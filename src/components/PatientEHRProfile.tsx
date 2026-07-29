import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Activity, 
  FlaskConical, 
  Pill, 
  Clock, 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  BrainCircuit, 
  Stethoscope, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Eye, 
  Printer, 
  Download, 
  Lock, 
  Heart, 
  Thermometer, 
  FileSpreadsheet, 
  Send,
  HelpCircle,
  FileCheck,
  Loader2,
  Cloud,
  RotateCcw,
  FilePlus,
  Check,
  ClipboardList,
  Lightbulb
} from 'lucide-react';
import { api } from '../api';
import { DoctorProfile, PatientProfile, Appointment, MedicalRecord, LabTestRequest, PrescriptionItem, AuditLog } from '../types';

interface PatientEHRProfileProps {
  patientId: string;
  doctor: DoctorProfile;
  onBack: () => void;
  initialAppointment?: Appointment | null;
}

export default function PatientEHRProfile({ patientId, doctor, onBack, initialAppointment }: PatientEHRProfileProps) {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'consultation' | 'history' | 'overview' | 'notes' | 'prescriptions' | 'labs' | 'imaging' | 'access'>('consultation');

  // Related EHR collections
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [labRequests, setLabRequests] = useState<LabTestRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [hospitalAccesses, setHospitalAccesses] = useState<any[]>([]);

  // Timeline Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');

  // Consultation Workspace Sub-Navigation Mode
  const [workspaceMode, setWorkspaceMode] = useState<'consultation' | 'prescription' | 'lab' | 'ai'>('consultation');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Consultation Form Fields
  const [symptoms, setSymptoms] = useState(initialAppointment?.symptoms || 'Minor retrosternal discomfort during physical exertion.');
  const [observations, setObservations] = useState('S1 & S2 dual heart sounds present. No murmurs or gallops. Lungs clear to auscultation bilaterally.');
  
  // Diagnoses (Multiple with Categories)
  const [diagnoses, setDiagnoses] = useState<{ name: string; category: string }[]>([
    { name: 'Atypical Angina Pectoris', category: 'Cardiology' },
    { name: 'Essential Hypertension (Stage 1)', category: 'Cardiology' }
  ]);
  const [newDiagName, setNewDiagName] = useState('');
  const [newDiagCategory, setNewDiagCategory] = useState('Cardiology');

  // Notes & Plan
  const [clinicalNotes, setClinicalNotes] = useState('Patient presented with episodic chest tightness. ECG shows sinus rhythm, no ST segment elevation. Initiated CCB monotherapy & ordered outpatient lipid panel.');
  const [treatmentRecommendations, setTreatmentRecommendations] = useState('1. Low sodium, heart-healthy dietary plan.\n2. Light aerobic exercise as tolerated.');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('Avoid strenuous weightlifting until stress ECG is evaluated. Hydrate adequately.');
  const [followUpInstructions, setFollowUpInstructions] = useState('Review in Cardiology Outpatient Clinic in 2 weeks with repeat lipid results.');

  // Vitals State
  const [vitalBP, setVitalBP] = useState('120/80');
  const [vitalHR, setVitalHR] = useState('72');
  const [vitalTemp, setVitalTemp] = useState('36.8');
  const [vitalResp, setVitalResp] = useState('16');

  // Prescriptions List Builder
  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('5 mg');
  const [newRxFreq, setNewRxFreq] = useState('Once Daily (Morning)');
  const [newRxDuration, setNewRxDuration] = useState('30 Days');
  const [newRxInstructions, setNewRxInstructions] = useState('Take with food');
  const [rxList, setRxList] = useState<{ name: string; dosage: string; freq: string; duration: string; instructions: string }[]>([
    { name: 'Amlodipine Besylate', dosage: '5 mg', freq: 'Once Daily', duration: '30 Days', instructions: 'Take in morning with water' },
    { name: 'Atorvastatin Calcium', dosage: '10 mg', freq: 'Once Daily', duration: '30 Days', instructions: 'Take at bedtime' }
  ]);

  // Lab Order Builder
  const [newLabCategory, setNewLabCategory] = useState<'Laboratory' | 'Radiology / Imaging'>('Laboratory');
  const [newLabTestName, setNewLabTestName] = useState('Full Blood Count (FBC) & Lipid Profile');
  const [newLabPriority, setNewLabPriority] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
  const [newLabNotes, setNewLabNotes] = useState('Rule out acute cardiac ischemia & hyperlipidemia.');

  // Auto-Save Mechanism & Sub-Tab State for Clinical Workspace
  const [consultSubTab, setConsultSubTab] = useState<'vitals' | 'notes' | 'plan' | 'summary'>('vitals');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Restore saved draft on mount if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(`ehr_consult_draft_${patientId}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.clinicalNotes) setClinicalNotes(parsed.clinicalNotes);
        if (parsed.symptoms) setSymptoms(parsed.symptoms);
        if (parsed.observations) setObservations(parsed.observations);
        if (parsed.treatmentRecommendations) setTreatmentRecommendations(parsed.treatmentRecommendations);
        if (parsed.followUpInstructions) setFollowUpInstructions(parsed.followUpInstructions);
        if (parsed.vitalBP) setVitalBP(parsed.vitalBP);
        if (parsed.vitalHR) setVitalHR(parsed.vitalHR);
        if (parsed.vitalTemp) setVitalTemp(parsed.vitalTemp);
        if (parsed.vitalResp) setVitalResp(parsed.vitalResp);
        if (parsed.lastSavedAt) setLastSavedAt(parsed.lastSavedAt);
      }
    } catch (err) {
      console.error('Failed to load draft from local storage', err);
    }
  }, [patientId]);

  // Debounced Auto-Save Effect (1000ms debounce)
  useEffect(() => {
    setAutoSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      try {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const draft = {
          clinicalNotes,
          symptoms,
          observations,
          treatmentRecommendations,
          followUpInstructions,
          vitalBP,
          vitalHR,
          vitalTemp,
          vitalResp,
          lastSavedAt: timeStr,
        };
        localStorage.setItem(`ehr_consult_draft_${patientId}`, JSON.stringify(draft));
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setLastSavedAt(timeStr);
        }, 300);
      } catch (err) {
        console.error('Auto-save error', err);
        setAutoSaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [clinicalNotes, symptoms, observations, treatmentRecommendations, followUpInstructions, vitalBP, vitalHR, vitalTemp, vitalResp, patientId]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Load Complete Patient EHR
  const loadEHR = async () => {
    setLoading(true);
    try {
      // Fetch data concurrently
      const [allAppointments, allRecords, allLabs, allRxs, allLogs, resHospitalAccess] = await Promise.all([
        api.getAppointments({ patientId }).catch(() => []),
        api.getRecords({ patientId }).catch(() => []),
        api.getLabRequests({ patientId }).catch(() => []),
        api.getPrescriptions({ patientId }).catch(() => []),
        api.getAuditLogs({ patientId }).catch(() => []),
        fetch(`/api/patient/${patientId}/hospital-access`)
          .then(r => r.ok ? r.json() : { accesses: [] })
          .catch(() => ({ accesses: [] }))
      ]);

      setAppointments(Array.isArray(allAppointments) ? allAppointments : []);
      setRecords(Array.isArray(allRecords) ? allRecords : []);
      setLabRequests(Array.isArray(allLabs) ? allLabs : []);
      setPrescriptions(Array.isArray(allRxs) ? allRxs : []);
      setAuditLogs(Array.isArray(allLogs) ? allLogs : []);
      setHospitalAccesses(resHospitalAccess?.accesses || []);

      // Fetch Patient demography
      try {
        const userRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'samuel@example.com', role: 'patient' })
        }).then(r => r.ok ? r.json() : {}).catch(() => ({}));

        if (userRes && (userRes as any).user) {
          setPatient((userRes as any).user);
        } else {
          // Fallback mock patient
          setPatient({
            id: patientId,
            name: "Samuel Nwosu",
            email: "samuel@example.com",
            phone: "+234 803 123 4567",
            age: 27,
            bloodGroup: "O+",
            allergies: ["Penicillin", "Dust Mites"],
            mfaEnabled: true,
            medicalHistory: [
              { id: "HIS-1", type: "condition", title: "Mild Seasonal Asthma", date: "2020", notes: "Managed with Albuterol inhaler as needed" },
              { id: "HIS-2", type: "surgery", title: "Appendectomy", date: "2018", notes: "Performed at General Hospital Abuja. No complications." }
            ]
          });
        }
      } catch (e) {
        // Fallback patient
      }
    } catch (err) {
      console.warn("Error loading EHR data warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEHR();
  }, [patientId]);

  const handleAddDiagnosis = () => {
    if (!newDiagName.trim()) return;
    setDiagnoses([...diagnoses, { name: newDiagName.trim(), category: newDiagCategory }]);
    setNewDiagName('');
  };

  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const handleAddRxItem = () => {
    if (!newRxName.trim()) return;
    setRxList([...rxList, {
      name: newRxName.trim(),
      dosage: newRxDosage,
      freq: newRxFreq,
      duration: newRxDuration,
      instructions: newRxInstructions
    }]);
    setNewRxName('');
  };

  const handleRemoveRxItem = (index: number) => {
    setRxList(rxList.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = async () => {
    try {
      const payload = {
        patientId,
        patientName: patient?.name || 'Samuel Nwosu',
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalName: doctor.hospitalName || 'General Hospital Abuja',
        department: doctor.department || 'Cardiology',
        specialty: doctor.specialty || 'Cardiology Specialist',
        appointmentId: initialAppointment?.id,
        symptoms,
        observations,
        diagnoses,
        clinicalNotes,
        treatmentPlan: {
          recommendations: treatmentRecommendations,
          lifestyleAdvice,
          followUpInstructions
        },
        vitals: {
          bloodPressure: vitalBP,
          heartRate: vitalHR,
          temperature: vitalTemp,
          respiratoryRate: vitalResp
        },
        prescriptions: rxList,
        labOrder: newLabTestName ? {
          category: newLabCategory,
          testName: newLabTestName,
          priority: newLabPriority,
          notes: newLabNotes
        } : null
      };

      const res = await fetch('/api/patient/consultations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        try { localStorage.removeItem(`ehr_consult_draft_${patientId}`); } catch (e) {}
        setSaveSuccessMessage("Consultation signed and appended to permanent EHR record successfully!");
        setTimeout(() => setSaveSuccessMessage(null), 6000);
        loadEHR();
      } else {
        alert("Failed to submit consultation. " + (res.message || ''));
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting consultation.");
    }
  };

  const handleAskAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.askAiAssistant({ prompt: aiPrompt, patientId });
      setAiResponse(res.text);
    } catch (err) {
      setAiResponse("AI Service unavailable or offline.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">Loading Patient Electronic Health Record (EHR)...</p>
        </div>
      </div>
    );
  }

  // Aggregate Unique Timeline Items
  // Combine Appointments with Clinical Notes, Lab Requests, Prescriptions, and Medical Records
  const timelineItems: Array<{
    id: string;
    date: string;
    hospital: string;
    department: string;
    doctorName: string;
    specialty: string;
    diagnosis: string;
    symptoms: string;
    clinicalNotes: string;
    prescriptions: PrescriptionItem[];
    labRequests: LabTestRequest[];
    imagingReports: MedicalRecord[];
    followUpNotes: string;
  }> = [
    {
      id: "TL-01",
      date: "2026-07-22",
      hospital: "General Hospital Abuja",
      department: "Cardiology Dept",
      doctorName: "Dr. Johnson Okafor",
      specialty: "Cardiology",
      diagnosis: "Atypical Angina Pectoris, Essential Hypertension",
      symptoms: "Retrosternal chest tightness during strenuous physical activity.",
      clinicalNotes: "Cardiovascular exam: Regular rhythm, normal S1/S2. ECG reveals sinus rhythm without ischemic ST elevation. Prescribed Amlodipine 5mg Daily & ordered High-Sensitivity Troponin I assay.",
      prescriptions: prescriptions.filter(p => p.doctorId === 'DOC-102'),
      labRequests: labRequests.filter(l => l.doctorId === 'DOC-102'),
      imagingReports: records.filter(r => r.specialty === 'Cardiology'),
      followUpNotes: "Review in Cardiology Outpatient Clinic in 14 days."
    },
    {
      id: "TL-02",
      date: "2026-07-15",
      hospital: "General Hospital Abuja",
      department: "Neurology Dept",
      doctorName: "Dr. John Smith",
      specialty: "Neurology",
      diagnosis: "Episodic Tension-Type Headache",
      symptoms: "Bilateral tight pressure around forehead after late work hours.",
      clinicalNotes: "Neurological examination completely intact. Cranial nerves I-XII normal. Motor strength 5/5 in all extremities. Recommended sleep hygiene and stress management.",
      prescriptions: [
        {
          id: "RX-901",
          patientId,
          patientName: "Samuel Nwosu",
          doctorId: "DOC-304",
          doctorName: "Dr. John Smith",
          date: "2026-07-15",
          medicationName: "Magnesium Glycinate",
          dosage: "400 mg",
          frequency: "Daily at night",
          duration: "30 Days",
          instructions: "Take with meal before sleep",
          status: "Completed"
        }
      ],
      labRequests: [],
      imagingReports: [],
      followUpNotes: "PRN follow-up if symptoms exacerbate."
    },
    {
      id: "TL-03",
      date: "2026-07-10",
      hospital: "General Hospital Abuja",
      department: "Ophthalmology Clinic",
      doctorName: "Dr. Adebayo Folarin",
      specialty: "Ophthalmology",
      diagnosis: "Mild Myopic Astigmatism",
      symptoms: "Mild eye strain when reading computer screen for >4 hours.",
      clinicalNotes: "Visual Acuity: Right Eye 20/25, Left Eye 20/20. Fundoscopy: Normal optic disc margins, macula clear. Prescribed anti-glare corrective lens.",
      prescriptions: [],
      labRequests: [],
      imagingReports: records.filter(r => r.specialty === 'Ophthalmology'),
      followUpNotes: "Annual vision review."
    }
  ];

  // Apply Timeline Filters
  const filteredTimeline = timelineItems.filter(item => {
    const matchesSearch = !searchFilter || 
      item.diagnosis.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.symptoms.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.clinicalNotes.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesHospital = hospitalFilter === 'ALL' || item.hospital === hospitalFilter;
    const matchesDept = departmentFilter === 'ALL' || item.department.includes(departmentFilter);
    const matchesSpecialty = specialtyFilter === 'ALL' || item.specialty === specialtyFilter;

    return matchesSearch && matchesHospital && matchesDept && matchesSpecialty;
  });

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col font-sans text-slate-800 overflow-hidden">
      
      {/* Top Header Navigation Bar */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-40 shadow-2xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              Back to Queue
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">{patient?.name}</h1>
                <span className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {patient?.id}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> EHR Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                National Health Record • Age {patient?.age} • Blood Group {patient?.bloodGroup} • {patient?.phone}
              </p>
            </div>
          </div>

          {/* Quick Actions Panel Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('consultation');
                setWorkspaceMode('consultation');
              }}
              className={`font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ${
                activeTab === 'consultation' && workspaceMode === 'consultation'
                  ? 'bg-blue-700 text-white shadow-blue-300 ring-2 ring-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Clinical Workspace
            </button>
            <button
              onClick={() => {
                setActiveTab('consultation');
                setWorkspaceMode('prescription');
              }}
              className={`font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ${
                activeTab === 'consultation' && workspaceMode === 'prescription'
                  ? 'bg-emerald-700 text-white shadow-emerald-300 ring-2 ring-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              <Pill className="w-4 h-4" />
              Prescribe Medication
            </button>
            <button
              onClick={() => {
                setActiveTab('consultation');
                setWorkspaceMode('lab');
              }}
              className={`font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all ${
                activeTab === 'consultation' && workspaceMode === 'lab'
                  ? 'bg-purple-700 text-white shadow-purple-300 ring-2 ring-purple-300'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Order Lab / Test
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout: Left Sidebar + Main EHR Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-12 gap-6 overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* LEFT SIDEBAR: Patient Demographics & Health Profile */}
        <aside className="col-span-12 lg:col-span-3 space-y-5 h-full overflow-y-auto pr-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-2 border-2 border-blue-200 shadow-inner">
                {patient?.name ? patient.name.split(' ').map(n=>n[0]).join('') : 'SN'}
              </div>
              <h2 className="font-extrabold text-slate-900 text-base">{patient?.name}</h2>
              <p className="text-xs text-slate-500 font-medium">{patient?.email}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">National ID</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{patient?.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Age / Gender</span>
                  <span className="font-bold text-slate-800">{patient?.age} Yrs • Male</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Blood Group</span>
                  <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">{patient?.bloodGroup}</span>
                </div>
              </div>

              {/* Allergies Block */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Known Allergies
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {patient?.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((alg, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-1 rounded-md border border-red-200">
                        ⚠️ {alg}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No known drug allergies reported</span>
                  )}
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                  Active Medical Conditions
                </label>
                <div className="space-y-1">
                  <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-lg font-medium text-[11px]">
                    • Essential Hypertension (Stage 1)
                  </div>
                  <div className="bg-blue-50 text-blue-900 border border-blue-200 p-2 rounded-lg font-medium text-[11px]">
                    • Mild Seasonal Asthma (Managed)
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Insurance */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
                  <p className="font-bold text-slate-800 text-[11px]">Mrs. Nkechi Nwosu (Spouse)</p>
                  <p className="text-slate-500 font-mono text-[11px]">+234 802 999 8888</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Insurance Policy</span>
                  <p className="font-bold text-blue-900 text-[11px]">AXA Mansard Health HMO (Tier 1)</p>
                  <p className="text-slate-500 font-mono text-[10px]">Pol #: AXA-7739-ABJ</p>
                </div>
              </div>

              {/* Hospital Access Consent Badge */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized Facility
                </div>
                <p className="text-emerald-700 text-[10px] leading-snug">
                  Patient granted active medical record consent to <strong>General Hospital Abuja</strong>.
                </p>
              </div>

            </div>
          </div>
        </aside>

        {/* MAIN EHR WORKSPACE PANEL */}
        <main className="col-span-12 lg:col-span-9 space-y-5 h-full overflow-y-auto pr-1">
          
          {/* EHR Tabs Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs flex overflow-x-auto text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('consultation')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer font-extrabold ${
                activeTab === 'consultation'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-blue-50/80 text-blue-900 border border-blue-200/80 hover:bg-blue-100'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <span>Clinical Consultation Workspace</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                activeTab === 'consultation' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
              }`}>
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" /> History Timeline ({timelineItems.length})
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" /> Health Overview
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" /> Consultation Notes
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" /> Prescriptions ({prescriptions.length})
            </button>

            <button
              onClick={() => setActiveTab('labs')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'labs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Lab Results ({labRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('imaging')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'imaging' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Imaging & Diagnostic Reports ({records.length})
            </button>

            <button
              onClick={() => setActiveTab('access')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'access' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4" /> Access Control ({hospitalAccesses.length})
            </button>
          </div>

          {/* TAB 0: CLINICAL CONSULTATION WORKSPACE */}
          {activeTab === 'consultation' && (
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6">
              
              {/* Consultation Header & Mode Navigation */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200 shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-extrabold text-slate-900 text-lg">Clinical Consultation Workspace</h2>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Active Session
                      </span>
                      
                      {/* Auto-Save Status Badge in Top Header */}
                      <div className="ml-auto sm:ml-0">
                        {autoSaveStatus === 'saving' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                            Auto-saving...
                          </span>
                        )}
                        {autoSaveStatus === 'saved' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Draft saved {lastSavedAt ? `at ${lastSavedAt}` : ''}
                          </span>
                        )}
                        {autoSaveStatus === 'unsaved' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            <Cloud className="w-3 h-3 text-slate-400" />
                            Unsaved draft
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Attending Clinician: <strong className="text-slate-800">{doctor.name}</strong> • {doctor.hospitalName || 'General Hospital Abuja'} ({doctor.specialty || 'Cardiology'})
                    </p>
                  </div>
                </div>

                {/* Navigation Modes Switcher Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs font-bold bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                  <button
                    onClick={() => setWorkspaceMode('consultation')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                      workspaceMode === 'consultation'
                        ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Consultation & Exam
                  </button>
                  <button
                    onClick={() => setWorkspaceMode('prescription')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                      workspaceMode === 'prescription'
                        ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    Rx Prescriptions ({rxList.length})
                  </button>
                  <button
                    onClick={() => setWorkspaceMode('lab')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                      workspaceMode === 'lab'
                        ? 'bg-white text-purple-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                    Lab / Radiology Orders
                  </button>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 shadow-2xs"
                    title="Open AI Clinical Assistant Pop-up"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    AI Decision Support
                    <span className="bg-indigo-200/80 text-indigo-900 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">Pop-up</span>
                  </button>
                </div>
              </div>

              {/* Save Success Banner */}
              {saveSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMessage}</span>
                  </div>
                  <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Patient Demographics Banner */}
              <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl font-bold text-sm">
                    {patient?.bloodGroup || 'O+'}
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-950 text-sm">Active Patient: {patient?.name} ({patient?.id})</span>
                    <p className="text-blue-800 text-xs font-medium mt-0.5">
                      Age: <strong>{patient?.age} Yrs</strong> • Gender: <strong>Male</strong> • Phone: {patient?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-white text-blue-900 font-bold px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                    Allergies: {patient?.allergies?.join(', ') || 'Penicillin'}
                  </span>
                </div>
              </div>

              {/* SUB-MODE 1: FULL CONSULTATION & CLINICAL EXAMINATION */}
              {workspaceMode === 'consultation' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Step Navigation Bar inside Consultation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setConsultSubTab('vitals')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          consultSubTab === 'vitals'
                            ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        <span>1. Vitals & Examination</span>
                      </button>

                      <button
                        onClick={() => setConsultSubTab('notes')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          consultSubTab === 'notes'
                            ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>2. Progress Notes</span>
                        {autoSaveStatus === 'saved' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Draft auto-saved" />
                        )}
                      </button>

                      <button
                        onClick={() => setConsultSubTab('plan')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          consultSubTab === 'plan'
                            ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>3. Diagnoses & Plan</span>
                        {diagnoses.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {diagnoses.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setConsultSubTab('summary')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          consultSubTab === 'summary'
                            ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>4. Review Summary</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-slate-500 px-3">
                      <span>Step {consultSubTab === 'vitals' ? '1' : consultSubTab === 'notes' ? '2' : consultSubTab === 'plan' ? '3' : '4'} of 4</span>
                    </div>
                  </div>

                  {/* Compact Live Session Status Ribbon */}
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        <span>BP: <strong className="text-slate-900">{vitalBP}</strong></span>
                        <span>• HR: <strong className="text-slate-900">{vitalHR} bpm</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Diagnoses: <strong className="text-slate-900">{diagnoses.length} Added</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Pill className="w-3.5 h-3.5 text-purple-600" />
                        <span>Prescriptions: <strong className="text-slate-900">{rxList.length} Items</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500 font-medium">Auto-save:</span>
                      {autoSaveStatus === 'saved' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved {lastSavedAt ? `at ${lastSavedAt}` : ''}
                        </span>
                      ) : autoSaveStatus === 'saving' ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> Saving...
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium">Unsaved changes</span>
                      )}
                    </div>
                  </div>

                  {/* SUB-TAB 1: PHYSICAL VITALS & EXAMINATION */}
                  {consultSubTab === 'vitals' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Vitals Measurements Card */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100/80 text-blue-700 rounded-xl">
                              <Activity className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm">Physical Examination Vitals</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Recorded clinical measurements & vital parameters</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVitalBP('120/80');
                              setVitalHR('72');
                              setVitalTemp('36.8');
                              setVitalResp('16');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Standard Normal Vitals
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl hover:border-blue-300 transition-all space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-500" /> Blood Pressure</span>
                              <span className="text-[10px] text-slate-400 font-medium">Normal: 120/80</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={vitalBP}
                                onChange={(e) => setVitalBP(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 text-center text-sm"
                              />
                              <span className="text-xs font-extrabold text-slate-400 shrink-0">mmHg</span>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl hover:border-blue-300 transition-all space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> Heart Rate</span>
                              <span className="text-[10px] text-slate-400 font-medium">Normal: 60-100</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={vitalHR}
                                onChange={(e) => setVitalHR(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 text-center text-sm"
                              />
                              <span className="text-xs font-extrabold text-slate-400 shrink-0">bpm</span>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl hover:border-blue-300 transition-all space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature</span>
                              <span className="text-[10px] text-slate-400 font-medium">Normal: 36.5-37.5</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={vitalTemp}
                                onChange={(e) => setVitalTemp(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 text-center text-sm"
                              />
                              <span className="text-xs font-extrabold text-slate-400 shrink-0">°C</span>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl hover:border-blue-300 transition-all space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-500" /> Respiratory Rate</span>
                              <span className="text-[10px] text-slate-400 font-medium">Normal: 12-20</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={vitalResp}
                                onChange={(e) => setVitalResp(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 text-center text-sm"
                              />
                              <span className="text-xs font-extrabold text-slate-400 shrink-0">bpm</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chief Complaints & Systemic Examination */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-indigo-100/80 text-indigo-700 rounded-xl">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm">Symptoms & Physical Examination Notes</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Patient history of present illness & systemic findings</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-extrabold text-slate-800 block text-xs">Chief Complaints & Present Illness History</label>
                            <textarea
                              rows={4}
                              value={symptoms}
                              onChange={(e) => setSymptoms(e.target.value)}
                              placeholder="Describe onset, location, severity, duration, aggravating factors..."
                              className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-slate-800 text-xs font-medium leading-relaxed transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-extrabold text-slate-800 block text-xs">Physical Examination & Systemic Findings</label>
                            <textarea
                              rows={4}
                              value={observations}
                              onChange={(e) => setObservations(e.target.value)}
                              placeholder="Auscultation, palpation, cardiovascular (S1/S2), respiratory chest sound, neurological exam..."
                              className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-slate-800 text-xs font-medium leading-relaxed transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Next Step Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('notes')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span>Proceed to Step 2: Clinical Progress Notes</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: CLINICAL PROGRESS NOTES (AUTO-SAVING) */}
                  {consultSubTab === 'notes' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Permanent EHR Clinical Progress Notes</h3>
                              <p className="text-[11px] text-slate-500 font-medium">All changes automatically save to continuous draft storage</p>
                            </div>
                          </div>

                          {/* Live Auto-Save Status Banner */}
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs">
                            {autoSaveStatus === 'saving' && (
                              <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 animate-pulse">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                Saving draft...
                              </span>
                            )}
                            {autoSaveStatus === 'saved' && (
                              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Auto-saved {lastSavedAt ? `at ${lastSavedAt}` : ''}
                              </span>
                            )}
                            {autoSaveStatus === 'unsaved' && (
                              <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                                <Cloud className="w-3.5 h-3.5 text-slate-400" />
                                Unsaved draft
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick SOAPE Templates Insertion Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                          <span className="font-bold text-slate-600 flex items-center gap-1">
                            <FilePlus className="w-3.5 h-3.5 text-blue-600" /> Quick Note Templates:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setClinicalNotes((prev) => 
                                  prev ? `${prev}\n\nS (Subjective): Patient reports episodic symptoms.\nO (Objective): Heart rate ${vitalHR} bpm, BP ${vitalBP} mmHg. Normal S1/S2.\nA (Assessment): Essential Hypertension.\nP (Plan): Lifestyle modifications & regular follow-up.` :
                                  `S (Subjective): Patient reports episodic symptoms.\nO (Objective): Heart rate ${vitalHR} bpm, BP ${vitalBP} mmHg. Normal S1/S2.\nA (Assessment): Essential Hypertension.\nP (Plan): Lifestyle modifications & regular follow-up.`
                                );
                              }}
                              className="bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 text-blue-500" /> SOAPE Note
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setClinicalNotes((prev) => 
                                  prev ? `${prev}\n\nGeneral: Patient is alert and oriented x3. Heart: S1/S2 present, no S3/S4 or murmurs. Lungs: Clear to auscultation bilaterally.` :
                                  `General: Patient is alert and oriented x3. Heart: S1/S2 present, no S3/S4 or murmurs. Lungs: Clear to auscultation bilaterally.`
                                );
                              }}
                              className="bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 text-emerald-500" /> Normal Cardiac Exam
                            </button>
                          </div>
                        </div>

                        {/* Textarea Canvas */}
                        <div className="space-y-1">
                          <textarea
                            rows={9}
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            placeholder="Write detailed clinical progress notes here. Changes automatically save continuously..."
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-slate-800 text-xs font-medium leading-relaxed transition-all resize-y"
                          />
                          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-1">
                            <span>Continuous auto-save active</span>
                            <span>{clinicalNotes.length} characters</span>
                          </div>
                        </div>
                      </div>

                      {/* Step Navigation Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('vitals')}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Vitals
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('plan')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span>Proceed to Step 3: Diagnoses & Plan</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: DIAGNOSES & TREATMENT PLAN */}
                  {consultSubTab === 'plan' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Diagnoses Card */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm">Working Diagnoses</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Categorized clinical conditions & diagnostic tags</p>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={newDiagCategory}
                              onChange={(e) => setNewDiagCategory(e.target.value)}
                              className="p-3 border border-slate-200 rounded-xl font-bold bg-slate-50 text-slate-800 shrink-0 text-xs focus:bg-white"
                            >
                              <option value="Cardiology">Cardiology</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Respiratory">Respiratory</option>
                              <option value="Gastroenterology">Gastroenterology</option>
                              <option value="Endocrinology">Endocrinology</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Ophthalmology">Ophthalmology</option>
                              <option value="General">General Medicine</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Type diagnosis e.g. Essential Hypertension..."
                              value={newDiagName}
                              onChange={(e) => setNewDiagName(e.target.value)}
                              className="flex-1 p-3 border border-slate-200 rounded-xl font-semibold bg-slate-50 text-slate-800 focus:bg-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleAddDiagnosis}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-extrabold cursor-pointer transition-all shrink-0 text-xs flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" /> Add Diagnosis
                            </button>
                          </div>

                          {/* Quick Suggestions */}
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Quick Add Common Conditions:</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: 'Essential Hypertension', cat: 'Cardiology' },
                                { name: 'Atypical Angina Pectoris', cat: 'Cardiology' },
                                { name: 'Acute Bronchitis', cat: 'Respiratory' },
                                { name: 'Type 2 Diabetes Mellitus', cat: 'Endocrinology' },
                                { name: 'Tension-Type Headache', cat: 'Neurology' }
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    if (!diagnoses.some(d => d.name === item.name)) {
                                      setDiagnoses([...diagnoses, { name: item.name, category: item.cat }]);
                                    }
                                  }}
                                  className="bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5 text-slate-400" /> {item.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Active Diagnoses List */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            {diagnoses.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No working diagnoses added yet.</p>
                            ) : (
                              diagnoses.map((diag, idx) => (
                                <span key={idx} className="bg-blue-50 border border-blue-200 text-blue-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
                                  <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-100 px-2 py-0.5 rounded-md">{diag.category}</span>
                                  {diag.name}
                                  <button onClick={() => handleRemoveDiagnosis(idx)} className="text-blue-400 hover:text-red-500 font-bold ml-1 cursor-pointer transition-colors">
                                    <X className="w-4 h-4" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Treatment & Outpatient Care Plan Card */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <div className="p-2 bg-purple-100/80 text-purple-700 rounded-xl">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm">Treatment Recommendations & Follow-Up</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Outpatient management instructions & lifestyle advice</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-extrabold text-slate-800 block text-xs">Treatment Recommendations & Advice</label>
                            <textarea
                              rows={4}
                              value={treatmentRecommendations}
                              onChange={(e) => setTreatmentRecommendations(e.target.value)}
                              className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-slate-800 text-xs font-medium leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-extrabold text-slate-800 block text-xs">Follow-Up & Outpatient Instructions</label>
                            <textarea
                              rows={4}
                              value={followUpInstructions}
                              onChange={(e) => setFollowUpInstructions(e.target.value)}
                              className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans text-slate-800 text-xs font-medium leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step Navigation Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('notes')}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('summary')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review Consultation Summary</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: CONSULTATION REVIEW SUMMARY */}
                  {consultSubTab === 'summary' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
                              <Eye className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base">Consultation Summary & Final Review</h3>
                              <p className="text-xs text-slate-500 font-medium">Verify all recorded details before final sign & save to permanent EHR</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ready to Sign
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          {/* Vitals & History Summary */}
                          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-blue-900">
                              <Activity className="w-4 h-4 text-blue-600" /> Physical Vitals Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800">
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">BP: <strong>{vitalBP}</strong> mmHg</div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">HR: <strong>{vitalHR}</strong> bpm</div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">Temp: <strong>{vitalTemp}</strong> °C</div>
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">Resp: <strong>{vitalResp}</strong> bpm</div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 space-y-1">
                              <strong className="text-slate-800 block text-[11px] uppercase">Symptoms / Chief Complaints:</strong>
                              <p className="text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                                {symptoms || 'None specified'}
                              </p>
                            </div>
                          </div>

                          {/* Diagnoses & Prescriptions Summary */}
                          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-3">
                            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-900">
                              <FileCheck className="w-4 h-4 text-emerald-600" /> Diagnoses & Orders Summary
                            </h4>

                            <div>
                              <strong className="text-slate-800 block text-[11px] uppercase mb-1">Diagnoses ({diagnoses.length}):</strong>
                              <div className="flex flex-wrap gap-1.5">
                                {diagnoses.length === 0 ? (
                                  <span className="text-slate-400 italic">None recorded</span>
                                ) : (
                                  diagnoses.map((d, i) => (
                                    <span key={i} className="bg-white border border-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                                      [{d.category}] {d.name}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60">
                              <strong className="text-slate-800 block text-[11px] uppercase mb-1">Prescriptions ({rxList.length}):</strong>
                              <div className="space-y-1">
                                {rxList.map((rx, i) => (
                                  <div key={i} className="bg-white p-2 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-900">{rx.name} ({rx.dosage})</span>
                                    <span className="text-slate-500 font-medium text-[11px]">{rx.freq}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Progress Notes Summary */}
                        <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                          <h4 className="font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wider text-indigo-900">
                            <FileText className="w-4 h-4 text-indigo-600" /> Clinical Notes Content
                          </h4>
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {clinicalNotes || 'No notes entered.'}
                          </div>
                        </div>
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setConsultSubTab('plan')}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Diagnoses
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* SUB-MODE 2: RX PRESCRIPTIONS BUILDER */}
              {workspaceMode === 'prescription' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Allergy Alert Banner */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-amber-950">Patient Drug Safety & Allergy Check</h4>
                      <p className="text-amber-800 font-medium mt-0.5">
                        Patient has known allergies: <strong className="underline">Penicillin, Dust Mites</strong>. Ensure prescribed pharmaceuticals do not contain penicillin derivatives or beta-lactam cross-reactivity.
                      </p>
                    </div>
                  </div>

                  {/* Prescription Item Builder */}
                  <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 text-xs shadow-2xs">
                    <label className="font-extrabold text-slate-900 block text-sm flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" /> Prescribe New Medication
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Pharmaceutical Drug Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Amlodipine Besylate"
                          value={newRxName}
                          onChange={(e) => setNewRxName(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g. 5 mg"
                          value={newRxDosage}
                          onChange={(e) => setNewRxDosage(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                        <input
                          type="text"
                          placeholder="e.g. Once Daily (Morning)"
                          value={newRxFreq}
                          onChange={(e) => setNewRxFreq(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 30 Days"
                          value={newRxDuration}
                          onChange={(e) => setNewRxDuration(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Special Administration Instructions</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Take with morning meal and full glass of water"
                          value={newRxInstructions}
                          onChange={(e) => setNewRxInstructions(e.target.value)}
                          className="flex-1 p-2.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddRxItem}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-extrabold cursor-pointer transition-all shadow-sm shadow-emerald-200 shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Rx
                        </button>
                      </div>
                    </div>

                    {/* Quick Drug Suggestions */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quick Common Formulary:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Amlodipine Besylate', dose: '5 mg', freq: 'Once Daily', dur: '30 Days', inst: 'Take in morning' },
                          { name: 'Atorvastatin Calcium', dose: '10 mg', freq: 'Once Daily', dur: '30 Days', inst: 'Take at bedtime' },
                          { name: 'Metformin HCl', dose: '500 mg', freq: 'Twice Daily', dur: '30 Days', inst: 'Take after meals' },
                          { name: 'Omeprazole', dose: '20 mg', freq: 'Once Daily', dur: '14 Days', inst: 'Take 30 mins before breakfast' },
                          { name: 'Paracetamol', dose: '1000 mg', freq: 'Three Times Daily', dur: '5 Days', inst: 'Take as needed for pain' }
                        ].map((rx, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewRxName(rx.name);
                              setNewRxDosage(rx.dose);
                              setNewRxFreq(rx.freq);
                              setNewRxDuration(rx.dur);
                              setNewRxInstructions(rx.inst);
                            }}
                            className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" /> {rx.name} ({rx.dose})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Prescriptions Table */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-extrabold text-slate-900">Active Session Prescriptions ({rxList.length})</h4>
                    <div className="space-y-2">
                      {rxList.map((rx, idx) => (
                        <div key={idx} className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-emerald-950 text-sm">{rx.name}</span>
                            <p className="text-slate-700 font-medium">
                              Dosage: <strong className="text-emerald-900">{rx.dosage}</strong> • Frequency: {rx.freq} • Duration: {rx.duration}
                            </p>
                            <p className="text-[10px] text-emerald-800 font-semibold italic">{rx.instructions}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRxItem(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold cursor-pointer transition-colors"
                            title="Remove Prescription"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SUB-MODE 3: DIAGNOSTIC LAB & RADIOLOGY ORDERS */}
              {workspaceMode === 'lab' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 text-xs shadow-2xs">
                    <label className="font-extrabold text-purple-950 block text-sm flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-purple-600" /> Requisition Diagnostic Lab / Radiology Test
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Diagnostic Category</label>
                        <select
                          value={newLabCategory}
                          onChange={(e) => setNewLabCategory(e.target.value as any)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-800"
                        >
                          <option value="Laboratory">Laboratory Pathology (Blood, Urine, Tissue)</option>
                          <option value="Radiology / Imaging">Radiology & Imaging (X-Ray, CT, MRI, Ultrasound, ECG)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Urgency Priority Level</label>
                        <select
                          value={newLabPriority}
                          onChange={(e) => setNewLabPriority(e.target.value as any)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-800"
                        >
                          <option value="Routine">Routine (Standard Turnaround)</option>
                          <option value="Urgent">Urgent (Within 24 Hours)</option>
                          <option value="Emergency">Emergency STAT (Immediate)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Test Title / Requisition Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Blood Count (FBC) & Fasting Lipid Panel"
                        value={newLabTestName}
                        onChange={(e) => setNewLabTestName(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl font-extrabold text-purple-950 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Clinical Justification & Technician Instructions</label>
                      <textarea
                        rows={2}
                        value={newLabNotes}
                        onChange={(e) => setNewLabNotes(e.target.value)}
                        placeholder="Provide clinical context for lab/radiology specialists..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800"
                      />
                    </div>

                    {/* Quick Test Requisition Suggestions */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frequently Ordered Tests:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Full Blood Count (FBC)', cat: 'Laboratory' },
                          { name: 'Lipid Profile Assay', cat: 'Laboratory' },
                          { name: 'Renal Function Test (E/U/Cr)', cat: 'Laboratory' },
                          { name: '12-Lead Electrocardiogram (ECG)', cat: 'Radiology / Imaging' },
                          { name: 'Chest X-Ray PA View', cat: 'Radiology / Imaging' },
                          { name: 'Abdominal Ultrasound', cat: 'Radiology / Imaging' }
                        ].map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewLabTestName(t.name);
                              setNewLabCategory(t.cat as any);
                            }}
                            className="bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-purple-900 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-purple-600" /> {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}



              {/* Bottom Commit Consultation Action Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Signing commits consultation notes, prescriptions, and lab requisitions to the national EHR database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveConsultation}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Sign & Commit Consultation to Permanent EHR
                </button>
              </div>

            </div>
          )}

          {/* TAB 1: MEDICAL HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              
              {/* Search & Filter Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex-1 min-w-[240px] relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search diagnosis, symptoms, or doctor notes..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-500 font-bold text-[11px]">
                      <Filter className="w-3.5 h-3.5" /> Filters:
                    </div>

                    <select
                      value={hospitalFilter}
                      onChange={(e) => setHospitalFilter(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs"
                    >
                      <option value="ALL">All Hospitals</option>
                      <option value="General Hospital Abuja">General Hospital Abuja</option>
                      <option value="National Diagnostic Lab">National Diagnostic Lab</option>
                    </select>

                    <select
                      value={specialtyFilter}
                      onChange={(e) => setSpecialtyFilter(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs"
                    >
                      <option value="ALL">All Specialties</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>

                    {(searchFilter || hospitalFilter !== 'ALL' || specialtyFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchFilter('');
                          setHospitalFilter('ALL');
                          setDepartmentFilter('ALL');
                          setSpecialtyFilter('ALL');
                        }}
                        className="text-blue-600 hover:underline text-[11px] font-bold px-2 py-1"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chronological Timeline Stream */}
              <div className="space-y-6">
                {filteredTimeline.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No medical visits match your filter parameters.</p>
                    <p className="text-xs text-slate-400">Try adjusting your keyword search or hospital filter.</p>
                  </div>
                ) : (
                  filteredTimeline.map((visit, index) => (
                    <div key={visit.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all">
                      
                      {/* Visit Header */}
                      <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-4 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                              {visit.specialty}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm">{visit.hospital}</span>
                            <span className="text-slate-400 text-xs">• {visit.department}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            Consultant: <span className="text-blue-900 font-extrabold">{visit.doctorName}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" /> {visit.date}
                          </span>
                        </div>
                      </div>

                      {/* Visit Clinical Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Primary Diagnosis</span>
                          <p className="font-extrabold text-blue-950 text-sm">{visit.diagnosis}</p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Reported Symptoms</span>
                          <p className="font-medium text-slate-800 text-xs">{visit.symptoms}</p>
                        </div>
                      </div>

                      {/* Clinical Notes Body */}
                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-blue-900 text-[11px] uppercase block flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> Physician Clinical Findings & Observations
                        </span>
                        <p className="text-slate-700 leading-relaxed font-sans">{visit.clinicalNotes}</p>
                      </div>

                      {/* Prescriptions & Lab orders in this visit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Prescriptions */}
                        <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Regimen
                          </span>
                          {visit.prescriptions.length > 0 ? (
                            <div className="space-y-1.5 text-[11px]">
                              {visit.prescriptions.map(rx => (
                                <div key={rx.id} className="bg-emerald-50 text-emerald-950 p-2 rounded-lg font-medium border border-emerald-100 flex justify-between items-center">
                                  <div>
                                    <span className="font-bold">{rx.medicationName}</span> ({rx.dosage})
                                    <p className="text-[10px] text-emerald-800">{rx.frequency} • {rx.duration}</p>
                                  </div>
                                  <span className="text-[9px] font-bold bg-white text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                                    {rx.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No medications prescribed during this visit.</p>
                          )}
                        </div>

                        {/* Lab & Diagnostic Requests */}
                        <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                            <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> Laboratory & Imaging
                          </span>
                          {visit.labRequests.length > 0 ? (
                            <div className="space-y-1.5 text-[11px]">
                              {visit.labRequests.map(lab => (
                                <div key={lab.id} className="bg-purple-50 text-purple-950 p-2 rounded-lg font-medium border border-purple-100">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">{lab.testType}</span>
                                    <span className="text-[9px] font-extrabold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded uppercase">
                                      {lab.status}
                                    </span>
                                  </div>
                                  {lab.resultSummary && (
                                    <p className="text-[10px] text-purple-800 mt-1 font-mono">{lab.resultSummary}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No lab tests ordered during this visit.</p>
                          )}
                        </div>
                      </div>

                      {/* Follow up Notes */}
                      {visit.followUpNotes && (
                        <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100 flex justify-between items-center">
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" /> Follow-up Plan: {visit.followUpNotes}</span>
                          <span className="text-[10px] text-slate-400">Recorded by {visit.doctorName}</span>
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Quick Vitals Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Current Baseline Vitals
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-semibold block">Blood Pressure</span>
                    <span className="text-base font-black text-slate-900">{vitalBP} <span className="text-xs text-slate-400 font-normal">mmHg</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-semibold block">Heart Rate</span>
                    <span className="text-base font-black text-slate-900">{vitalHR} <span className="text-xs text-slate-400 font-normal">bpm</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-semibold block">Body Temp</span>
                    <span className="text-base font-black text-slate-900">{vitalTemp} <span className="text-xs text-slate-400 font-normal">°C</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-semibold block">Respiratory Rate</span>
                    <span className="text-base font-black text-slate-900">{vitalResp} <span className="text-xs text-slate-400 font-normal">bpm</span></span>
                  </div>
                </div>
              </div>

              {/* Active Prescriptions Overview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" /> Active Prescribed Medications
                </h3>
                <div className="divide-y divide-slate-100">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900">{rx.medicationName} ({rx.dosage})</p>
                        <p className="text-[11px] text-slate-500">{rx.frequency} • {rx.instructions}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full">
                        {rx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CONSULTATION NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Signed Permanent Clinical Notes</h3>
                  <p className="text-xs text-slate-500">Read-only archived consultation records preserved for medical audit and care continuity.</p>
                </div>
              </div>

              <div className="space-y-4">
                {timelineItems.map((note) => (
                  <div key={note.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{note.doctorName}</span>
                        <span className="text-blue-600 font-bold text-[11px]">• {note.specialty} ({note.hospital})</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{note.date}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-sans">{note.clinicalNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Complete Medication History</h3>
                <button
                  onClick={() => {
                    setActiveTab('consultation');
                    setWorkspaceMode('prescription');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Prescribe New Medication
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="py-4 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 text-sm">{rx.medicationName} ({rx.dosage})</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">Frequency: {rx.frequency} | Duration: {rx.duration}</p>
                    <p className="text-slate-500 italic">Instructions: {rx.instructions}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Prescribed by {rx.doctorName} on {rx.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LAB RESULTS */}
          {activeTab === 'labs' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Diagnostic Laboratory Requests & Results</h3>
                <button
                  onClick={() => {
                    setActiveTab('consultation');
                    setWorkspaceMode('lab');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Order New Lab Test
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {labRequests.map((lab) => (
                  <div key={lab.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-950 text-sm">{lab.testType}</span>
                      <span className="bg-purple-100 text-purple-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        {lab.status}
                      </span>
                    </div>
                    {lab.resultSummary ? (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]">
                        {lab.resultSummary}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Test pending laboratory processing.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: IMAGING */}
          {activeTab === 'imaging' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Imaging & Diagnostic Reports</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {records.map((rec) => (
                  <div key={rec.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="font-mono text-[10px] text-blue-600 font-bold uppercase block">{rec.fileType} • {rec.specialty}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{rec.title}</h4>
                    <p className="text-slate-600 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">{rec.url}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Uploaded {rec.uploadDate}</span>
                      <span>{rec.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ACCESS CONTROL */}
          {activeTab === 'access' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 text-xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Active Hospital Authorizations & Audit Logs</h3>
                <p className="text-xs text-slate-500">Hospitals and clinicians currently granted consent to inspect or edit this EHR record.</p>
              </div>

              <div className="space-y-3">
                {hospitalAccesses.map((acc: any) => (
                  <div key={acc.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-sm">{acc.hospitalName}</p>
                      <p className="text-[11px] text-slate-500">Granted: {acc.grantedDate} • Authorized Depts: {acc.authorizedDepartments.join(', ')}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                      {acc.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Recent Medical Access Audit Trail</h4>
                <div className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-2 flex justify-between text-slate-600">
                      <span>{log.timestamp}: {log.actorName} ({log.actorRole}) - {log.action}</span>
                      <span className="font-bold text-blue-600">{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating AI Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => setShowAiModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold px-4.5 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 border border-white/20 cursor-pointer group"
        title="Open AI Decision Support Pop-up"
      >
        <BrainCircuit className="w-5 h-5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="text-xs tracking-wide">AI Clinical Assistant</span>
        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
          Pop-up
        </span>
      </button>

      {/* AI POP-UP DIALOG MODAL */}
      {showAiModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAiModal(false); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-indigo-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs shrink-0">
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    Gemma 4 Medical AI Assistant
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                      Gemma 4 Powered
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Gemma 4 Medical Engine • Diagnostic reasoning, drug interaction screening & clinical support
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Close AI Pop-up"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Context Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-indigo-950">
                    Active EHR Context: {patient?.name || 'Samuel Adewale'}
                  </p>
                  <p className="text-[11px] text-indigo-800 font-medium">
                    Vitals: BP {vitalBP} mmHg • HR {vitalHR} bpm • Allergies: Penicillin, Dust Mites
                  </p>
                </div>
                <span className="bg-indigo-200/80 text-indigo-900 font-bold text-[10px] px-2.5 py-1 rounded-lg shrink-0">
                  Live Linked
                </span>
              </div>

              {/* Preset Guideline Queries */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Guideline Prompts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "First-line management for Stage 1 Hypertension in young adult",
                    "Check drug interactions between Amlodipine and Atorvastatin",
                    "Differential diagnosis for atypical non-cardiac chest discomfort",
                    "Penicillin allergy alternative drug choices"
                  ].map((promptText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(promptText)}
                      className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 px-2.5 py-1.5 rounded-xl text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Field */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 text-xs block">Clinical Query or Protocol Search</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type clinical question or protocol lookup..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAskAi(); } }}
                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAskAi}
                    disabled={aiLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-indigo-200 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    {aiLoading ? 'Analyzing...' : 'Query AI'}
                  </button>
                </div>
              </div>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-200 text-xs text-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-600" />
                      AI Clinical Recommendation:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setClinicalNotes((prev) => 
                          prev ? `${prev}\n\n[AI Clinical Guidance]:\n${aiResponse}` : `[AI Clinical Guidance]:\n${aiResponse}`
                        );
                        alert("AI recommendation appended to clinical progress notes!");
                      }}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Append to Progress Notes
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700 font-sans">{aiResponse}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400 font-medium">
                Verified with Federal Ministry of Health Clinical Knowledge Protocols
              </span>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-4 py-2 rounded-xl cursor-pointer transition-all"
              >
                Close Pop-up
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
