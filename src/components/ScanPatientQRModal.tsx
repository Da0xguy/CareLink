import React, { useState } from 'react';
import { 
  QrCode, 
  X, 
  Search, 
  ShieldCheck, 
  Camera, 
  Upload, 
  AlertCircle, 
  UserCheck, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Building2,
  Lock
} from 'lucide-react';
import { PatientProfile } from '../types';

interface ScanPatientQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: PatientProfile) => void;
}

export default function ScanPatientQRModal({ isOpen, onClose, onSelectPatient }: ScanPatientQRModalProps) {
  const [patientIdInput, setPatientIdInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mock patient dataset for instant staff lookup
  const mockPatients: PatientProfile[] = [
    {
      id: "NID-782-901",
      name: "Samuel Nwosu",
      email: "samuel@example.com",
      phone: "+234 803 123 4567",
      age: 27,
      bloodGroup: "O+",
      allergies: ["Penicillin", "Dust Mites", "Sulfa Drugs"],
      mfaEnabled: true,
      hospital: "General Hospital Abuja (Garki)",
      emergencyContacts: [
        { id: '1', name: 'Dr. Amina Nwosu', relationship: 'Spouse / Guardian', phone: '+234 802 999 8888' },
        { id: '2', name: 'Chinedu Nwosu', relationship: 'Brother', phone: '+234 803 111 2222' }
      ],
      medicalHistory: [
        { id: 'm1', type: 'condition', title: 'Essential Hypertension', date: '2023', hospital: 'General Hospital' },
        { id: 'm2', type: 'condition', title: 'Mild Asthma', date: '2021', hospital: 'National Hospital Abuja' }
      ]
    },
    {
      id: "NID-501-332",
      name: "Grace Adebayo",
      email: "grace.adebayo@example.org",
      phone: "+234 802 333 4455",
      age: 34,
      bloodGroup: "A+",
      allergies: ["Ibuprofen", "Aspirin"],
      mfaEnabled: true,
      hospital: "National Hospital Abuja",
      emergencyContacts: [
        { id: '1', name: 'Kabiru Adebayo', relationship: 'Husband', phone: '+234 803 444 5566' }
      ],
      medicalHistory: [
        { id: 'm1', type: 'condition', title: 'Type 2 Diabetes Mellitus', date: '2020', hospital: 'National Hospital' }
      ]
    },
    {
      id: "NID-992-104",
      name: "Ibrahim Garba",
      email: "ibrahim.garba@example.ng",
      phone: "+234 809 777 8899",
      age: 42,
      bloodGroup: "B+",
      allergies: ["Latex", "Codeine"],
      mfaEnabled: true,
      hospital: "Federal Medical Center Jabi",
      emergencyContacts: [
        { id: '1', name: 'Fatima Garba', relationship: 'Wife', phone: '+234 802 888 9900' }
      ],
      medicalHistory: [
        { id: 'm1', type: 'condition', title: 'Previous Appendectomy', date: '2018', hospital: 'FMC Jabi' }
      ]
    }
  ];

  const handleSimulateScanCamera = () => {
    setScanning(true);
    setScanError(null);
    setTimeout(() => {
      setScanning(false);
      // Select default mock patient Samuel Nwosu
      onSelectPatient(mockPatients[0]);
    }, 2000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    const cleaned = patientIdInput.trim().toUpperCase();
    const found = mockPatients.find(p => p.id.toUpperCase().includes(cleaned) || p.name.toUpperCase().includes(cleaned));
    
    if (found) {
      onSelectPatient(found);
    } else {
      // Fallback: create dynamic patient record with that ID
      const dynamicPatient: PatientProfile = {
        id: cleaned || `NID-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        name: `Patient (${cleaned || 'Verified ID'})`,
        email: "patient@carelink.health",
        phone: "+234 800 000 0000",
        age: 30,
        bloodGroup: "O+",
        allergies: ["Penicillin", "Sulfa Drugs"],
        mfaEnabled: true,
        hospital: "General Hospital Abuja",
        emergencyContacts: [
          { id: '1', name: 'Primary Guardian', relationship: 'Next of Kin', phone: '+234 802 000 1111' }
        ]
      };
      onSelectPatient(dynamicPatient);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-7 space-y-5 max-w-lg w-full shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Scan Patient Emergency QR Code
              </h2>
              <p className="text-xs text-slate-500">
                Authorized Clinical Staff Emergency Profile Lookup
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

        {/* Scanner Simulation Box */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center space-y-4 relative overflow-hidden border border-slate-800">
          
          <div className="w-44 h-44 mx-auto border-2 border-dashed border-blue-400/80 rounded-2xl flex flex-col items-center justify-center relative p-3 bg-slate-950/60">
            {scanning ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-blue-300 animate-pulse">Scanning QR Beam...</p>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <QrCode className="w-16 h-16 text-blue-400" />
                <p className="text-[11px] font-mono text-slate-300">Point Camera at Patient's QR Pass</p>
              </div>
            )}
            
            {/* Animated Scan Line */}
            {scanning && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce"></div>
            )}
          </div>

          <button
            onClick={handleSimulateScanCamera}
            disabled={scanning}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
          >
            <Camera className="w-4 h-4" />
            <span>{scanning ? 'Initializing Optical Scanner...' : 'Start Camera QR Scanner'}</span>
          </button>
        </div>

        {/* Manual ID Search Option */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Or Enter National ID / Paste QR Link</span>
            <span className="text-[10px] text-slate-400 font-mono">e.g. NID-782-901</span>
          </label>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              placeholder="Enter Patient ID (e.g., NID-782-901)"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Fetch</span>
            </button>
          </form>
        </div>

        {/* Quick Test Demo Patients */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Recent Patient Emergency QR Passes (Quick Select):
          </span>
          <div className="space-y-1.5">
            {mockPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className="w-full text-left bg-slate-50 hover:bg-blue-50/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between transition-all cursor-pointer text-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-900 block">{p.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">ID: {p.id} • Blood: {p.bloodGroup}</span>
                </div>
                <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                  {p.allergies?.length || 0} Allergies
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
          CareLink Cryptographic Identity Service • Security Seal Active
        </div>

      </div>
    </div>
  );
}
