import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LoginPortal from './components/LoginPortal';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import LabDashboard from './components/LabDashboard';
import ReceptionDashboard from './components/ReceptionDashboard';
import LandingPage from './components/LandingPage';
import RegisterFacilityPage from './components/RegisterFacilityPage';
import EmergencyMedicalProfileModal from './components/EmergencyMedicalProfileModal';
import ConfirmPasswordPage from './components/ConfirmPasswordPage';

export default function App() {
  const [role, setRole] = useState<'patient' | 'doctor' | 'lab' | 'admin' | 'reception' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'portal' | 'register-facility' | 'confirm-account'>('landing');
  const [confirmToken, setConfirmToken] = useState<string>('');
  const [initialRegister, setInitialRegister] = useState<boolean>(false);
  const [urlEmergencyPatient, setUrlEmergencyPatient] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setConfirmToken(token);
        setView('confirm-account');
      }

      const pid = params.get('emergencyPatientId');
      if (pid) {
        setUrlEmergencyPatient({
          id: pid,
          name: pid === 'NID-782-901' ? 'Samuel Nwosu' : `Patient (${pid})`,
          email: "patient@carelink.health",
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
            { id: 'm1', type: 'condition', title: 'Essential Hypertension', date: '2023', hospital: 'General Hospital' }
          ]
        });
      }
    }
  }, []);

  const handleLoginSuccess = (userRole: 'patient' | 'doctor' | 'lab' | 'admin' | 'reception', loggedInUser: any) => {
    setRole(userRole);
    setUser(loggedInUser);
    setView('portal');
  };

  const handleLogout = () => {
    setRole(null);
    setUser(null);
    setView('landing');
    setInitialRegister(false);
  };

  // Immediate role switching presets for seamless review
  const simulateRoleSwitch = (targetRole: 'patient' | 'doctor' | 'lab' | 'admin' | 'reception') => {
    setView('portal');
    if (targetRole === 'patient') {
      handleLoginSuccess('patient', {
        id: "NID-782-901",
        name: "Samuel Nwosu",
        email: "samuel@example.com",
        phone: "+234 803 123 4567",
        age: 27,
        bloodGroup: "O+",
        allergies: ["Penicillin", "Dust Mites"],
        mfaEnabled: true
      });
    } else if (targetRole === 'doctor') {
      handleLoginSuccess('doctor', {
        id: "DOC-102",
        name: "Dr. Johnson Okafor",
        email: "johnson@hospital.org",
        phone: "+234 805 987 6543",
        specialty: "Cardiology Specialist",
        department: "Cardiology",
        hospitalId: "HOSP-01",
        hospitalName: "General Hospital Abuja",
        availability: ["09:00", "10:00", "11:30", "14:00"]
      });
    } else if (targetRole === 'lab') {
      handleLoginSuccess('lab', {
        id: "LAB-001",
        name: "Tech. Chidi Vance",
        email: "labtech@hospital.org",
        hospitalId: "HOSP-01",
        hospitalName: "General Hospital Abuja",
        department: "Central Diagnostic Laboratory",
        role: "Senior Lab Technologist"
      });
    } else if (targetRole === 'admin') {
      handleLoginSuccess('admin', {
        id: "ADM-001",
        name: "Hospital Administrator",
        email: "admin@ghabuja.org",
        hospitalName: "General Hospital Abuja",
        location: "Garki Area, Abuja",
        verified: true,
        emergencyPhone: "+234 901 222 3333",
        ambulancePhone: "+234 901 444 5555"
      });
    } else if (targetRole === 'reception') {
      handleLoginSuccess('reception', {
        id: "REC-001",
        name: "Amina Aliyu",
        email: "reception@ghabuja.org",
        hospitalId: "HOSP-01",
        hospitalName: "General Hospital Abuja",
        department: "Front Desk & Reception",
        role: "Senior Reception Officer"
      });
    }
  };

  const activeRouteKey = view === 'portal' ? `portal-${role || 'login'}` : view;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
      {/* Primary Workspace router */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRouteKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 flex flex-col min-h-0 w-full"
          >
            {view === 'landing' ? (
              <LandingPage 
                onBypassRole={simulateRoleSwitch} 
                onNavigatePortal={(register?: boolean) => {
                  setInitialRegister(!!register);
                  setView('portal');
                }}
                onNavigateRegisterFacility={() => setView('register-facility')}
              />
            ) : view === 'register-facility' ? (
              <RegisterFacilityPage onBackToLanding={() => setView('landing')} />
            ) : view === 'confirm-account' ? (
              <ConfirmPasswordPage 
                tokenFromUrl={confirmToken}
                onGoToLogin={() => {
                  setView('portal');
                  setRole(null);
                }}
              />
            ) : !role ? (
              <LoginPortal 
                onLoginSuccess={handleLoginSuccess} 
                initialRegister={initialRegister} 
              />
            ) : role === 'patient' ? (
              <PatientDashboard patient={user} onLogout={handleLogout} />
            ) : role === 'doctor' ? (
              <DoctorDashboard doctor={user} onLogout={handleLogout} />
            ) : role === 'lab' ? (
              <LabDashboard labStaff={user} onLogout={handleLogout} />
            ) : role === 'admin' ? (
              <AdminDashboard admin={user} onLogout={handleLogout} />
            ) : role === 'reception' ? (
              <ReceptionDashboard receptionist={user} onLogout={handleLogout} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Emergency URL QR Scan Overlay */}
      {urlEmergencyPatient && (
        <EmergencyMedicalProfileModal 
          patient={urlEmergencyPatient}
          isOpen={!!urlEmergencyPatient}
          onClose={() => setUrlEmergencyPatient(null)}
          scannedByStaff={true}
          staffName="Authorized Triage Staff / First Responder"
          staffRole="Emergency Medical Officer"
        />
      )}
    </div>
  );
}
