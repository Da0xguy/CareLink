import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CareLinkLogo } from './CareLinkLogo';
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  UserCheck,
  Clock,
  Bell,
  Search,
  Building,
  CheckCircle,
  AlertTriangle,
  FileText,
  Phone,
  User,
  LogOut,
  RefreshCw,
  Plus,
  ChevronRight,
  Filter,
  CheckCircle2,
  Stethoscope,
  Users,
  Activity,
  Shield,
  Send,
  X,
  CreditCard,
  HeartPulse,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { api } from '../api';
import { ReceptionStaffProfile, Appointment, PatientProfile, Department, DoctorProfile, Notification, RegisteredHospital } from '../types';

interface ReceptionDashboardProps {
  receptionist: ReceptionStaffProfile;
  onLogout: () => void;
}

export default function ReceptionDashboard({ receptionist, onLogout }: ReceptionDashboardProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'walkin' | 'queue' | 'notifications' | 'search'>('dashboard');

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registeredHospitals, setRegisteredHospitals] = useState<RegisteredHospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<RegisteredHospital | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Selected Item for Inspector / Details Panel
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientRecord, setSelectedPatientRecord] = useState<PatientProfile | null>(null);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);

  // Check-In Form State in Panel
  const [checkInPriority, setCheckInPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  // Walk-In Patient Form State
  const [walkInNid, setWalkInNid] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInAge, setWalkInAge] = useState('30');
  const [walkInGender, setWalkInGender] = useState('Male');
  const [walkInBlood, setWalkInBlood] = useState('O+');
  const [walkInDept, setWalkInDept] = useState('General Medicine');
  const [walkInDoctorId, setWalkInDoctorId] = useState('');
  const [walkInReason, setWalkInReason] = useState('');
  const [walkInPriority, setWalkInPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [walkInSearchFound, setWalkInSearchFound] = useState<PatientProfile | null>(null);
  const [walkInSuccessMsg, setWalkInSuccessMsg] = useState('');

  // Toast banner
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const prevAptsCountRef = React.useRef<number | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [aptsData, deptsData, docsData, notifsData, hospsData] = await Promise.all([
        api.getTodayAppointments(),
        api.getDepartments(),
        api.getAdminDoctors(),
        api.getNotifications(),
        api.getRegisteredHospitals()
      ]);
      const loadedApts = aptsData || [];
      
      if (prevAptsCountRef.current !== null && loadedApts.length > prevAptsCountRef.current) {
        const latest = loadedApts[0];
        if (latest) {
          showToast("New Appointment Booked", `${latest.patientName} scheduled with ${latest.doctorName} (${latest.department}).`);
        }
      }
      prevAptsCountRef.current = loadedApts.length;

      setAppointments(loadedApts);
      setDepartments(deptsData || []);
      setDoctors(docsData || []);
      setNotifications(notifsData || []);
      
      const loadedHosps = hospsData || [];
      setRegisteredHospitals(loadedHosps);

      if (loadedHosps.length > 0) {
        setSelectedHospital(prev => {
          if (prev) return prev;
          const match = loadedHosps.find(h => h.name === receptionist.hospitalName) || loadedHosps[0];
          return match;
        });
      }
    } catch (err) {
      console.error('Error fetching reception data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Live poll updates every 8 sec
    return () => clearInterval(interval);
  }, []);

  // Search Patients Live Query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      api.searchPatients(searchQuery).then(res => setPatients(res || []));
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  // Handle Search Patient Click
  const handleSelectPatientSearchResult = (patient: PatientProfile) => {
    setSelectedPatientRecord(patient);
    const existingApt = appointments.find(a => a.patientId === patient.id || a.patientNid === patient.id);
    if (existingApt) {
      setSelectedAppointment(existingApt);
      setShowRightPanel(true);
    } else {
      setSelectedAppointment(null);
    }
  };

  // Check In Handler
  const handleCheckIn = async (appointmentId: string) => {
    setIsSubmittingCheckIn(true);
    try {
      const res = await api.checkInPatient({
        appointmentId,
        priority: checkInPriority,
        notes: checkInNotes
      });
      if (res.success && res.appointment) {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? res.appointment : a));
        setSelectedAppointment(res.appointment);
        showToast("Check-In Complete", `Patient ${res.appointment.patientName} checked in. Doctor ${res.appointment.doctorName} notified.`);
        setCheckInNotes('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Walk-In Search Existing First
  const handleWalkInSearch = async () => {
    if (!walkInNid && !walkInPhone && !walkInName) return;
    const q = walkInNid || walkInPhone || walkInName;
    const results = await api.searchPatients(q);
    if (results && results.length > 0) {
      const match = results[0];
      setWalkInSearchFound(match);
      setWalkInName(match.name);
      setWalkInPhone(match.phone);
      setWalkInEmail(match.email);
      if (match.age) setWalkInAge(match.age.toString());
      if (match.gender) setWalkInGender(match.gender);
      if (match.bloodGroup) setWalkInBlood(match.bloodGroup);
      showToast("Existing Profile Found", `Loaded record for ${match.name} (${match.id}).`);
    } else {
      setWalkInSearchFound(null);
      showToast("New Patient Record", "No matching profile found. A new patient profile will be created upon check-in.", "info");
    }
  };

  // Register Walk-In Handler
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInDept) {
      alert("Please fill in patient name and department.");
      return;
    }
    setIsSubmittingCheckIn(true);
    try {
      const res = await api.registerWalkIn({
        nid: walkInNid,
        name: walkInName,
        phone: walkInPhone,
        email: walkInEmail,
        age: walkInAge,
        gender: walkInGender,
        bloodGroup: walkInBlood,
        department: walkInDept,
        doctorId: walkInDoctorId,
        priority: walkInPriority,
        reasonForVisit: walkInReason
      });

      if (res.success && res.appointment) {
        showToast("Walk-In Registered & Checked In", `Patient ${res.patient?.name || walkInName} added to ${res.appointment.department} queue #${res.appointment.queueNumber}.`);
        setWalkInSuccessMsg(`Walk-in Check-In successful! Patient ID: ${res.patient.id} • Queue Number #${res.appointment.queueNumber}`);
        fetchData();
        // Reset form
        setWalkInNid('');
        setWalkInName('');
        setWalkInPhone('');
        setWalkInEmail('');
        setWalkInReason('');
        setWalkInSearchFound(null);
      }
    } catch (err: any) {
      alert(err.message || 'Walk-in registration failed.');
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Select appointment for inspector
  const openAppointmentDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowRightPanel(true);
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a => {
    const matchesDept = selectedDeptFilter === 'All' || a.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'All' || 
      (selectedStatusFilter === 'Pending' && a.status === 'pending') ||
      (selectedStatusFilter === 'Checked In' && a.status === 'checked_in') ||
      (selectedStatusFilter === 'In Consultation' && (a.status === 'called' || a.status === 'in_consultation')) ||
      (selectedStatusFilter === 'Completed' && a.status === 'completed');

    const matchesQuery = !searchQuery || 
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientNid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesQuery;
  });

  // Today's Counters
  const totalToday = appointments.length;
  const checkedInWaiting = appointments.filter(a => a.status === 'checked_in').length;
  const inConsultation = appointments.filter(a => a.status === 'called' || a.status === 'in_consultation').length;
  const completedVisits = appointments.filter(a => a.status === 'completed').length;
  const walkInsToday = appointments.filter(a => a.isWalkIn).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <CareLinkLogo variant="dark" size="md" showSubtitle />
          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              {registeredHospitals.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedHospital?.id || ''}
                    onChange={(e) => {
                      const found = registeredHospitals.find(h => h.id === e.target.value);
                      if (found) setSelectedHospital(found);
                    }}
                    className="bg-slate-800 text-white font-black text-xs md:text-sm tracking-tight rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {registeredHospitals.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.type})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <h1 className="text-sm font-black tracking-tight text-amber-300">
                  Awaiting Admin Facility Registration
                </h1>
              )}

              {selectedHospital?.status === 'active' ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Facility
                </span>
              ) : (
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
                  Unregistered Facility Node
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {receptionist.name} • {selectedHospital?.location || 'CareLink Network'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 relative cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold rounded-lg border border-red-800/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar Nav */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between p-3.5 shrink-0 shadow-3xs">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">
                Navigation Menu
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'appointments'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Appointments</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'appointments' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {totalToday}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('walkin')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'walkin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Walk-In Registration</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('queue')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'queue'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4" />
                    <span>Doctor Queues</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'queue' ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {checkedInWaiting + inConsultation}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4" />
                    <span>Patient Registry</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'notifications' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {notifications.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Compact Mini Triage Banner */}
          <div className="bg-slate-900 text-white p-3 rounded-xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Live Status
              </span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Waiting: <strong className="text-amber-400 font-black">{checkedInWaiting}</strong></span>
              <span className="text-slate-400">In Consult: <strong className="text-blue-400 font-black">{inConsultation}</strong></span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">

          {/* Toast Notification Banner - Fixed Top Right */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed top-5 right-5 z-50 max-w-sm w-full pointer-events-auto"
              >
                <div className={`p-4 rounded-xl shadow-2xl border flex items-start justify-between backdrop-blur-md ${
                  toastMessage.type === 'success' 
                    ? 'bg-slate-900/95 text-emerald-100 border-emerald-500/40 shadow-emerald-950/20' 
                    : 'bg-slate-900/95 text-blue-100 border-blue-500/40 shadow-blue-950/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      toastMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-white">{toastMessage.title}</p>
                      <p className="text-xs font-medium text-slate-300 mt-0.5 leading-relaxed">{toastMessage.message}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setToastMessage(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key Metrics Bar (Clean 4-card horizontal bar) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Scheduled</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{totalToday}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waiting in Lobby</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">{checkedInWaiting}</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Consultation</p>
                <p className="text-xl font-black text-indigo-600 mt-0.5">{inConsultation}</p>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Walk-Ins Today</p>
                <p className="text-xl font-black text-purple-600 mt-0.5">{walkInsToday}</p>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Header Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by National ID (NID), Card Number, or Name..."
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 shrink-0 w-full md:w-auto">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Check-In</option>
                <option value="Checked In">Checked In / Waiting</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                onClick={() => setActiveTab('walkin')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Walk-In</span>
              </button>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {searchQuery && patients.length > 0 && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Patient Profiles Found ({patients.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {patients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatientSearchResult(p)}
                    className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500">NID: <span className="font-semibold text-slate-700">{p.id}</span> • {p.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Inspect
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 1: Overview / Appointments Table */}
          {(activeTab === 'dashboard' || activeTab === 'appointments') && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-3xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Appointments & Reception Queue ({filteredAppointments.length})
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">Click any row to open patient verification & check-in</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                      <th className="py-2.5 px-3.5">Queue #</th>
                      <th className="py-2.5 px-3.5">Patient Name & NID</th>
                      <th className="py-2.5 px-3.5">Time</th>
                      <th className="py-2.5 px-3.5">Assigned Specialist</th>
                      <th className="py-2.5 px-3.5">Department</th>
                      <th className="py-2.5 px-3.5">Priority</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No matching appointments found.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(apt => {
                        const isSelected = selectedAppointment?.id === apt.id && showRightPanel;
                        return (
                          <tr
                            key={apt.id}
                            onClick={() => openAppointmentDetails(apt)}
                            className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/90 font-medium' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3.5 font-black text-slate-900">
                              {apt.queueNumber ? `#${apt.queueNumber}` : '-'}
                            </td>

                            <td className="py-2.5 px-3.5">
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {apt.patientName}
                                  {apt.isWalkIn && (
                                    <span className="bg-purple-100 text-purple-800 text-[8px] font-extrabold px-1 rounded">
                                      WALK-IN
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  NID: <span className="font-semibold text-slate-700">{apt.patientNid || apt.patientId}</span>
                                </p>
                              </div>
                            </td>

                            <td className="py-2.5 px-3.5 text-slate-700 font-semibold">
                              {apt.time}
                              {apt.checkInTime && (
                                <p className="text-[9px] text-emerald-700">Checked {apt.checkInTime}</p>
                              )}
                            </td>

                            <td className="py-2.5 px-3.5 font-medium text-slate-800">
                              {apt.doctorName}
                            </td>

                            <td className="py-2.5 px-3.5 text-slate-600">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {apt.department}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                apt.priority === 'Emergency'
                                  ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                  : apt.priority === 'Urgent'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {apt.priority || 'Normal'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                apt.status === 'checked_in'
                                  ? 'bg-amber-100 text-amber-900'
                                  : apt.status === 'called'
                                  ? 'bg-blue-100 text-blue-900 animate-pulse'
                                  : apt.status === 'in_consultation'
                                  ? 'bg-indigo-100 text-indigo-900'
                                  : apt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {apt.status === 'checked_in' ? 'Checked In' :
                                 apt.status === 'called' ? 'Called' :
                                 apt.status === 'in_consultation' ? 'In Consult' :
                                 apt.status === 'completed' ? 'Completed' : 'Pending'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5 text-right">
                              {apt.status === 'pending' || !apt.checkInTime ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAppointmentDetails(apt);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Check In
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAppointmentDetails(apt);
                                  }}
                                  className="text-slate-500 hover:text-slate-800 text-[11px] font-bold border border-slate-200 px-2 py-1 rounded-lg"
                                >
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: Walk-In Form */}
          {activeTab === 'walkin' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-5">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    Walk-In Patient Registration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct registration and immediate triage queuing for unscheduled patients.
                  </p>
                </div>
              </div>

              {walkInSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    {walkInSuccessMsg}
                  </span>
                  <button onClick={() => setWalkInSuccessMsg('')} className="text-emerald-800 font-bold text-xs">
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleWalkInSubmit} className="space-y-4">
                {/* Search Existing Record */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    Look Up Existing Profile (NID or Phone)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={walkInNid}
                      onChange={(e) => setWalkInNid(e.target.value)}
                      placeholder="National ID (NID) or Phone Number..."
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleWalkInSearch}
                      className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Search
                    </button>
                  </div>

                  {walkInSearchFound && (
                    <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-xs text-blue-900">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Profile Loaded: {walkInSearchFound.name} ({walkInSearchFound.id})
                      </p>
                    </div>
                  )}
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="e.g. Samuel Oketona"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={walkInAge}
                      onChange={(e) => setWalkInAge(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={walkInGender}
                      onChange={(e) => setWalkInGender(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={walkInBlood}
                      onChange={(e) => setWalkInBlood(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={walkInEmail}
                      onChange={(e) => setWalkInEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Assignment & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <select
                      value={walkInDept}
                      onChange={(e) => setWalkInDept(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-bold"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Doctor</label>
                    <select
                      value={walkInDoctorId}
                      onChange={(e) => setWalkInDoctorId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
                    >
                      <option value="">Auto-Assign On-Duty Specialist</option>
                      {doctors.filter(d => !walkInDept || d.department.toLowerCase().includes(walkInDept.toLowerCase())).map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={walkInPriority}
                      onChange={(e) => setWalkInPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-bold"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Emergency">Emergency (Immediate Triage)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Triage Notes</label>
                  <textarea
                    rows={2}
                    value={walkInReason}
                    onChange={(e) => setWalkInReason(e.target.value)}
                    placeholder="e.g. Acute abdominal pain, fever..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingCheckIn}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmittingCheckIn ? 'Processing...' : 'Register & Check In Walk-In'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB CONTENT 3: Doctor Queues */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Doctor Waiting Queues (Hospital-Wide)
                  </h2>
                  <p className="text-xs text-slate-500">Live consultation lobby lists per specialist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map(doc => {
                  const docQueue = appointments.filter(a => a.doctorId === doc.id && (a.status === 'checked_in' || a.status === 'called' || a.status === 'in_consultation'));
                  return (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.specialty} • {doc.department}</p>
                        </div>
                        <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-blue-200">
                          {docQueue.length} Waiting
                        </span>
                      </div>

                      {docQueue.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">No patients currently queued for this doctor.</p>
                      ) : (
                        <div className="space-y-2">
                          {docQueue.map(item => (
                            <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-black text-[10px]">
                                  #{item.queueNumber || '1'}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{item.patientName}</p>
                                  <p className="text-[10px] text-slate-500">Check-In: {item.checkInTime || item.time}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                item.status === 'called' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                item.status === 'in_consultation' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status === 'called' ? 'Proceeding' : item.status === 'in_consultation' ? 'In Consult' : 'Waiting'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: Search Registry */}
          {activeTab === 'search' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-700" />
                National Patient ID & Card Number Registry
              </h2>

              {selectedPatientRecord ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {selectedPatientRecord.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900">{selectedPatientRecord.name}</h3>
                        <p className="text-[10px] text-slate-500">National ID: <span className="font-bold text-blue-700">{selectedPatientRecord.id}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPatientRecord(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 border px-2 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">Phone</p>
                      <p className="font-bold text-slate-800">{selectedPatientRecord.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">Age / Gender</p>
                      <p className="font-bold text-slate-800">{selectedPatientRecord.age} Yrs • {selectedPatientRecord.gender || 'Male'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">Blood Group</p>
                      <p className="font-bold text-slate-800">{selectedPatientRecord.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">Known Allergies</p>
                      <p className="font-bold text-rose-600">{selectedPatientRecord.allergies?.join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">Use the top search bar to query National ID or Patient Name.</p>
              )}
            </div>
          )}

          {/* TAB CONTENT 5: Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-600" />
                Reception Real-Time Notifications
              </h2>

              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-slate-600 text-[11px]">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Slide-over / Right Inspector Panel for Selected Patient Verification */}
        <AnimatePresence>
          {showRightPanel && selectedAppointment && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-white border-l border-slate-200 p-4 flex flex-col justify-between shrink-0 overflow-y-auto shadow-lg relative z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Patient Verification
                  </span>
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedAppointment.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NID: <span className="font-bold text-slate-800">{selectedAppointment.patientNid || selectedAppointment.patientId}</span>
                  </p>
                </div>

                {/* Patient Profile Cards */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-bold text-slate-800">{selectedAppointment.patientPhone || '+234 800 000 0000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bio:</span>
                    <span className="font-bold text-slate-800">{selectedAppointment.patientAge || '30'} Yrs • {selectedAppointment.patientGender || 'Male'} • {selectedAppointment.patientBloodGroup || 'O+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Time:</span>
                    <span className="font-bold text-blue-700">{selectedAppointment.time}</span>
                  </div>
                </div>

                {/* Assigned Specialist */}
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 space-y-1 text-xs">
                  <p className="text-[9px] font-bold uppercase text-blue-700">Assigned Specialist</p>
                  <p className="font-bold text-slate-900">{selectedAppointment.doctorName}</p>
                  <p className="text-slate-600 text-[11px]">{selectedAppointment.specialty} • {selectedAppointment.department}</p>
                </div>

                {/* Check-In Form */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                      Check-In Priority Level
                    </label>
                    <select
                      value={checkInPriority}
                      onChange={(e) => setCheckInPriority(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Emergency">Emergency (Immediate Triage)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                      Reception Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={checkInNotes}
                      onChange={(e) => setCheckInNotes(e.target.value)}
                      placeholder="e.g. Wheelchair requested..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {selectedAppointment.status === 'pending' || !selectedAppointment.checkInTime ? (
                    <button
                      onClick={() => handleCheckIn(selectedAppointment.id)}
                      disabled={isSubmittingCheckIn}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isSubmittingCheckIn ? 'Processing...' : 'Confirm Patient Check-In'}</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-lg text-xs font-bold text-center space-y-1">
                      <p className="flex items-center justify-center gap-1 text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                        Checked In at {selectedAppointment.checkInTime}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Queue Number: <span className="font-black text-slate-900">#{selectedAppointment.queueNumber || '1'}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
