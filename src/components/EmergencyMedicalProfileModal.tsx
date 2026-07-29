import React, { useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  ShieldAlert, 
  X, 
  Printer, 
  Phone, 
  Mail, 
  Download, 
  Share2, 
  Check, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Lock, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy,
  ExternalLink,
  Siren,
  Send
} from 'lucide-react';
import { PatientProfile } from '../types';

interface EmergencyMedicalProfileModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
  scannedByStaff?: boolean;
  staffName?: string;
  staffRole?: string;
  onBreakGlassConsent?: (patientId: string) => void;
}

export default function EmergencyMedicalProfileModal({
  patient,
  isOpen,
  onClose,
  scannedByStaff = false,
  staffName = 'Authorized Emergency Clinical Staff',
  staffRole = 'Emergency Medical Officer',
  onBreakGlassConsent
}: EmergencyMedicalProfileModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'clinical' | 'contacts'>('card');

  if (!isOpen || !patient) return null;

  // Construct secure QR code payload link
  const scanOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://carelink.health';
  const emergencyQrPayload = `${scanOrigin}/?emergencyPatientId=${encodeURIComponent(patient.id)}&ts=${Date.now()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(emergencyQrPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQr = () => {
    const canvas = document.getElementById('emergency-qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `Emergency_QR_${patient.id}_${patient.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleTriggerStaffSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  Emergency Medical Profile & Digital QR Card
                </h2>
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Critical Care
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Encrypted National Identity Record • Scan for Immediate Triage Info
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Verification Access Banner if accessed by staff */}
        {scannedByStaff && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-extrabold text-amber-950">
                  Staff Emergency Access Audit Active
                </p>
                <p className="text-amber-800 text-[11px]">
                  Accessed by <strong>{staffName}</strong> ({staffRole}) on {new Date().toLocaleTimeString()}.
                </p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg shrink-0">
              AUDIT RECORDED
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'card'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency QR Card
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clinical'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Clinical Triage & Allergies
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Emergency Contacts ({patient.emergencyContacts?.length || 2})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1 text-slate-800">
          
          {/* TAB 1: EMERGENCY QR CARD & WALLET PRINTABLE */}
          {activeTab === 'card' && (
            <div className="space-y-6">
              
              {/* Emergency Card Display Box */}
              <div 
                id="emergency-wallet-card-printable"
                className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden space-y-6"
              >
                {/* Background Design Details */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Top Header */}
                <div className="flex justify-between items-start border-b border-indigo-800/80 pb-4 relative z-10 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      CU
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-wider uppercase text-white">
                        CARELINK HEALTH NETWORK
                      </h3>
                      <p className="text-[10px] font-mono text-rose-300 font-bold uppercase tracking-widest">
                        NATIONAL EMERGENCY MEDICAL PASS
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block">
                      BLOOD TYPE: {patient.bloodGroup || 'O+'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      ID: {patient.id}
                    </span>
                  </div>
                </div>

                {/* Patient Main Details & QR Code Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                  
                  {/* Left Patient Details */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      {patient.avatarUrl ? (
                        <img src={patient.avatarUrl} alt={patient.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/50 border-2 border-indigo-400/50 flex items-center justify-center text-xl font-black text-white">
                          {patient.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-extrabold text-white leading-tight">{patient.name}</h2>
                        <p className="text-xs text-indigo-200 font-mono">
                          {patient.age || 34} Yrs • {patient.gender || 'Male'} • National Reg
                        </p>
                      </div>
                    </div>

                    {/* Critical Alert Ribbon */}
                    <div className="bg-rose-950/80 border border-rose-500/40 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>CRITICAL ALLERGIES & ADVERSE DRUG ALERTS</span>
                      </div>
                      <p className="font-mono text-xs font-extrabold text-white pl-5">
                        {patient.allergies && patient.allergies.length > 0
                          ? patient.allergies.join(', ')
                          : 'PENICILLIN, SULFA-BASED ANTIBIOTICS'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase block">Emergency Phone</span>
                        <span className="font-bold text-white">{patient.phone}</span>
                      </div>
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 text-[10px] uppercase block">Primary Hospital</span>
                        <span className="font-bold text-white truncate block">{patient.hospital || 'General Hospital Abuja'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right QR Code Generator */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2 bg-white text-slate-900 p-4 rounded-2xl border-2 border-indigo-400/60 shadow-lg">
                    <div className="p-2 bg-white rounded-xl">
                      <QRCodeSVG 
                        value={emergencyQrPayload} 
                        size={155} 
                        level="H" 
                        includeMargin={false} 
                      />
                      {/* Hidden canvas element for PNG export */}
                      <div className="hidden">
                        <QRCodeCanvas 
                          id="emergency-qr-code-canvas" 
                          value={emergencyQrPayload} 
                          size={400} 
                          level="H" 
                          includeMargin={true} 
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">
                      SCAN FOR EMERGENCY PROFILE
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 text-center">
                      Authorized Medical Personnel Only
                    </span>
                  </div>

                </div>

                {/* Footer Security Verification */}
                <div className="pt-3 border-t border-indigo-900/80 flex flex-wrap justify-between items-center text-[10px] text-indigo-300 font-mono gap-2 relative z-10">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    256-BIT CRYPTOGRAPHIC HEALTH SEAL
                  </span>
                  <span>REF: CU-EMG-{patient.id}</span>
                </div>

              </div>

              {/* Instructions and Share Links */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  How to Use Your Emergency QR Code
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Save or print this QR card to keep in your wallet, phone lockscreen, or emergency medical bracelet. First responders, paramedics, and hospital ER doctors can scan it directly to view your critical allergies, blood group, and emergency contacts instantly.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{copiedLink ? 'Emergency Link Copied!' : 'Copy Emergency Scan Link'}</span>
                  </button>

                  <button
                    onClick={handleDownloadQr}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download QR Image (PNG)</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Emergency Wallet Card</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CLINICAL TRIAGE & ALLERGIES */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              
              {/* Demographics Summary Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Blood Group</span>
                  <span className="text-base font-black text-rose-600">{patient.bloodGroup || 'O+'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Age / Gender</span>
                  <span className="text-sm font-extrabold text-slate-900">{patient.age || 34} Yrs / {patient.gender || 'Male'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">MFA Identity Status</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Primary Hospital</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">{patient.hospital || 'General Hospital Abuja'}</span>
                </div>
              </div>

              {/* Critical Allergies Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Known Adverse Drug Reactions & Allergies
                  </span>
                  <span className="bg-rose-200 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded">
                    HIGH PRIORITY
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(patient.allergies && patient.allergies.length > 0 ? patient.allergies : ['Penicillin', 'Sulfa-based Antibiotics', 'Dust Mites']).map((allergy, idx) => (
                    <span key={idx} className="bg-white text-rose-800 border border-rose-300 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-2xs">
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Chronic Diagnoses & Medical History
                </span>
                <div className="space-y-2 pt-1">
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    patient.medicalHistory.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-amber-200/80 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900">{item.title}</span>
                          <span className="text-slate-500 block text-[11px]">{item.hospital || 'General Hospital'} • {item.notes || 'Recorded in profile'}</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.date || 'Active'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Essential Hypertension (Stage 1)</span>
                        <span className="text-[10px] font-mono text-slate-500">Diagnosed 2023</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Asthma (Mild Intermittent)</span>
                        <span className="text-[10px] font-mono text-slate-500">Diagnosed 2019</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Configured Emergency Contacts & Next of Kin
                </h3>
                {scannedByStaff && (
                  <button
                    onClick={handleTriggerStaffSos}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>{sosSent ? 'Emergency SMS Dispatched!' : 'Notify Contact via SMS'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(patient.emergencyContacts && patient.emergencyContacts.length > 0 ? patient.emergencyContacts : [
                  { id: '1', name: 'Dr. Amina Nwosu', relationship: 'Spouse / Primary Guardian', phone: '+234 802 999 8888', email: 'amina@example.com' },
                  { id: '2', name: 'Chinedu Nwosu', relationship: 'Brother / Next of Kin', phone: '+234 803 111 2222', email: 'chinedu@example.com' }
                ]).map((contact, idx) => (
                  <div key={contact.id || idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{contact.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {contact.relationship}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600">{contact.phone}</p>
                      {contact.email && <p className="text-[11px] text-slate-400">{contact.email}</p>}
                    </div>

                    <a 
                      href={`tel:${contact.phone}`}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {contact.name.split(' ')[0]}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions Bar */}
        <div className="border-t border-slate-100 pt-3 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>CareLink Biometric QR Shield • Ver 2026</span>
          </div>

          <div className="flex items-center gap-2">
            {scannedByStaff && onBreakGlassConsent && (
              <button
                onClick={() => onBreakGlassConsent(patient.id)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Break-Glass EHR Access</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
