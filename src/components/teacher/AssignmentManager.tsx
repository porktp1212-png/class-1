import React, { useState } from 'react';
import type { Classroom, Assignment, Submission } from '../../types';
import { saveAssignment } from '../../services/firestoreService';
import {
  FileText,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Users,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AssignmentManagerProps {
  classroom: Classroom | null;
  assignments: Assignment[];
  submissions: Submission[];
  onOpenGradingModal: (submission: Submission, assignment: Assignment) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  classroom,
  assignments,
  submissions,
  onOpenGradingModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(assignments[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [maxScore, setMaxScore] = useState(10);
  const [pointsReward, setPointsReward] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classroom) return;

    setIsCreating(true);
    try {
      const newAsg: Assignment = {
        id: `asg_${Date.now()}`,
        classroomId: classroom.id,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        maxScore: Number(maxScore) || 10,
        pointsReward: Number(pointsReward) || 50,
        createdAt: new Date().toISOString(),
      };
      await saveAssignment(newAsg);
      setSelectedAssignmentId(newAsg.id);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!classroom) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">ยังไม่มีห้องเรียนสำหรับการบ้าน</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          กรุณาสร้างหรือเลือกห้องเรียน เพื่อเริ่มมอบหมายงานและการบ้านแก่นักเรียน
        </p>
      </div>
    );
  }

  const relevantSubmissions = submissions.filter((s) => {
    if (!activeAssignment) return false;
    const matchAsg = s.assignmentId === activeAssignment.id;
    if (!matchAsg) return false;
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ระบบสั่งและตรวจการบ้าน</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            มอบหมายงาน ติดตามสถานะการส่ง และใช้ AI ช่วยวิเคราะห์ประเมินผล
          </p>
        </div>

        <button
          type="button"
          id="btn-open-create-asg"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>สั่งการบ้านใหม่</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignment List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            <span>รายการการบ้าน ({assignments.length})</span>
          </div>

          {assignments.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              ยังไม่มีการบ้าน คลิก "สั่งการบ้านใหม่" เพื่อเริ่มต้น
            </div>
          ) : (
            assignments.map((asg) => {
              const asgSubs = submissions.filter((s) => s.assignmentId === asg.id);
              const pendingCount = asgSubs.filter((s) => s.status === 'submitted').length;
              const isSelected = asg.id === activeAssignment?.id;

              return (
                <div
                  key={asg.id}
                  id={`asg-card-${asg.id}`}
                  onClick={() => setSelectedAssignmentId(asg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{asg.title}</h3>
                    {pendingCount > 0 && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                        รอตรวจ {pendingCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{asg.description}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      ส่งภายใน: {asg.dueDate}
                    </span>
                    <span className="text-amber-600 font-semibold">+{asg.pointsReward} แต้ม</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 2 Cols: Submissions for Active Assignment */}
        <div className="lg:col-span-2 space-y-4">
          {activeAssignment ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Info */}
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-slate-900">{activeAssignment.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold">
                      คะแนนเต็ม {activeAssignment.maxScore} คะแนน
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {activeAssignment.pointsReward} แต้ม
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {activeAssignment.description}
                </p>

                {/* Submissions Filter */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs font-semibold text-slate-700">
                    งานที่นักเรียนส่งมา ({relevantSubmissions.length} รายการ)
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('submitted')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === 'submitted' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      รอตรวจ
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('graded')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filterStatus === 'graded' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ตรวจแล้ว
                    </button>
                  </div>
                </div>
              </div>

              {/* Submissions Table / Cards */}
              <div className="divide-y divide-slate-100">
                {relevantSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    ยังไม่มีการส่งงานตามเงื่อนไขที่เลือก
                  </div>
                ) : (
                  relevantSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{sub.studentName}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              sub.status === 'graded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sub.status === 'graded' ? `ตรวจแล้ว (${sub.score} คะแนน)` : 'รอคุณครูตรวจ'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 italic">"{sub.content}"</p>
                        <div className="text-[10px] text-slate-400">
                          ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString('th-TH')}
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`btn-open-grade-${sub.id}`}
                        onClick={() => onOpenGradingModal(sub, activeAssignment)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                          sub.status === 'graded'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{sub.status === 'graded' ? 'ดูผล / แก้ไขคะแนน' : 'ตรวจงานด้วย AI'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              กรุณาเลือกการบ้านทางซ้ายมือ
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>สั่งการบ้านใหม่สำหรับห้องเรียน</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  หัวข้อ / ชื่องาน *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รายงานการทดลองพันธุศาสตร์ CRISPR"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  คำชี้แจงและโจทย์ *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="อธิบายรายละเอียดสิ่งที่นักเรียนต้องทำ เกณฑ์การส่งงาน..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    กำหนดส่ง
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    คะแนนเต็ม
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    แต้มรางวัล
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-amber-700 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-submit-create-asg"
                  disabled={isCreating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {isCreating ? 'กำลังบันทึก...' : 'มอบหมายการบ้าน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
