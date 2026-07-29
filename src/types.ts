export interface RegisteredHospital {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'active' | 'pending_verification' | 'suspended';
  registrationCode: string;
  registrationDate: string;
  contactPhone: string;
  contactEmail: string;
  departmentsCount?: number;
  doctorsCount?: number;
  adminName?: string;
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'lab' | 'reception';

export interface MedicalHistoryItem {
  id: string;
  type: 'condition' | 'surgery' | 'medication' | 'vaccine' | 'family' | 'other';
  title: string;
  date?: string;
  notes?: string;
  doctor?: string;
  doctorName?: string;
  hospital?: string;
  category?: string;
  fileUrl?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PatientProfile {
  id: string; // Unique National Patient ID
  name: string;
  email: string;
  phone: string;
  age: number;
  bloodGroup: string;
  allergies: string[];
  mfaEnabled: boolean;
  avatarUrl?: string;
  gender?: string;
  hospital?: string;
  address?: string;
  medicalHistory?: MedicalHistoryItem[];
  emergencyContacts?: EmergencyContact[];
}

export interface DoctorProfile {
  id: string; // Unique Doctor ID
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  availability: string[]; // e.g. ["09:00", "10:00", "11:30", "14:00"]
  status?: 'active' | 'revoked' | 'suspended' | 'deactivated';
  firstTimeLogin?: boolean;
  password?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  qualifications?: string[];
  languages?: string[];
  workingDays?: string[];
  availableHours?: string;
  ratings?: number;
  totalPatientsCount?: number;
  forcePasswordChange?: boolean;
  deletedAt?: string | null;
}

export interface LabStaffProfile {
  id: string;
  name: string;
  email: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  role: string;
}

export interface ReceptionStaffProfile {
  id: string;
  name: string;
  email: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  role: string;
}

export interface HospitalAdminProfile {
  id: string;
  name: string;
  email: string;
  hospitalName: string;
  location: string;
  verified: boolean;
  emergencyPhone: string;
  ambulancePhone: string;
  firstTimeLogin?: boolean;
  password?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalName: string;
  department: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'called' | 'in_consultation' | 'awaiting_lab' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'unpaid';
  paymentAmount?: number;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
  prescription?: string;
  followUpDate?: string;
  labRequestsCount?: number;
  checkInTime?: string;
  queueNumber?: number;
  priority?: 'Normal' | 'Urgent' | 'Emergency';
  isWalkIn?: boolean;
  checkInNotes?: string;
  patientAge?: number;
  patientPhone?: string;
  patientNid?: string;
  patientGender?: string;
  patientBloodGroup?: string;
  patientPhoto?: string;
}

export interface LabTestRequest {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalName?: string;
  department: string;
  testType: 'Blood Test' | 'Urinalysis' | 'Malaria Test' | 'ECG' | 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'COVID Test' | 'Eye Test' | string;
  testCategory: 'Laboratory' | 'Radiology / Imaging' | string;
  clinicalNotes?: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  requestedDate: string;
  status: 'Suggested' | 'Requested' | 'Sample Collected' | 'Processing' | 'Completed' | 'Results Uploaded';
  resultSummary?: string;
  resultFileUrl?: string;
  resultFileName?: string;
  resultFileType?: 'pdf' | 'jpg' | 'png' | 'doc';
  completedDate?: string;
  labTechnicianName?: string;
  comments?: string;
}

export interface PrescriptionItem {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  additionalNotes?: string;
  status: 'Active' | 'Dispensed' | 'Completed';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  fileType: string; // e.g. 'pdf', 'png', 'jpg', 'doc'
  specialty: string; // e.g. 'Cardiology', 'Ophthalmology', 'Neurology'
  hospital: string;
  doctorName: string;
  uploadDate: string;
  url: string; // Base64 or object URL simulation
  size: string;
  encrypted: boolean;
  approvedDoctors: string[]; // List of Doctor IDs who have consent
}

export interface ConsentRequest {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  specialties: string[]; // e.g. ["Cardiology", "Blood Tests"]
  fullHistory: boolean;
  expiresInDays: number;
  expiresAt: string;
  status: 'pending' | 'approved' | 'declined';
}

export interface AuditLog {
  id: string;
  patientId: string;
  actorName: string;
  actorRole: string;
  action: string; // e.g. "Viewed Medical Record", "Granted Access", "Revoked Access"
  timestamp: string;
  status: 'Success' | 'Denied' | 'Emergency-Override' | 'Emergency-SOS';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  doctorsCount: number;
  consultationFee?: number;
  leadDoctor?: string;
  location?: string;
  operatingHours?: string;
  maxDailySlots?: number;
  estimatedWaitMinutes?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  type: 'reminder' | 'report' | 'payment' | 'consent' | 'emergency' | 'lab' | 'prescription' | 'admin';
  read: boolean;
  appointmentId?: string;
  actionStatus?: 'confirmed' | 'rescheduled' | null;
}
