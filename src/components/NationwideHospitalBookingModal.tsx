import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Navigation, 
  Star, 
  Activity, 
  Filter, 
  Sparkles, 
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Eye,
  Brain,
  Baby,
  Bone,
  Check,
  UserCheck,
  Lock,
  Info
} from 'lucide-react';
import { PatientProfile } from '../types';

export interface HospitalNetworkItem {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  type: 'Teaching Hospital' | 'General Hospital' | 'Specialist Clinic' | 'Emergency ER & Trauma' | 'Diagnostic Center';
  distanceKm: number;
  rating: number;
  phone: string;
  emergencyActive: boolean;
  specialties: string[];
  imageUrl?: string;
}

interface NationwideHospitalBookingModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (newAppointment: {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    hospitalName: string;
    status: 'pending' | 'completed' | 'cancelled';
  }) => void;
}

export const DEPARTMENT_DUTY_DOCTORS: Record<string, { name: string; title: string }> = {
  'Cardiology Dept': { name: 'Dr. Aminu Bello', title: 'Chief Cardiologist' },
  'Cardiology': { name: 'Dr. Aminu Bello', title: 'Chief Cardiologist' },
  'Eye Clinic': { name: 'Dr. Samuel Okafor', title: 'Consultant Ophthalmologist' },
  'Ophthalmology': { name: 'Dr. Samuel Okafor', title: 'Consultant Ophthalmologist' },
  'Neurology Dept': { name: 'Dr. Chidi Nnamdi', title: 'Consultant Neurologist' },
  'Neurology': { name: 'Dr. Chidi Nnamdi', title: 'Consultant Neurologist' },
  'Pediatrics Dept': { name: 'Dr. Fatima Umar', title: 'Senior Pediatrician' },
  'Pediatrics': { name: 'Dr. Fatima Umar', title: 'Senior Pediatrician' },
  'Orthopedics Dept': { name: 'Dr. Clement Egwu', title: 'Orthopedic Surgeon' },
  'Orthopedics': { name: 'Dr. Clement Egwu', title: 'Orthopedic Surgeon' },
  'General Outpatient Dept': { name: 'Dr. Halima Bello', title: 'Senior Medical Officer' },
  'General Medicine': { name: 'Dr. Halima Bello', title: 'Senior Medical Officer' },
  'Emergency Medicine': { name: 'Dr. Victor Adebayo', title: 'ER Duty Specialist' },
  'Emergency ER & Trauma': { name: 'Dr. Victor Adebayo', title: 'ER Duty Specialist' },
  'Oncology': { name: 'Dr. Grace Danjuma', title: 'Consultant Oncologist' },
  'Obstetrics & Gynecology': { name: 'Dr. Zainab Kalu', title: 'Consultant Gynaecologist' },
  'Radiology': { name: 'Dr. Ibrahim Musa', title: 'Chief Radiologist' },
  'Nephrology': { name: 'Dr. Emmanuel Bassey', title: 'Nephrologist' },
  'Psychiatry': { name: 'Dr. Yetunde Adeleke', title: 'Psychiatrist' },
  'Surgery': { name: 'Dr. Olanrewaju Ajayi', title: 'General Surgeon' },
};

export function getAssignedDoctorForDept(dept: string): { name: string; title: string } {
  const key = dept.trim();
  const cleanKey = key.replace(' Dept', '');
  if (DEPARTMENT_DUTY_DOCTORS[key]) return DEPARTMENT_DUTY_DOCTORS[key];
  if (DEPARTMENT_DUTY_DOCTORS[cleanKey]) return DEPARTMENT_DUTY_DOCTORS[cleanKey];
  return { name: 'Dr. Aminu Bello', title: 'On-Duty Department Specialist' };
}

