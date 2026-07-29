import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Home as HomeIcon, 
  FileText, 
  AlertTriangle, 
  Shield, 
  QrCode, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Plus, 
  Calendar, 
  Phone, 
  Activity, 
  Bell, 
  Search, 
  User, 
  CheckCircle, 
  X, 
  RefreshCw,
  Eye,
  Settings,
  ChevronRight
} from 'lucide-react';
import { PatientProfile, Appointment, MedicalRecord, AuditLog } from '../types';

interface ReactNativeSimulatorProps {
  patient: PatientProfile;
}

export default function ReactNativeSimulator({ patient }: ReactNativeSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'sos' | 'security'>('home');
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosStatus, setSosStatus] = useState<'idle' | 'counting' | 'dispatched'>('idle');
  
  // Interactive Simulator State
  const [decryptedRecords, setDecryptedRecords] = useState<Record<string, boolean>>({});
  const [localRecords, setLocalRecords] = useState<MedicalRecord[]>([
    {
      id: "REC-201",
      patientId: patient.id,
      title: "Electrocardiogram (ECG) Report",
      fileType: "pdf",
      specialty: "Cardiology",
      hospital: "General Hospital Abuja",
      doctorName: "Dr. Sarah Johnson",
      uploadDate: "Yesterday, 10:24 AM",
      url: "Sinus Rhythm with Stable QT Interval. Heart rate avg 72bpm.",
      size: "1.2 MB",
      encrypted: true,
      approvedDoctors: ["DOC-102"]
    },
    {
      id: "REC-202",
      patientId: patient.id,
      title: "Lipid Profile & Blood Count",
      fileType: "pdf",
      specialty: "Hematology",
      hospital: "LabCentral Abuja",
      doctorName: "Dr. David Alao",
      uploadDate: "Oct 14, 2023",
      url: "Cholesterol: 180 mg/dL (Normal). WBC count within baseline.",
      size: "820 KB",
      encrypted: true,
      approvedDoctors: []
    }
  ]);

  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLog[]>([
    {
      id: "AUD-401",
      patientId: patient.id,
      actorName: "Dr. Johnson (Clinician)",
      actorRole: "Doctor",
      action: "Decrypted Electrocardiogram (ECG)",
      timestamp: "Today, 11:15 AM",
      status: "Success"
    },
    {
      id: "AUD-402",
      patientId: patient.id,
      actorName: "General Hospital Abuja Node",
      actorRole: "System",
      action: "Encrypted Lab Record Upload",
      timestamp: "Yesterday, 10:24 AM",
      status: "Success"
    }
  ]);

  const [simulatedHr, setSimulatedHr] = useState(72);
  const [simulatedBp, setSimulatedBp] = useState("120/80");

  // Biometric Unlock animation simulation
  useEffect(() => {
    if (!biometricUnlocked) {
      const timer = setTimeout(() => {
        setBiometricUnlocked(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [biometricUnlocked]);

  // HR monitor pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedHr(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const newHr = prev + delta;
        return Math.min(Math.max(newHr, 65), 85);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // SOS dispatch trigger
  useEffect(() => {
    let timer: any;
    if (sosStatus === 'counting') {
      if (sosCountdown > 0) {
        timer = setTimeout(() => setSosCountdown(prev => prev - 1), 1000);
      } else {
        setSosStatus('dispatched');
        // Add dispatch audit log
        const newLog: AuditLog = {
          id: `AUD-${Date.now()}`,
          patientId: patient.id,
          actorName: "Patient (Mobile App)",
          actorRole: "User",
          action: "Triggered Emergency GPS Ambulance Dispatch",
          timestamp: "Just Now",
          status: "Emergency-Override"
        };
        setLocalAuditLogs(prev => [newLog, ...prev]);
      }
    }
    return () => clearTimeout(timer);
  }, [sosStatus, sosCountdown]);

  const triggerSos = () => {
    setSosStatus('counting');
    setSosCountdown(5);
  };

  const cancelSos = () => {
    setSosStatus('idle');
    setSosCountdown(5);
  };

  const handleToggleDecrypt = (id: string) => {
    setDecryptedRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // Log the decryption action
    const record = localRecords.find(r => r.id === id);
    if (record && !decryptedRecords[id]) {
      const newLog: AuditLog = {
        id: `AUD-${Date.now()}`,
        patientId: patient.id,
        actorName: "Patient (Biometrics verified)",
        actorRole: "Owner",
        action: `Self-decrypted ${record.title}`,
        timestamp: "Just Now",
        status: "Success"
      };
      setLocalAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleShareWithDoctor = (id: string) => {
    setLocalRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        const isAlreadyShared = rec.approvedDoctors.includes("DOC-102");
        return {
          ...rec,
          approvedDoctors: isAlreadyShared 
            ? rec.approvedDoctors.filter(d => d !== "DOC-102") 
            : [...rec.approvedDoctors, "DOC-102"]
        };
      }
      return rec;
    }));

    const record = localRecords.find(r => r.id === id);
    const wasShared = record?.approvedDoctors.includes("DOC-102");
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      patientId: patient.id,
      actorName: "Patient (Biometrics verified)",
      actorRole: "Owner",
      action: `${wasShared ? 'Revoked' : 'Granted'} Dr. Johnson access to ${record?.title}`,
      timestamp: "Just Now",
      status: "Success"
    };
    setLocalAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="w-full flex justify-center items-center py-4">
      {/* Clean Embedded App Simulator Container (No Phone Frame) */}
      <div className="relative w-full max-w-[380px] h-[650px] bg-slate-50 rounded-2xl border border-slate-200 shadow-md flex flex-col text-slate-900 overflow-hidden select-none">
        
        {/* Screen Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {/* Biometric Lock Splash Screen overlay */}
          {!biometricUnlocked && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white p-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Fingerprint className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold tracking-tight text-white">Authenticating Profile</h4>
                  <p className="text-[11px] text-slate-400">Verifying secure biometric credentials...</p>
                </div>
                <div className="bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/50 text-[10px] font-mono text-slate-400">
                  Patient Key: {patient.id}
                </div>
              </div>
            </div>
          )}

          {/* Header Bar */}
          <div className="px-5 py-3 flex justify-between items-center bg-white border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                {patient.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">CareLink App</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Patient Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowQrModal(true)}
                className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="View Decentralized QR Credentials"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setBiometricUnlocked(false);
                  setTimeout(() => setBiometricUnlocked(true), 1200);
                }}
                className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Re-authenticate biometrics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Pane inside Device (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            
            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                
                {/* Greeting */}
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Welcome back,</h4>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{patient.name} 👋</h2>
                  <p className="text-[11px] text-slate-400 leading-tight">Your secure patient medical profile is active.</p>
                </div>

                {/* Identity Card (Clean Utility design) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health ID Registry</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                      Active Profile
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono">National ID (Universal)</p>
                    <p className="text-xs font-mono font-bold text-slate-800 tracking-wider bg-slate-50 p-2 rounded border border-slate-100/50 flex justify-between items-center">
                      <span>{patient.id}</span>
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Blood Group</span>
                      <span className="font-bold text-red-600 text-sm">{patient.bloodGroup}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Age</span>
                      <span className="font-bold text-slate-700 text-sm">{patient.age} Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry metrics row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                      <span className="text-sm font-extrabold text-slate-800">{simulatedHr} <span className="text-[10px] font-normal text-slate-400">BPM</span></span>
                    </div>
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 animate-pulse text-xs">❤️</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                      <span className="text-sm font-extrabold text-slate-800">{simulatedBp}</span>
                    </div>
                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-xs">⚡</div>
                  </div>
                </div>

                {/* Next Appointment alert */}
                <div className="bg-blue-600 text-white rounded-2xl p-4.5 space-y-3 relative overflow-hidden shadow-sm shadow-blue-500/10">
                  <div className="relative z-10 space-y-1.5">
                    <span className="text-[10px] text-blue-100 uppercase font-bold tracking-wider">Scheduled Visit</span>
                    <h4 className="text-base font-black">Dr. Sarah Johnson</h4>
                    <p className="text-[11px] text-blue-100 font-medium">Tomorrow • 10:00 AM • Cardiology</p>
                    <div className="pt-2 flex gap-2">
                      <button className="bg-white text-blue-600 px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">
                        View Details
                      </button>
                      <button className="bg-blue-500 border border-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">
                        Map
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500 rounded-full opacity-30"></div>
                </div>

                {/* Emergency Hotlines quick button */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-red-800">Dispatch Emergency Response</h4>
                    <p className="text-[10px] text-red-600/80">Sends continuous location and vital telemetry.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('sos')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    SOS Dial
                  </button>
                </div>

              </div>
            )}

            {/* TAB: RECORDS */}
            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Secure Record Vault</h3>
                    <p className="text-[10px] text-slate-400">Requires local biometric authentication to decrypt files.</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                    AES-256 Encrypted
                  </span>
                </div>

                {/* Records list */}
                <div className="space-y-3">
                  {localRecords.map(record => {
                    const isDecrypted = decryptedRecords[record.id];
                    const isDoctorApproved = record.approvedDoctors.includes("DOC-102");
                    return (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-3xs">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                              {record.fileType}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug">{record.title}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold">{record.specialty} • {record.uploadDate}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">{record.size}</span>
                        </div>

                        {/* Decrypted viewer card */}
                        {isDecrypted ? (
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] text-slate-600 font-mono leading-relaxed">
                            {record.url}
                          </div>
                        ) : (
                          <div className="bg-slate-100/50 p-2 rounded-xl text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Encrypted. Scan finger or press decrypt to view.</span>
                          </div>
                        )}

                        {/* Actions line */}
                        <div className="pt-2 border-t border-slate-100 flex justify-between gap-2">
                          <button
                            onClick={() => handleToggleDecrypt(record.id)}
                            className="flex-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200/50 transition-colors"
                          >
                            {isDecrypted ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            {isDecrypted ? "Re-encrypt" : "Decrypt"}
                          </button>
                          <button
                            onClick={() => handleShareWithDoctor(record.id)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border ${
                              isDoctorApproved 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100' 
                                : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {isDoctorApproved ? "Consent Active" : "Grant Dr. Consent"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Upload Simulated Record button */}
                <button
                  onClick={() => {
                    const randomId = `REC-${Math.floor(Math.random() * 900) + 100}`;
                    const newRec: MedicalRecord = {
                      id: randomId,
                      patientId: patient.id,
                      title: "Simulated Phone Laboratory Slip",
                      fileType: "pdf",
                      specialty: "General Medicine",
                      hospital: "Mobile Gallery Upload",
                      doctorName: "Self-Uploaded",
                      uploadDate: "Just Now",
                      url: "Allergic response: Dust Mites (Positive). IgE level: 120 IU/mL.",
                      size: "450 KB",
                      encrypted: true,
                      approvedDoctors: []
                    };
                    setLocalRecords(prev => [newRec, ...prev]);
                    // Audit log
                    const newLog: AuditLog = {
                      id: `AUD-${Date.now()}`,
                      patientId: patient.id,
                      actorName: "Patient (Camera Capture)",
                      actorRole: "Owner",
                      action: "Uploaded & encrypted secure laboratory document",
                      timestamp: "Just Now",
                      status: "Success"
                    };
                    setLocalAuditLogs(prev => [newLog, ...prev]);
                    alert("Laboratory document secured and appended to your clinical profile!");
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-3xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Capture & Upload Document
                </button>
              </div>
            )}

            {/* TAB: SOS DISPATCH */}
            {activeTab === 'sos' && (
              <div className="space-y-4">
                
                {/* Emergency banner */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center space-y-1">
                  <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase inline-block">
                    Emergency Dispatch Network
                  </span>
                  <h3 className="text-sm font-bold text-red-900">Abuja National Ambulance Grid</h3>
                  <p className="text-[10px] text-slate-500 max-w-[250px] mx-auto leading-tight">
                    By holding the dispatch trigger, we automatically bypass standard locks to share immediate allergies, conditions, and location.
                  </p>
                </div>

                {/* Interactive SOS Trigger Button */}
                <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                  {sosStatus === 'idle' && (
                    <button 
                      onClick={triggerSos}
                      className="w-32 h-32 bg-red-600 hover:bg-red-700 text-white rounded-full flex flex-col items-center justify-center gap-1 font-black text-lg tracking-wider border-8 border-red-100 shadow-md animate-bounce cursor-pointer transition-colors"
                    >
                      <AlertTriangle className="w-8 h-8" />
                      <span>SOS</span>
                    </button>
                  )}

                  {sosStatus === 'counting' && (
                    <div className="text-center space-y-3">
                      <div className="w-32 h-32 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-4xl border-8 border-orange-100 animate-pulse">
                        {sosCountdown}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest animate-pulse">Initiating Dispatch Protocol</p>
                        <button 
                          onClick={cancelSos}
                          className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-[10px] font-bold border border-slate-300"
                        >
                          Cancel Override
                        </button>
                      </div>
                    </div>
                  )}

                  {sosStatus === 'dispatched' && (
                    <div className="text-center space-y-3 p-4">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">Ambulance Dispatched!</h4>
                        <p className="text-[10px] text-slate-500 font-mono bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                          ER Route Code: <strong className="text-blue-600 font-bold">ABJ-ER-991</strong>
                        </p>
                        <p className="text-[10px] text-slate-400">Emergency physician has bypassed access locks and decrypted your clinical profile.</p>
                        <button 
                          onClick={cancelSos}
                          className="mt-2 text-red-500 text-[10px] font-bold bg-red-50 px-3 py-1 rounded border border-red-100"
                        >
                          Terminate Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location coordinates telemetry block */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800">Live Status & Location</h4>
                  <div className="bg-slate-50 p-2 rounded-lg font-mono text-[10px] text-slate-500 space-y-1">
                    <p>● GPS Latitude: 9.0765° N (Abuja)</p>
                    <p>● GPS Longitude: 7.3986° E</p>
                    <p>● Heart Rate Status: <strong className="text-blue-600 font-bold">{simulatedHr} BPM</strong> (Monitored)</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SECURITY & AUDIT */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Security & Audits</h3>
                    <p className="text-[10px] text-slate-400">Auditable, immutable access logs for your health files.</p>
                  </div>
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>

                {/* Ledger entries list */}
                <div className="space-y-2.5">
                  {localAuditLogs.map(log => (
                    <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 text-[11px]">{log.action}</span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          log.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {log.status === 'Success' ? 'Verified' : 'Bypass'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                        <span>By: {log.actorName}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consent instructions banner */}
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200/50 text-[10px] text-slate-500 leading-normal">
                  CareLink implements secure patient-centric encryption. Hospital and clinical personnel cannot view files unless explicit consent is active in this app, or in designated emergency dispatch override scenarios.
                </div>

              </div>
            )}

          </div>

          {/* Navigation Bar at the absolute bottom of Phone */}
          <nav className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-40">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1.5 text-[10px] font-bold ${
                activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('records')}
              className={`flex flex-col items-center gap-1.5 text-[10px] font-bold ${
                activeTab === 'records' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Vault</span>
            </button>
            <button 
              onClick={() => setActiveTab('sos')}
              className={`flex flex-col items-center gap-1.5 text-[10px] font-bold ${
                activeTab === 'sos' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              <span>SOS</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex flex-col items-center gap-1.5 text-[10px] font-bold ${
                activeTab === 'security' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </button>
          </nav>

        </div>

        {/* --- PATIENT SECURE IDENTITY QR MODAL (INSIDE SIMULATOR) --- */}
        {showQrModal && (
          <div className="absolute inset-0 bg-black/60 z-55 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[280px] p-5 text-center space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">Secure Access QR Code</span>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Simulated QR Code box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-2">
                <div className="w-32 h-32 bg-white border border-slate-200 p-2 rounded-lg flex flex-col justify-between relative">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 bg-slate-900 rounded-2xs"></span>
                    <span className="w-4 h-4 bg-slate-900 rounded-2xs"></span>
                  </div>
                  <div className="flex justify-center items-center">
                    <Shield className="w-6 h-6 text-blue-600 absolute" />
                    <div className="grid grid-cols-6 gap-0.5 opacity-80 select-none">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 ${
                          (i % 3 === 0 || i % 4 === 1 || i % 7 === 0) ? 'bg-slate-900' : 'bg-transparent'
                        }`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 bg-slate-900 rounded-2xs"></span>
                    <span className="w-4 h-4 bg-slate-400 rounded-2xs"></span>
                  </div>
                </div>
                <p className="text-[10px] font-mono font-bold text-slate-700">{patient.id}</p>
              </div>

              <div className="text-[9px] text-slate-400 leading-tight">
                This QR contains the cryptographic signature of patient {patient.name}. Hospital operators scan this directly to request records consent.
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-slate-900 text-white py-1.5 rounded-xl text-[10px] font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
