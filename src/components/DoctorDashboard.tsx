import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CareLinkLogo } from "./CareLinkLogo";
import {
  Users,
  Calendar,
  TrendingUp,
  Clipboard,
  BrainCircuit,
  AlertCircle,
  Lock,
  Search,
  ChevronRight,
  Save,
  CheckCircle,
  FileText,
  Activity,
  Plus,
  Send,
  X,
  Menu,
  Stethoscope,
  HeartHandshake,
  FlaskConical,
  UserCheck,
  Printer,
  Clock,
  Thermometer,
  Heart,
  FileSpreadsheet,
  Bell,
  Upload,
  FileCheck,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { api } from "../api";
import {
  DoctorProfile,
  Appointment,
  MedicalRecord,
  PatientProfile,
  LabTestRequest,
} from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import PatientEHRProfile from "./PatientEHRProfile";
import ScanPatientQRModal from "./ScanPatientQRModal";
import EmergencyMedicalProfileModal from "./EmergencyMedicalProfileModal";

interface DoctorDashboardProps {
  doctor: DoctorProfile;
  onLogout: () => void;
}

export default function DoctorDashboard({
  doctor,
  onLogout,
}: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [patientsList, setPatientsList] = useState<PatientProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [doctorLabRequests, setDoctorLabRequests] = useState<LabTestRequest[]>(
    [],
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Department View State (Department-Specific Doctor Dashboard)
  const [activeDepartment, setActiveDepartment] = useState<string>(
    doctor.department || "Cardiology",
  );

  // EHR Profile View Routing
  const [selectedEHRPatientId, setSelectedEHRPatientId] = useState<
    string | null
  >(null);

  // Emergency QR Code Scanning State
  const [showScanQrModal, setShowScanQrModal] = useState(false);
  const [selectedEmergencyPatient, setSelectedEmergencyPatient] =
    useState<PatientProfile | null>(null);

  // Active Consult State
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(
    null,
  );

  // Doctor Entry Forms
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  // Vitals
  const [vitalBP, setVitalBP] = useState("120/80");
  const [vitalHR, setVitalHR] = useState("72");
  const [vitalTemp, setVitalTemp] = useState("36.8");
  const [vitalResp, setVitalResp] = useState("16");

  // Lab Order Modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedLabCategory, setSelectedLabCategory] = useState<
    | "Hematology"
    | "Biochemistry"
    | "Microbiology"
    | "Radiology"
    | "Cardiology"
    | "Genetics"
  >("Hematology");
  const [selectedTestName, setSelectedTestName] = useState(
    "Full Blood Count (FBC)",
  );
  const [labPriority, setLabPriority] = useState<
    "Routine" | "Urgent" | "Emergency"
  >("Routine");
  const [labInstructions, setLabInstructions] = useState("");

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [docPhone, setDocPhone] = useState(doctor.phone || "+234 803 123 4567");
  const [docAvailability, setDocAvailability] = useState(
    Array.isArray(doctor.availability)
      ? doctor.availability.join(", ")
      : doctor.availability || "Mon-Fri 08:00 - 16:00",
  );
  const [docBio, setDocBio] = useState(
    "Senior Consultant Cardiologist specializing in non-invasive diagnostic electrophysiology & coronary artery disease.",
  );
  const [docPinInput, setDocPinInput] = useState(doctor.pin || "1234");
  const [docPasswordInput, setDocPasswordInput] = useState(
    doctor.password || "123456",
  );
  const [docPinSaved, setDocPinSaved] = useState(false);

  const handleSaveDoctorSecuritySettings = async () => {
    try {
      await api.updateDoctorPin({
        id: doctor.id,
        pin: docPinInput,
        password: docPasswordInput,
      });
      setDocPinSaved(true);
      setTimeout(() => setDocPinSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // AI Assistant Panel State
  interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: string;
  }

  interface Guideline {
    id: string;
    title: string;
    summary: string;
    content: string;
    presetQuery: string;
  }

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-default",
      sender: "ai",
      text: "Hello, Dr. Johnson. I am your Gemma 4 Medical Decision Support AI Assistant connected to the National Medical Informatics Division.\n\nPlease select a patient from today's appointment queue to load their medical record context. Alternatively, you can ask general clinical questions, check drug interactions, or look up treatment guidelines below.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [guidelinesLibraryOpen, setGuidelinesLibraryOpen] = useState(true);
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>(
    null,
  );

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const SUGGESTED_GUIDELINES: Guideline[] = [
    {
      id: "htn",
      title: "Hypertension Protocol (Abuja NHS)",
      summary:
        "First-line CCB monotherapy vs dual ACEi/ARB combo restrictions.",
      content:
        "• Monotherapy: Initiate CCBs (e.g., Amlodipine) or Thiazides in black patients.\n• Dual Therapy: ACEi + CCB or ARB + CCB. NEVER combine ACEi & ARB.\n• Safety: Monitor creatinine, eGFR, potassium within 2 weeks of starting ACEi/ARB.",
      presetQuery:
        "Apply Abuja NHS Hypertension Protocol: check first-line CCB indication and verify any ACEi/ARB combination issues.",
    },
    {
      id: "ecg",
      title: "ECG Rhythm & QT Standards",
      summary:
        "PR/QTc interval values and drug-induced prolongation risk alerts.",
      content:
        "• PR Interval: 120 - 200 ms. >200ms indicates first-degree AV block.\n• QTc Interval: <450ms (males), <460ms (females). >500ms is critical risk for Torsades de Pointes.\n• Prohibited combos: Avoid co-prescribing Macrolides (Azithromycin) with other QT prolonging agents.",
      presetQuery:
        "Evaluate ECG readings (sinus rhythm, stable QT) and assess risk of drug-induced QT prolongation considering current therapy.",
    },
    {
      id: "allergy",
      title: "Penicillin Allergy Alternatives",
      summary:
        "Cross-reactivity screening & safe non-beta-lactam substitution guidelines.",
      content:
        "• Cephalosporin cross-reactivity: 5-10% in severe IgE-mediated reactions.\n• Safer Alternatives: Macrolides (Azithromycin), Fluoroquinolones (Levofloxacin), or Clindamycin.\n• Audit check: Always verify penicillin status before ordering any penicillin derivative.",
      presetQuery:
        "What are the safest alternative drug classes for Samuel considering Penicillin allergy, dust mite sensitivity, and chest pain?",
    },
    {
      id: "chest-pain",
      title: "Acute Chest Pain Protocol",
      summary:
        "Serial ECG timing, biomarkers, and emergent Aspirin/GTN dosages.",
      content:
        "• Timing: Perform 12-lead ECG within 10 minutes of presentation.\n• Initial Rx: Aspirin 300mg (crushed), sublingual Glyceryl Trinitrate (GTN).\n• Biomarkers: High-sensitivity cardiac Troponin assays at 0h and 3h.\n• Safety: Hold beta-blockers if bradycardic or hypotensive.",
      presetQuery:
        "Cross-examine Samuel’s symptoms (minor chest tightness) against Acute Chest Pain Protocol. Is Aspirin/GTN indicated?",
    },
  ];

  // Search Active Patient
  const [searchPatientId, setSearchPatientId] = useState("");
  const [matchedPatient, setMatchedPatient] = useState<PatientProfile | null>(
    null,
  );

  // Emergency Bypass Justification Modal
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [bypassReason, setBypassReason] = useState("");

  // Doctor Notifications & Result Viewing Modal State
  const [doctorNotifications, setDoctorNotifications] = useState<any[]>([]);
  const [selectedResultModal, setSelectedResultModal] =
    useState<LabTestRequest | null>(null);

  // Point-of-Care Direct Capture State for Doctor
  const [showPocModal, setShowPocModal] = useState<boolean>(false);
  const [pocTestType, setPocTestType] = useState<string>(
    "Point-of-Care Blood Glucose",
  );
  const [pocCategory, setPocCategory] = useState<string>("Laboratory");
  const [pocFindings, setPocFindings] = useState<string>("");
  const [pocFileAttachment, setPocFileAttachment] = useState<string>("");
  const [submittingPoc, setSubmittingPoc] = useState<boolean>(false);

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "queue" | "labs" | "analytics"
  >("queue");

  const loadData = async () => {
    try {
      const apts = await api
        .getAppointments({ doctorId: doctor.id })
        .catch(() => []);
      if (Array.isArray(apts)) setAppointments(apts);

      const resStats = await api.getAdminStats().catch(() => null);
      if (resStats) setStats(resStats);

      const labReqs = await api
        .getLabRequests({ doctorId: doctor.id })
        .catch(() => []);
      if (Array.isArray(labReqs)) setDoctorLabRequests(labReqs);

      // Fetch notifications for requesting doctor alerts
      try {
        const notifs = await fetch(`/api/notifications?userId=${doctor.id}`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);
        if (Array.isArray(notifs)) setDoctorNotifications(notifs);
      } catch (e) {
        // silent
      }

      // Get prefilled patients list
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "samuel@example.com",
            password: "123",
            role: "patient",
          }),
        })
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({}));
        if (res && (res as any).user) {
          setPatientsList([(res as any).user]);
        }
      } catch (e) {
        // silent
      }
    } catch (err) {
      console.warn("DoctorDashboard loadData warning:", err);
    }
  };

  const handleCapturePocResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      alert("Please select an active patient from the queue first.");
      return;
    }
    setSubmittingPoc(true);
    try {
      // Create lab request first
      const newReq = await api.createLabRequest({
        patientId: activePatient.id,
        patientName: activePatient.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalName: doctor.hospitalName || "Abuja General Hospital",
        category: pocCategory,
        testName: pocTestType,
        priority: "Urgent",
        notes: `Bedside Point-of-Care Diagnostic Test captured directly by Dr. ${doctor.name}.`,
      });

      if (newReq.success && newReq.labRequest?.id) {
        // Mark as uploaded
        await api.updateLabStatus(newReq.labRequest.id, {
          status: "Results Uploaded",
          resultSummary: pocFindings,
          resultFileName:
            pocFileAttachment || `${pocTestType.replace(/\s+/g, "_")}_POC.pdf`,
          resultFileType: "pdf",
          comments: `Captured directly in bedside consultation by Dr. ${doctor.name}`,
          labTechnicianName: doctor.name,
        });

        alert(
          `✓ Point-of-Care result uploaded & synced directly to ${activePatient.name}'s Profile!`,
        );
        setShowPocModal(false);
        setPocFindings("");
        setPocFileAttachment("");
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to record Point-of-Care result.");
    }
    setSubmittingPoc(false);
  };

  const handleCreateLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      alert("Please select a patient before submitting a laboratory order.");
      return;
    }
    try {
      const newReq = await api.createLabRequest({
        patientId: activePatient.id,
        patientName: activePatient.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalName: doctor.hospitalName || "Abuja General Hospital",
        category: selectedLabCategory,
        testName: selectedTestName,
        priority: labPriority,
        notes:
          labInstructions ||
          `Requested during clinical consultation for ${activePatient.name}.`,
      });
      alert(
        `Diagnostic test ordered successfully! Request ID: ${newReq.labRequest?.id || "LAB-ORD"}`,
      );
      setShowLabModal(false);
      setLabInstructions("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to dispatch lab order request.");
    }
  };

  const handleQuickLabOrder = async (
    testType: string,
    category: string,
    targetDepartment: string,
  ) => {
    if (!activePatient) {
      alert(
        "Please select a patient from the queue first to attach this diagnostic order.",
      );
      return;
    }
    try {
      const res = await api.createLabRequest({
        patientId: activePatient.id,
        patientName: activePatient.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalName: doctor.hospitalName || "General Hospital Abuja",
        category: category,
        testName: testType,
        priority: "Routine",
        notes: `Departmental quick order sent to ${targetDepartment} Laboratory. Marked as Suggested.`,
      });
      alert(
        `Diagnostic order for "${testType}" sent instantly to the ${targetDepartment} Laboratory Dashboard marked as "Suggested"!`,
      );
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit quick diagnostic order.");
    }
  };

  useEffect(() => {
    loadData();
  }, [doctor.id]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // Dynamic context adjustment for AI Assistant
  useEffect(() => {
    if (activePatient) {
      setMessages([
        {
          id: "welcome-" + activePatient.id,
          sender: "ai",
          text: `I have successfully retrieved the clinical files and decrypted medical history for **${activePatient.name}** (National ID: ${activePatient.id}).\n\nHow can I help you analyze their diagnostic trends, check for allergy contraindications, or draft medication prescriptions?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } else {
      setMessages([
        {
          id: "welcome-default",
          sender: "ai",
          text: "Hello, Dr. Johnson. I am your Clinical Decision Support AI Assistant connected to the National Medical Informatics Division.\n\nPlease select a patient from today's appointment queue to load their medical record context. Alternatively, you can ask general clinical questions or look up national treatment guidelines below.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [activePatient?.id]);

  const handleCallPatient = async (aptId: string) => {
    try {
      const res = await api.callPatient(aptId);
      if (res.success && res.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === aptId ? res.appointment : a)),
        );
        alert(
          `Patient ${res.appointment.patientName} called! Real-time notification sent to proceed to ${doctor.department} consultation suite.`,
        );
      }
    } catch (err: any) {
      alert(err.message || "Call patient failed");
    }
  };

  const selectAppointment = async (apt: Appointment) => {
    setActiveAppointment(apt);
    setClinicalNotes(apt.clinicalNotes || "");
    setPrescription(apt.prescription || "");
    setSelectedEHRPatientId(apt.patientId);

    // Load patient profile
    const patRes = patientsList.find((p) => p.id === apt.patientId);
    if (patRes) {
      setActivePatient(patRes);
      // Load their records for this doctor
      const records = await api.getRecords({
        patientId: patRes.id,
        doctorId: doctor.id,
      });
      setPatientRecords(records);
    }
  };

  const handleSaveConsultation = async () => {
    if (!activeAppointment) return;
    try {
      const response = await api.updateAppointment(activeAppointment.id, {
        clinicalNotes,
        prescription,
        status: "completed",
      });
      if (response.success) {
        alert(
          "Consultation files securely signed, encrypted, and saved to national registry.",
        );
        loadData();
        setActiveAppointment(null);
        setActivePatient(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiAsk = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    // Create user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const response = await api.askAiAssistant({
        prompt: promptToSend,
        patientId: activePatient?.id || "NID-782-901",
      });

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: response.success
          ? response.text
          : "We encountered an issue retrieving clinical guidance. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: "AI service unavailable. Please verify your API configuration and try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEmergencyOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !bypassReason) return;
    try {
      const response = await api.emergencyOverride({
        patientId: activePatient.id,
        doctorId: doctor.id,
        reason: bypassReason,
      });
      if (response.success) {
        alert(response.message);
        setShowBypassModal(false);
        setBypassReason("");
        // Reload record visibility which is now bypassed
        const records = await api.getRecords({
          patientId: activePatient.id,
          doctorId: doctor.id,
        });
        setPatientRecords(records);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLookupPatient = () => {
    const matched = patientsList.find((p) => p.id === searchPatientId);
    if (matched) {
      setMatchedPatient(matched);
    } else {
      alert("National Patient ID not verified in registry.");
    }
  };

  const handleRequestAccessSig = async () => {
    if (!activePatient) return;
    try {
      const response = await api.requestConsent({
        doctorId: doctor.id,
        patientId: activePatient.id,
        specialties: ["Cardiology Records", "Blood Tests"],
        expiresInDays: 7,
      });
      if (response.success) {
        alert(
          `Access Authorization Request signed with key ${response.consent.id}. Dispatched notification to Samuel.`,
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mock charts data
  const consultTrendData = [
    { name: "Mon", PatientVol: 12, CompletedConsults: 10 },
    { name: "Tue", PatientVol: 19, CompletedConsults: 16 },
    { name: "Wed", PatientVol: 15, CompletedConsults: 14 },
    { name: "Thu", PatientVol: 18, CompletedConsults: 15 },
    { name: "Fri", PatientVol: 24, CompletedConsults: 21 },
    { name: "Sat", PatientVol: 8, CompletedConsults: 7 },
    { name: "Sun", PatientVol: 2, CompletedConsults: 2 },
  ];

  if (selectedEHRPatientId) {
    return (
      <PatientEHRProfile
        patientId={selectedEHRPatientId}
        doctor={doctor}
        onBack={() => setSelectedEHRPatientId(null)}
        initialAppointment={activeAppointment}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Locked Sidebar Layout */}
      <aside className="hidden md:flex w-64 bg-white text-slate-700 flex-col justify-between shrink-0 border-r border-slate-200 h-screen overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <CareLinkLogo size="md" showSubtitle />
          </div>

          <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1 border border-slate-200/40">
            <p className="font-bold text-slate-800 text-sm">{doctor.name}</p>
            <p className="text-blue-600 font-bold">
              {doctor.specialty} Specialist
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {doctor.hospitalName}
            </p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveSubTab("queue")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "queue"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "hover:bg-slate-50 text-slate-500"
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" /> Today's Schedule
            </button>

            <button
              onClick={() => setActiveSubTab("labs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "labs"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "hover:bg-slate-50 text-slate-500"
              }`}
            >
              <FlaskConical className="w-4 h-4 text-blue-600" /> Lab &
              Diagnostics ({doctorLabRequests.length})
            </button>

            <button
              onClick={() => setActiveSubTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "analytics"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "hover:bg-slate-50 text-slate-500"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-600" /> Statistics &
              Analytics
            </button>

            <button
              onClick={() => {
                setActiveSubTab("queue");
                setAiPanelOpen(!aiPanelOpen);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                aiPanelOpen && activeSubTab === "queue"
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "hover:bg-slate-50 text-slate-500"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-blue-600" /> AI Medical
              Assistant
            </button>
          </nav>
        </div>

        <div className="p-6 space-y-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            Doctor Profile
          </button>
          <button
            onClick={onLogout}
            className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-500 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer"
          >
            Logout Secure Session
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden flex animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-72 h-full p-6 flex flex-col justify-between shadow-2xl border-r border-slate-200 overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <CareLinkLogo size="sm" showSubtitle />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1 border border-slate-200/40">
                <p className="font-bold text-slate-800 text-sm">
                  {doctor.name}
                </p>
                <p className="text-blue-600 font-bold">
                  {doctor.specialty} Specialist
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {doctor.hospitalName}
                </p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveSubTab("queue");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeSubTab === "queue"
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-blue-600" /> Today's
                  Schedule
                </button>

                <button
                  onClick={() => {
                    setActiveSubTab("labs");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeSubTab === "labs"
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <FlaskConical className="w-4 h-4 text-blue-600" /> Lab &
                  Diagnostics ({doctorLabRequests.length})
                </button>

                <button
                  onClick={() => {
                    setActiveSubTab("analytics");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeSubTab === "analytics"
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Statistics &
                  Analytics
                </button>

                <button
                  onClick={() => {
                    setActiveSubTab("queue");
                    setAiPanelOpen(!aiPanelOpen);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    aiPanelOpen && activeSubTab === "queue"
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 text-blue-600" /> AI Medical
                  Assistant
                </button>
              </nav>
            </div>

            <div className="pt-6 space-y-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setMobileSidebarOpen(false);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                Doctor Profile
              </button>
              <button
                onClick={onLogout}
                className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-500 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer"
              >
                Logout Secure Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex h-screen overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto space-y-6 h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden border border-slate-200 transition-colors cursor-pointer shrink-0"
                title={
                  mobileSidebarOpen
                    ? "Hide Navigation Menu"
                    : "Show Navigation Menu"
                }
                aria-label="Toggle navigation menu"
              >
                {mobileSidebarOpen ? (
                  <X className="w-5 h-5 text-slate-700" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Clinical Workspace
                </h1>
                <p className="text-sm text-slate-500">
                  Secure consultation queue and complete clinical patient record
                  reviews.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanQrModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 transition-all cursor-pointer border border-rose-500/50"
                title="Scan Patient Emergency QR Pass"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span>Scan Emergency QR Pass</span>
              </button>

              <button
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  aiPanelOpen
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>
                  {aiPanelOpen ? "Hide AI Assistant" : "Show AI Assistant"}
                </span>
              </button>
            </div>
          </div>

          {/* Department-Specific View Switcher */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Department Specialty:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                {[
                  "Cardiology",
                  "Ophthalmology",
                  "Orthopedics",
                  "Neurology",
                  "Pediatrics",
                  "General Medicine",
                ].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setActiveDepartment(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      activeDepartment === dept
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
              {activeDepartment} Specialty Workspace & Diagnostic Orders
            </span>
          </div>

          {/* Unread Diagnostic Result Alert Banner for Requesting Doctor */}
          {doctorNotifications.filter(
            (n) =>
              !n.read &&
              (n.type === "report" ||
                n.title?.includes("Result") ||
                n.title?.includes("Diagnostic")),
          ).length > 0 && (
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4.5 rounded-2xl shadow-md border border-blue-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shrink-0 border border-white/30">
                  <Bell className="w-5 h-5 animate-bounce text-white" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-white uppercase tracking-wide">
                      Diagnostic Test Results Ready (
                      {doctorNotifications.filter((n) => !n.read).length})
                    </p>
                    <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                      Patient Profile Updated
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    {doctorNotifications.find((n) => !n.read)?.message ||
                      "Requested lab findings have been uploaded and attached to the patient's record."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveSubTab("labs");
                  fetch("/api/notifications/read", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: doctor.id }),
                  }).catch(() => {});
                  loadData();
                }}
                className="bg-white text-blue-900 hover:bg-blue-50 font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 uppercase tracking-wider shadow-sm border border-white"
              >
                Inspect Results Queue
              </button>
            </div>
          )}

          {activeSubTab === "queue" && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  animate={{ y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Scheduled Queue
                    </span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-black">
                    {appointments.length} Patients
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    100% attendance expected
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Completed Consults
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black">
                    {appointments.filter((a) => a.status === "completed")
                      .length || 12}{" "}
                    Consults
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-bold">
                    Records updated
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Pending Diagnostics
                    </span>
                    <Clipboard className="w-4 h-4 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-black">2 Lab Results</h3>
                  <p className="text-[10px] text-orange-500 font-bold">
                    Needs clinician sign-off
                  </p>
                </motion.div>
              </div>

              {/* Consultation Area */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left side: Queue lists */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        Live Reception Waiting Queue
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Patients checked in by Front Desk
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full border border-amber-200">
                      {
                        appointments.filter(
                          (a) =>
                            a.status === "checked_in" ||
                            a.status === "called" ||
                            a.status === "in_consultation",
                        ).length
                      }{" "}
                      Waiting
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {appointments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No patients scheduled in today's queue.
                      </p>
                    ) : (
                      appointments.map((apt) => {
                        const isSelected = activeAppointment?.id === apt.id;
                        return (
                          <div
                            key={apt.id}
                            onClick={() => selectAppointment(apt)}
                            className={`p-3.5 rounded-xl border transition-all space-y-2 cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/30"
                                : "bg-white border-slate-200 hover:border-slate-300 shadow-3xs"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                  #{apt.queueNumber || "1"}
                                </span>
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                    {apt.patientName}
                                    {apt.isWalkIn && (
                                      <span className="bg-purple-100 text-purple-800 text-[8px] font-extrabold px-1 rounded-full">
                                        WALK-IN
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    ID:{" "}
                                    <span className="font-bold text-slate-700">
                                      {apt.patientNid || apt.patientId}
                                    </span>{" "}
                                    • {apt.time}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  apt.priority === "Emergency"
                                    ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                                    : apt.priority === "Urgent"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {apt.priority || "Normal"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold ${
                                  apt.status === "checked_in"
                                    ? "bg-amber-100 text-amber-900"
                                    : apt.status === "called"
                                      ? "bg-blue-100 text-blue-900 animate-pulse"
                                      : apt.status === "in_consultation"
                                        ? "bg-indigo-100 text-indigo-900"
                                        : apt.status === "completed"
                                          ? "bg-emerald-100 text-emerald-900"
                                          : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {apt.status === "checked_in"
                                  ? "Checked In"
                                  : apt.status === "called"
                                    ? "Called"
                                    : apt.status === "in_consultation"
                                      ? "In Consult"
                                      : apt.status === "completed"
                                        ? "Completed"
                                        : "Pending"}
                              </span>

                              <div
                                className="flex gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {apt.status !== "completed" && (
                                  <button
                                    onClick={() => handleCallPatient(apt.id)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-3xs cursor-pointer transition-colors"
                                  >
                                    Call Patient
                                  </button>
                                )}
                                <button
                                  onClick={() => selectAppointment(apt)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-3xs cursor-pointer transition-colors"
                                >
                                  Open
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Patient lookup bypass input */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">
                      Registry Search (Lookup patient)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="NID-782-901"
                        value={searchPatientId}
                        onChange={(e) => setSearchPatientId(e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-xl text-xs uppercase"
                      />
                      <button
                        onClick={handleLookupPatient}
                        className="bg-slate-800 text-white px-3 rounded-xl text-xs font-bold"
                      >
                        Find
                      </button>
                    </div>
                    {matchedPatient && (
                      <div className="bg-slate-50 p-2 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold">{matchedPatient.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Age: {matchedPatient.age}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            // Mock consult session
                            const dummyApt: Appointment = {
                              id: `APT-${Date.now()}`,
                              patientId: matchedPatient.id,
                              patientName: matchedPatient.name,
                              doctorId: doctor.id,
                              doctorName: doctor.name,
                              specialty: doctor.specialty,
                              hospitalName: doctor.hospitalName,
                              department: doctor.department,
                              date: "Today",
                              time: "Walk-in",
                              status: "pending",
                            };
                            selectAppointment(dummyApt);
                            setMatchedPatient(null);
                          }}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                        >
                          Consult
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Selected Patient consult workspace */}
                <div className="col-span-8 space-y-4">
                  {activePatient ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                      {/* Clinical Identity Card */}
                      <div className="space-y-4 border-b border-slate-100 pb-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <p className="text-xs text-blue-600 font-extrabold uppercase tracking-wider">
                              Active Patient Consultation
                            </p>
                            <h2 className="text-2xl font-black text-slate-950">
                              {activePatient.name}
                            </h2>
                            <p className="text-xs text-slate-400 font-mono">
                              National ID:{" "}
                              <strong className="text-slate-700">
                                {activePatient.id}
                              </strong>
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedEHRPatientId(activePatient.id)
                            }
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>
                              Open Full-Page Electronic Health Record (EHR)
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-4 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">
                              Age
                            </span>
                            <span className="font-bold text-slate-800">
                              {activePatient.age} yrs
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">
                              Blood Group
                            </span>
                            <span className="font-bold text-red-600 text-sm">
                              {activePatient.bloodGroup}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">
                              Allergies
                            </span>
                            <span className="font-bold text-red-600 text-[10px] truncate max-w-[120px] block">
                              {activePatient.allergies.join(", ") ||
                                "No known allergies"}
                            </span>
                          </div>
                        </div>

                        {/* Department Instant Diagnostic Request Toolbar */}
                        <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-extrabold text-blue-900">
                            <span>
                              Instant Department Diagnostic Orders (
                              {activeDepartment} Lab)
                            </span>
                            <span className="text-[10px] text-blue-600 font-normal">
                              Auto-routes as "Suggested"
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {activeDepartment === "Cardiology" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "12-Lead Electrocardiogram (ECG)",
                                      "Cardiology",
                                      "Cardiology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + 12-Lead ECG
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Cardiac Troponin I Assay",
                                      "Laboratory",
                                      "Cardiology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Cardiac Troponin I
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Transthoracic Echocardiogram (Echo)",
                                      "Radiology / Imaging",
                                      "Cardiology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Echocardiogram
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "24-Hour Holter Monitor",
                                      "Cardiology",
                                      "Cardiology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Holter Monitor
                                </button>
                              </>
                            )}

                            {activeDepartment === "Ophthalmology" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Dilated Retinal Fundus Examination",
                                      "Ophthalmology",
                                      "Ophthalmology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Eye Exam (Fundoscopy)
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Optical Coherence Tomography (OCT)",
                                      "Radiology / Imaging",
                                      "Ophthalmology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Retinal OCT Scan
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Goldmann Intraocular Pressure (IOP) Tonometry",
                                      "Ophthalmology",
                                      "Ophthalmology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + IOP Tonometry
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Visual Field Perimetry Test",
                                      "Ophthalmology",
                                      "Ophthalmology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Visual Field Test
                                </button>
                              </>
                            )}

                            {activeDepartment === "Orthopedics" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Digital X-Ray Skeletal / Joint",
                                      "Radiology / Imaging",
                                      "Orthopedics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + X-Ray Skeletal Scan
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "High-Resolution Joint MRI Scan",
                                      "Radiology / Imaging",
                                      "Orthopedics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Joint MRI Scan
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "DEXA Bone Density Scan",
                                      "Radiology / Imaging",
                                      "Orthopedics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Bone DEXA Scan
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Serum Calcium & Vitamin D Assay",
                                      "Laboratory",
                                      "Orthopedics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Serum Calcium & Vit D
                                </button>
                              </>
                            )}

                            {activeDepartment === "Neurology" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Brain MRI with Contrast",
                                      "Radiology / Imaging",
                                      "Neurology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Brain MRI
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Electroencephalogram (EEG)",
                                      "Neurology",
                                      "Neurology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + EEG Waveform Study
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Carotid Doppler Ultrasound",
                                      "Radiology / Imaging",
                                      "Neurology",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Carotid Doppler
                                </button>
                              </>
                            )}

                            {activeDepartment === "Pediatrics" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Pediatric Full Blood Count",
                                      "Laboratory",
                                      "Pediatrics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Pediatric FBC
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Pediatric Chest X-Ray",
                                      "Radiology / Imaging",
                                      "Pediatrics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Pediatric Chest X-Ray
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Newborn Metabolic Screening Panel",
                                      "Laboratory",
                                      "Pediatrics",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Metabolic Screen
                                </button>
                              </>
                            )}

                            {activeDepartment === "General Medicine" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Full Blood Count (FBC)",
                                      "Laboratory",
                                      "General Medicine",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Full Blood Count
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Urinalysis Dipstick & Microscopy",
                                      "Laboratory",
                                      "General Medicine",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Urinalysis
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickLabOrder(
                                      "Malaria Rapid Diagnostic Test (RDT)",
                                      "Laboratory",
                                      "General Medicine",
                                    )
                                  }
                                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-3xs cursor-pointer"
                                >
                                  + Malaria RDT
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Decrypted History records under consent */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-900 text-sm">
                            Patient Medical Vault
                          </h3>

                          <div className="flex gap-2">
                            <button
                              onClick={handleRequestAccessSig}
                              className="text-[10px] bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-100"
                            >
                              Request Consent Signature
                            </button>
                            <button
                              onClick={() => setShowBypassModal(true)}
                              className="text-[10px] bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Emergency
                              Bypass
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {patientRecords.map((record) => {
                            const isApproved = record.approvedDoctors.includes(
                              doctor.id,
                            );
                            return (
                              <div
                                key={record.id}
                                className="border border-slate-100 rounded-xl p-3 space-y-2"
                              >
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-800 truncate max-w-[120px]">
                                    {record.title}
                                  </span>
                                  <span className="text-slate-400 font-mono uppercase text-[9px] bg-slate-50 px-1 rounded">
                                    {record.fileType}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  {record.specialty} • {record.uploadDate}
                                </p>

                                {isApproved ? (
                                  <div className="bg-slate-50 p-2 rounded-lg text-[10px] font-mono text-slate-600">
                                    {record.url}
                                  </div>
                                ) : (
                                  <div className="bg-red-50 text-red-800 p-2 rounded-lg text-[10px] font-mono flex items-center gap-1.5 border border-red-100">
                                    <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                    <span>
                                      Access Restricted. Patient consent
                                      signature required.
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Doctor Clinical Input Fields & Vitals */}
                      <div className="space-y-4 border-t border-slate-100 pt-5 text-xs">
                        {/* Vitals Bar */}
                        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                              <Activity className="w-3.5 h-3.5 text-blue-600" />{" "}
                              Patient Vitals Assessment
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Recorded today
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block">
                                Blood Pressure (mmHg)
                              </label>
                              <div className="flex items-center gap-1 mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                <input
                                  type="text"
                                  value={vitalBP}
                                  onChange={(e) => setVitalBP(e.target.value)}
                                  className="w-full text-xs font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block">
                                Heart Rate (bpm)
                              </label>
                              <div className="flex items-center gap-1 mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <input
                                  type="text"
                                  value={vitalHR}
                                  onChange={(e) => setVitalHR(e.target.value)}
                                  className="w-full text-xs font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block">
                                Temperature (°C)
                              </label>
                              <div className="flex items-center gap-1 mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <Thermometer className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <input
                                  type="text"
                                  value={vitalTemp}
                                  onChange={(e) => setVitalTemp(e.target.value)}
                                  className="w-full text-xs font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold block">
                                Resp. Rate (bpm)
                              </label>
                              <div className="flex items-center gap-1 mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <input
                                  type="text"
                                  value={vitalResp}
                                  onChange={(e) => setVitalResp(e.target.value)}
                                  className="w-full text-xs font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Symptoms & Working Diagnosis */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">
                              Reported Symptoms
                            </label>
                            <input
                              type="text"
                              value={symptoms}
                              onChange={(e) => setSymptoms(e.target.value)}
                              placeholder="e.g. Sharp chest tightness, shortness of breath on exertion"
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">
                              Working Clinical Diagnosis
                            </label>
                            <input
                              type="text"
                              value={diagnosis}
                              onChange={(e) => setDiagnosis(e.target.value)}
                              placeholder="e.g. Atypical Angina Pectoris / Non-ST Elevation Ischemia"
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold text-blue-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">
                              Clinical Diagnostic Notes
                            </label>
                            <textarea
                              rows={3}
                              value={clinicalNotes}
                              onChange={(e) => setClinicalNotes(e.target.value)}
                              placeholder="Describe physical examination findings, Auscultation (S1, S2), lungs clear..."
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="font-bold text-slate-600 block">
                                Digital Prescription (Rx)
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setPrescription(
                                    "1. Amlodipine 5mg Daily x 30 days\n2. Atorvastatin 20mg Nocturnal x 30 days\n3. Glyceryl Trinitrate Spray 400mcg PRN",
                                  )
                                }
                                className="text-[10px] text-blue-600 hover:underline font-bold"
                              >
                                Prefill Cardioprotective Rx
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={prescription}
                              onChange={(e) => setPrescription(e.target.value)}
                              placeholder="1. Medication Name - Dosage - Frequency - Duration..."
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-between items-center border-t border-slate-50 pt-3">
                          <button
                            type="button"
                            onClick={() => setShowLabModal(true)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-purple-200"
                          >
                            <FlaskConical className="w-4 h-4 text-purple-600" />
                            Order Diagnostic Lab / Imaging Test
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const prompt = `Formulate a detailed clinical prescription and laboratory testing outline for patient Samuel, age 27, diagnosed with Penicillin allergy. Symptoms: chest tightness. Vitals: BP ${vitalBP}, HR ${vitalHR}, Temp ${vitalTemp}.`;
                                setAiPrompt(prompt);
                                handleAiAsk(prompt);
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <BrainCircuit className="w-4 h-4 text-blue-600" />
                              Clinical AI Support
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveConsultation}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-100"
                            >
                              <Save className="w-4 h-4" />
                              Sign & Save Consultation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-blue-100">
                        <HeartHandshake className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          No Patient Consult Selected
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          Select a patient from today's scheduled appointment
                          queue or lookup a unique patient ID to initiate
                          clinical diagnosis workflows.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSubTab === "labs" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Laboratory & Diagnostic Test Orders
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track real-time status of bloodwork, imaging, and pathology
                    requested for your patients.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPocModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Capture Point-of-Care Result
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-purple-100 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Order New Diagnostic Test
                  </button>
                </div>
              </div>

              {doctorLabRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    No Lab Orders Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't dispatched any diagnostic test orders yet. You
                    can order tests directly during patient consultations or
                    using the order button above.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 font-bold">
                          Request ID & Patient
                        </th>
                        <th className="py-3 px-4 font-bold">Category & Test</th>
                        <th className="py-3 px-4 font-bold">Priority</th>
                        <th className="py-3 px-4 font-bold">Date Requested</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">
                          Lab Result & Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doctorLabRequests.map((req) => {
                        const isDone =
                          req.status === "Completed" ||
                          req.status === "Results Uploaded";
                        return (
                          <tr
                            key={req.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <span className="font-mono font-bold text-slate-600 block text-[11px]">
                                {req.id}
                              </span>
                              <span className="font-bold text-blue-900">
                                {req.patientName}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800 block">
                                {req.testType || (req as any).testName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {req.testCategory || (req as any).category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  req.priority === "Emergency"
                                    ? "bg-red-100 text-red-800"
                                    : req.priority === "Urgent"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {req.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {req.requestedDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isDone
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : req.status === "Processing"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isDone
                                      ? "bg-emerald-500"
                                      : req.status === "Processing"
                                        ? "bg-blue-500"
                                        : "bg-amber-500 animate-ping"
                                  }`}
                                />
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isDone ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-emerald-800 font-bold block bg-emerald-50/80 p-1 rounded border border-emerald-200/80">
                                    {req.resultSummary ||
                                      "Uploaded & Synced to Profile"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedResultModal(req)}
                                    className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                  >
                                    <FileText className="w-3 h-3" /> Inspect
                                    Result
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Awaiting Processing
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black">
                Statistics & Analytics Workspace
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Weekly Patient Consultation Volumes
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={consultTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="PatientVol"
                          fill="#2563EB"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Weekly Completed Consultations Trend
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consultTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="CompletedConsults"
                          stroke="#10B981"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Decision Support Pop-up Modal */}
        {aiPanelOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setAiPanelOpen(false);
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-blue-100 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs shrink-0">
                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      Gemma 4 Clinical AI Assistant
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                        Gemma 4 Engine
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      National Medical Informatics Division • Gemma 4 Decision
                      Support
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiPanelOpen(false)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Close AI Pop-up"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                {/* Active Context */}
                <div className="bg-blue-50/80 border border-blue-100 p-3.5 rounded-2xl space-y-1 text-xs">
                  <p className="font-extrabold text-blue-900">
                    Active Patient Context
                  </p>
                  <p className="text-slate-700 font-medium">
                    Analyzing records for:{" "}
                    <strong>{activePatient?.name || "Samuel Adewale"}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Allergies:{" "}
                    {activePatient?.allergies.join(", ") ||
                      "Penicillin, Dust Mites"}
                  </p>
                </div>

                {/* Suggested Guidelines */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      setGuidelinesLibraryOpen(!guidelinesLibraryOpen)
                    }
                    className="w-full bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 flex justify-between items-center text-xs font-bold text-slate-800 transition-colors border-b border-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-blue-800">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Suggested Clinical Guidelines & Protocols</span>
                    </div>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                      {guidelinesLibraryOpen ? "HIDE" : "SHOW"}
                    </span>
                  </button>

                  {guidelinesLibraryOpen && (
                    <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                      {SUGGESTED_GUIDELINES.map((guideline) => {
                        const isExpanded = expandedGuidelineId === guideline.id;
                        return (
                          <div
                            key={guideline.id}
                            className="border border-slate-200 rounded-xl bg-white overflow-hidden text-xs"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedGuidelineId(
                                  isExpanded ? null : guideline.id,
                                )
                              }
                              className="w-full text-left px-3 py-2 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <span className="font-extrabold text-slate-800 text-[11px]">
                                {guideline.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-[10px] text-slate-500 italic font-medium">
                                  {guideline.summary}
                                </p>
                                <div className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                                  {guideline.content}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAiAsk(guideline.presetQuery)
                                  }
                                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <BrainCircuit className="w-3.5 h-3.5" />
                                  <span>
                                    Apply Query for{" "}
                                    {activePatient?.name || "Samuel"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3 flex flex-col min-h-[200px] max-h-[300px] overflow-y-auto">
                  {messages.map((msg) => {
                    const isAi = msg.sender === "ai";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[88%] ${isAi ? "self-start" : "self-end"}`}
                      >
                        <div
                          className={`flex items-center gap-1 text-[9px] font-bold text-slate-400 mb-0.5 ${isAi ? "justify-start" : "justify-end"}`}
                        >
                          <span>
                            {isAi ? "Clinical Support AI" : "Dr. Johnson"}
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl whitespace-pre-line text-xs font-sans ${
                            isAi
                              ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none leading-relaxed shadow-2xs"
                              : "bg-blue-600 text-white rounded-tr-none leading-relaxed"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="self-start flex flex-col max-w-[88%]">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 mb-0.5">
                        <span>Clinical Support AI</span>
                        <span>•</span>
                        <span>Analyzing...</span>
                      </div>
                      <div className="p-3 bg-white text-slate-500 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                        <span className="font-bold text-[11px]">
                          Querying national medical guidelines...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested queries buttons */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                    Preset Clinical Scenarios
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleAiAsk(
                          "Check for drug-drug interactions between sumatriptan and magnesium supplements.",
                        )
                      }
                      className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors text-left font-medium cursor-pointer"
                    >
                      Drug interaction check
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAiAsk(
                          "Identify chest tightness causes considering ECG: sinus rhythm, stable QT.",
                        )
                      }
                      className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors text-left font-medium cursor-pointer"
                    >
                      Evaluate ECG & chest discomfort
                    </button>
                  </div>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aiPrompt.trim()) {
                      handleAiAsk(aiPrompt);
                    }
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    placeholder="Ask AI symptoms, ECG interpretations, drug risks..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiLoading}
                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white font-medium text-slate-800 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-blue-200 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  Connected to Ministry of Health Clinical Knowledge Engine
                </span>
                <button
                  type="button"
                  onClick={() => setAiPanelOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Close Pop-up
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- CLINICAL EMERGENCY OVERRIDE JUSTIFICATION MODAL --- */}
      {showBypassModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBypassModal(false);
          }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-2xl shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-red-950 uppercase tracking-wide">
                    Secure Emergency Bypass
                  </h3>
                  <p className="text-[11px] text-red-600 font-medium">
                    Logged in security audit trail
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBypassModal(false)}
                className="p-1.5 hover:bg-red-100/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleEmergencyOverrideSubmit}
              className="p-6 overflow-y-auto space-y-4 text-xs flex-1"
            >
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-slate-600 leading-relaxed font-medium">
                By activating Emergency Bypass, you certify that this patient
                requires immediate medical diagnostics for trauma or critical
                care, and consent cannot be obtained immediately.
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 text-xs">
                  Written Clinical Justification{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={bypassReason}
                  onChange={(e) => setBypassReason(e.target.value)}
                  placeholder="Describe patient's trauma, unconscious status, or urgent medical requirement..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-all text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBypassModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl text-slate-600 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-extrabold shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Activate Bypass Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ORDER DIAGNOSTIC LAB TEST MODAL --- */}
      {showLabModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLabModal(false);
          }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl shrink-0">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Order Diagnostic Lab Request
                  </h3>
                  <p className="text-[11px] text-purple-700 font-medium">
                    Dispatch order to pathology & imaging department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLabModal(false)}
                className="p-1.5 hover:bg-purple-100/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleCreateLabOrder}
              className="p-6 overflow-y-auto space-y-4 text-xs flex-1"
            >
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Target Patient
                </p>
                <p className="font-extrabold text-slate-900 text-sm">
                  {activePatient ? activePatient.name : "Samuel Adewale"}{" "}
                  <span className="font-normal text-slate-500 text-xs">
                    (National ID: {activePatient?.id || "NID-782-901"})
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Lab Category
                  </label>
                  <select
                    value={selectedLabCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setSelectedLabCategory(cat);
                      if (cat === "Hematology")
                        setSelectedTestName("Full Blood Count (FBC)");
                      else if (cat === "Biochemistry")
                        setSelectedTestName(
                          "Serum Electrolytes, Urea & Creatinine",
                        );
                      else if (cat === "Microbiology")
                        setSelectedTestName("Blood Culture & Sensitivity");
                      else if (cat === "Radiology")
                        setSelectedTestName("Chest X-Ray (PA View)");
                      else if (cat === "Cardiology")
                        setSelectedTestName("12-Lead Electrocardiogram (ECG)");
                      else if (cat === "Genetics")
                        setSelectedTestName(
                          "Sickle Cell Genotype & Hb Electrophoresis",
                        );
                    }}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Radiology">Radiology & Imaging</option>
                    <option value="Cardiology">
                      Cardiology Investigations
                    </option>
                    <option value="Genetics">Genetics & Molecular</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Priority Classification
                  </label>
                  <select
                    value={labPriority}
                    onChange={(e) => setLabPriority(e.target.value as any)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs"
                  >
                    <option value="Routine">Routine (Standard Queue)</option>
                    <option value="Urgent">Urgent (Within 4 Hours)</option>
                    <option value="Emergency">
                      Emergency STAT (Immediate)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Specific Diagnostic Test
                </label>
                <input
                  type="text"
                  required
                  value={selectedTestName}
                  onChange={(e) => setSelectedTestName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-bold text-purple-950 text-xs"
                  placeholder="e.g. Troponin I High Sensitivity Assay"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Clinical Instructions / Reason for Test
                </label>
                <textarea
                  rows={3}
                  value={labInstructions}
                  onChange={(e) => setLabInstructions(e.target.value)}
                  placeholder="Specify clinical indication, e.g. Rule out myocardial ischemia, check Hb levels..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-800 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl text-slate-600 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-extrabold shadow-md shadow-purple-200 transition-all cursor-pointer"
                >
                  Dispatch Lab Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DOCTOR PROFILE MODAL --- */}
      {showProfileModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shrink-0 font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {doctor.name}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-bold">
                    {doctor.specialty} • {doctor.hospitalName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 hover:bg-blue-100/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-200/70">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Doctor ID
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {doctor.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Department
                  </span>
                  <span className="font-bold text-slate-800">
                    {doctor.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Consultation Fee
                  </span>
                  <span className="font-bold text-emerald-600">
                    ₦
                    {(
                      (doctor as any).consultationFee || 15000
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Direct Contact Phone
                </label>
                <input
                  type="text"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Consultation Schedule Hours
                </label>
                <input
                  type="text"
                  value={docAvailability}
                  onChange={(e) => setDocAvailability(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Specialty Bio & Credentials
                </label>
                <textarea
                  rows={2}
                  value={docBio}
                  onChange={(e) => setDocBio(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-xs text-slate-800"
                />
              </div>

              {/* Security PIN & Password Setup Block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" /> Account
                    Security PIN & Password
                  </h4>
                  {docPinSaved && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      4-Digit Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={docPinInput}
                      onChange={(e) => setDocPinInput(e.target.value)}
                      placeholder="1234"
                      className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono font-bold tracking-widest text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Account Password
                    </label>
                    <input
                      type="password"
                      value={docPasswordInput}
                      onChange={(e) => setDocPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2 border border-slate-200 rounded-lg font-bold text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveDoctorSecuritySettings();
                    alert(
                      "Doctor profile and security settings saved successfully!",
                    );
                    setShowProfileModal(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md shadow-blue-200 cursor-pointer transition-all"
                >
                  Save Profile & Security Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INSPECT DIAGNOSTIC RESULT MODAL --- */}
      {selectedResultModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Diagnostic Finding Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedResultModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex justify-between font-extrabold text-emerald-950">
                <span>{selectedResultModal.testType}</span>
                <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-2 py-0.5 rounded font-black">
                  {selectedResultModal.testCategory || "Laboratory"}
                </span>
              </div>
              <p className="text-slate-700">
                Patient:{" "}
                <strong className="text-slate-900">
                  {selectedResultModal.patientName}
                </strong>{" "}
                (ID:{" "}
                <span className="font-mono">
                  {selectedResultModal.patientId}
                </span>
                )
              </p>
              <p className="text-slate-700">
                Technician / Clinician:{" "}
                <strong className="text-slate-900">
                  {selectedResultModal.labTechnicianName ||
                    selectedResultModal.doctorName}
                </strong>
              </p>
              <p className="text-slate-700">
                Completed Date:{" "}
                <span className="font-mono">
                  {selectedResultModal.completedDate ||
                    selectedResultModal.requestedDate}
                </span>
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-extrabold text-slate-800 block">
                Reported Diagnostic Findings & Findings
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap">
                {selectedResultModal.resultSummary ||
                  "Normal limits. Specimen analyzed with automated controls."}
              </div>
            </div>

            {selectedResultModal.resultFileName && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono font-bold text-blue-950">
                    {selectedResultModal.resultFileName}
                  </span>
                </div>
                <span className="bg-blue-200 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  {selectedResultModal.resultFileType || "PDF"}
                </span>
              </div>
            )}

            <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Synced & encrypted into{" "}
                <strong>{selectedResultModal.patientName}</strong>'s medical
                profile.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedResultModal(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POINT-OF-CARE DIRECT CAPTURE MODAL FOR DOCTOR --- */}
      {showPocModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Direct Point-of-Care Diagnostic Capture
                </h3>
              </div>
              <button
                onClick={() => setShowPocModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-extrabold">
                Instant Bedside Diagnostic Upload
              </p>
              <p>
                Active Patient:{" "}
                <strong className="text-slate-900">
                  {activePatient ? activePatient.name : "Select from queue"}
                </strong>
              </p>
              <p className="text-[11px] text-emerald-800">
                Results uploaded here are synced directly into the patient's
                record in real time.
              </p>
            </div>

            <form
              onSubmit={handleCapturePocResult}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Test Type
                  </label>
                  <select
                    value={pocTestType}
                    onChange={(e) => setPocTestType(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="Point-of-Care Blood Glucose">
                      Point-of-Care Blood Glucose
                    </option>
                    <option value="Bedside 12-Lead ECG">
                      Bedside 12-Lead ECG
                    </option>
                    <option value="Rapid Cardiac Troponin Swab">
                      Rapid Cardiac Troponin
                    </option>
                    <option value="Pulse Oximetry & ABG Scan">
                      ABG / Oximetry Scan
                    </option>
                    <option value="Ophthalmic Tonometry Scan">
                      Ophthalmic Tonometry
                    </option>
                    <option value="Rapid COVID / Flu Swab">
                      Rapid Swab Antigen
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={pocCategory}
                    onChange={(e) => setPocCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Radiology">Imaging</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Diagnostic Findings & Impressions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={pocFindings}
                  onChange={(e) => setPocFindings(e.target.value)}
                  placeholder="e.g. Fasting blood glucose 118 mg/dL. Sinus rhythm without acute ST changes..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Report Attachment Filename
                </label>
                <input
                  type="text"
                  value={pocFileAttachment}
                  onChange={(e) => setPocFileAttachment(e.target.value)}
                  placeholder="e.g. Bedside_ECG_Strip_2026.pdf"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPocModal(false)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPoc}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {submittingPoc
                      ? "Uploading & Syncing..."
                      : "Upload & Sync Profile"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Scanner Modal */}
      <ScanPatientQRModal
        isOpen={showScanQrModal}
        onClose={() => setShowScanQrModal(false)}
        onSelectPatient={(p) => {
          setSelectedEmergencyPatient(p);
          setShowScanQrModal(false);
        }}
      />

      {/* Emergency Medical Profile Display for Staff */}
      {selectedEmergencyPatient && (
        <EmergencyMedicalProfileModal
          patient={selectedEmergencyPatient}
          isOpen={!!selectedEmergencyPatient}
          onClose={() => setSelectedEmergencyPatient(null)}
          scannedByStaff={true}
          staffName={doctor.name}
          staffRole={`${doctor.specialty} Specialist`}
          onBreakGlassConsent={(patientId) => {
            setSelectedEHRPatientId(patientId);
            setSelectedEmergencyPatient(null);
          }}
        />
      )}
    </div>
  );
}
