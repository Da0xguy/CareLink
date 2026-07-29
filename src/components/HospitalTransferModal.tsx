import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  ArrowRightLeft, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Send, 
  FileText, 
  Key, 
  Share2, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  QrCode,
  Building,
  Check,
  Download,
  Copy
} from 'lucide-react';
import { PatientProfile } from '../types';

interface AuthorizedFacility {
  id: string;
  name: string;
  code: string;
  city: string;
  type: 'General Hospital' | 'Teaching Hospital' | 'Specialist Clinic' | 'Diagnostic Center' | 'ER / Ambulance';
  accessGrantedDate: string;
  status: 'Active Access' | 'Pending Transfer' | 'Transferred' | 'Revoked';
  accessLevel: 'Full EHR & Labs' | 'Emergency Profile Only' | 'Read & Write Consults';
  expiresIn: string;
}

interface HospitalTransferModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
  onTransferSuccess?: (newHospital: string) => void;
}

export default function HospitalTransferModal({
  patient,
  isOpen,
  onClose,
  onTransferSuccess
}: HospitalTransferModalProps) {
  const [activeTab, setActiveTab] = useState<'transfer' | 'facilities' | 'pass'>('transfer');
  
  // Hospital Transfer Form State
  const [currentHospital, setCurrentHospital] = useState(patient.hospital || 'General Hospital Abuja (Garki)');
  const [targetHospital, setTargetHospital] = useState('');
  const [transferReason, setTransferReason] = useState('Specialist Care Referral & Relocation');
  const [customReason, setCustomReason] = useState('');
  const [requestingDoctor, setRequestingDoctor] = useState('');
  const [transferUrgency, setTransferUrgency] = useState<'Routine' | 'Urgent Specialist' | 'Emergency ER Transfer'>('Urgent Specialist');
  const [transferStatus, setTransferStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [transferPassGenerated, setTransferPassGenerated] = useState(false);
  const [copiedTransferCode, setCopiedTransferCode] = useState(false);

  // Search & Facility Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityForGrant, setSelectedFacilityForGrant] = useState<string | null>(null);

  // Network Hospitals Database
  const networkHospitals = [
    { name: 'General Hospital Abuja (Garki)', code: 'HOSP-ABJ-001', city: 'Abuja FCT', type: 'General Hospital' },
    { name: 'Lagos University Teaching Hospital (LUTH)', code: 'HOSP-LOS-012', city: 'Lagos', type: 'Teaching Hospital' },
    { name: 'National Hospital Abuja', code: 'HOSP-ABJ-002', city: 'Abuja FCT', type: 'Specialist Clinic' },
    { name: 'University College Hospital (UCH) Ibadan', code: 'HOSP-IBD-005', city: 'Ibadan, Oyo', type: 'Teaching Hospital' },
    { name: 'Federal Medical Center Jabi', code: 'HOSP-ABJ-008', city: 'Abuja FCT', type: 'General Hospital' },
    { name: 'Aminu Kano Teaching Hospital', code: 'HOSP-KAN-003', city: 'Kano', type: 'Teaching Hospital' },
    { name: 'St. Nicholas Hospital Lagos Island', code: 'HOSP-LOS-088', city: 'Lagos', type: 'Specialist Clinic' },
    { name: 'Reddington Hospital Victoria Island', code: 'HOSP-LOS-099', city: 'Lagos', type: 'Specialist Clinic' }
  ];

  // Mock Active Authorized Facilities
  const [authorizedFacilities, setAuthorizedFacilities] = useState<AuthorizedFacility[]>([
    {
      id: 'f-1',
      name: patient.hospital || 'General Hospital Abuja (Garki)',
      code: 'HOSP-ABJ-001',
      city: 'Abuja FCT',
      type: 'General Hospital',
      accessGrantedDate: '2025-01-15',
      status: 'Active Access',
      accessLevel: 'Full EHR & Labs',
      expiresIn: 'Permanent (Primary)'
    },
    {
      id: 'f-2',
      name: 'National Hospital Abuja',
      code: 'HOSP-ABJ-002',
      city: 'Abuja FCT',
      type: 'Specialist Clinic',
      accessGrantedDate: '2026-03-10',
      status: 'Active Access',
      accessLevel: 'Read & Write Consults',
      expiresIn: '24 Hours Remaining'
    }
  ]);

  if (!isOpen || !patient) return null;

  const filteredFacilities = networkHospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHospital) return;

    setTransferStatus('processing');
    setTimeout(() => {
      setTransferStatus('completed');
      setTransferPassGenerated(true);

      // Add to authorized facilities
      const newFacilityObj: AuthorizedFacility = {
        id: `f-${Date.now()}`,
        name: targetHospital,
        code: `HOSP-${Math.floor(100 + Math.random() * 900)}`,
        city: 'Verified Network Branch',
        type: 'Teaching Hospital',
        accessGrantedDate: new Date().toISOString().split('T')[0],
        status: 'Transferred',
        accessLevel: 'Full EHR & Labs',
        expiresIn: 'Permanent (Transferred)'
      };

      setAuthorizedFacilities(prev => [newFacilityObj, ...prev]);

      if (onTransferSuccess) {
        onTransferSuccess(targetHospital);
      }
    }, 1800);
  };

  const handleRevokeFacility = (id: string) => {
    setAuthorizedFacilities(prev => prev.map(f => f.id === id ? { ...f, status: 'Revoked' } : f));
  };

  const handleGrantAccess = (facility: { name: string; code: string; city: string; type: string }) => {
    const existing = authorizedFacilities.find(f => f.name === facility.name);
    if (existing && existing.status === 'Active Access') return;

    const newFac: AuthorizedFacility = {
      id: `f-${Date.now()}`,
      name: facility.name,
      code: facility.code,
      city: facility.city,
      type: facility.type as any,
      accessGrantedDate: new Date().toISOString().split('T')[0],
      status: 'Active Access',
      accessLevel: 'Full EHR & Labs',
      expiresIn: '72 Hours Temporary'
    };

    setAuthorizedFacilities(prev => [newFac, ...prev]);
    setSelectedFacilityForGrant(null);
  };

  const transferPassCode = `CU-TRANS-${patient.id.replace('NID-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyTransferCode = () => {
    navigator.clipboard.writeText(transferPassCode);
    setCopiedTransferCode(true);
    setTimeout(() => setCopiedTransferCode(false), 2500);
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  Universal Cross-Hospital Transfer & Access Control
                </h2>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  CareLink ID: {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grant instant record access to any healthcare facility or initiate paperless hospital transfers
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transfer'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Initiate Hospital Transfer
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'facilities'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Authorized Hospitals ({authorizedFacilities.filter(f => f.status !== 'Revoked').length})
          </button>
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pass'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Transfer Pass & Clearance
          </button>
        </div>

        {/* Main Body Content */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1 text-slate-800">

          {/* TAB 1: INITIATE HOSPITAL TRANSFER */}
          {activeTab === 'transfer' && (
            <div className="space-y-5">
              
              <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Zero Paperwork Transfer:</strong> CareLink's universal record database allows you to instantly transfer your complete clinical history, prescriptions, diagnostic labs, and active consultations to any registered hospital across Nigeria without manual request letters.
                </p>
              </div>

              {transferStatus === 'completed' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-emerald-950">
                      Hospital Transfer Authorized & EMR Synced!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                      All clinical files and diagnostic records have been securely routed to <strong>{targetHospital}</strong>. Present your Universal Patient ID (<strong>{patient.id}</strong>) or Clearance Pass code at the reception desk upon arrival.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 max-w-md mx-auto space-y-2 text-left text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Clearance Reference Code:</span>
                      <span className="font-extrabold text-slate-900">{transferPassCode}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Target Facility:</span>
                      <span className="font-bold text-slate-800">{targetHospital}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Authorized Security Key:</span>
                      <span className="text-emerald-600 font-bold">● AES-256 SYNCED</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('pass')}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>View Transfer Clearance Pass</span>
                    </button>
                    <button
                      onClick={() => setTransferStatus('idle')}
                      className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                    >
                      New Transfer Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInitiateTransfer} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Current Hospital (Read-only) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>Origin Healthcare Facility</span>
                      </label>
                      <input 
                        type="text" 
                        value={currentHospital} 
                        readOnly 
                        className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    {/* Target Hospital Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Destination Hospital / Facility</span>
                      </label>
                      <select
                        required
                        value={targetHospital}
                        onChange={(e) => setTargetHospital(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select Destination Hospital...</option>
                        {networkHospitals
                          .filter(h => h.name !== currentHospital)
                          .map((h, idx) => (
                            <option key={idx} value={h.name}>
                              {h.name} ({h.city})
                            </option>
                          ))}
                      </select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Reason */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Transfer Reason</label>
                      <select
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Specialist Care Referral & Relocation">Specialist Care Referral & Relocation</option>
                        <option value="Patient Choice / Proximity to Home">Patient Choice / Proximity to Home</option>
                        <option value="Emergency Intensive Care Unit Transfer">Emergency Intensive Care Unit Transfer</option>
                        <option value="Second Medical Opinion Consultation">Second Medical Opinion Consultation</option>
                        <option value="Other">Custom Reason...</option>
                      </select>
                    </div>

                    {/* Transfer Urgency */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Urgency Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Routine', 'Urgent Specialist', 'Emergency ER Transfer'] as const).map((urg) => (
                          <button
                            key={urg}
                            type="button"
                            onClick={() => setTransferUrgency(urg)}
                            className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                              transferUrgency === urg
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {urg.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Requesting Doctor / Referral Specialist */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Referring Physician or Specialist (Optional)
                    </label>
                    <input 
                      type="text"
                      value={requestingDoctor}
                      onChange={(e) => setRequestingDoctor(e.target.value)}
                      placeholder="e.g. Dr. Aminu Bello (Cardiology Department)"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Checkbox Permissions */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="consent-transfer" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                      <label htmlFor="consent-transfer" className="font-bold text-slate-800">
                        Authorize full electronic transfer of diagnostic lab reports, prescriptions, and medical records to the destination hospital.
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      CareLink cryptographically seals your identity. Access can be revoked at any time from your patient dashboard.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!targetHospital || transferStatus === 'processing'}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {transferStatus === 'processing' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Routing Clinical EMR Vault to {targetHospital}...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Authorize Electronic Transfer to {targetHospital || 'Hospital'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          )}

          {/* TAB 2: AUTHORIZED HOSPITALS & ACCESS DIRECTORY */}
          {activeTab === 'facilities' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Active Healthcare Facility Access Directory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hospitals and clinics authorized to query your universal record using ID <strong>{patient.id}</strong>
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search national hospital network..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Active Granted Facilities */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Currently Granted Facilities ({authorizedFacilities.filter(f => f.status !== 'Revoked').length})
                </span>

                {authorizedFacilities.map((fac) => (
                  <div key={fac.id} className="bg-slate-50 border border-slate-200/90 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{fac.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          fac.status === 'Transferred' 
                            ? 'bg-blue-100 text-blue-800' 
                            : fac.status === 'Active Access' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fac.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Code: {fac.code} • {fac.city} • Level: {fac.accessLevel}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Granted: {fac.accessGrantedDate} • Access Expiry: <strong className="text-slate-700">{fac.expiresIn}</strong>
                      </p>
                    </div>

                    {fac.status !== 'Revoked' && (
                      <button
                        onClick={() => handleRevokeFacility(fac.id)}
                        className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Revoke Access</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Grant Access to New Network Hospital Directory */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Grant Instant Access to National Healthcare Network:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                  {filteredFacilities.map((h, i) => {
                    const isAlreadyGranted = authorizedFacilities.some(af => af.name === h.name && af.status !== 'Revoked');
                    return (
                      <div key={i} className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900 block">{h.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{h.code} • {h.city}</span>
                        </div>
                        <button
                          disabled={isAlreadyGranted}
                          onClick={() => handleGrantAccess(h)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                            isAlreadyGranted 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                          }`}
                        >
                          {isAlreadyGranted ? 'Granted' : 'Grant Access'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TRANSFER CLEARANCE PASS & DOCKET */}
          {activeTab === 'pass' && (
            <div className="space-y-5">
              
              <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-5 border border-slate-800 shadow-xl relative overflow-hidden">
                
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="bg-blue-600 text-white text-[9px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-widest">
                      NATIONAL HEALTH REGISTRY PASS
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      Official Cross-Hospital Record Transfer Docket
                    </h3>
                  </div>
                  <div className="text-right font-mono text-xs text-blue-300">
                    <span className="font-bold">{transferPassCode}</span>
                    <span className="block text-[10px] text-slate-400">STATUS: SEALED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[10px] block uppercase">Patient ID</span>
                    <span className="font-bold text-white">{patient.id}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                    <span className="font-bold text-white truncate block">{patient.name}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[10px] block uppercase">Blood Group</span>
                    <span className="font-bold text-rose-400">{patient.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[10px] block uppercase">Security Lock</span>
                    <span className="font-bold text-emerald-400">256-BIT AES</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Origin Facility:</span>
                    <strong className="text-white">{currentHospital}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Target Hospital:</span>
                    <strong className="text-blue-300">{targetHospital || 'Any Network Hospital'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Transfer Reason:</span>
                    <span className="text-slate-200">{transferReason}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-between items-center text-xs">
                  <button
                    onClick={handleCopyTransferCode}
                    className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {copiedTransferCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{copiedTransferCode ? 'Code Copied!' : 'Copy Clearance Code'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Print Transfer Docket</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs shrink-0">
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            CareLink Universal Health Database Interoperability Standard 2026
          </span>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2 rounded-xl cursor-pointer transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
