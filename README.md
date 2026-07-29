# CareLink: Unified National Healthcare Platform

CareLink is a full-stack digital health infrastructure platform designed to unify health records, clinical workflows, and emergency dispatch systems under a patient-centric framework.

## Overview

CareLink enables seamless interoperability across healthcare institutions. Patients maintain full ownership and cryptographic control over their Electronic Health Records (EHR), authorizing clinician access dynamically while receiving automated diagnostic synchronization from certified laboratory facilities.

---

## Core Capabilities

### 1. Patient Portal & Universal Healthcare ID
* Unique Universal Health ID issuance for every registered patient.
* Dynamic consent management allowing fine-grained access control by specialty or doctor.
* Downloadable and exportable encrypted health summaries.
* Integrated digital prescriptions with automated pharmacy QR verification.

### 2. Automated Diagnostic Laboratory Synchronization
* Direct integration with certified laboratory facilities.
* Automatic result upload into patient profiles upon test completion.
* Encrypted record storage referencing simulated IPFS payload hashes.
* Immediate notifications for patients upon diagnostic report publication.

### 3. Clinician & Doctor Dashboard
* Secure patient search by Health ID, full name, or biometric QR code.
* Real-time consultation logging, diagnosis recording, and electronic prescription issuing.
* Access request workflows requesting patient permission to review historic medical records.
* Integrated AI Clinical Assistant providing decision support based on patient history and clinical guidelines.

### 4. Nationwide Interoperability & Hospital Transfers
* Zero-paperwork transfer requests across participating health networks.
* Appointment scheduling across registered hospitals and diagnostic centers nationwide.
* Automated EMR synchronization between transferring and receiving facilities.

### 5. Emergency SOS & Emergency Profile Access
* Instant Emergency Medical Profile view accessible via emergency QR pass.
* Immediate SOS alert logging with GPS position reporting for quick responder dispatch.
* Override protocols for critical clinical encounters under strict audit trails.

### 6. Administrative Governance & Facility Registration
* Self-service hospital and laboratory onboarding requests.
* Central administrator verification and credential key activation.
* Network analytics, active patient tracking, and audit log compliance monitoring.

---

## Technical Architecture

* Frontend: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
* Backend: Express.js (Node.js/TypeScript) built with ESBuild.
* API Communication: RESTful API endpoints proxying client requests.
* State Management & Persistence: Server-side JSON store with real-time updates.

---

## Getting Started

### Prerequisites
* Node.js version 18 or higher.
* npm package manager.

### Installation & Execution

1. Install Dependencies:
```bash
npm install
```

2. Start Development Server:
```bash
npm run dev
```
The application will launch on port 3000 at `http://localhost:3000`.

3. Production Build:
```bash
npm run build
npm start
```

---

## Project Structure

```
├── server.ts                 # Full-stack Express backend server and REST endpoints
├── src/
│   ├── App.tsx               # Main application routing & portal selection
│   ├── api.ts                # Client API wrapper
│   ├── types.ts              # Global TypeScript interfaces and data models
│   ├── components/           # Feature dashboards and modal dialogs
│   │   ├── PatientDashboard.tsx
│   │   ├── PatientEHRProfile.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── LabDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── ReceptionDashboard.tsx
│   │   ├── RegisterFacilityPage.tsx
│   │   ├── HospitalTransferModal.tsx
│   │   └── EmergencyMedicalProfileModal.tsx
├── metadata.json             # Application metadata configuration
└── package.json              # Package declarations and build scripts
```

---

## Security & Compliance Standards

CareLink follows patient-centric security principles:
* Access Control: Records remain locked by default until explicit consent is granted by the patient.
* Audit Logging: Every record access, consent approval, and emergency override is recorded in immutable audit trails.
* Encryption Standard: Data payloads use AES cryptographic tokenization protocols.
