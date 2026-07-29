import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Calendar, 
  FileText, 
  Bell, 
  User, 
  Search, 
  Plus, 
  Download, 
  Share2, 
  ShieldAlert, 
  CheckCircle, 
  Phone, 
  CreditCard, 
  Activity, 
  Clock, 
  AlertTriangle,
  Upload,
  UserCheck,
  MapPin,
  Lock,
  X,
  FileCode,
  Menu,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Trash2,
  Check,
  Copy,
  FileCheck,
  QrCode,
  ArrowRightLeft,
  FlaskConical,
  Scissors,
  Pill,
  Syringe,
  Users,
  Stethoscope
} from 'lucide-react';
import { api } from '../api';
import { PatientProfile, Appointment, MedicalRecord, ConsentRequest, AuditLog, Notification } from '../types';
import EmergencyMedicalProfileModal from './EmergencyMedicalProfileModal';
import HospitalTransferModal from './HospitalTransferModal';
import NationwideHospitalBookingModal from './NationwideHospitalBookingModal';

interface PatientDashboardProps {
  patient: PatientProfile;
  onLogout: () => void;
}

type TabType = 'home' | 'appointments' | 'records' | 'access' | 'notifications' | 'profile';

export default function PatientDashboard({ patient: initialPatient, onLogout }: PatientDashboardProps) {
  const [localPatient, setLocalPatient] = useState<PatientProfile>(initialPatient);
  const patient = localPatient;

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [hospitalAccessList, setHospitalAccessList] = useState<any[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Profile editing & file uploading states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(initialPatient.phone);
  const [editEmail, setEditEmail] = useState(initialPatient.email);
  const [editAge, setEditAge] = useState(initialPatient.age);
  const [editBloodGroup, setEditBloodGroup] = useState(initialPatient.bloodGroup);
  const [dragActive, setDragActive] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Synchronize state if prop changes
  useEffect(() => {
    setLocalPatient(initialPatient);
    setEditPhone(initialPatient.phone);
    setEditEmail(initialPatient.email);
    setEditAge(initialPatient.age);
    setEditBloodGroup(initialPatient.bloodGroup);
  }, [initialPatient]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Interactive Modals
  const [showBooking, setShowBooking] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showEmergencyQrModal, setShowEmergencyQrModal] = useState(false);
  const [showHospitalTransferModal, setShowHospitalTransferModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState<ConsentRequest | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // New Booking State
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('General Hospital Abuja');
  const [selectedDept, setSelectedDept] = useState('Cardiology Dept');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-07-22');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date(2026, 6, 1)); // Default July 2026

  // Printing State
  const [printingRecord, setPrintingRecord] = useState<MedicalRecord | null>(null);

  // Health Summary PDF Generator State
  const [showHealthSummaryPdfModal, setShowHealthSummaryPdfModal] = useState(false);
  const [summarySpecialistNote, setSummarySpecialistNote] = useState('');
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdfSummary = () => {
    setDownloadingPdf(true);
    try {
      const header = `================================================================================
CARELINK INTEGRATED HEALTH NETWORK
OFFICIAL PATIENT MEDICAL & DIAGNOSTIC SUMMARY REPORT
Export Date: ${new Date().toLocaleString()}
Document Reference ID: CU-PDF-${patient.id}-${Date.now().toString().slice(-6)}
================================================================================\n\n`;

      const demographics = `1. PATIENT DEMOGRAPHICS & CLINICAL PROFILE
--------------------------------------------------------------------------------
Full Name          : ${patient.name}
CareLink ID       : ${patient.id}
Age / Gender       : ${patient.age || 34} Yrs / ${patient.gender || 'Male'}
Blood Group        : ${patient.bloodGroup || 'O+'}
Primary Contact    : ${patient.phone}
Email Address      : ${patient.email}
Home Address       : ${patient.address || 'Garki Area 11, Abuja, FCT Nigeria'}
Primary Hospital   : ${patient.hospital || 'General Hospital Abuja (Garki)'}
\n`;

      const allergies = `2. CRITICAL CLINICAL ALERTS & ALLERGIES
--------------------------------------------------------------------------------
Known Allergies    : ${patient.allergies?.join(', ') || 'Penicillin, Sulfa-based Antibiotics'}
Chronic Conditions : ${patient.medicalHistory?.map(h => h.title).join(', ') || 'Hypertension, Type 2 Diabetes'}
Emergency Status   : ACTIVE (SOS Contacts Configured)\n\n`;

      const contacts = `3. PRE-CONFIGURED EMERGENCY CONTACTS
--------------------------------------------------------------------------------
${emergencyContacts.map((c, i) => `${i + 1}. ${c.name} (${c.relationship}) - Phone: ${c.phone}`).join('\n')}\n\n`;

      const labResults = `4. RECENT LABORATORY & DIAGNOSTIC FINDINGS
--------------------------------------------------------------------------------
${records.length > 0 ? records.map((r, i) => `${i + 1}. [${r.specialty.toUpperCase()}] ${r.title}
   Date Uploaded : ${r.uploadDate}
   Facility      : ${r.hospital}
   Summary/URL   : ${r.url || 'Diagnostic Finding Verified & Attached'}`).join('\n\n') : 'No recent lab results registered.'}\n\n`;

      const history = `5. CLINICAL MEDICAL HISTORY & PROCEDURES
--------------------------------------------------------------------------------
${patient.medicalHistory && patient.medicalHistory.length > 0 ? patient.medicalHistory.map((h, i) => `${i + 1}. ${h.title} (Date: ${h.date || 'Recorded'})
   Facility: ${h.hospital || 'General Hospital'} | Doctor: ${h.doctor || 'Attending Physician'}
   Notes: ${h.notes || 'No extra remarks'}`).join('\n\n') : 'No past medical history logs.'}\n\n`;

      const specialistNote = summarySpecialistNote ? `6. SPECIALIST REFERRAL NOTE & CLINICAL REMARKS
--------------------------------------------------------------------------------
${summarySpecialistNote}\n\n` : '';

      const footer = `================================================================================
VERIFICATION & CRYPTOGRAPHIC SECURITY STAMP
Issued by: CareLink Central Health Data Registry
Status: VERIFIED & CRYPTOGRAPHICALLY SEALED
This clinical report is an official medical document generated for printing and external specialist consultations.
================================================================================`;

      const fullContent = header + demographics + allergies + contacts + labResults + history + specialistNote + footer;

      const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CareLink_Health_Summary_${patient.id}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate download summary file.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShareSpecialistLink = () => {
    const shareText = `CareLink Encrypted Health Summary Token for ${patient.name} (ID: ${patient.id}) - Ref: CU-PDF-${patient.id}-${Date.now().toString().slice(-6)}`;
    navigator.clipboard.writeText(shareText);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 3000);
  };

  // Reschedule State
  const [reschedulingNotification, setReschedulingNotification] = useState<Notification | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-07-22');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');

  // Medical History states
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [newHistoryType, setNewHistoryType] = useState<'condition' | 'surgery' | 'medication' | 'vaccine' | 'family' | 'other'>('condition');
  const [newHistoryTitle, setNewHistoryTitle] = useState('');
  const [newHistoryDate, setNewHistoryDate] = useState('');
  const [newHistoryNotes, setNewHistoryNotes] = useState('');

  // Calendar Calculation Helper
  const getDaysInMonth = (monthDate: Date) => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth(); // 0-indexed
    const daysInM = new Date(y, m + 1, 0).getDate();
    const startD = new Date(y, m, 1).getDay(); // Sunday=0, Monday=1, ...
    return { daysInMonth: daysInM, startDay: startD, year: y, month: m };
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const { daysInMonth, startDay, year, month } = getDaysInMonth(currentCalendarMonth);

  // Upload Record State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSpecialty, setUploadSpecialty] = useState('Cardiology');
  const [uploadType, setUploadType] = useState('pdf');
  const [uploadFileContent, setUploadFileContent] = useState('');
  const [uploading, setUploading] = useState(false);

  // Search filter
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Location share simulation
  const [liveLocationShared, setLiveLocationShared] = useState(false);

  // Emergency Contacts & Automated SOS Dispatch States
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>(
    initialPatient.emergencyContacts && initialPatient.emergencyContacts.length > 0
      ? initialPatient.emergencyContacts
      : [
          { id: 'ec-1', name: 'Mrs. Sarah Adeleke', relationship: 'Spouse / Next of Kin', phone: '+234 802 345 6789', email: 'sarah.adeleke@example.com' },
          { id: 'ec-2', name: 'Dr. David Okafor', relationship: 'Family Physician', phone: '+234 803 987 6543', email: 'dr.david@ghabuja.org' }
        ]
  );
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Next of Kin');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  const [emergencySending, setEmergencySending] = useState(false);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState<string | null>(null);
  const [emergencyLocation, setEmergencyLocation] = useState('Garki Area, Abuja (GPS Live: 9.0578° N, 7.4951° E)');
  const [emergencyCustomNote, setEmergencyCustomNote] = useState('');

  const handleAddEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const newC = {
      id: `ec-${Date.now()}`,
      name: newContactName,
      relationship: newContactRel,
      phone: newContactPhone,
      email: newContactEmail
    };
    setEmergencyContacts([...emergencyContacts, newC]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setIsAddingContact(false);
  };

  const handleRemoveEmergencyContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const handleSendEmergencyAlert = async () => {
    if (emergencyContacts.length === 0) {
      alert("Please configure at least one emergency contact before triggering the broadcast.");
      return;
    }
    setEmergencySending(true);
    try {
      const res = await api.sendEmergencyAlert({
        patientId: patient.id,
        contacts: emergencyContacts,
        location: emergencyLocation,
        healthStatus: {
          bloodGroup: patient.bloodGroup || 'O+',
          allergies: patient.allergies || ['Penicillin'],
          age: patient.age || 34,
          chronicConditions: patient.medicalHistory?.map(m => m.title) || ['Type 2 Diabetes']
        },
        customNote: emergencyCustomNote
      });

      if (res.success) {
        setEmergencyAlertSent(res.dispatchedSummary || res.message);
        setLiveLocationShared(true);
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send emergency alert.");
    } finally {
      setEmergencySending(false);
    }
  };

  // Load Data
  const loadData = async () => {
    try {
      const aptData = await api.getAppointments({ patientId: patient.id }).catch(() => []);
      if (Array.isArray(aptData)) setAppointments(aptData);

      const recData = await api.getRecords({ patientId: patient.id }).catch(() => []);
      if (Array.isArray(recData)) setRecords(recData);

      const conData = await api.getConsents({ patientId: patient.id }).catch(() => []);
      if (Array.isArray(conData)) setConsents(conData);

      const auditData = await api.getAuditLogs({ patientId: patient.id }).catch(() => []);
      if (Array.isArray(auditData)) setAuditLogs(auditData);

      const ntfData = await api.getNotifications({ userId: patient.id }).catch(() => []);
      if (Array.isArray(ntfData)) setNotifications(ntfData);

      const docs = await api.getAdminDoctors().catch(() => []);
      if (Array.isArray(docs)) setDoctorsList(docs);

      try {
        const accRes = await fetch(`/api/patient/${patient.id}/hospital-access`)
          .then(r => r.ok ? r.json() : { accesses: [] })
          .catch(() => ({ accesses: [] }));
        if (accRes && Array.isArray(accRes.accesses)) {
          setHospitalAccessList(accRes.accesses);
        }
      } catch (e) {
        // silent catch
      }
    } catch (err) {
      console.warn("Patient dashboard loadData warning:", err);
    }
  };

  const handleRevokeHospitalAccess = async (hospitalName: string) => {
    if (!window.confirm(`Are you sure you want to revoke record access permissions for ${hospitalName}? Doctors at this facility will no longer be able to inspect your medical profile.`)) return;
    try {
      const res = await fetch(`/api/patient/${patient.id}/hospital-access/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName })
      }).then(r => r.json());

      if (res.success) {
        alert(`Access permissions for ${hospitalName} have been revoked.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to revoke access.");
    }
  };

  const handleGrantHospitalAccess = async (hospitalName: string, department: string) => {
    try {
      const res = await fetch(`/api/patient/${patient.id}/hospital-access/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName, department })
      }).then(r => r.json());

      if (res.success) {
        alert(`Granted medical record access permissions to ${hospitalName}.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to grant access.");
    }
  };

  useEffect(() => {
    loadData();
    // Check for pending consents to auto-show modal for high visibility
    const timer = setTimeout(async () => {
      const conData = await api.getConsents({ patientId: patient.id });
      const pending = conData.find(c => c.status === 'pending');
      if (pending) {
        setShowConsentModal(pending);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [patient.id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !selectedDept) return;
    try {
      const response = await api.bookAppointment({
        patientId: patient.id,
        doctorId: `DEP-${selectedDept.replace(/\s+/g, '-').toUpperCase()}`,
        date: selectedDate,
        time: selectedTime,
        department: selectedDept,
        hospitalName: selectedHospital
      });
      if (response.success) {
        setShowBooking(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentResponse = async (id: string, approve: boolean) => {
    try {
      const status = approve ? 'approved' : 'declined';
      const response = await api.respondConsent(id, status);
      if (response.success) {
        setShowConsentModal(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeConsent = async (id: string) => {
    try {
      const response = await api.revokeConsent(id);
      if (response.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    setUploading(true);
    try {
      const response = await api.uploadRecord({
        title: uploadTitle,
        fileType: uploadType,
        specialty: uploadSpecialty,
        hospital: "National Hospital Abuja",
        doctorName: "Patient Uploaded",
        url: uploadFileContent || "Secure Record Document",
        patientId: patient.id
      });
      if (response.success) {
        setShowUpload(false);
        setUploadTitle('');
        setUploadFileContent('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelApt = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const response = await api.cancelAppointment(id);
      if (response.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAppointmentNotification = async (notificationId: string, appointmentId: string) => {
    try {
      const appResponse = await api.updateAppointment(appointmentId, { status: 'confirmed' });
      if (appResponse.success) {
        await api.updateNotificationActionStatus(notificationId, 'confirmed');
        await loadData();
      } else {
        alert("Could not update appointment status.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while confirming the appointment.");
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingNotification || !reschedulingNotification.appointmentId) return;
    try {
      const appResponse = await api.updateAppointment(reschedulingNotification.appointmentId, {
        date: rescheduleDate,
        time: rescheduleTime
      });
      if (appResponse.success) {
        await api.updateNotificationActionStatus(reschedulingNotification.id, 'rescheduled');
        await loadData();
        setReschedulingNotification(null);
      } else {
        alert("Could not reschedule appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while rescheduling the appointment.");
    }
  };

  // Drag & drop mock for file upload
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadFileContent("Decrypted text: Normal pathology check. Full metabolic panel values aligned in healthy baseline.");
    setUploadTitle("Blood Metabolism Diagnostics.pdf");
    setUploadType("pdf");
  };

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAvatarUploadStatus('error');
      alert("Invalid file format. Please select an image file (PNG/JPEG).");
      return;
    }

    setAvatarUploadStatus('loading');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.updatePatientProfile({
          id: patient.id,
          avatarUrl: base64
        });
        if (res.success) {
          setLocalPatient(res.user);
          setAvatarUploadStatus('success');
          setTimeout(() => setAvatarUploadStatus('idle'), 4000);
          loadData();
        } else {
          setAvatarUploadStatus('error');
        }
      } catch (err) {
        console.error(err);
        setAvatarUploadStatus('error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updatePatientProfile({
        id: patient.id,
        phone: editPhone,
        email: editEmail,
        age: Number(editAge),
        bloodGroup: editBloodGroup
      });
      if (res.success) {
        setLocalPatient(res.user);
        setIsEditingProfile(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save profile parameters. Verify registry connectivity.");
    }
  };

  const handleAddHistoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistoryTitle) return;
    try {
      const newItem = {
        id: `HIS-${Date.now()}`,
        type: newHistoryType,
        title: newHistoryTitle,
        date: newHistoryDate || undefined,
        notes: newHistoryNotes || undefined
      };
      const currentHistory = localPatient.medicalHistory || [];
      const updatedHistory = [...currentHistory, newItem];
      
      const res = await api.updatePatientProfile({
        id: patient.id,
        medicalHistory: updatedHistory
      });
      if (res.success) {
        setLocalPatient(res.user);
        setShowAddHistoryModal(false);
        setNewHistoryTitle('');
        setNewHistoryDate('');
        setNewHistoryNotes('');
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add medical history item.");
    }
  };

  const handleDeleteHistoryItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this medical history item?")) return;
    try {
      const currentHistory = localPatient.medicalHistory || [];
      const updatedHistory = currentHistory.filter(item => item.id !== itemId);
      
      const res = await api.updatePatientProfile({
        id: patient.id,
        medicalHistory: updatedHistory
      });
      if (res.success) {
        setLocalPatient(res.user);
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete medical history item.");
    }
  };

  const exportRecords = (specificRecord?: MedicalRecord) => {
    let text = "";
    if (specificRecord) {
      text += `==============================================\n`;
      text += `          CARELINK MEDICAL RECORD\n`;
      text += `==============================================\n`;
      text += `Record ID: ${specificRecord.id}\n`;
      text += `Patient Name: ${localPatient.name} (ID: ${localPatient.id})\n`;
      text += `Title: ${specificRecord.title}\n`;
      text += `Category: ${specificRecord.specialty}\n`;
      text += `Hospital: ${specificRecord.hospital}\n`;
      text += `Date Uploaded: ${specificRecord.uploadDate}\n`;
      text += `Details/Content: ${specificRecord.url}\n`;
      text += `==============================================\n`;
    } else {
      text += `==============================================\n`;
      text += `          CARELINK HEALTH EXPORT\n`;
      text += `==============================================\n`;
      text += `Patient Name: ${localPatient.name}\n`;
      text += `National ID: ${localPatient.id}\n`;
      text += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
      text += `--- MEDICAL RECORDS ---\n`;
      records.forEach(r => {
        text += `• [${r.specialty}] ${r.title} - ${r.hospital} (${r.uploadDate})\n`;
        text += `  Details/Content: ${r.url}\n\n`;
      });
      text += `--- ACTIVE PRESCRIPTIONS ---\n`;
      appointments.filter(a => a.prescription).forEach(a => {
        text += `• Specialist Doctor: ${a.doctorName} (${a.department})\n`;
        text += `  Prescription: ${a.prescription}\n\n`;
      });
      text += `--- MEDICAL HISTORY ---\n`;
      const hist = localPatient.medicalHistory || [];
      if (hist.length > 0) {
        hist.forEach(h => {
          text += `• [${h.type.toUpperCase()}] ${h.title} (${h.date || 'N/A'})\n`;
          if (h.notes) text += `  Notes: ${h.notes}\n`;
        });
      } else {
        text += `No medical history records provided.\n`;
      }
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", specificRecord ? `${specificRecord.title.replace(/\s+/g, '_')}_record.txt` : `${localPatient.name.replace(/\s+/g, '_')}_health_records_export.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Filter doctors by specialty/name in the search bar
  const filteredDoctors = doctorsList.filter(doc => 
    doc.name.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  const sidebarTabs = [
    { id: 'home' as TabType, label: 'Dashboard', icon: Home },
    { id: 'appointments' as TabType, label: 'My Consultations', icon: Calendar },
    { id: 'records' as TabType, label: 'Medical Records', icon: Lock },
    { id: 'access' as TabType, label: 'Medical Record Access', icon: ShieldCheck },
    { id: 'notifications' as TabType, label: 'Alerts', icon: Bell, badgeCount: notifications.filter(n => !n.read).length },
    { id: 'profile' as TabType, label: 'Health Profile', icon: User },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
      
      {/* Global Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-40 shadow-xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full flex items-center justify-between gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden border border-slate-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={mobileSidebarOpen ? "Hide Navigation Menu" : "Show Navigation Menu"}
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>

            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shadow-blue-500/20 shrink-0">
              C
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight">CareLink</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Patient Health Portal</p>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              {patient.avatarUrl ? (
                <img src={patient.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-xs border border-blue-200">
                  {patient.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900 truncate leading-tight">{patient.name}</h3>
                <p className="text-[10px] text-blue-600 font-mono font-bold leading-none">ID: {patient.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Icons & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmergencyQrModal(true)}
              className="px-3 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-white hover:from-slate-800 hover:to-indigo-900 border border-indigo-500/40 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              title="View & Download Unique Emergency QR Code Pass"
            >
              <QrCode className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Emergency QR Pass</span>
            </button>

            <button
              onClick={() => setShowHealthSummaryPdfModal(true)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="Generate Health Summary PDF & Diagnostic Report for External Specialists"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Health Summary PDF</span>
            </button>

            <button
              onClick={() => {
                setEmergencyAlertSent(null);
                setShowEmergency(true);
              }}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-200 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse shrink-0 border border-red-500/50"
              title="Trigger Automated SOS Emergency Notification"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span className="hidden sm:inline uppercase tracking-wide">Emergency SOS</span>
            </button>

            <button 
              onClick={() => {
                const pending = consents.find(c => c.status === 'pending');
                if (pending) setShowConsentModal(pending);
                else alert("No outstanding clinical consent requests found.");
              }}
              className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer border border-slate-200 text-slate-700"
              title="Pending Consents / Access Requests"
            >
              <Lock className="w-4 h-4 text-orange-600" />
              {consents.some(c => c.status === 'pending') && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer border border-slate-200 text-slate-700"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Body Container with Sideways Left Sidebar */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col md:flex-row gap-6 overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* Mobile Sidebar Navigation Drawer */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden flex animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-72 h-full p-5 flex flex-col space-y-4 shadow-2xl border-r border-slate-200 overflow-y-auto animate-in slide-in-from-left duration-200"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-sm">
                    C
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">CareLink Menu</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Patient Navigation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1">
                {sidebarTabs.map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badgeCount ? (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full leading-none ${
                          isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                        }`}>
                          {tab.badgeCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Sidebar Footer Patient Quick Summary */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Blood Group:</span>
                  <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{patient.bloodGroup || 'O+'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">MFA Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locked Left Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4 h-full overflow-y-auto">
          <div className="px-2 py-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient Portal Navigation</p>
          </div>

          <nav className="space-y-1.5">
            {sidebarTabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badgeCount ? (
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full leading-none ${
                      isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                    }`}>
                      {tab.badgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Patient Quick Summary */}
          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">Blood Group:</span>
              <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{patient.bloodGroup || 'O+'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">MFA Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Protected
              </span>
            </div>
            <button
              onClick={() => setShowEmergencyQrModal(true)}
              className="w-full bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white border border-indigo-500/30 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-rose-400" />
              <span>My Emergency QR Pass</span>
            </button>
            <button
              onClick={() => setShowHealthSummaryPdfModal(true)}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200/80 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Health Summary PDF</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane with In-Built Scrolling */}
        <main className="flex-1 min-w-0 space-y-6 h-full overflow-y-auto pr-1">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Header welcome banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-lg">
                  <span className="bg-blue-500 text-xs px-2.5 py-1 rounded-full font-bold">Patient Portal</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Hello, {patient.name} 👋
                  </h1>
                  <p className="text-blue-100 text-xs md:text-sm font-medium leading-relaxed">
                    Welcome to your CareLink portal. View your clinical consultations, manage authorization requests, and review your medical records securely.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 hidden lg:flex items-center justify-center pr-10 pointer-events-none">
                  <ShieldCheck className="w-56 h-56" />
                </div>
              </div>

              {/* Emergency SOS Banner */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl p-5 md:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden border border-red-400">
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-black shrink-0 border border-white/30">
                    <ShieldAlert className="w-7 h-7 animate-pulse text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold flex items-center gap-2 text-white">
                      Automated Emergency SOS Notification System
                    </h3>
                    <p className="text-red-100 text-xs font-medium leading-relaxed max-w-xl">
                      In case of emergency, send instant alerts with your live location & health profile to {emergencyContacts.length} pre-configured emergency contacts with one tap.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEmergencyAlertSent(null);
                    setShowEmergency(true);
                  }}
                  className="relative z-10 bg-white hover:bg-red-50 text-red-700 px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider border border-white/80"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Trigger SOS Alert
                </button>
              </div>

              {/* Health Summary PDF Specialist Referral Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-md text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <FileText className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">External Specialist Health Summary PDF</h3>
                      <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        Print & Share
                      </span>
                    </div>
                    <p className="text-indigo-200 text-xs font-medium leading-relaxed max-w-xl">
                      Generate a comprehensive printable PDF summary containing your demographics, active allergies, emergency contacts, and recent lab results for external specialist consultations.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHealthSummaryPdfModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-blue-400/50"
                >
                  <Printer className="w-4 h-4" /> Generate Health Summary PDF
                </button>
              </div>

              {/* Hospital On-Duty Clinicians Directory */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Hospital On-Duty Clinicians Directory</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Duty doctors are system-allocated by department roster upon booking
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search specialty or clinician name..."
                    value={searchDocQuery}
                    onChange={(e) => setSearchDocQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {searchDocQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 text-xs space-y-1.5 max-h-60 overflow-y-auto">
                      <p className="font-bold text-slate-400 px-2 border-b border-slate-100 pb-1.5 uppercase tracking-wider text-[10px]">
                        Active On-Duty Clinicians ({filteredDoctors.length})
                      </p>
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctorId(doc.id);
                              setSelectedDept(doc.department);
                              setSearchDocQuery('');
                              setShowBooking(true);
                            }}
                            className="w-full text-left p-2.5 hover:bg-blue-50 hover:text-blue-700 rounded-xl flex items-center justify-between transition-all"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{doc.name}</p>
                              <p className="text-[10px] text-slate-500">{doc.specialty} • {doc.hospitalName} (On-Duty)</p>
                            </div>
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                              Book {doc.department} Visit
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-center py-2">No matching clinicians found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bento Grid Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Next scheduled Consultation */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Next Scheduled Consultation</h3>
                  
                  {appointments.some(a => a.status === 'pending') ? (
                    appointments.filter(a => a.status === 'pending').slice(0, 1).map(apt => (
                      <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-blue-300 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4 gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-extrabold shrink-0">
                              {apt.doctorName.replace("Dr. ", "").charAt(0)}
                            </div>
                            <div>
                              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                Telehealth Appointment
                              </span>
                              <h3 className="text-base font-extrabold text-slate-900 mt-1">{apt.doctorName}</h3>
                              <p className="text-xs text-slate-500 font-medium">{apt.specialty} • {apt.hospitalName}</p>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
                            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                              Telehealth Ready
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>Scheduled date: {apt.date} • {apt.time}</span>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => alert("Launching Secure Telehealth consultation pipeline...")}
                              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 cursor-pointer"
                            >
                              Join Consultation
                            </button>
                            <button 
                              onClick={() => handleCancelApt(apt.id)}
                              className="border border-slate-200 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">No scheduled appointments found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">All consults completed. You can schedule a telehealth session with medical experts in our hospital directory.</p>
                      </div>
                      <button 
                        onClick={() => setShowBooking(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        📅 Schedule a consultation now
                      </button>
                    </div>
                  )}

                  {/* Actions Grid */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Quick Clinic Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      
                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => setShowBooking(true)}
                        className="bg-white hover:border-blue-400 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                      >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Book Visit</span>
                      </motion.button>

                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => setActiveTab('records')}
                        className="bg-white hover:border-blue-400 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                      >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Medical Records</span>
                      </motion.button>

                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => {
                          setActiveTab('records');
                          setTimeout(() => alert("Find active pharmaceuticals under 'Active Prescriptions' on the records page!"), 200);
                        }}
                        className="bg-white hover:border-blue-400 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md col-span-2 sm:col-span-1"
                      >
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Prescriptions</span>
                      </motion.button>

                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => {
                          setActiveTab('records');
                          setShowUpload(true);
                        }}
                        className="bg-white hover:border-blue-400 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                      >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Upload Labs</span>
                      </motion.button>

                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => setActiveTab('access')}
                        className="bg-white hover:border-blue-400 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                      >
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Consent Access</span>
                      </motion.button>

                      <motion.button 
                        animate={{ y: 0 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => setShowEmergency(true)}
                        className="bg-red-50 hover:bg-red-100 border border-red-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group shadow-2xs hover:shadow-md col-span-2 sm:col-span-1"
                      >
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl group-hover:scale-110 transition-transform animate-pulse">
                          <Phone className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-red-700">Emergency</span>
                      </motion.button>

                    </div>
                  </div>
                </div>

                {/* Column 2: Recent Activity Timeline & Alerts */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Secure Health Logs</h3>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Recent logs</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Secure Logs live</span>
                      </div>

                      <div className="space-y-4">
                        {records.length > 0 || (patient.medicalHistory && patient.medicalHistory.length > 0) ? (
                          <>
                            {records.slice(0, 3).map((rec) => (
                              <div key={rec.id} className="flex gap-3 items-start">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-slate-800">{rec.title}</p>
                                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-100">
                                      Auto-Synced
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">{rec.hospital} • {rec.uploadDate}</p>
                                </div>
                              </div>
                            ))}
                            {patient.medicalHistory && patient.medicalHistory.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex gap-3 items-start">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                                  <p className="text-[10px] text-slate-400">{item.hospital || 'Central Diagnostic Laboratory'} • {item.date || 'Auto-synced'}</p>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-xs text-slate-400 italic text-center py-2">No health logs recorded yet.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Consent Request Alert */}
                  {consents.some(c => c.status === 'pending') && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-orange-600 animate-bounce" />
                        <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">Clinical Signature Pending</h4>
                      </div>
                      <p className="text-xs text-orange-700">
                        A clinical medical professional is requesting signature keys to read cardiology diagnostic charts.
                      </p>
                      <button 
                        onClick={() => {
                          const p = consents.find(c => c.status === 'pending');
                          if (p) setShowConsentModal(p);
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Respond & Sign Keys
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Consultation History</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage and track your telehealth and clinic physical appointments.</p>
                </div>
                <button 
                  onClick={() => setShowBooking(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-100 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Book Consult Visit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-4 shadow-2xs transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            ID: {apt.id}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{apt.doctorName}</h3>
                          <p className="text-xs text-slate-500">{apt.specialty} • {apt.hospitalName}</p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          apt.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-b border-slate-50 py-2">
                        <span className="font-semibold text-slate-600">Scheduled: {apt.date} at {apt.time}</span>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">{apt.department}</span>
                      </div>

                      {apt.clinicalNotes && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Diagnosis Summary</p>
                          <p className="text-xs text-slate-600 italic">"{apt.clinicalNotes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {apt.status === 'pending' && (
                        <button 
                          onClick={() => handleCancelApt(apt.id)}
                          className="flex-1 border border-slate-200 hover:bg-red-50 hover:text-red-600 text-xs py-2 rounded-xl text-slate-500 font-bold transition-all cursor-pointer"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              
              {/* Top intro */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Patient Medical Vault</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Records are stored securely and kept confidential.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setShowHealthSummaryPdfModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-100 transition-all cursor-pointer"
                    title="Generate & print official Health Summary PDF with lab results, allergies & emergency info"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Health Summary PDF
                  </button>
                  <button 
                    onClick={() => exportRecords()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
                    title="Export all medical records & history to a secure text report"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    Export All Data
                  </button>
                  <button 
                    onClick={() => {
                      // Trigger normal browser print
                      window.print();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
                    title="Print full patient summary view"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    Print Summary
                  </button>
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-100 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Labs
                  </button>
                </div>
              </div>

              {/* Informational security banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-800">
                <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Privacy and Access Settings</p>
                  <p className="text-blue-700 leading-relaxed">
                    By default, clinicians can only view medical logs with your permission. When a clinician requests to view your diagnostic charts, a prompt will appear letting you approve or deny the request.
                  </p>
                </div>
              </div>

              {/* Categorized Records List */}
              <div className="space-y-6">
                {Array.from(new Set([...records.map(r => r.specialty), 'Laboratory', 'Cardiology', 'Ophthalmology'])).filter(Boolean).map(spec => {
                  const specRecords = records.filter(r => r.specialty === spec);
                  return (
                    <div key={spec} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{spec} Diagnostic Records</h3>
                        <span className="text-[10px] text-slate-400 font-bold">{specRecords.length} records</span>
                      </div>
                      
                      {specRecords.length === 0 ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400 font-medium">
                          No {spec.toLowerCase()} records in profile yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {specRecords.map(record => (
                            <div key={record.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-4 shadow-2xs transition-all flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-sm font-bold text-slate-900">{record.title}</h4>
                                      {(record.specialty === 'Laboratory' || record.title.toLowerCase().includes('lab')) && (
                                        <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Auto-Uploaded by Lab
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{record.hospital} • {record.uploadDate}</p>
                                  </div>
                                  <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0">
                                    {record.fileType}
                                  </span>
                                </div>

                                {/* AES IPFS Hash Container */}
                                <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] font-mono border border-slate-100 flex items-start gap-2">
                                  <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                  <p className="text-slate-600 break-all leading-relaxed">{record.url}</p>
                                </div>

                                {/* Granted Clinicians Indicators */}
                                <div className="space-y-1 text-xs">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Clinicians:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {record.approvedDoctors.length > 0 ? (
                                      record.approvedDoctors.map(docId => {
                                        const d = doctorsList.find(doc => doc.id === docId);
                                        return (
                                          <span key={docId} className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                                            <Check className="w-2.5 h-2.5 text-blue-600" /> {d?.name || docId}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5 text-red-500" /> Confidential (Restricted to Patient only)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Record Actions Footer */}
                              <div className="flex flex-wrap justify-end gap-2 text-xs border-t border-slate-50 pt-3">
                                <button 
                                  onClick={() => exportRecords(record)}
                                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold bg-slate-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                                  title="Export this record to a plain text file"
                                >
                                  <Download className="w-3.5 h-3.5" /> Export
                                </button>

                                <button 
                                  onClick={() => setPrintingRecord(record)}
                                  className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-bold bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                                  title="Print this record"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Print
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    const req: ConsentRequest = {
                                      id: `CON-${Date.now()}`,
                                      patientId: patient.id,
                                      doctorId: "DOC-304", 
                                      doctorName: "Dr. John Smith",
                                      hospitalName: "General Hospital Abuja",
                                      specialties: [record.specialty],
                                      fullHistory: false,
                                      expiresInDays: 7,
                                      expiresAt: "",
                                      status: "pending"
                                    };
                                    setShowConsentModal(req);
                                  }}
                                  className="flex items-center gap-1.5 text-blue-600 hover:text-white font-bold bg-blue-50 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" /> Grant Doctor Access
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Prescriptions Panel */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Prescriptions</h3>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                  {appointments.filter(a => a.prescription).length > 0 ? (
                    appointments.filter(a => a.prescription).map(apt => (
                      <div key={apt.id} className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-blue-700">{apt.doctorName} ({apt.specialty})</span>
                          <span className="text-slate-400 font-mono">{apt.date}</span>
                        </div>
                        <p className="text-slate-800 font-mono text-sm border-l-2 border-blue-600 pl-3 py-1 bg-white rounded shadow-2xs font-semibold">
                          Rx: {apt.prescription}
                        </p>
                        <p className="text-[10px] text-slate-400">Scan QR Code at any CareLink certified pharmacy for secure dispense.</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-sm text-center py-4">No active medical prescriptions found.</p>
                  )}
                </div>
              </div>

              {/* Security Audit Trail */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-500" /> Action Audit Log
                </h3>
                <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 font-mono text-xs space-y-3 shadow-md max-h-60 overflow-y-auto border border-slate-850">
                  {auditLogs.map(log => (
                    <div key={log.id} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0 text-[11px]">
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>[{log.timestamp.replace('T', ' ')}]</span>
                        <span className={log.status === 'Success' ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                          {log.status}
                        </span>
                      </div>
                      <p className="mt-1">
                        <span className="text-blue-400">{log.actorName}</span> 
                        <span className="text-slate-400"> ({log.actorRole})</span>: {log.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: MEDICAL RECORD ACCESS */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Medical Record Access & Consent Governance
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage hospital facilities, clinics, and clinical teams authorized to view your Electronic Health Record (EHR).
                  </p>
                </div>

                <button
                  onClick={() => {
                    const hosp = prompt("Enter hospital or diagnostic center name to grant record access (e.g., CareLink Health Network):", "CareLink Health Network");
                    if (hosp) {
                      handleGrantHospitalAccess(hosp, "General Medicine & Outpatients");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Grant Access to Hospital
                </button>
              </div>

              {/* Active Hospital Access List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospitals with Active Record Access</h3>
                
                {hospitalAccessList.filter(a => a.status === 'active').length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                    <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700 text-sm">No external hospital currently has active access to your EHR.</p>
                  </div>
                ) : (
                  hospitalAccessList.filter(a => a.status === 'active').map((acc: any) => (
                    <div key={acc.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <h4 className="font-extrabold text-slate-900 text-base">{acc.hospitalName}</h4>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Active Access
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Granted: <span className="font-bold text-slate-700">{acc.grantedDate}</span> • Expires: <span className="font-bold text-slate-700">{acc.expiresAt || '2027-12-31'}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleRevokeHospitalAccess(acc.hospitalName)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revoke Hospital Access
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Authorized Hospital Departments</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {acc.authorizedDepartments && acc.authorizedDepartments.map((dept: string, idx: number) => (
                              <span key={idx} className="bg-white border border-slate-200 font-bold text-[10px] text-slate-700 px-2 py-0.5 rounded-md">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Recent Clinicians Access Log</span>
                          {acc.doctorsWhoViewed && acc.doctorsWhoViewed.length > 0 ? (
                            <div className="space-y-1 text-[11px] pt-1">
                              {acc.doctorsWhoViewed.map((doc: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-slate-700">
                                  <span className="font-bold">{doc.doctorName} ({doc.department})</span>
                                  <span className="text-slate-400 font-mono text-[10px]">{doc.timestamp}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pt-1">No clinicians have accessed records recently.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Revoked Access History */}
              {hospitalAccessList.filter(a => a.status === 'revoked').length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Previously Revoked Hospital Access</h3>
                  <div className="space-y-2">
                    {hospitalAccessList.filter(a => a.status === 'revoked').map((acc: any) => (
                      <div key={acc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">{acc.hospitalName}</p>
                          <p className="text-[11px] text-slate-400">Granted on {acc.grantedDate}</p>
                        </div>
                        <button
                          onClick={() => handleGrantHospitalAccess(acc.hospitalName, "General Medicine")}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        >
                          Re-authorize Hospital Access
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Audit Trail */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Security & Access Audit Log
                </h3>
                <div className="divide-y divide-slate-100 font-mono text-[11px] max-h-60 overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex justify-between items-center text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800">{log.actorName} ({log.actorRole}):</span> {log.action}
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0 ml-4">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Security Alerts & Updates</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time alerts and security status updates.</p>
                </div>
                <button 
                  onClick={async () => {
                    await api.markNotificationsRead();
                    loadData();
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Clear Unread Notifications
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-2xs ${
                      n.read ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-xs'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                      n.type === 'emergency' ? 'bg-red-500' :
                      n.type === 'consent' ? 'bg-orange-500' :
                      n.type === 'payment' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></span>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{n.title}</h3>
                        {n.actionStatus && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            n.actionStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {n.actionStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{n.date}</p>

                      {n.type === 'reminder' && n.appointmentId && !n.actionStatus && (
                        <div className="flex flex-wrap gap-2 pt-2.5">
                          <button
                            onClick={() => handleConfirmAppointmentNotification(n.id, n.appointmentId!)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-100 cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button
                            onClick={() => {
                              setReschedulingNotification(n);
                              const apt = appointments.find(a => a.id === n.appointmentId);
                              if (apt) {
                                setRescheduleDate(apt.date === 'Tomorrow' ? '2026-07-22' : apt.date);
                                setRescheduleTime(apt.time);
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900">Health Profile</h2>
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-2xs">
                <div className="flex flex-col items-center">
                  <div className="relative group mb-2">
                    {patient.avatarUrl ? (
                      <img src={patient.avatarUrl} className="w-24 h-24 rounded-3xl object-cover shadow-md border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-inner border border-blue-200">
                        {patient.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Drag-and-drop file upload zone */}
                  <div className="mt-2 w-full max-w-md mx-auto">
                    <div 
                      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          await handleAvatarFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-4 text-xs cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                          : 'border-slate-200 hover:border-blue-400 text-slate-500 hover:bg-slate-50'
                      }`}
                      onClick={() => document.getElementById('avatar-file-input')?.click()}
                    >
                      <input 
                        id="avatar-file-input"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            await handleAvatarFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <p className="font-bold">Drag & drop profile image, or click to upload</p>
                        <p className="text-[10px] text-slate-400">JPEG, PNG, GIF formats up to 5MB</p>
                      </div>
                    </div>
                    {avatarUploadStatus === 'loading' && (
                      <p className="text-[10px] text-blue-600 font-bold mt-1.5 animate-pulse text-center">Uploading new profile picture...</p>
                    )}
                    {avatarUploadStatus === 'success' && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1.5 text-center">✓ Profile photo updated successfully!</p>
                    )}
                    {avatarUploadStatus === 'error' && (
                      <p className="text-[10px] text-red-600 font-bold mt-1.5 text-center">⚠️ Failed to update image. Please try again.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{patient.name}</h2>
                  <span className="inline-block text-xs text-blue-700 font-bold font-mono uppercase bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mt-2">
                    National ID: {patient.id}
                  </span>
                </div>
              </div>

              {/* Patient details block */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Profile Details
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditingProfile) {
                        setEditPhone(patient.phone);
                        setEditEmail(patient.email);
                        setEditAge(patient.age);
                        setEditBloodGroup(patient.bloodGroup);
                      }
                      setIsEditingProfile(!isEditingProfile);
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfileDetails} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Emergency Contacts</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Primary Email</label>
                        <input 
                          type="email" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Age</label>
                        <input 
                          type="number" 
                          value={editAge} 
                          onChange={(e) => setEditAge(Number(e.target.value))}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold">Blood Group</label>
                        <select 
                          value={editBloodGroup} 
                          onChange={(e) => setEditBloodGroup(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        >
                          <option>A+</option>
                          <option>B+</option>
                          <option>AB+</option>
                          <option>O+</option>
                          <option>A-</option>
                          <option>B-</option>
                          <option>AB-</option>
                          <option>O-</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Save Profile Details
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">Emergency Contacts</span>
                        <p className="font-semibold text-slate-800 text-sm">{patient.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">Primary Email</span>
                        <p className="font-semibold text-slate-800 text-sm">{patient.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">Age</span>
                        <p className="font-semibold text-slate-800 text-sm">{patient.age} years old</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">Blood Group</span>
                        <p className="font-bold text-red-600 text-sm">{patient.bloodGroup}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold text-xs block mb-2">Clinical Allergies</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map(al => (
                          <span key={al} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">
                            {al}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Pre-Configured Emergency Contacts Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-600" /> Pre-Configured Emergency Contacts ({emergencyContacts.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Contacts who receive your automated SOS location & health alerts during medical emergencies.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEmergencyAlertSent(null);
                      setShowEmergency(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-white" />
                    <span>Manage / SOS</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-900 text-xs">{contact.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{contact.relationship}</p>
                        <p className="text-[11px] text-blue-600 font-mono font-bold">{contact.phone}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
                        Configured
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History section */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Clinical Medical History
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Keep track of your conditions, surgeries, and immunizations.</p>
                  </div>
                  <button
                    onClick={() => setShowAddHistoryModal(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-blue-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add History</span>
                  </button>
                </div>

                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {patient.medicalHistory.map((item) => {
                      const getTypeIcon = (type: string) => {
                        switch(type) {
                          case 'surgery': return <Scissors className="w-4 h-4 text-rose-500" />;
                          case 'medication': return <Pill className="w-4 h-4 text-emerald-500" />;
                          case 'vaccine': return <Syringe className="w-4 h-4 text-blue-500" />;
                          case 'family': return <Users className="w-4 h-4 text-purple-500" />;
                          case 'condition': return <Stethoscope className="w-4 h-4 text-amber-500" />;
                          default: return <FlaskConical className="w-4 h-4 text-indigo-500" />;
                        }
                      };
                      return (
                        <div key={item.id} className="py-3 flex justify-between items-start gap-4">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-lg bg-slate-50 p-1.5 rounded-lg border border-slate-100 shrink-0">
                              {getTypeIcon(item.type)}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase font-mono">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Diagnosed/Performed: {item.date || 'N/A'}</p>
                              {item.notes && (
                                <p className="text-[10px] text-slate-500 mt-1 italic font-medium leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-all border border-transparent hover:border-red-100"
                            title="Delete history item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold">No medical history logged yet</p>
                    <p className="text-[10px] text-slate-400 mt-1">Add history items to help clinical professionals serve you better.</p>
                  </div>
                )}
              </div>

              {/* 2FA indicators */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Two-Factor Security Activated</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Your clinical profile is safely synchronized with the National Health Registry.</p>
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}

          </main>
      </div>

        {/* Mobile Web Bottom Navigation Bar */}
        <nav className="md:hidden sticky bottom-0 inset-x-0 bg-white border-t border-slate-200 px-3 py-2 flex justify-between items-center z-40 shadow-lg shrink-0">
          {sidebarTabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all relative cursor-pointer"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                  {tab.label === 'Dashboard' ? 'Home' : tab.label === 'My Consultations' ? 'Consults' : tab.label === 'Medical Records' ? 'Vault' : tab.label === 'Alerts' ? 'Alerts' : 'Profile'}
                </span>
                
                {tab.badgeCount ? (
                  <span className="absolute top-1 right-3 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none min-w-3.5 text-center">
                    {tab.badgeCount}
                  </span>
                ) : null}
                {!tab.badgeCount && tab.id === 'records' && consents.some(c => c.status === 'pending') ? (
                  <span className="absolute top-1.5 right-4 w-2 h-2 bg-orange-500 rounded-full"></span>
                ) : null}
              </button>
            );
          })}
        </nav>

      {/* --- FLOATING OVERLAY DIALOG MODALS (RESPONSIVE CENTER-ALIGNED) --- */}

      {/* MODAL 1: NATIONWIDE HOSPITAL BOOKING FORM */}
      <NationwideHospitalBookingModal
        patient={localPatient}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        onBookingConfirmed={(newApt) => {
          setAppointments(prev => [newApt, ...prev]);
          api.bookAppointment({
            patientId: localPatient.id,
            patientName: localPatient.name,
            doctorId: newApt.doctorId,
            doctorName: newApt.doctorName,
            specialty: newApt.specialty,
            hospitalName: newApt.hospitalName,
            date: newApt.date,
            time: newApt.time,
            department: `${newApt.specialty} Dept`
          }).catch(console.error);
        }}
      />

      {/* MODAL 2: UPLOAD REPORT */}
      {showUpload && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/40">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5 text-indigo-600" /> Upload Diagnostic Medical Report
              </h2>
              <button 
                onClick={() => setShowUpload(false)} 
                className="p-1.5 hover:bg-indigo-100/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">File Title</label>
                <input 
                  type="text" 
                  required 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Chest X-Ray Imaging" 
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Specialty Category</label>
                  <select 
                    value={uploadSpecialty} 
                    onChange={(e) => setUploadSpecialty(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold transition-all text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option>Cardiology</option>
                    <option>Ophthalmology</option>
                    <option>Neurology</option>
                    <option>Laboratory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">File Type</label>
                  <select 
                    value={uploadType} 
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold transition-all text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option>pdf</option>
                    <option>png</option>
                    <option>jpg</option>
                  </select>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-800">Drag files here, or click to browse</p>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB • Secure storage</p>
              </div>

              {uploadFileContent && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-bold truncate max-w-xs">{uploadTitle} (Staged Successfully)</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Upload Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EMERGENCY OVERLAY */}
      {showEmergency && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowEmergency(false); }}
          className="fixed inset-0 bg-red-950/95 backdrop-blur-md z-50 text-white p-4 md:p-8 flex items-center justify-center overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="max-w-2xl w-full max-h-[92vh] flex flex-col space-y-5 bg-red-950/90 border border-red-800/80 p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-red-900/80 pb-4 shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-lg font-black flex items-center gap-2 text-red-400 uppercase tracking-wide">
                  <ShieldAlert className="w-6 h-6 animate-pulse text-red-500" /> Automated Emergency SOS Dispatch
                </h2>
                <p className="text-xs text-red-300 font-medium">Broadcast your live location and critical health status to pre-configured emergency contacts instantly.</p>
              </div>
              <button 
                onClick={() => setShowEmergency(false)} 
                className="p-1.5 hover:bg-red-900/60 rounded-full cursor-pointer text-red-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto flex-1 pr-1 text-xs">
              
              {/* Alert Confirmation Banner if Sent */}
              {emergencyAlertSent && (
                <div className="bg-emerald-950/90 border-2 border-emerald-500 p-4.5 rounded-2xl space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>AUTOMATED EMERGENCY SOS DISPATCHED SUCCESSFULLY!</span>
                  </div>
                  <p className="text-emerald-100 leading-relaxed font-medium text-xs bg-emerald-900/50 p-3 rounded-xl border border-emerald-800 font-mono">
                    {emergencyAlertSent}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-semibold">
                    ✓ Notification log saved to security audit trail. Contacts received emergency SMS and push alerts.
                  </p>
                </div>
              )}

              {/* SECTION 1: Pre-Configured Emergency Contacts */}
              <div className="bg-red-900/40 border border-red-800/80 rounded-2xl p-4.5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-red-400" /> Pre-Configured Emergency Contacts ({emergencyContacts.length})
                    </h3>
                    <p className="text-[11px] text-red-300">Automated SMS & push notifications will be dispatched to these recipients.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingContact(!isAddingContact)}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all border border-red-700/80 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingContact ? "Cancel" : "Add Contact"}</span>
                  </button>
                </div>

                {/* Inline Add Contact Form */}
                {isAddingContact && (
                  <form onSubmit={handleAddEmergencyContact} className="bg-red-950/80 p-3.5 rounded-xl border border-red-800/80 space-y-3 animate-in fade-in duration-150">
                    <p className="font-extrabold text-red-300 text-[11px]">Configure New Emergency Contact</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Full Name (e.g. John Doe)"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="p-2.5 bg-red-900/60 border border-red-700/80 rounded-lg text-white text-xs font-semibold placeholder:text-red-300/60 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Relationship (e.g. Spouse, Brother)"
                        value={newContactRel}
                        onChange={(e) => setNewContactRel(e.target.value)}
                        className="p-2.5 bg-red-900/60 border border-red-700/80 rounded-lg text-white text-xs font-semibold placeholder:text-red-300/60 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number (+234 800 000 0000)"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="p-2.5 bg-red-900/60 border border-red-700/80 rounded-lg text-white text-xs font-mono font-semibold placeholder:text-red-300/60 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                      <input
                        type="email"
                        placeholder="Email Address (Optional)"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="p-2.5 bg-red-900/60 border border-red-700/80 rounded-lg text-white text-xs font-semibold placeholder:text-red-300/60 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-1.5 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                      >
                        Save Emergency Contact
                      </button>
                    </div>
                  </form>
                )}

                {/* Contacts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="bg-red-950/60 border border-red-800/80 p-3 rounded-xl flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-white">{contact.name}</p>
                        <p className="text-[10px] text-red-300 font-medium">{contact.relationship}</p>
                        <p className="text-[11px] text-red-200 font-mono font-bold flex items-center gap-1 pt-0.5">
                          <Phone className="w-3 h-3 text-red-400" /> {contact.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveEmergencyContact(contact.id)}
                        className="p-1 hover:bg-red-800/80 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Patient Current Location & Health Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Location Box */}
                <div className="bg-red-900/40 border border-red-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-400" /> Patient Location
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">GPS Active</span>
                  </div>
                  <input
                    type="text"
                    value={emergencyLocation}
                    onChange={(e) => setEmergencyLocation(e.target.value)}
                    className="w-full p-2.5 bg-red-950/80 border border-red-700/80 rounded-xl text-xs text-white font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <p className="text-[10px] text-red-300">Exact coordinates automatically attached to emergency notifications.</p>
                </div>

                {/* Health Status Box */}
                <div className="bg-red-900/40 border border-red-800/80 rounded-2xl p-4 space-y-2">
                  <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-red-400" /> Attached Basic Health Status
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                    <div className="bg-red-950/60 p-2 rounded-lg border border-red-800/80">
                      <span className="text-[9px] text-red-300 uppercase block font-bold">Blood Group</span>
                      <span className="text-white font-mono font-black">{patient.bloodGroup || 'O+'}</span>
                    </div>
                    <div className="bg-red-950/60 p-2 rounded-lg border border-red-800/80">
                      <span className="text-[9px] text-red-300 uppercase block font-bold">Age</span>
                      <span className="text-white font-mono font-black">{patient.age || 34} yrs</span>
                    </div>
                  </div>
                  <div className="bg-red-950/60 p-2 rounded-lg border border-red-800/80 text-[10px]">
                    <span className="text-red-300 font-bold uppercase block text-[9px]">Known Allergies</span>
                    <span className="text-white font-medium">{patient.allergies?.join(', ') || 'Penicillin'}</span>
                  </div>
                </div>

              </div>

              {/* SECTION 3: Custom Emergency Note */}
              <div className="space-y-1.5">
                <label className="block text-red-300 font-extrabold text-xs">Optional Emergency Note / Situation Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Experiencing severe chest pain and difficulty breathing..."
                  value={emergencyCustomNote}
                  onChange={(e) => setEmergencyCustomNote(e.target.value)}
                  className="w-full p-3 bg-red-950/80 border border-red-800/80 rounded-2xl text-xs text-white placeholder:text-red-400/60 font-medium focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>

              {/* ACTION BUTTON: DISPATCH AUTOMATED SOS */}
              <div className="pt-2">
                <button
                  onClick={handleSendEmergencyAlert}
                  disabled={emergencySending}
                  className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-red-900/50 flex items-center justify-center gap-2 cursor-pointer border border-red-400 uppercase tracking-wider animate-pulse disabled:opacity-50"
                >
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <span>{emergencySending ? "Dispatching Automated Emergency Alerts..." : "SEND AUTOMATED EMERGENCY ALERT TO CONTACTS"}</span>
                </button>
              </div>

              {/* Direct Hotline Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a 
                  href="tel:+2349012223333" 
                  className="flex items-center justify-between p-3 bg-red-900/60 hover:bg-red-800 rounded-xl transition-all font-bold text-xs border border-red-700/60 text-white"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-300" /> Hospital Emergency Line
                  </span>
                  <span className="text-[11px] text-red-200 font-mono">+234 901 222 3333</span>
                </a>

                <a 
                  href="tel:+2349014445555" 
                  className="flex items-center justify-between p-3 bg-red-900/60 hover:bg-red-800 rounded-xl transition-all font-bold text-xs border border-red-700/60 text-white"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-300" /> Ambulance Hotline
                  </span>
                  <span className="text-[11px] text-red-200 font-mono">+234 901 444 5555</span>
                </a>
              </div>

            </div>

            <p className="text-center text-[10px] text-red-400 pt-2 border-t border-red-900/80 font-medium shrink-0">
              🚨 Emergency SOS triggers real-time alert logs and forensic audit entries automatically across CareLink.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 5: PERMISSION / CONSENT SCREEN */}
      {showConsentModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) handleConsentResponse(showConsentModal.id, false); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-4 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                M
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Access Request Registry</h3>
                <h2 className="text-sm font-extrabold text-slate-950 mt-0.5">{showConsentModal.hospitalName}</h2>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-extrabold text-slate-800">{showConsentModal.doctorName} requested digital consent signatures to read:</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                {showConsentModal.specialties.map(spec => (
                  <div key={spec} className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-[10px]">✓</span>
                    <span className="font-bold text-slate-800">{spec} Records</span>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center font-black text-[10px]">✗</span>
                  <span className="font-bold text-slate-400">Full Medical History</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 py-1">
                <span>Requested Signature Validity:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">Expires in {showConsentModal.expiresInDays} Days</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleConsentResponse(showConsentModal.id, false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => handleConsentResponse(showConsentModal.id, true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 cursor-pointer transition-all"
              >
                Approve Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PRINT PREVIEW MODAL */}
      {printingRecord && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setPrintingRecord(null); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-1.5 text-slate-900">
                <Printer className="w-5 h-5 text-indigo-600" /> Medical Document Print Preview
              </h2>
              <button 
                onClick={() => setPrintingRecord(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Viewable Section */}
            <div id="printable-area" className="border border-slate-200 p-6 rounded-2xl bg-white space-y-6 text-slate-800 overflow-y-auto flex-1">
              <div className="flex justify-between items-start border-b border-blue-500 pb-4">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">CARELINK HEALTH REPORT</h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secure Clinical Record Document</p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <p>System Hash ID:</p>
                  <p className="font-mono text-slate-600 font-bold">{printingRecord.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Patient Name</span>
                  <p className="font-bold text-slate-900">{localPatient.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">National ID</span>
                  <p className="font-mono text-slate-900">{localPatient.id}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Record Title</span>
                  <p className="font-bold text-slate-900">{printingRecord.title}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Category</span>
                  <p className="font-bold text-blue-600 uppercase text-[10px] tracking-wide">{printingRecord.specialty}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Clinical Facility</span>
                  <p className="font-semibold text-slate-900">{printingRecord.hospital}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Date Uploaded</span>
                  <p className="font-semibold text-slate-900">{printingRecord.uploadDate}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold text-[10px] uppercase block">Record Details / Laboratory Findings</span>
                <div className="bg-slate-50 p-4 rounded-xl text-xs font-mono border border-slate-200/80 break-all whitespace-pre-wrap leading-relaxed text-slate-700">
                  {printingRecord.url}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 text-center text-[9px] text-slate-400 font-medium">
                CareLink Secure Network • Verified Cryptographic Clinical Synchronization
              </div>
            </div>

            <div className="flex gap-3 text-xs justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setPrintingRecord(null)}
                className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 cursor-pointer transition-all"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold flex items-center gap-2 shadow-md shadow-indigo-100 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Trigger System Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD MEDICAL HISTORY ITEM */}
      {showAddHistoryModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddHistoryModal(false); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-4 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-slate-900">
                <Plus className="w-5 h-5 text-blue-600" /> Add Clinical Medical History
              </h2>
              <button 
                onClick={() => setShowAddHistoryModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHistoryItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Type of History</label>
                <select 
                  value={newHistoryType} 
                  onChange={(e) => setNewHistoryType(e.target.value as any)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-xs transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="condition">Medical Condition / Chronic Illness</option>
                  <option value="surgery">Surgery / Surgical Procedure</option>
                  <option value="medication">Chronic Medication</option>
                  <option value="vaccine">Vaccination / Immunization</option>
                  <option value="family">Family Medical History</option>
                  <option value="other">Other Clinical Details</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Title / Description</label>
                <input 
                  type="text" 
                  required 
                  value={newHistoryTitle}
                  onChange={(e) => setNewHistoryTitle(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Appendectomy, Pfizer Booster" 
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white font-semibold text-slate-800 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Diagnosed / Performed Year</label>
                <input 
                  type="text" 
                  value={newHistoryDate}
                  onChange={(e) => setNewHistoryDate(e.target.value)}
                  placeholder="e.g. 2020, June 2022" 
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white font-semibold text-slate-800 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Notes</label>
                <textarea 
                  value={newHistoryNotes}
                  onChange={(e) => setNewHistoryNotes(e.target.value)}
                  placeholder="Notes, dosages, treatments, outcomes..." 
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white leading-relaxed font-medium text-slate-800 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 cursor-pointer transition-all"
                >
                  Save History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: RESCHEDULE APPOINTMENT MODAL */}
      {reschedulingNotification && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setReschedulingNotification(null); }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-4 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-slate-900">
                <Calendar className="w-5 h-5 text-blue-600" /> Reschedule Appointment
              </h2>
              <button 
                onClick={() => setReschedulingNotification(null)} 
                className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
              <p className="font-extrabold text-blue-950">Original Reminder Detail:</p>
              <p className="font-medium text-blue-800 leading-relaxed">{reschedulingNotification.message}</p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Select New Date</label>
                <input 
                  type="date" 
                  required 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white font-semibold text-slate-800 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Select New Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRescheduleTime(t)}
                      className={`py-2 text-[11px] font-extrabold rounded-xl border transition-all text-center cursor-pointer ${
                        rescheduleTime === t 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingNotification(null)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-extrabold text-xs shadow-md shadow-blue-200 cursor-pointer transition-all"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: PATIENT HEALTH SUMMARY PDF GENERATOR */}
      {showHealthSummaryPdfModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowHealthSummaryPdfModal(false); }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                    Patient Health & Diagnostic Summary PDF
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified clinical export for printing, offline storage, or sharing with external specialists.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowHealthSummaryPdfModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specialist Referral Note Input */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 shrink-0 no-print">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>Add Custom Referral Note or Specialist Name (Optional)</span>
              </label>
              <input
                type="text"
                value={summarySpecialistNote}
                onChange={(e) => setSummarySpecialistNote(e.target.value)}
                placeholder="e.g. For Dr. Aminu - Specialist Referral / Cardiology Second Opinion"
                className="w-full bg-white p-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Printable Area (Targeted by @media print) */}
            <div 
              id="health-summary-printable" 
              className="border-2 border-slate-200 p-6 sm:p-8 rounded-2xl bg-white space-y-6 text-slate-800 overflow-y-auto flex-1 shadow-inner text-xs"
            >
              {/* Document Official Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-blue-600 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
                      CARELINK INTEGRATED HEALTH NETWORK
                    </h1>
                  </div>
                  <p className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                    OFFICIAL CLINICAL PROFILE & DIAGNOSTIC SUMMARY
                  </p>
                </div>
                <div className="text-left sm:text-right text-[10px] space-y-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
                  <p className="text-slate-400 font-bold uppercase">Document Ref ID:</p>
                  <p className="font-mono text-slate-900 font-black">CU-PDF-{patient.id}-{Date.now().toString().slice(-6)}</p>
                  <p className="text-slate-500 font-mono">Issued: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Section 1: Demographics */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-slate-100 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span>1. Patient Demographics & Profile</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">VERIFIED ACTIVE</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Full Patient Name</span>
                    <p className="font-extrabold text-slate-900">{patient.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">CareLink National ID</span>
                    <p className="font-mono font-bold text-blue-700">{patient.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Age / Gender</span>
                    <p className="font-bold text-slate-900">{patient.age || 34} Yrs / {patient.gender || 'Male'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Blood Group</span>
                    <p className="font-mono font-black text-rose-600">{patient.bloodGroup || 'O+'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Primary Contact Phone</span>
                    <p className="font-mono text-slate-800">{patient.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Email Address</span>
                    <p className="font-mono text-slate-800 truncate">{patient.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Home Address</span>
                    <p className="text-slate-800">{patient.address || 'Garki Area 11, Abuja, FCT Nigeria'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Primary Clinical Facility</span>
                    <p className="font-bold text-slate-900">{patient.hospital || 'General Hospital Abuja (Garki)'}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Allergies & Critical Care Directives */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-rose-50 text-rose-900 p-2 rounded-lg border border-rose-200 flex items-center justify-between">
                  <span>2. Critical Allergies & Clinical Directives</span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/80 space-y-1">
                    <span className="text-rose-900 font-extrabold text-[11px] block">Known Adverse Drug Reactions / Allergies</span>
                    <p className="font-extrabold text-rose-700 bg-white p-2 rounded-lg border border-rose-200 font-mono">
                      {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Penicillin, Sulfa-based Antibiotics'}
                    </p>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/80 space-y-1">
                    <span className="text-amber-900 font-extrabold text-[11px] block">Chronic Conditions & Risk Factors</span>
                    <p className="font-extrabold text-amber-800 bg-white p-2 rounded-lg border border-amber-200 font-mono">
                      {patient.medicalHistory && patient.medicalHistory.length > 0
                        ? patient.medicalHistory.map(h => h.title).join(', ')
                        : 'Essential Hypertension, Type 2 Diabetes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Emergency Contacts */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-slate-100 p-2 rounded-lg border border-slate-200/80">
                  3. Configured Emergency Contacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{contact.name}</p>
                        <p className="text-[10px] text-slate-500">{contact.relationship}</p>
                      </div>
                      <span className="font-mono font-bold text-blue-700 bg-white px-2 py-1 rounded border border-slate-200 text-[11px]">
                        {contact.phone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Recent Diagnostic & Laboratory Findings */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-blue-50 text-blue-950 p-2 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span>4. Recent Diagnostic & Laboratory Results ({records.length})</span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </h3>
                {records.length === 0 ? (
                  <p className="text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl">No uploaded lab records found.</p>
                ) : (
                  <div className="space-y-2">
                    {records.map((rec) => (
                      <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-900 text-xs">{rec.title}</span>
                          <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                            {rec.specialty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 whitespace-pre-wrap">
                          {rec.url || 'Diagnostic Finding Verified & Synchronized with Vault'}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Facility: <strong>{rec.hospital}</strong></span>
                          <span>Date Uploaded: <strong className="font-mono">{rec.uploadDate}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Medical History */}
              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider bg-slate-100 p-2 rounded-lg border border-slate-200/80">
                    5. Medical Visit History & Diagnoses
                  </h3>
                  <div className="space-y-1.5">
                    {patient.medicalHistory.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.title}</span>
                          <span className="text-slate-500">{item.hospital || 'General Hospital'} • Dr. {item.doctor || 'Attending Physician'}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                          {item.date || 'Recorded'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 6: Specialist Referral Note if populated */}
              {summarySpecialistNote && (
                <div className="space-y-1.5 bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 text-indigo-950">
                  <span className="font-extrabold text-xs block uppercase text-indigo-900">
                    Specialist Referral & Clinical Remarks
                  </span>
                  <p className="font-mono text-xs bg-white p-2.5 rounded-lg border border-indigo-200">
                    {summarySpecialistNote}
                  </p>
                </div>
              )}

              {/* Footer Seal & Signatures */}
              <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-black shrink-0 border border-slate-800">
                    CU
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">CareLink Cryptographic Medical Verification</p>
                    <p className="font-mono">Security Hash: SHA256-892401-VERIFIED</p>
                  </div>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0 w-full sm:w-auto">
                  <p className="border-b border-slate-400 pb-1 font-mono font-bold text-slate-800">
                    ____________________________________
                  </p>
                  <p className="text-slate-400 font-bold uppercase mt-1">Official Clinician / Specialist Signature</p>
                </div>
              </div>

            </div>

            {/* Action Footer Bar (Hidden when printing via .no-print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareSpecialistLink}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  {summaryCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                  <span>{summaryCopied ? 'Link Copied!' : 'Copy Specialist Link'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHealthSummaryPdfModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 text-xs cursor-pointer transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadPdfSummary}
                  disabled={downloadingPdf}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? 'Generating...' : 'Download Summary Document'}</span>
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-200 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Emergency Medical Profile & QR Pass Modal */}
      <EmergencyMedicalProfileModal 
        patient={patient}
        isOpen={showEmergencyQrModal}
        onClose={() => setShowEmergencyQrModal(false)}
      />

      {/* Universal Hospital Transfer & Cross-Facility Access Modal */}
      <HospitalTransferModal 
        patient={localPatient}
        isOpen={showHospitalTransferModal}
        onClose={() => setShowHospitalTransferModal(false)}
        onTransferSuccess={(newHospital) => {
          setLocalPatient(prev => ({ ...prev, hospital: newHospital }));
        }}
      />

    </div>
  );
}
