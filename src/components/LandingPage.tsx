import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Compass, 
  Lock, 
  Activity, 
  Ambulance, 
  BrainCircuit, 
  ArrowRight, 
  Users, 
  QrCode, 
  HeartHandshake, 
  Stethoscope, 
  Building,
  CheckCircle,
  FileText,
  Lightbulb,
  FolderLock,
  Key,
  Sparkles,
  Server,
  UserCheck,
  Microscope,
  Building2,
  ShieldAlert,
  Zap,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onBypassRole: (role: 'patient' | 'doctor' | 'lab' | 'admin' | 'reception') => void;
  onNavigatePortal: (register?: boolean) => void;
  onNavigateRegisterFacility: () => void;
}

export default function LandingPage({ onBypassRole, onNavigatePortal, onNavigateRegisterFacility }: LandingPageProps) {
  const [activePreviewRole, setActivePreviewRole] = useState<'patient' | 'doctor' | 'lab' | 'admin' | 'reception'>('patient');

  const mockPatient = {
    id: "NID-782-901",
    name: "Samuel Nwosu",
    email: "samuel@example.com",
    phone: "+234 803 123 4567",
    age: 27,
    bloodGroup: "O+",
    allergies: ["Penicillin", "Dust Mites"],
    mfaEnabled: true
  };

  const rolePreviews = {
    patient: {
      title: "Patient Health Vault",
      subtitle: "Biometric Digital Identity & Record Control",
      icon: Users,
      badge: "Patient Portal",
      color: "bg-blue-600 text-white",
      desc: "Full ownership of medical folders, instant digital consent requests, emergency contact alerts, and downloadable health summaries.",
      actionText: "Launch Patient Dashboard",
      stats: [
        { label: "Active Records", value: "12 Reports" },
        { label: "Consent Key", value: "SHA-256 Active" },
        { label: "MFA Status", value: "Biometric Sealed" }
      ]
    },
    doctor: {
      title: "Physician Clinical Workspace",
      subtitle: "AI Diagnostic Co-Pilot & Patient Queue",
      icon: Stethoscope,
      badge: "Physician Portal",
      color: "bg-emerald-600 text-white",
      desc: "Instant patient folder lookup, break-glass emergency access override, real-time lab order dispatch, and AI consultation support.",
      actionText: "Launch Doctor Dashboard",
      stats: [
        { label: "Clinic Queue", value: "8 Active Patients" },
        { label: "AI Diagnostic", value: "Gemini 2.5 Co-Pilot" },
        { label: "Lab Orders", value: "Instant Dispatch" }
      ]
    },
    lab: {
      title: "Diagnostic Lab Information System",
      subtitle: "Sample Tracking & Result Verification",
      icon: Microscope,
      badge: "Lab Portal",
      color: "bg-purple-600 text-white",
      desc: "Digital test request queue, direct specimen result capture, attachment sync into patient vault, and real-time status alerts.",
      actionText: "Launch Lab Technologist Portal",
      stats: [
        { label: "Pending Tests", value: "5 Orders" },
        { label: "Sync Speed", value: "< 1.2 seconds" },
        { label: "Format Support", value: "PDF & High-Res DICOM" }
      ]
    },
    admin: {
      title: "Hospital Command & Logistics Center",
      subtitle: "Roster Management & Emergency SOS Grid",
      icon: Building2,
      badge: "Admin Portal",
      color: "bg-amber-600 text-white",
      desc: "Hospital staff roster management, emergency ambulance response logs, audit trail oversight, and system security parameters.",
      actionText: "Launch Hospital Admin Center",
      stats: [
        { label: "Active Staff", value: "24 Physicians & Techs" },
        { label: "Facility ID", value: "HOSP-01 Verified" },
        { label: "Ambulance Status", value: "2 Fleet Units Ready" }
      ]
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.45, ease: [0.215, 0.61, 0.355, 1.0] } 
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans flex flex-col selection:bg-blue-100">
      
      {/* Navigation Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-5.5 h-5.5" />
            </motion.div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">CareLink</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <a href="#features" className="hover:text-blue-600 transition-colors relative group py-1">
              System Architecture
            </a>
            <a href="#roles" className="hover:text-blue-600 transition-colors relative group py-1">
              Patient Portal
            </a>
            <a href="#compliance" className="hover:text-blue-600 transition-colors relative group py-1">
              Clinical Compliance
            </a>
            <button 
              onClick={onNavigateRegisterFacility}
              className="hover:text-blue-600 text-blue-600 transition-colors relative group py-1 font-extrabold cursor-pointer text-xs uppercase tracking-wider"
            >
              Register Facility
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigatePortal(false)}
              className="text-slate-700 hover:bg-slate-100 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigatePortal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              Register Patient
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="px-6 py-8 md:py-12 max-w-7xl mx-auto grid grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-73px)] w-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="col-span-12 lg:col-span-6 space-y-6"
        >
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Integrated Care. <br />
            <span className="text-blue-600">Empowered Outcomes.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base text-slate-500 leading-relaxed max-w-lg">
            CareLink bridges the gap across all hospitals with a universal patient identification system. Eliminate manual transfer paperwork: present your unique ID or QR code at any healthcare facility to instantly authorize paperless access to your complete medical history.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigatePortal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              Log In to Portal <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigatePortal(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm px-7 py-3.5 rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              Create Patient Account
            </motion.button>
          </motion.div>


        </motion.div>

        {/* Hero Interactive App Device Frame */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.215, 0.61, 0.355, 1.0] }}
          className="col-span-12 lg:col-span-6 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-lg space-y-4 relative"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Digital Identity Card</span>
            </div>
          </div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-50/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden"
          >
            <div className="space-y-3 flex-1 z-10">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-600" />
                Active Patient Card
              </span>
              <h3 className="text-lg font-bold text-slate-900">{mockPatient.name}</h3>
              <div className="space-y-1.5 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">National ID Registry:</p>
                <p className="font-bold text-slate-800 bg-white border border-slate-200 p-2 rounded-lg shadow-2xs">{mockPatient.id}</p>
              </div>
            </div>
            
            {/* Hologram QR */}
            <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 w-32 shrink-0 shadow-xs z-10">
              <QrCode className="w-16 h-16 text-slate-800" />
              <span className="text-[9px] text-slate-400 font-bold uppercase">Biometric Verified</span>
            </div>
          </motion.div>


        </motion.div>
      </section>

      {/* Patient Health Vault Showcase Section */}
      <section id="roles" className="bg-gradient-to-b from-slate-100/70 to-slate-50 border-t border-b border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-100/80 px-3 py-1 rounded-full">
              Patient Portal Workspace
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Patient Health Vault & Digital Identity
            </h2>
          </div>

          {/* Patient Showcase Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-sm grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase">
                  Patient Health Vault
                </span>
                <span className="text-xs text-slate-400 font-mono">End-to-End Encrypted</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900">
                Personal Medical Record Control Center
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage all your hospital consultation reports, lab results, prescriptions, and emergency contact details in one secure place. Present your universal QR code at any hospital for instant paperless record synchronization.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Active Records</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">12 Reports</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Consent Key</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">SHA-256 Active</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">MFA Status</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">Biometric Sealed</span>
                </div>
              </div>

              <div className="pt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBypassRole('patient')}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-7 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Patient Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl space-y-4 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-300">PATIENT VAULT SECURITY LOG</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">Biometric Gate:</span>
                  <span className="text-emerald-400 font-bold">● VERIFIED</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">Data Encryption:</span>
                  <span className="text-blue-300 font-bold">AES-256 SYNCED</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">Emergency Pass:</span>
                  <span className="text-slate-200">Active QR Code</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Launch the portal to view your complete personal medical dashboard and records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks Section */}
      <section id="features" className="bg-white border-t border-b border-slate-200 py-16 px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Security & Consent First</h4>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Core System Architecture</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Our clinical protocols ensure that patients manage their health data securely, while clinical institutions can access real-time vitals during emergencies.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Card 1 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Encrypted Record Vaults</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Medical reports and laboratory test files are fully encrypted. Access credentials reside in local secure storage, protected by system-level biometric locks.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Patient-Controlled Consent</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clinicians dispatch instant digital consent requests to patient apps. Access is granted in one tap, with automatic expiration times and precise security auditing.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <Ambulance className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Emergency Override</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                In critical medical emergencies where consent is unobtainable, verified physicians can execute a break-glass override, recorded permanently in security logs.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Support Proxy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Doctors use our Express/Gemini-powered clinical decision support to examine complex ECG charts, check drug-drug interactions, and write diagnostic prescriptions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance / Safety Block */}
      <section id="compliance" className="bg-slate-900 text-slate-400 py-16 px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Regulatory Standards</h4>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Security & Clinical Compliance</h2>
            <p className="text-xs leading-relaxed">
              CareLink complies fully with modern medical security standards, privacy regulations, and electronic record transmission standards. Comprehensive encryption keeps files locked on device storage until decrypted under strict clinical access controls.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-slate-800 text-slate-300 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-slate-700">
                HIPAA COMPLIANT
              </span>
              <span className="bg-slate-800 text-slate-300 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-slate-700">
                GDPR COMPLIANT
              </span>
              <span className="bg-slate-800 text-slate-300 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-slate-700">
                AES-256 REGISTERED
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl space-y-3 font-mono text-xs text-slate-300"
          >
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Abuja Registry Hub Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Active database synchronization is running at 100% service availability. Secure cloud API layers process medical rosters and urgent dispatches, using verified end-to-end authorization keys.
            </p>
            <div className="text-[10px] text-slate-500">
              Cert Code: NH-FCT-883-992-SECURE
            </div>
          </motion.div>
        </div>
      </section>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-8 text-center text-xs text-slate-400 font-medium mt-auto">
        <p>© 2026 CareLink Patient Portal. Developed for National Clinical Standards.</p>
      </footer>

    </div>
  );
}