export const NATIONWIDE_HOSPITALS: HospitalNetworkItem[] = [
  {
    id: 'hosp-abj-1',
    name: 'General Hospital Abuja (Garki)',
    code: 'HOSP-ABJ-001',
    city: 'Abuja FCT',
    state: 'FCT',
    address: 'Area 11, Tafawa Balewa Way, Garki, Abuja',
    type: 'General Hospital',
    distanceKm: 1.2,
    rating: 4.8,
    phone: '+234 901 222 3333',
    emergencyActive: true,
    specialties: ['Cardiology', 'Emergency Medicine', 'General Medicine', 'Pediatrics', 'Eye Clinic', 'Orthopedics']
  },
  {
    id: 'hosp-los-1',
    name: 'Lagos University Teaching Hospital (LUTH)',
    code: 'HOSP-LOS-012',
    city: 'Lagos',
    state: 'Lagos',
    address: 'Ishaga Road, Idi-Araba, Surulere, Lagos',
    type: 'Teaching Hospital',
    distanceKm: 5.4,
    rating: 4.9,
    phone: '+234 802 333 4444',
    emergencyActive: true,
    specialties: ['Neurology', 'Cardiology', 'Oncology', 'Surgery', 'Orthopedics', 'Pediatrics', 'Radiology']
  },
  {
    id: 'hosp-abj-2',
    name: 'National Hospital Abuja',
    code: 'HOSP-ABJ-002',
    city: 'Abuja FCT',
    state: 'FCT',
    address: 'Plot 132 Central Business District, Abuja',
    type: 'Specialist Clinic',
    distanceKm: 3.1,
    rating: 4.9,
    phone: '+234 901 888 9999',
    emergencyActive: true,
    specialties: ['Cardiology', 'Neurology', 'Obstetrics & Gynecology', 'Radiology', 'Oncology']
  },
  {
    id: 'hosp-ibd-1',
    name: 'University College Hospital (UCH) Ibadan',
    code: 'HOSP-IBD-005',
    city: 'Ibadan',
    state: 'Oyo',
    address: 'Queen Elizabeth II Road, Ibadan',
    type: 'Teaching Hospital',
    distanceKm: 8.2,
    rating: 4.8,
    phone: '+234 803 444 5555',
    emergencyActive: true,
    specialties: ['General Medicine', 'Cardiology', 'Ophthalmology', 'Psychiatry', 'Surgery']
  },
  {
    id: 'hosp-ph-1',
    name: 'University of Port Harcourt Teaching Hospital (UPTH)',
    code: 'HOSP-PH-018',
    city: 'Port Harcourt',
    state: 'Rivers',
    address: 'East-West Road, Choba, Port Harcourt',
    type: 'Teaching Hospital',
    distanceKm: 12.0,
    rating: 4.7,
    phone: '+234 805 111 2222',
    emergencyActive: true,
    specialties: ['Emergency ER & Trauma', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Nephrology']
  },
  {
    id: 'hosp-kan-1',
    name: 'Aminu Kano Teaching Hospital',
    code: 'HOSP-KAN-003',
    city: 'Kano',
    state: 'Kano',
    address: 'Zaria Road, Kano',
    type: 'Teaching Hospital',
    distanceKm: 15.5,
    rating: 4.8,
    phone: '+234 806 777 8888',
    emergencyActive: true,
    specialties: ['Cardiology', 'General Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 'Ophthalmology']
  },
  {
    id: 'hosp-los-2',
    name: 'St. Nicholas Hospital Lagos Island',
    code: 'HOSP-LOS-088',
    city: 'Lagos',
    state: 'Lagos',
    address: '57 Campbell Street, Lagos Island',
    type: 'Specialist Clinic',
    distanceKm: 4.0,
    rating: 4.9,
    phone: '+234 802 999 0000',
    emergencyActive: true,
    specialties: ['Nephrology', 'Cardiology', 'General Medicine', 'Radiology', 'Emergency Medicine']
  },
  {
    id: 'hosp-enu-1',
    name: 'University of Nigeria Teaching Hospital (UNTH)',
    code: 'HOSP-ENU-009',
    city: 'Enugu',
    state: 'Enugu',
    address: 'Ituku-Ozalla, Enugu',
    type: 'Teaching Hospital',
    distanceKm: 18.2,
    rating: 4.7,
    phone: '+234 803 222 1111',
    emergencyActive: true,
    specialties: ['Cardiothoracic Surgery', 'Pediatrics', 'Neurology', 'Internal Medicine']
  },
  {
    id: 'hosp-kad-1',
    name: 'Ahmadu Bello University Teaching Hospital (ABUTH)',
    code: 'HOSP-KAD-014',
    city: 'Kaduna / Zaria',
    state: 'Kaduna',
    address: 'Shika, Zaria, Kaduna State',
    type: 'Teaching Hospital',
    distanceKm: 22.0,
    rating: 4.6,
    phone: '+234 803 555 6666',
    emergencyActive: true,
    specialties: ['Emergency ER & Trauma', 'Orthopedics', 'Cardiology', 'Pediatrics']
  }
];

export default function NationwideHospitalBookingModal({
  patient,
  isOpen,
  onClose,
  onBookingConfirmed
}: NationwideHospitalBookingModalProps) {
  // Step state: 1 = Select Hospital, 2 = Choose Department & Date/Time, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedType, setSelectedType] = useState<string>('All Facility Types');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Selected Booking Details
  const [selectedHospitalObj, setSelectedHospitalObj] = useState<HospitalNetworkItem | null>(
    NATIONWIDE_HOSPITALS[0]
  );
  const [selectedDept, setSelectedDept] = useState('Cardiology Dept');
  const [selectedDate, setSelectedDate] = useState('2026-07-22');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [symptomsReason, setSymptomsReason] = useState('');
  const [attendingDoctorName, setAttendingDoctorName] = useState('Dr. Aminu Bello');

  // Confirmation Result State
  const [createdAptId, setCreatedAptId] = useState<string>('');

  if (!isOpen) return null;

  // Cities List for Filter Dropdown
  const availableCities = ['All Cities', 'Abuja FCT', 'Lagos', 'Ibadan', 'Port Harcourt', 'Kano', 'Enugu', 'Kaduna / Zaria'];
  const facilityTypes = ['All Facility Types', 'General Hospital', 'Teaching Hospital', 'Specialist Clinic', 'Emergency ER & Trauma'];

  // Filtered Hospitals
  const filteredHospitals = NATIONWIDE_HOSPITALS.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCity = selectedCity === 'All Cities' || h.city === selectedCity;
    const matchesType = selectedType === 'All Facility Types' || h.type === selectedType;
    const matchesEmergency = !emergencyOnly || h.emergencyActive;
    return matchesSearch && matchesCity && matchesType && matchesEmergency;
  });

  const handleSelectHospital = (hosp: HospitalNetworkItem) => {
    setSelectedHospitalObj(hosp);
    // Set default department based on hospital's first specialty or default
    if (hosp.specialties.length > 0) {
      setSelectedDept(`${hosp.specialties[0]} Dept`);
    }
    setStep(2);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalObj) return;

    const aptId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedAptId(aptId);

    const assignedDoctor = getAssignedDoctorForDept(selectedDept);

    const newApt = {
      id: aptId,
      doctorId: `doc-${Math.floor(10 + Math.random() * 90)}`,
      doctorName: `${assignedDoctor.name} (${assignedDoctor.title})`,
      specialty: selectedDept.replace(' Dept', ''),
      date: selectedDate,
      time: selectedTime,
      hospitalName: selectedHospitalObj.name,
      status: 'pending' as const
    };

    onBookingConfirmed(newApt);
    setStep(3);
  };

  const assignedDoctor = getAssignedDoctorForDept(selectedDept);

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  Nationwide Healthcare Access & Hospital Directory
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Universal ID: {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Book care at any healthcare facility across Nigeria with automatic CareLink record synchronization
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

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                step === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[11px] leading-4">1</span>
              <span>Select Hospital</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              disabled={step < 2}
              onClick={() => setStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                step === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 disabled:opacity-40'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[11px] leading-4">2</span>
              <span>Department & Slot</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold ${
              step === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[11px] leading-4">3</span>
              <span>Confirmed</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Home Base: {patient.hospital || 'General Hospital Abuja'}</span>
          </div>
        </div>

        {/* STEP 1: BROWSE NATIONWIDE HOSPITALS */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-slate-800">
            
            {/* Informational Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">CareLink Universal Patient ID: {patient.id}</p>
                <p className="text-blue-800 text-[11px] leading-snug">
                  Traveling or away from home? You can book care at any hospital listed below. When you arrive, presenting your CareLink ID or scanning your Emergency QR Pass gives attending doctors instant access to your complete medical history.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              {/* Search input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospital name, city, specialty..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Type Dropdown */}
              <div className="sm:col-span-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {facilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Hospital Cards List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span className="font-bold text-slate-700">
                  Showing {filteredHospitals.length} Healthcare Facilities Nationwide
                </span>
                {patient.hospital && (
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Home Registered: {patient.hospital}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredHospitals.map((hosp) => {
                  const isHome = hosp.name === patient.hospital || hosp.name.includes('General Hospital Abuja');
                  return (
                    <div 
                      key={hosp.id}
                      className={`bg-white rounded-2xl border p-4.5 space-y-3 transition-all hover:shadow-md flex flex-col justify-between ${
                        isHome ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                                {hosp.name}
                              </h3>
                              {isHome && (
                                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                  Home Hospital
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{hosp.address} ({hosp.city})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg border border-amber-200 text-xs font-black shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{hosp.rating}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {hosp.type}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-emerald-600" />
                            {hosp.distanceKm} km nearby
                          </span>
                          {hosp.emergencyActive && (
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 text-[10px]">
                              <Activity className="w-3 h-3 text-rose-600" />
                              24/7 ER Active
                            </span>
                          )}
                        </div>

                        {/* Specialties Chips */}
                        <div className="pt-1 flex flex-wrap gap-1">
                          {hosp.specialties.slice(0, 4).map((spec, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                              {spec}
                            </span>
                          ))}
                          {hosp.specialties.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{hosp.specialties.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-[11px] text-slate-500 font-mono font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> CareLink Synced
                        </span>
                        <button
                          onClick={() => handleSelectHospital(hosp)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Select & Book Visit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: SELECT DEPARTMENT, DATE & TIME */}
        {step === 2 && selectedHospitalObj && (
          <form onSubmit={handleConfirmBooking} className="overflow-y-auto flex-1 space-y-5 pr-1 text-slate-800 text-xs">
            
            {/* Selected Hospital Summary Card */}
            <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 space-y-2 flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    Selected Destination Facility
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{selectedHospitalObj.code}</span>
                </div>
                <h3 className="text-base font-extrabold text-white">{selectedHospitalObj.name}</h3>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedHospitalObj.address} • Phone: {selectedHospitalObj.phone}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer shrink-0"
              >
                Change Hospital
              </button>
            </div>

            {/* Cross-Facility EMR Notice */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">Automatic CareLink EMR Synchronization</p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Booking at <strong>{selectedHospitalObj.name}</strong> will automatically authorize attending doctors at this branch to read your medical profile and upload consult reports using your unique CareLink ID (<strong>{patient.id}</strong>).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Department Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Choose Specialty Department
                </label>
                <select
                  required
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {selectedHospitalObj.specialties.map((s, idx) => (
                    <option key={idx} value={`${s} Dept`}>{s} Department</option>
                  ))}
                  <option value="General Outpatient Dept">General Outpatient Dept (GOPD)</option>
                  <option value="Emergency & Urgent Care">Emergency & Urgent Care</option>
                </select>
              </div>

              {/* Assigned Doctor (Read-Only System Allocation) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Assigned Attending Clinician
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Auto-Allocated
                  </span>
                </label>

                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs shrink-0">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{assignedDoctor.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{assignedDoctor.title} • {selectedDept}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200 font-bold shrink-0">
                    On-Duty Lead
                  </span>
                </div>

                <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-2 text-[11px] text-blue-900 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Duty doctors are automatically assigned by hospital department schedule. Patients cannot select specific doctors.
                  </span>
                </div>
              </div>

            </div>

            {/* Date & Time Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Available Timeslot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`p-2.5 rounded-xl font-extrabold text-[11px] border transition-all cursor-pointer ${
                        selectedTime === t
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason / Symptoms Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Reason for Visit / Main Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={symptomsReason}
                onChange={(e) => setSymptomsReason(e.target.value)}
                placeholder="e.g. Routine consultation, follow-up checkup, or specific health concern..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Back to Hospital List
              </button>

              <button
                type="submit"
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Visit at {selectedHospitalObj.name}</span>
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: BOOKING CONFIRMED SUCCESS VIEW */}
        {step === 3 && selectedHospitalObj && (
          <div className="overflow-y-auto flex-1 space-y-5 text-center p-2">
            
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                Healthcare Appointment Confirmed!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your consultation has been successfully scheduled at <strong>{selectedHospitalObj.name}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/90 max-w-lg mx-auto text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Appointment Ref ID:</span>
                <span className="font-mono font-black text-blue-700">{createdAptId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Hospital Facility:</span>
                <span className="font-bold text-slate-900">{selectedHospitalObj.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Department:</span>
                <span className="font-bold text-slate-800">{selectedDept}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Assigned Attending Clinician:</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {assignedDoctor.name} ({assignedDoctor.title})
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Scheduled Date & Time:</span>
                <span className="font-bold text-emerald-700">{selectedDate} • {selectedTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">CareLink EMR Link:</span>
                <span className="font-extrabold text-blue-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  ID {patient.id} Authorized
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all shadow-sm"
              >
                Done & View Appointments
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
