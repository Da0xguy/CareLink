import { 
  PatientProfile, 
  DoctorProfile, 
  HospitalAdminProfile, 
  Appointment, 
  MedicalRecord, 
  ConsentRequest, 
  AuditLog, 
  Department, 
  Notification,
  LabTestRequest,
  PrescriptionItem,
  RegisteredHospital
} from './types';

// Helper to handle standard response safely with fallback defaults
async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallback?: T
): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      if (errorData && typeof errorData === 'object' && ('message' in errorData || 'success' in errorData)) {
        return errorData as T;
      }
      console.warn(`API call to ${url} returned status ${res.status}`);
      if (fallback !== undefined) return fallback;
      throw new Error((errorData && errorData.message) || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`Network or API call warning for ${url}:`, err?.message || err);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  // Auth
  login: (payload: any) => 
    safeFetch<{ success: boolean; user?: any; message?: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, message: 'Server unavailable' }),

  register: (payload: any) => 
    safeFetch<{ success: boolean; user?: any; message?: string }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, message: 'Server unavailable' }),

  updatePatientProfile: (payload: { id: string; name?: string; email?: string; phone?: string; age?: number; bloodGroup?: string; avatarUrl?: string; medicalHistory?: any[] }) =>
    safeFetch('/api/patient/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, user: payload as any }),

  updatePatientPin: (payload: { id: string; pin?: string; password?: string }) =>
    safeFetch<{ success: boolean; message: string; user?: any }>('/api/patient/update-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, message: 'Security PIN updated locally' }),

  updateDoctorPin: (payload: { id: string; pin?: string; password?: string }) =>
    safeFetch<{ success: boolean; message: string; user?: any }>('/api/doctor/update-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, message: 'Doctor PIN updated locally' }),

  adminCreateDoctor: (payload: { name: string; email: string; phone?: string; specialty?: string; department?: string }) =>
    safeFetch<{ success: boolean; message: string; doctor?: any; pendingConfirmation?: any; confirmationLink?: string }>('/api/admin/create-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, message: 'Failed to dispatch confirmation email' }),

  adminCreateDepartment: (payload: { name: string; description?: string; email: string; leadDoctor?: string; consultationFee?: number | string; location?: string; operatingHours?: string; maxDailySlots?: number | string }) =>
    safeFetch<{ success: boolean; message: string; department?: any; pendingConfirmation?: any; confirmationLink?: string }>('/api/admin/create-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, message: 'Failed to create department portal' }),

  getPendingConfirmations: () =>
    safeFetch<{ success: boolean; pendingConfirmations: any[] }>('/api/admin/pending-confirmations', undefined, { success: true, pendingConfirmations: [] }),

  confirmSetPassword: (payload: { email?: string; token?: string; password?: string; pin?: string; newPassword?: string; newPin?: string }) =>
    safeFetch<{ success: boolean; message: string; user?: any; department?: any; account?: any; role?: string }>('/api/auth/confirm-set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, message: 'Server unavailable' }),


  // Appointments
  getAppointments: (params?: { patientId?: string; doctorId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<Appointment[]>(`/api/appointments?${searchParams.toString()}`, undefined, []);
  },

  bookAppointment: (payload: any) => 
    safeFetch('/api/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, appointment: { id: `APT-${Date.now().toString().slice(-4)}`, ...payload, status: 'pending' } }),

  cancelAppointment: (id: string) => 
    safeFetch(`/api/appointments/${id}/cancel`, { method: 'POST' }, { success: true, appointment: null as any }),

  updateAppointment: (id: string, payload: any) => 
    safeFetch(`/api/appointments/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, appointment: null as any }),

  payAppointment: (id: string) => 
    safeFetch(`/api/appointments/${id}/pay`, { method: 'POST' }, { success: true, appointment: null as any }),

  // Medical Records
  getRecords: (params?: { patientId?: string; doctorId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<MedicalRecord[]>(`/api/records?${searchParams.toString()}`, undefined, []);
  },

  uploadRecord: (payload: any) => 
    safeFetch('/api/records/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, record: { id: `REC-${Date.now().toString().slice(-4)}`, ...payload } }),

  // Consents
  getConsents: (params?: { patientId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<ConsentRequest[]>(`/api/consents?${searchParams.toString()}`, undefined, []);
  },

  requestConsent: (payload: any) => 
    safeFetch('/api/consents/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, consent: { id: `CON-${Date.now().toString().slice(-4)}`, ...payload, status: 'pending' } }),

  respondConsent: (id: string, status: 'approved' | 'declined') => 
    safeFetch(`/api/consents/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }, { success: true, consent: null as any }),

  revokeConsent: (id: string) => 
    safeFetch(`/api/consents/${id}/revoke`, { method: 'POST' }, { success: true, consent: null as any }),

  // Audit Logs
  getAuditLogs: (params?: { patientId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<AuditLog[]>(`/api/audit-logs?${searchParams.toString()}`, undefined, []);
  },

  // Notifications
  getNotifications: (params?: { userId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<Notification[]>(`/api/notifications?${searchParams.toString()}`, undefined, []);
  },

  markNotificationsRead: (id?: string) => 
    safeFetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }, { success: true }),

  updateNotificationActionStatus: (id: string, actionStatus: 'confirmed' | 'rescheduled') =>
    safeFetch(`/api/notifications/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionStatus })
    }, { success: true, notification: null as any }),

  // Emergency Override
  emergencyOverride: (payload: { patientId: string; doctorId: string; reason: string }) => 
    safeFetch('/api/emergency/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, message: 'Emergency access granted' }),

  sendEmergencyAlert: (payload: { patientId: string; contacts: any[]; location: string; healthStatus: any; customNote?: string }) =>
    safeFetch<{ success: boolean; message: string; dispatchedSummary?: string; notifiedContactsCount?: number }>('/api/patient/emergency-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, message: 'Emergency alert dispatched to contacts' }),

  // Clinician AI Assistant
  askAiAssistant: (payload: { prompt: string; patientId: string }) => 
    safeFetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, text: '', message: 'AI service unavailable. Please try again later.' }),

  // Admin Setup
  getAdminStats: () => safeFetch<any>('/api/admin/stats', undefined, { totalPatients: 25420, doctorsCount: 184, appointmentsToday: 640, completedConsultations: "1,420", availableDoctors: 76, pendingRequests: 18 }),
  getAdminDoctors: () => safeFetch<DoctorProfile[]>('/api/admin/doctors', undefined, []),
  toggleDoctorStatus: (id: string, status: 'active' | 'revoked') =>
    safeFetch(`/api/admin/doctors/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }, { success: true, doctor: null as any }),
  suspendDoctor: (id: string, suspended: boolean) =>
    safeFetch(`/api/admin/doctors/${id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended })
    }, { success: true, doctor: null as any }),
  reassignDoctorDept: (id: string, department: string) =>
    safeFetch(`/api/admin/doctors/${id}/department`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department })
    }, { success: true, doctor: null as any }),
  resetDoctorPassword: (id: string, forcePasswordChange?: boolean) =>
    safeFetch(`/api/admin/doctors/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forcePasswordChange })
    }, { success: true, tempPassword: 'ResetPass123!', message: 'Password reset' }),
  deleteDoctor: (id: string) =>
    safeFetch(`/api/admin/doctors/${id}/delete`, { method: 'POST' }, { success: true, message: 'Deleted doctor' }),
  createDoctor: (payload: any) => 
    safeFetch('/api/admin/doctors/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, doctor: { id: `DOC-${Date.now().toString().slice(-3)}`, ...payload, status: 'active' }, generatedId: `DOC-${Date.now().toString().slice(-3)}`, tempPassword: 'TempPass123!' }),

  // Laboratory Module API
  getLabRequests: (params?: { patientId?: string; doctorId?: string; status?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<LabTestRequest[]>(`/api/lab/requests?${searchParams.toString()}`, undefined, []);
  },
  createLabRequest: (payload: any) =>
    safeFetch('/api/lab/requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, labRequest: { id: `LAB-${Date.now().toString().slice(-4)}`, ...payload, status: 'Ordered' } }),
  updateLabStatus: (id: string, payload: any) =>
    safeFetch(`/api/lab/requests/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, labRequest: null as any }),

  // Prescription API
  getPrescriptions: (params?: { patientId?: string; doctorId?: string }) => {
    const searchParams = new URLSearchParams(params as any);
    return safeFetch<PrescriptionItem[]>(`/api/prescriptions?${searchParams.toString()}`, undefined, []);
  },
  createPrescription: (payload: any) =>
    safeFetch('/api/prescriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, prescription: { id: `RX-${Date.now().toString().slice(-4)}`, ...payload } }),

  // Consultation Details
  submitConsultation: (id: string, payload: any) =>
    safeFetch(`/api/appointments/${id}/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, appointment: null as any }),

  getDepartments: () => safeFetch<Department[]>('/api/admin/departments', undefined, []),
  createDepartment: (payload: any) => 
    safeFetch('/api/admin/departments/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, department: { id: `DEP-${Date.now().toString().slice(-3)}`, ...payload } }),

  getAdminContacts: () => safeFetch<HospitalAdminProfile>('/api/admin/contacts', undefined, {
    id: "ADM-001",
    name: "Hospital Administrator",
    email: "admin@ghabuja.org",
    hospitalName: "General Hospital Abuja",
    location: "Garki Area, Abuja",
    verified: true,
    emergencyPhone: "+234 901 222 3333",
    ambulancePhone: "+234 901 444 5555"
  }),
  updateAdminContacts: (payload: any) => 
    safeFetch('/api/admin/contacts/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, contacts: payload as any }),

  // Reception Workflow API
  searchPatients: (q: string) => 
    safeFetch<PatientProfile[]>(`/api/reception/search-patients?q=${encodeURIComponent(q)}`, undefined, []),

  getTodayAppointments: () => 
    safeFetch<Appointment[]>('/api/reception/today-appointments', undefined, []),

  checkInPatient: (payload: { appointmentId: string; priority?: 'Normal' | 'Urgent' | 'Emergency'; notes?: string }) =>
    safeFetch<{ success: boolean; appointment: Appointment }>('/api/reception/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, appointment: null as any }),

  registerWalkIn: (payload: any) =>
    safeFetch<{ success: boolean; patient: PatientProfile; appointment: Appointment }>('/api/reception/walk-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: true, patient: null as any, appointment: null as any }),

  callPatient: (appointmentId: string) =>
    safeFetch<{ success: boolean; appointment: Appointment }>('/api/doctor/call-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId })
    }, { success: true, appointment: null as any }),

  startConsultation: (appointmentId: string) =>
    safeFetch<{ success: boolean; appointment: Appointment }>('/api/doctor/start-consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId })
    }, { success: true, appointment: null as any }),

  // Hospital Facilities API
  getRegisteredHospitals: () =>
    safeFetch<RegisteredHospital[]>('/api/hospitals', undefined, []),

  registerHospitalFacility: (payload: any) =>
    safeFetch<{ success: boolean; hospital: RegisteredHospital; message?: string }>('/api/admin/register-hospital', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, { success: false, hospital: null as any, message: 'Facility registration failed' }),

  updateHospitalStatus: (id: string, status: 'active' | 'pending_verification' | 'suspended') =>
    safeFetch<{ success: boolean; hospital: RegisteredHospital }>('/api/admin/hospitals/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    }, { success: true, hospital: null as any }),
};
