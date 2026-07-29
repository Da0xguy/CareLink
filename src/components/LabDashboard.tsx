import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FlaskConical, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Upload, 
  AlertCircle, 
  User, 
  Stethoscope, 
  Building2, 
  Filter, 
  Send, 
  LogOut,
  RefreshCw,
  Camera,
  Bell,
  FileText,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../api';
import { LabStaffProfile, LabTestRequest } from '../types';

interface LabDashboardProps {
  labStaff: LabStaffProfile;
  onLogout: () => void;
}

export default function LabDashboard({ labStaff, onLogout }: LabDashboardProps) {
  const [requests, setRequests] = useState<LabTestRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Active result upload modal
  const [activeRequest, setActiveRequest] = useState<LabTestRequest | null>(null);
  const [resultSummary, setResultSummary] = useState<string>('');
  const [resultFileName, setResultFileName] = useState<string>('');
  const [resultFileType, setResultFileType] = useState<'pdf' | 'jpg' | 'png' | 'doc'>('pdf');
  const [technicianComments, setTechnicianComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Camera & File Capture State
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState<boolean>(false);

  const fetchLabRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getLabRequests().catch(() => []);
      if (Array.isArray(data)) setRequests(data);
    } catch (err) {
      console.warn('Failed to load lab requests warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: LabTestRequest['status']) => {
    try {
      const res = await api.updateLabStatus(id, {
        status: newStatus,
        labTechnicianName: labStaff.name
      });
      if (res.success) {
        fetchLabRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenUploadModal = (req: LabTestRequest) => {
    setActiveRequest(req);
    setResultSummary(req.resultSummary || '');
    setResultFileName(req.resultFileName || `${req.testType.replace(/\s+/g, '_')}_Result.pdf`);
    setTechnicianComments(req.comments || '');
    setCapturedPhoto(null);
    setIsSimulatingCamera(false);
  };

  const handleSimulateCameraCapture = () => {
    setIsSimulatingCamera(true);
    setTimeout(() => {
      setCapturedPhoto(`https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80`);
      setResultFileType('jpg');
      setResultFileName(`${activeRequest?.testType.replace(/\s+/g, '_')}_LabScan_${Date.now()}.jpg`);
      setIsSimulatingCamera(false);
    }, 800);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;
    setSubmitting(true);
    try {
      const res = await api.updateLabStatus(activeRequest.id, {
        status: 'Results Uploaded',
        resultSummary,
        resultFileName,
        resultFileType,
        comments: technicianComments,
        labTechnicianName: labStaff.name
      });
      if (res.success) {
        alert(`✓ Lab result uploaded & attached to ${activeRequest.patientName}'s profile!\n🔔 Automated alert dispatched to requesting clinician Dr. ${activeRequest.doctorName}.`);
        setActiveRequest(null);
        fetchLabRequests();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload result. Please check connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || r.testCategory === filterCategory;
    const matchesDept = filterDepartment === 'all' || r.department.toLowerCase().includes(filterDepartment.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      r.patientName.toLowerCase().includes(q) || 
      r.patientId.toLowerCase().includes(q) || 
      r.doctorName.toLowerCase().includes(q) || 
      r.testType.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    return matchesStatus && matchesCategory && matchesDept && matchesQuery;
  });

  const suggestedCount = requests.filter(r => r.status === 'Suggested' || r.status === 'Requested').length;
  const processingCount = requests.filter(r => r.status === 'Processing' || r.status === 'Sample Collected').length;
  const completedCount = requests.filter(r => r.status === 'Results Uploaded' || r.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">Diagnostic Laboratory Portal</h1>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Central Diagnostic Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {labStaff.hospitalName} • Technologist: <strong className="text-slate-800">{labStaff.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLabRequests}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Orders
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200/60 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            animate={{ y: 0 }} 
            whileHover={{ y: -4 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md cursor-pointer transition-shadow space-y-1"
          >
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Diagnostic Orders</p>
            <h3 className="text-2xl font-black text-slate-900">{requests.length}</h3>
            <p className="text-[10px] text-slate-500">Across all hospital departments</p>
          </motion.div>

          <motion.div 
            animate={{ y: 0 }} 
            whileHover={{ y: -4 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs hover:shadow-md cursor-pointer transition-shadow space-y-1"
          >
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Suggested & Pending Orders</p>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-2xl font-black text-amber-900">{suggestedCount}</h3>
            <p className="text-[10px] text-amber-700 font-medium">Awaiting specimen arrival</p>
          </motion.div>

          <motion.div 
            animate={{ y: 0 }} 
            whileHover={{ y: -4 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs hover:shadow-md cursor-pointer transition-shadow space-y-1"
          >
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">In Processing</p>
              <FlaskConical className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-blue-900">{processingCount}</h3>
            <p className="text-[10px] text-blue-700 font-medium">Assay / Scanner active</p>
          </motion.div>

          <motion.div 
            animate={{ y: 0 }} 
            whileHover={{ y: -4 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs hover:shadow-md cursor-pointer transition-shadow space-y-1"
          >
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Completed Reports</p>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900">{completedCount}</h3>
            <p className="text-[10px] text-emerald-700 font-medium">Synced with Medical Vault</p>
          </motion.div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, Doctor, or Test Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Status:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterStatus === 'Pending' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('Processing')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterStatus === 'Processing' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setFilterStatus('Results Uploaded')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterStatus === 'Results Uploaded' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Department:</span>
              <button
                onClick={() => setFilterDepartment('all')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterDepartment('Cardiology')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'Cardiology' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cardiology
              </button>
              <button
                onClick={() => setFilterDepartment('Ophthalmology')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'Ophthalmology' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ophthalmology
              </button>
              <button
                onClick={() => setFilterDepartment('Orthopedics')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'Orthopedics' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orthopedics
              </button>
              <button
                onClick={() => setFilterDepartment('Neurology')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'Neurology' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Neurology
              </button>
              <button
                onClick={() => setFilterDepartment('Pediatrics')}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterDepartment === 'Pediatrics' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pediatrics
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Category:</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterCategory === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterCategory('Laboratory')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterCategory === 'Laboratory' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lab
              </button>
              <button
                onClick={() => setFilterCategory('Radiology / Imaging')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterCategory === 'Radiology / Imaging' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Radiology
              </button>
            </div>
          </div>
        </div>

        {/* Requests Table List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Diagnostic Test Queue</h3>
            <span className="text-xs text-slate-500 font-medium">Showing {filteredRequests.length} orders</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading laboratory orders...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No diagnostic test requests found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <div key={req.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        req.priority === 'Urgent' || req.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                        {req.testCategory}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        req.status === 'Results Uploaded' || req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{req.testType}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Patient: <strong className="text-slate-800">{req.patientName}</strong> ({req.patientId})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ordered by: <strong className="text-slate-800">{req.doctorName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dept: <strong className="text-slate-800">{req.department}</strong></span>
                      </div>
                    </div>

                    {req.clinicalNotes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        Doctor Notes: "{req.clinicalNotes}"
                      </p>
                    )}

                    {req.resultSummary && (
                      <div className="bg-emerald-50/60 border border-emerald-200/80 p-2.5 rounded-xl text-xs text-emerald-950 font-mono space-y-1">
                        <div className="flex items-center justify-between font-extrabold text-[10px] text-emerald-800 uppercase">
                          <span>Uploaded Diagnostic Findings</span>
                          <span>Completed: {req.completedDate}</span>
                        </div>
                        <p>{req.resultSummary}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'Processing')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        Start Processing
                      </button>
                    )}

                    {(req.status === 'Pending' || req.status === 'Processing') && (
                      <button
                        onClick={() => handleOpenUploadModal(req)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-100 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Test Results
                      </button>
                    )}

                    {req.status === 'Results Uploaded' && (
                      <button
                        onClick={() => handleOpenUploadModal(req)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Edit Results
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Upload Diagnostic Results Modal */}
      {activeRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Capture & Publish Diagnostic Findings</h3>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Target Patient Profile & Doctor Alert Cards */}
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200/80 space-y-1 text-blue-950">
                <div className="flex justify-between items-center font-extrabold text-blue-900">
                  <span>{activeRequest.testType} ({activeRequest.testCategory})</span>
                  <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-md uppercase font-black">
                    {activeRequest.priority} Order
                  </span>
                </div>
                <p className="text-slate-700">Patient Profile: <strong className="text-slate-900">{activeRequest.patientName}</strong> (ID: <span className="font-mono">{activeRequest.patientId}</span>)</p>
                <p className="text-slate-700">Requesting Doctor: <strong className="text-slate-900">{activeRequest.doctorName}</strong> ({activeRequest.department})</p>
              </div>

              {/* Automated Action Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Attaches directly to Patient Profile Vault</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-amber-900 font-medium">
                  <Bell className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                  <span>Alerts Dr. {activeRequest.doctorName} on publish</span>
                </div>
              </div>
            </div>

            {/* Image / Specimen Capture Options */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <label className="font-extrabold text-slate-800 block">Capture Result Document / Specimen Scan</label>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSimulateCameraCapture}
                  disabled={isSimulatingCamera}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isSimulatingCamera ? 'Scanning Specimen...' : 'Snap/Scan Specimen'}</span>
                </button>

                <label className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Browse Local File</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setResultFileName(file.name);
                        setCapturedPhoto(URL.createObjectURL(file));
                        if (file.type.includes('image')) setResultFileType('jpg');
                        else setResultFileType('pdf');
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Preview if Captured */}
              {capturedPhoto && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-300 max-h-36 bg-slate-900 flex items-center justify-center">
                  <img src={capturedPhoto} alt="Specimen Scan Preview" className="max-h-36 object-contain" />
                  <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Attached Specimen Image
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Diagnostic Result Summary & Lab Findings *</label>
                <textarea
                  required
                  rows={3}
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  placeholder="Enter detailed laboratory assay values, reference ranges, or diagnostic impression..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Report Attachment Name</label>
                  <input
                    type="text"
                    required
                    value={resultFileName}
                    onChange={(e) => setResultFileName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">File Type</label>
                  <select
                    value={resultFileType}
                    onChange={(e) => setResultFileType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="jpg">JPEG Image</option>
                    <option value="png">PNG Image</option>
                    <option value="doc">Word Document</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Technician Internal Comments / Protocols</label>
                <input
                  type="text"
                  value={technicianComments}
                  onChange={(e) => setTechnicianComments(e.target.value)}
                  placeholder="e.g. Specimen processed within 30 min of draw. Controls verified."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="flex-1 border border-slate-200 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{submitting ? 'Encrypting & Syncing...' : 'Publish & Alert Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
