import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  UserCheck, 
  Building, 
  Lock, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { api } from '../api';

interface LoginPortalProps {
  onLoginSuccess: (role: 'patient' | 'doctor' | 'lab' | 'admin', user: any) => void;
  initialRegister?: boolean;
}

export default function LoginPortal({ onLoginSuccess, initialRegister = false }: LoginPortalProps) {
  const [role, setRole] = useState<'patient' | 'doctor' | 'lab' | 'admin' | 'reception'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration state
  const [isRegistering, setIsRegistering] = useState(initialRegister);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('27');
  const [regBlood, setRegBlood] = useState('O+');
  const [regAllergies, setRegAllergies] = useState('');

  // MFA Flow state
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('123456');
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePrefill = (selectedRole: 'patient' | 'doctor' | 'lab' | 'admin' | 'reception') => {
    setRole(selectedRole);
    setIsRegistering(false);
    setError('');
    if (selectedRole === 'patient') {
      setEmail('samuel@example.com');
      setPassword('securepass123');
    } else if (selectedRole === 'doctor') {
      setEmail('johnson@hospital.org');
      setPassword('securepass456');
    } else if (selectedRole === 'lab') {
      setEmail('labtech@hospital.org');
      setPassword('securepasslab');
    } else if (selectedRole === 'admin') {
      setEmail('admin@ghabuja.org');
      setPassword('securepass789');
    } else if (selectedRole === 'reception') {
      setEmail('reception@ghabuja.org');
      setPassword('securepassrec');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.login({ email, password, role });
      if (response.success) {
        if (response.user.mfaEnabled || role === 'patient' || role === 'doctor') {
          // Trigger MFA check for safety simulation
          setPendingUser(response.user);
          setShowMfa(true);
        } else {
          onLoginSuccess(role, response.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!regName || !regEmail || !regPhone) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      const response = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        role: 'patient',
        age: regAge,
        bloodGroup: regBlood,
        allergies: regAllergies
      });
      if (response.success) {
        setSuccessMsg(`Registration Successful! Unique Patient ID issued: ${response.user.id}. You can now sign in.`);
        setEmail(regEmail);
        setIsRegistering(false);
        setRole('patient');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456') {
      onLoginSuccess(role, pendingUser);
    } else {
      setError('Invalid 6-digit security token. Try 123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header Banner */}
      <div className="max-w-md w-full mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-600 animate-pulse" />
          Federal Republic of Nigeria • Unified Health Portal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          CareLink
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Unified Health Records & Secure Cryptographic Patient Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Success / Error Banners */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-medium">
              {successMsg}
            </div>
          )}

          {!showMfa ? (
            <>
              {/* Role Selectors - Single page view for Patient & Doctor */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => handlePrefill('patient')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    role === 'patient' && !isRegistering
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => handlePrefill('doctor')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    (role === 'doctor' || role === 'admin') && !isRegistering
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Doctor / Clinician
                </button>
              </div>

              {/* Login or Register Form */}
              {!isRegistering ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. samuel@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Prefill helper pills */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Instant Access Presets
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role === 'patient' ? (
                        <button
                          type="button"
                          onClick={() => handlePrefill('patient')}
                          className="text-xs bg-white border border-slate-200 hover:border-blue-500 text-slate-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs cursor-pointer"
                        >
                          Samuel (Patient)
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePrefill('doctor')}
                            className="text-xs bg-white border border-slate-200 hover:border-blue-500 text-slate-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs cursor-pointer"
                          >
                            Dr. Johnson (Doctor)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrefill('reception')}
                            className="text-xs bg-amber-50 border border-amber-200 hover:border-amber-500 text-amber-900 px-2.5 py-1 rounded-lg font-bold shadow-2xs cursor-pointer"
                          >
                            Front Desk Reception
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrefill('lab')}
                            className="text-xs bg-white border border-slate-200 hover:border-blue-500 text-slate-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs cursor-pointer"
                          >
                            Lab Tech
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrefill('admin')}
                            className="text-xs bg-white border border-slate-200 hover:border-blue-500 text-slate-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs cursor-pointer"
                          >
                            Abuja Admin
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md cursor-pointer transition-colors"
                  >
                    Enter Portal
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {role === 'patient' && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(true);
                          setError('');
                        }}
                        className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        New patient? Register Unique National Patient ID
                      </button>
                    </div>
                  )}

                  {(role === 'doctor' || role === 'admin') && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {role === 'admin' ? 'Hospital Admin Mode Active' : 'Are you a Hospital Administrator?'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {role === 'admin' ? 'Managing Abuja General Hospital' : 'Sign in to facility management console'}
                          </p>
                        </div>
                      </div>
                      {role === 'doctor' ? (
                        <button
                          type="button"
                          onClick={() => handlePrefill('admin')}
                          className="text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                        >
                          Admin Login
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePrefill('doctor')}
                          className="text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                        >
                          Doctor Login
                        </button>
                      )}
                    </div>
                  )}
                </form>
              ) : (
                /* Registration Mode */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="border-b border-slate-100 pb-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-800">Register National Health Record</h3>
                    <p className="text-[11px] text-slate-500">Will issue a secure, unique patient ID valid nationwide.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="e.g. Samuel Adewale"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        required
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Blood Group
                      </label>
                      <select
                        value={regBlood}
                        onChange={(e) => setRegBlood(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="e.g. adewale@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="+234 803 ..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Known Allergies (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={regAllergies}
                      onChange={(e) => setRegAllergies(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="e.g. Penicillin, Peanuts"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md cursor-pointer transition-colors"
                  >
                    Generate Unique ID & Register
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Already registered? Go to Login
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Multi-factor Authentication (MFA) Verification Mode */
            <form onSubmit={handleMfaVerify} className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                  <Fingerprint className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Multi-Factor Security</h3>
                <p className="text-xs text-slate-500 mt-1">
                  A high-security verification token was sent to {pendingUser?.phone || 'your phone'}.
                </p>
              </div>

              <div>
                <label className="block text-left text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="block text-center tracking-widest text-lg font-bold w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-left bg-slate-50 p-2 rounded-lg">
                  💡 **Developer Info**: Mock security token is autofilled to <strong className="text-slate-700">123456</strong> for testing simplicity.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMfa(false);
                    setPendingUser(null);
                  }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  Verify Access
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Trust Badge Footer */}
      <div className="text-center text-xs text-slate-400 max-w-sm mx-auto space-y-2 mt-8">
        <p className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          End-to-End Encrypted File Storage Activated
        </p>
        <p>
          Secure patient records are protected with comprehensive security audit logs. Access is strictly user-revocable.
        </p>
      </div>
    </div>
  );
}
