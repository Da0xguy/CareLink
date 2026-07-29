import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building, 
  Building2,
  Users, 
  UserCheck, 
  TrendingUp, 
  Layers, 
  Ambulance, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Lock, 
  Mail, 
  Key,
  CheckCircle,
  Stethoscope,
  Trash2,
  UserX,
  Clock,
  CreditCard,
  X,
  Menu,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api';
import { HospitalAdminProfile, DoctorProfile, Department, RegisteredHospital } from '../types';

interface AdminDashboardProps {
  admin: HospitalAdminProfile;
  onLogout: () => void;
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>({
    totalPatients: 25420,
    doctorsCount: 184,
    appointmentsToday: 640,
    completedConsultations: "1,420",
    availableDoctors: 76,
    pendingRequests: 18
  });

  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitalsList, setHospitalsList] = useState<RegisteredHospital[]>([]);
  const [adminContacts, setAdminContacts] = useState<HospitalAdminProfile>(admin);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Hospital Facility Registration Form State
  const [hospName, setHospName] = useState('');
  const [hospType, setHospType] = useState('General Hospital');
  const [hospLocation, setHospLocation] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospEmail, setHospEmail] = useState('');
  const [hospCode, setHospCode] = useState('');
  const [hospAdminName, setHospAdminName] = useState('');
  const [hospSubmitting, setHospSubmitting] = useState(false);

  // Doctor Creation Form
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Cardiology');
  const [docDept, setDocDept] = useState('Cardiology Dept');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');

  // Generated Credentials Display
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    docId: string;
    tempPass: string;
    docName: string;
  } | null>(null);

  // New Department Form extended fields
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptFee, setDeptFee] = useState('5000');
  const [deptLead, setDeptLead] = useState('');
  const [deptLocation, setDeptLocation] = useState('Block A, Clinical Wing');
  const [deptHours, setDeptHours] = useState('08:00 AM - 05:00 PM');
  const [deptSlots, setDeptSlots] = useState('30');

  // Active Department Portal Modal
  const [selectedDeptPortal, setSelectedDeptPortal] = useState<Department | null>(null);

  // Contacts Edit Form
  const [editEmergency, setEditEmergency] = useState(admin.emergencyPhone);
  const [editAmbulance, setEditAmbulance] = useState(admin.ambulancePhone);
  const [editLocation, setEditLocation] = useState(admin.location);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'departments' | 'hospitals' | 'emergency'>('overview');

  const loadData = async () => {
    try {
      const liveStats = await api.getAdminStats().catch(() => null);
      if (liveStats) setStats(liveStats);

      const docs = await api.getAdminDoctors().catch(() => []);
      if (Array.isArray(docs)) setDoctorsList(docs);

      const depts = await api.getDepartments().catch(() => []);
      if (Array.isArray(depts)) setDepartments(depts);

      const hosps = await api.getRegisteredHospitals().catch(() => []);
      if (Array.isArray(hosps)) setHospitalsList(hosps);

      const contacts = await api.getAdminContacts().catch(() => null);
      if (contacts) setAdminContacts(contacts);
    } catch (err) {
      console.warn("AdminDashboard loadData warning:", err);
    }
  };

  const handleRegisterHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospEmail) return;
    setHospSubmitting(true);
    try {
      const res = await api.registerHospitalFacility({
        name: hospName,
        type: hospType || 'General Hospital',
        location: hospLocation || 'Abuja FCT',
        contactPhone: hospPhone || '+234 800 000 0000',
        contactEmail: hospEmail,
        registrationCode: hospCode || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
        adminName: hospAdminName || admin.name
      });
      if (res.success) {
        alert(`Health Facility "${hospName}" successfully registered & verified on CareLink Network!`);
        setHospName('');
        setHospEmail('');
        setHospPhone('');
        setHospLocation('');
        setHospCode('');
        setHospAdminName('');
        loadData();
      } else {
        alert(res.message || 'Facility registration failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to register facility');
    } finally {
      setHospSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docEmail) return;
    try {
      const response = await api.createDoctor({
        name: docName,
        email: docEmail,
        phone: docPhone,
        specialty: docSpecialty,
        department: docDept
      });
      if (response.success) {
        setGeneratedCredentials({
          docId: response.generatedId,
          tempPass: response.tempPassword,
          docName: response.doctor.name
        });
        // Reset inputs
        setDocName('');
        setDocEmail('');
        setDocPhone('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDoctorStatus = async (docId: string, status: 'active' | 'revoked') => {
    try {
      const response = await api.toggleDoctorStatus(docId, status);
      if (response.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;
    try {
      const response = await api.createDepartment({
        name: deptName,
        description: deptDesc,
        consultationFee: deptFee,
        leadDoctor: deptLead,
        location: deptLocation,
        operatingHours: deptHours,
        maxDailySlots: deptSlots
      });
      if (response.success) {
        alert(`Department Portal "${response.department.name}" provisioned successfully.`);
        setDeptName('');
        setDeptDesc('');
        setDeptFee('5000');
        setDeptLead('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.updateAdminContacts({
        emergencyPhone: editEmergency,
        ambulancePhone: editAmbulance,
        location: editLocation
      });
      if (response.success) {
        alert("Hospital Emergency directories updated nationwide.");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-white text-slate-700 flex-col justify-between shrink-0 border-r border-slate-200">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white font-black shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-md tracking-tight">CareLink Portal</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hospital Administration</p>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1 border border-slate-200/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <p className="font-bold text-slate-800 text-sm">Abuja General</p>
            </div>
            <p className="text-slate-500 font-bold">FCT Division</p>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase block mt-1.5 text-center">
              Verified Facility
            </span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-600" /> Operations Overview
            </button>
            <button 
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'doctors' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" /> Staff Management
            </button>
            <button 
              onClick={() => setActiveTab('departments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'departments' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600" /> Department Roster
            </button>
            <button 
              onClick={() => setActiveTab('hospitals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hospitals' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" /> Facility & Hospital Registry
            </button>
            <button 
              onClick={() => setActiveTab('emergency')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'emergency' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Ambulance className="w-4 h-4 text-blue-600" /> Emergency Dispatch
            </button>
          </nav>
        </div>

        <div className="p-6">
          <button 
            onClick={onLogout}
            className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-500 py-3 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer"
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
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 rounded-xl text-white font-black shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">CareLink Portal</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hospital Administration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1 border border-slate-200/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <p className="font-bold text-slate-800 text-sm">Abuja General</p>
                </div>
                <p className="text-slate-500 font-bold">FCT Division</p>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase block mt-1.5 text-center">
                  Verified Facility
                </span>
              </div>

              <nav className="space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab('overview');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Operations Overview
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('doctors');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'doctors' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-600" /> Staff Management
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('departments');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'departments' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-600" /> Department Roster
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('emergency');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'emergency' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Ambulance className="w-4 h-4 text-blue-600" /> Emergency Dispatch
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={onLogout}
                className="w-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-500 py-3 rounded-xl text-xs font-bold transition-colors border border-slate-200/60 cursor-pointer"
              >
                Logout Secure Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden border border-slate-200 transition-colors cursor-pointer shrink-0"
              title={mobileSidebarOpen ? "Hide Navigation Menu" : "Show Navigation Menu"}
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{adminContacts.hospitalName} Dashboard</h1>
              <p className="text-sm text-slate-500">Clinical administration, department rosters, staff credentials generation, and logistics monitoring.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Federally Accredited Hospital</span>
          </div>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Analytics Counters */}
            <div className="grid grid-cols-3 gap-5">
              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients Enrolled</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.totalPatients.toLocaleString()}</h3>
                <p className="text-[10px] text-slate-500">Matching Unique Patient IDs nationwide</p>
              </motion.div>

              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff & Doctors</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.doctorsCount}</h3>
                <p className="text-[10px] text-emerald-600 font-bold">Credentialed staff access</p>
              </motion.div>

              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointments Today</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.appointmentsToday}</h3>
                <p className="text-[10px] text-blue-600 font-bold">Consolidated department schedules</p>
              </motion.div>

              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Consultations</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.completedConsultations || "1,420"}</h3>
                <p className="text-[10px] text-emerald-600 font-bold">Records logged securely</p>
              </motion.div>

              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Doctors Today</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.availableDoctors}</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">Ready in departments</p>
              </motion.div>

              <motion.div 
                animate={{ y: 0 }} 
                whileHover={{ y: -4 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-md cursor-pointer transition-shadow"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Consent Clearances</p>
                <h3 className="text-3xl font-black text-orange-600">{stats.pendingRequests}</h3>
                <p className="text-[10px] text-orange-500 font-medium">Requiring patient signatures</p>
              </motion.div>
            </div>

            {/* Quick Summary list of hospital attributes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">Secure Registry Administration Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <p className="font-bold text-slate-700">Digital Location Directory</p>
                  <p className="text-slate-500">{adminContacts.location}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <p className="font-bold text-slate-700">Audit Logs Status</p>
                  <p className="text-emerald-600 font-semibold">✓ Cryptographic signing and security audit trail fully online.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STAFF MANAGEMENT */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column: Create Doctor Credential */}
            <div className="col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Accredit New Specialist</h3>
                <p className="text-[11px] text-slate-400 mt-1">This will generate a Unique Doctor ID and temporary security password.</p>
              </div>

              <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Dr. Adaeze Nwachukwu" 
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Specialty</label>
                    <select 
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      <option>Cardiology</option>
                      <option>Ophthalmology</option>
                      <option>Neurology</option>
                      <option>Orthopedics</option>
                      <option>Emergency Medicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Department</label>
                    <select 
                      value={docDept}
                      onChange={(e) => setDocDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      <option>Cardiology Dept</option>
                      <option>Eye Clinic</option>
                      <option>Neurology Dept</option>
                      <option>Emergency Medicine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      placeholder="adaeze@ghabuja.org" 
                      value={docEmail}
                      onChange={(e) => setDocEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="+234 803 ..." 
                      value={docPhone}
                      onChange={(e) => setDocPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Generate Credentials & Register
                </button>
              </form>

              {/* Display Generated credentials box */}
              {generatedCredentials && (
                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl p-4.5 text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Specialist Accredited!</span>
                  </div>
                  <p className="font-medium text-slate-700">Account successfully provisioned for <strong>{generatedCredentials.docName}</strong>.</p>
                  
                  <div className="bg-white border border-emerald-100 p-2.5 rounded-xl space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase text-[9px] font-bold">Unique Doc ID:</span>
                      <span className="text-blue-700 font-bold">{generatedCredentials.docId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase text-[9px] font-bold">Temporary Password:</span>
                      <span className="text-slate-800 font-bold">{generatedCredentials.tempPass}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Roster List */}
            <div className="col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Accredited Doctor Roster</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2">Doctor ID</th>
                      <th>Specialist</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th className="text-right">Access Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {doctorsList.map(doc => {
                      const isRevoked = doc.status === 'revoked';
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-blue-600">{doc.id}</td>
                          <td>
                            <div className="font-bold text-slate-900">{doc.name}</div>
                            <div className="text-[10px] text-slate-400">{doc.specialty}</div>
                          </td>
                          <td className="font-medium text-slate-600">{doc.department}</td>
                          <td>
                            {isRevoked ? (
                              <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-200">
                                REVOKED
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            {isRevoked ? (
                              <button
                                onClick={() => handleToggleDoctorStatus(doc.id, 'active')}
                                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg font-bold border border-emerald-200 transition-all text-[10px] cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Restore Access
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleDoctorStatus(doc.id, 'revoked')}
                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2.5 py-1 rounded-lg font-bold border border-red-200 transition-all text-[10px] cursor-pointer inline-flex items-center gap-1"
                              >
                                <UserX className="w-3 h-3" />
                                Revoke Access
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-12 gap-6 text-xs">
            
            {/* Left: Provision Department Portal */}
            <div className="col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Provision Department Portal</h3>
                <p className="text-[11px] text-slate-400 mt-1">Create an authorized hospital department portal for patient routing and clinical dispatch.</p>
              </div>
              
              <form onSubmit={handleCreateDept} className="space-y-3.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Department Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Pediatrics Dept" 
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Clinical Scope & Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe diagnostic focus, specialized equipment, and clinical procedures..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Consultation Fee (₦)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="5000" 
                      value={deptFee}
                      onChange={(e) => setDeptFee(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Daily Capacity (Slots)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="30" 
                      value={deptSlots}
                      onChange={(e) => setDeptSlots(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Department Lead Specialist</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dr. Adaeze Nwachukwu" 
                    value={deptLead}
                    onChange={(e) => setDeptLead(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Facility Wing / Location</label>
                    <input 
                      type="text" 
                      placeholder="Block D, Ground Floor" 
                      value={deptLocation}
                      onChange={(e) => setDeptLocation(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Operating Hours</label>
                    <input 
                      type="text" 
                      placeholder="08:00 AM - 05:00 PM" 
                      value={deptHours}
                      onChange={(e) => setDeptHours(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Provision Department Portal
                </button>
              </form>
            </div>

            {/* Right: Active Department Portals Grid */}
            <div className="col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Active Department Portals</h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-mono">
                  {departments.length} Provisioned Portals
                </span>
              </div>
              
              <div className="space-y-4">
                {departments.map(dept => {
                  const deptDocs = doctorsList.filter(d => d.department === dept.name);
                  return (
                    <div key={dept.id} className="p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                              {dept.id}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{dept.name}</h4>
                          </div>
                          <p className="text-slate-500 leading-relaxed text-xs">{dept.description}</p>
                        </div>

                        <button
                          onClick={() => setSelectedDeptPortal(dept)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Portal
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[10px]">
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase">Fee</span>
                          <span className="font-mono font-extrabold text-slate-900">
                            {dept.consultationFee !== undefined ? (dept.consultationFee === 0 ? 'Free (Trauma)' : `₦${dept.consultationFee.toLocaleString()}`) : '₦5,000'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase">Clinician Lead</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {dept.leadDoctor || 'Dr. On-Duty Lead'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase">Location</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {dept.location || 'Clinical Complex'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-bold uppercase">Active Staff</span>
                          <span className="font-mono font-extrabold text-blue-600">
                            {deptDocs.length || dept.doctorsCount || 1} Doctors
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB: EMERGENCY AMBULANCE DIRECTORY */}
        {activeTab === 'emergency' && (
          <div className="grid grid-cols-2 gap-6 text-xs">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Emergency Dispatch Directory</h3>
                <p className="text-slate-400 text-[11px] mt-1">Configure emergency hotlines displayed to patients during crisis events.</p>
              </div>

              <form onSubmit={handleUpdateContacts} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Hospital Emergency hotline</label>
                  <input 
                    type="text" 
                    required 
                    value={editEmergency}
                    onChange={(e) => setEditEmergency(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Ambulance Triage response number</label>
                  <input 
                    type="text" 
                    required 
                    value={editAmbulance}
                    onChange={(e) => setEditAmbulance(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">GPS Physical Coordinates (Hospital location)</label>
                  <input 
                    type="text" 
                    required 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Publish Emergency Updates Nationwide
                </button>
              </form>
            </div>

            <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 space-y-4 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-slate-400 border-b border-slate-800 pb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Ambulance className="w-5 h-5 text-red-500 animate-pulse" /> Dispatch Terminal
                </h3>

                <div className="space-y-2 leading-relaxed">
                  <p className="font-bold text-red-400">● LIVE DISPATCH SYSTEM ACTIVE</p>
                  <p>Ambulance response protocols matching <span className="text-white">{adminContacts.location}</span> physical boundaries.</p>
                  <p className="text-slate-500">Dispatch logistics system validates dispatch within 4 minutes average response time.</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <p className="font-bold text-white">Current Active Directory:</p>
                  <p>ER Number: <span className="text-blue-400">{adminContacts.emergencyPhone}</span></p>
                  <p>Ambulance Triage: <span className="text-blue-400">{adminContacts.ambulancePhone}</span></p>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
                Federally accredited emergency channels are integrated with Abuja metropolitan GPS tracking servers.
              </div>
            </div>

          </div>
        )}

        {/* TAB: FACILITY & HOSPITAL REGISTRY */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Facilities</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">{hospitalsList.length}</div>
                <p className="text-xs text-slate-500 font-medium">Healthcare institutions registered on CareLink</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Active Nodes</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {hospitalsList.filter(h => h.status === 'active').length}
                </div>
                <p className="text-xs text-slate-500 font-medium">Active facilities receiving reception & referrals</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Network EHR Sync</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">100%</div>
                <p className="text-xs text-slate-500 font-medium">Real-time consent & cross-facility record encryption</p>
              </div>
            </div>

            {/* Registration Form & List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form: Register New Facility */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Register New Health Facility</h3>
                    <p className="text-xs text-slate-500">Onboard hospital to CareLink EHR</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterHospital} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name *</label>
                    <input 
                      type="text"
                      required
                      value={hospName}
                      onChange={(e) => setHospName(e.target.value)}
                      placeholder="e.g. St. Nicholas Specialist Hospital"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Facility Category</label>
                      <select
                        value={hospType}
                        onChange={(e) => setHospType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="General Hospital">General Hospital</option>
                        <option value="Teaching Hospital">Teaching Hospital</option>
                        <option value="Federal Medical Center">Federal Medical Center</option>
                        <option value="Specialist Clinic">Specialist Clinic</option>
                        <option value="Diagnostic Center">Diagnostic Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Facility Code</label>
                      <input 
                        type="text"
                        value={hospCode}
                        onChange={(e) => setHospCode(e.target.value)}
                        placeholder="e.g. GH-ABJ-002"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location / Division</label>
                    <input 
                      type="text"
                      value={hospLocation}
                      onChange={(e) => setHospLocation(e.target.value)}
                      placeholder="e.g. Central Business District, Abuja"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                      <input 
                        type="email"
                        required
                        value={hospEmail}
                        onChange={(e) => setHospEmail(e.target.value)}
                        placeholder="admin@facility.org"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input 
                        type="text"
                        value={hospPhone}
                        onChange={(e) => setHospPhone(e.target.value)}
                        placeholder="+234 800 123 4567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Director / Admin</label>
                    <input 
                      type="text"
                      value={hospAdminName}
                      onChange={(e) => setHospAdminName(e.target.value)}
                      placeholder="e.g. Dr. Emmanuel Nnamdi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={hospSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    {hospSubmitting ? "Registering Facility..." : "Register Facility on Portal"}
                  </button>
                </form>
              </div>

              {/* List: Registered Facilities */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">CareLink Registered Hospitals</h3>
                    <p className="text-xs text-slate-500">Admin registered medical facilities on CareLink network</p>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                    {hospitalsList.length} Facilities Active
                  </span>
                </div>

                <div className="space-y-3">
                  {hospitalsList.length > 0 ? (
                    hospitalsList.map((hosp) => (
                      <div 
                        key={hosp.id}
                        className="p-4 bg-slate-50 hover:bg-slate-100/60 rounded-2xl border border-slate-200/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                            <span className="font-mono text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-extrabold">
                              {hosp.registrationCode}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            <span>{hosp.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {hosp.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {hosp.contactEmail}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          {hosp.status === 'active' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Active
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200">
                              Pending Onboarding
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      No registered hospitals found. Use the registration form to add your first facility.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* DEPARTMENT PORTAL MODAL VIEW */}
        {selectedDeptPortal && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedDeptPortal(null); }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 space-y-5 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-md">
                      {selectedDeptPortal.id}
                    </span>
                    <h2 className="text-lg font-black text-slate-900">{selectedDeptPortal.name} Portal</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedDeptPortal.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedDeptPortal(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department Operational Metrics */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                  <span className="text-sm font-mono font-black text-slate-900 mt-0.5 block">
                    {selectedDeptPortal.consultationFee !== undefined ? (selectedDeptPortal.consultationFee === 0 ? 'Free' : `₦${selectedDeptPortal.consultationFee.toLocaleString()}`) : '₦5,000'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Clinician</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 truncate block">
                    {selectedDeptPortal.leadDoctor || 'Dr. On-Duty Lead'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Facility Location</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 truncate block">
                    {selectedDeptPortal.location || 'Clinical Complex'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operating Hours</span>
                  <span className="text-xs font-bold text-blue-600 mt-0.5 truncate block">
                    {selectedDeptPortal.operatingHours || '08:00 AM - 05:00 PM'}
                  </span>
                </div>
              </div>

              {/* Department Staff Roster */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Assigned Department Specialists
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {doctorsList.filter(d => d.department === selectedDeptPortal.name).length} Specialists
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {doctorsList.filter(d => d.department === selectedDeptPortal.name).length > 0 ? (
                    doctorsList.filter(d => d.department === selectedDeptPortal.name).map(doc => {
                      const isRevoked = doc.status === 'revoked';
                      return (
                        <div key={doc.id} className="p-3.5 bg-white flex items-center justify-between hover:bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                              {doc.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{doc.name}</span>
                                <span className="text-[10px] font-mono text-blue-600 font-bold">{doc.id}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{doc.specialty} • {doc.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isRevoked ? (
                              <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-200">
                                REVOKED
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                                ACTIVE
                              </span>
                            )}

                            {isRevoked ? (
                              <button
                                onClick={() => handleToggleDoctorStatus(doc.id, 'active')}
                                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg font-bold border border-emerald-200 transition-all text-[10px] cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleDoctorStatus(doc.id, 'revoked')}
                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2.5 py-1 rounded-lg font-bold border border-red-200 transition-all text-[10px] cursor-pointer inline-flex items-center gap-1"
                              >
                                <UserX className="w-3 h-3" />
                                Revoke Access
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 font-medium text-xs">
                      No specialists currently assigned to {selectedDeptPortal.name}. Use the Staff Management tab to accredit new clinicians for this department.
                    </div>
                  )}
                </div>
              </div>

              {/* Portal Info Footer */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950 font-medium">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Department Portal Operational Directive</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed mt-0.5">
                    Patients schedule appointments directly through this department portal. On-duty doctors assigned here handle incoming consultations and diagnostic history logs.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDeptPortal(null)}
                  className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  Close Department Portal
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
