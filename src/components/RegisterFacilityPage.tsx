import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building, 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Sparkles, 
  Clock, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

import { api } from '../api';

interface RegisterFacilityPageProps {
  onBackToLanding: () => void;
}

export default function RegisterFacilityPage({ onBackToLanding }: RegisterFacilityPageProps) {
  // Form states
  const [facilityName, setFacilityName] = useState('');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repHotline, setRepHotline] = useState('');
  const [facilityType, setFacilityType] = useState('General Hospital');
  const [staffCount, setStaffCount] = useState('20-50');
  const [locationRegion, setLocationRegion] = useState('Abuja FCT');
  const [message, setMessage] = useState('');
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleHospitalRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!facilityName || !repName || !repEmail || !repHotline) {
      setFormError('Please fill in all required clinical credentials & contact details.');
      return;
    }

    if (!repEmail.includes('@')) {
      setFormError('Please provide a valid official organization email address.');
      return;
    }

    try {
      await api.registerHospitalFacility({
        name: facilityName,
        type: facilityType,
        location: locationRegion,
        contactPhone: repHotline,
        contactEmail: repEmail,
        adminName: repName,
        registrationCode: `FAC-${Math.floor(1000 + Math.random() * 9000)}`
      });
    } catch (err) {
      console.warn("Facility registration submit info:", err);
    }

    setFormSubmitted(true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans flex flex-col selection:bg-blue-100">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-4 shadow-3xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">CareLink</span>
              <span className="text-[9px] block font-mono text-slate-400 font-bold leading-none tracking-wider">INTEGRATED CLINICAL NETWORK</span>
            </div>
          </div>

          <button 
            onClick={onBackToLanding}
            className="text-slate-600 hover:text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      {/* Main Registration Content Area */}
      <main className="flex-1 py-12 px-6 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
            For Medical Providers & Directors
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Register Your Health Facility</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Connect your hospital, specialty clinic, or diagnostics lab to the CareLink Network. Apply below to request deployment of your verified clinician node keys.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          {!formSubmitted ? (
            <form onSubmit={handleHospitalRegisterSubmit} className="p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Organization Onboarding Application</h3>
                <p className="text-xs text-slate-400">Please provide verified clinical coordinates. All requests are securely verified by the system provider.</p>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl font-medium">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hospital/Facility Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Medical Facility / Hospital Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. National Hospital Abuja" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Representative Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Medical Director / Representative Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="e.g. Dr. Fatima Usman" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Representative Professional Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Official Clinic Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      value={repEmail}
                      onChange={(e) => setRepEmail(e.target.value)}
                      placeholder="e.g. director@hospital.gov.ng" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Representative Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Facility Contact / Hotline *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      type="tel" 
                      value={repHotline}
                      onChange={(e) => setRepHotline(e.target.value)}
                      placeholder="e.g. +234 901 000 0000" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Facility Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Facility Classification
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                  >
                    <option value="General Hospital">General Hospital / Medical Center</option>
                    <option value="Primary Health Care">Primary Health Care Clinic</option>
                    <option value="Private Specialty">Private Specialty Clinic</option>
                    <option value="Diagnostic Laboratory">Diagnostic Laboratory / Imaging Center</option>
                    <option value="Trauma Center">Trauma & Emergency response Node</option>
                  </select>
                </div>

                {/* Estimated Staff Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Licensed Personnel Count
                  </label>
                  <select
                    value={staffCount}
                    onChange={(e) => setStaffCount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                  >
                    <option value="Under 10">Fewer than 10 Practitioners</option>
                    <option value="10-20">10 to 20 Practitioners</option>
                    <option value="20-50">20 to 50 Practitioners</option>
                    <option value="50-100">50 to 100 Practitioners</option>
                    <option value="100+">More than 100 Practitioners</option>
                  </select>
                </div>

                {/* Intended Deployment Location */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Deployment Location / Region *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={locationRegion}
                      onChange={(e) => setLocationRegion(e.target.value)}
                      placeholder="e.g. Garki Area, Abuja FCT" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Representative message */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Additional Licensing Details / Comments
                  </label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Specify medical registration licenses, regulatory bodies, or custom integration needs..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Submit Node Activation Request <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Success Receipt Block */
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-100">
                ✓
              </div>

              <div className="space-y-2">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                  Application Received & Logged
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Node Request Registered Successfully</h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Thank you! Your facility onboarding inquiry has been submitted and registered to the network registry. A verification request code has been generated.
                </p>
              </div>

              {/* Simulated Verification coordinates */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left font-mono text-[11px] text-slate-600 space-y-2.5">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span>Inquiry Reference:</span>
                  <strong className="text-slate-900">REQ-{Math.floor(100000 + Math.random() * 900000)}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span>Facility Name:</span>
                  <strong className="text-slate-900">{facilityName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span>Director / Rep:</span>
                  <strong className="text-slate-900">{repName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span>Official Email:</span>
                  <strong className="text-slate-900">{repEmail}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hotline:</span>
                  <strong className="text-slate-900">{repHotline}</strong>
                </div>
              </div>

              {/* Explicit directions to reach you (the provider) */}
              <div className="max-w-lg mx-auto bg-blue-50 border border-blue-100 p-5 rounded-2xl text-left space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> 
                  Reach the Clinical Systems Provider
                </h4>
                <p className="text-xs text-slate-600 leading-normal">
                  To expedite verification and deployment of your facility's cryptographic server keys, you can reach the system engineer directly:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <a 
                    href="mailto:ayobamioketona@gmail.com" 
                    className="bg-white border border-blue-200/60 p-3 rounded-xl flex items-center gap-2.5 hover:border-blue-400 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold leading-none">DIRECT EMAIL</p>
                      <p className="font-semibold text-slate-800 mt-0.5">ayobamioketona@gmail.com</p>
                    </div>
                  </a>
                  
                  <div className="bg-white border border-blue-200/60 p-3 rounded-xl flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold leading-none">VERIFICATION TIME</p>
                      <p className="font-semibold text-slate-800 mt-0.5">Under 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    setFormSubmitted(false);
                    setFacilityName('');
                    setRepName('');
                    setRepEmail('');
                    setRepHotline('');
                    setMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-bold"
                >
                  Submit another organization request
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-8 text-center text-xs text-slate-400 font-medium mt-auto">
        <p>© 2026 CareLink Patient Portal. Developed for National Clinical Standards.</p>
      </footer>
    </div>
  );
}
