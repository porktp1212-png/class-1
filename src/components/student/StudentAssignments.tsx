import React, { useState } from 'react';
import type { Classroom, Assignment, Submission, UserProfile } from '../../types';
import { submitHomework } from '../../services/firestoreService';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  Send,
  ExternalLink,
  MessageSquare,
  Award,
} from 'lucide-react';

interface StudentAssignmentsProps {
  classroom: Classroom | null;
  assignments: Assignment[];
  submissions: Submission[];
  student: UserProfile;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  classroom,
  assignments,
  submissions,
  student,
}) => {
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<'pending' | 'submitted' | 'graded'>('pending');

  const studentSubmissionsMap = new Map<string, Submission>();
  submissions
    .filter((s) => s.studentId === student.id)
    .forEach((s) => {
      studentSubmissionsMap.set(s.assignmentId, s);
    });

  const pendingAssignments = assignments.filter((a) => !studentSubmissionsMap.has(a.id));
  const submittedAssignments = assignments.filter((a) => {
    const sub = studentSubmissionsMap.get(a.id);
    return sub && sub.status === 'submitted';
  });
  const gradedAssignments = assignments.filter((a) => {
    const sub = studentSubmissionsMap.get(a.id);
    return sub && sub.status === 'graded';
  });

  const handleOpenSubmit = (asg: Assignment) => {
    const existing = studentSubmissionsMap.get(asg.id);
    setSelectedAsg(asg);
    setSubmitText(existing?.content || '');
    setFileUrl(existing?.fileUrl || '');
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg || !submitText.trim() || !classroom) return;

    setIsSubmitting(true);
    try {
      const existing = studentSubmissionsMap.get(selectedAsg.id);
      const submission: Submission = {
        id: existing?.id || `sub_${selectedAsg.id}_${student.id}`,
        assignmentId: selectedAsg.id,
        classroomId: classroom.id,
        studentId: student.id,
        studentName: student.name,
        submittedAt: new Date().toISOString(),
        content: submitText.trim(),
        fileUrl: fileUrl.trim() || undefined,
        status: 'submitted',
        score: null,
        teacherFeedback: '',
        aiFeedback: '',
        pointsAwarded: 0,
      };

      await submitHomework(submission);
      setSelectedAsg(null);
      setSubmitText('');
      setFileUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!classroom) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">คุณยังไม่ได้เข้าร่วมห้องเรียน</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          กรุณาเข้าร่วมห้องเรียนด้วยรหัส 6 หลักจากคุณครูผู้สอนเพื่อเริ่มดูและส่งการบ้าน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">การบ้านและภาระงานของฉัน</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ส่งงาน ตอบคำถาม แนบลิงก์เอกสารหรือรูปภาพ พร้อมตรวจผลคะแนนแบบเรียลไทม์
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold self-start">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'pending' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ยังไม่ส่ง ({pendingAssignments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('submitted')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'submitted' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ส่งแล้วรอตรวจ ({submittedAssignments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('graded')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'graded' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ตรวจแล้ว ({gradedAssignments.length})
          </button>
        </div>
      </div>

      {/* Content list */}
      <div className="space-y-4">
        {tab === 'pending' && (
          pendingAssignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-slate-800 text-sm">ยินดีด้วย! คุณส่งการบ้านครบทุกงานแล้ว</h3>
              <p className="text-xs text-slate-500 mt-1">ไม่มีงานที่ค้างส่งในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{asg.title}</h3>
                      <span className="shrink-0 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        +{asg.pointsReward} แต้ม
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        กำหนดส่ง: <strong className="text-slate-700">{asg.dueDate}</strong>
                      </span>
                      <span>คะแนนเต็ม: {asg.maxScore} คะแนน</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id={`btn-submit-asg-${asg.id}`}
                    onClick={() => handleOpenSubmit(asg)}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งงานการบ้านนี้</span>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'submitted' && (
          submittedAssignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              ไม่มีงานที่กำลังรอคุณครูตรวจ
            </div>
          ) : (
            <div className="space-y-3">
              {submittedAssignments.map((asg) => {
                const sub = studentSubmissionsMap.get(asg.id)!;
                return (
                  <div
                    key={asg.id}
                    className="p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          ส่งแล้ว อยู่ระหว่างรอคุณครูประเมิน
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{asg.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString('th-TH')}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                      <strong className="text-slate-900 block mb-1">คำตอบของคุณ:</strong>
                      {sub.content}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenSubmit(asg)}
                      className="text-xs text-teal-700 font-semibold hover:underline"
                    >
                      แก้ไขการส่งงาน &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'graded' && (
          gradedAssignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              ยังไม่มีงานที่ตรวจเสร็จสิ้น
            </div>
          ) : (
            <div className="space-y-4">
              {gradedAssignments.map((asg) => {
                const sub = studentSubmissionsMap.get(asg.id)!;
                return (
                  <div
                    key={asg.id}
                    className="p-5 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/10 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ตรวจเสร็จสมบูรณ์
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{asg.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-sm">
                          {sub.score} / {asg.maxScore} คะแนน
                        </div>
                        {sub.pointsAwarded ? (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>+{sub.pointsAwarded} แต้ม</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-slate-800">คำตอบที่ส่ง:</div>
                      <p className="text-slate-600 whitespace-pre-wrap">{sub.content}</p>
                    </div>

                    {/* Feedback from teacher & AI */}
                    {sub.teacherFeedback && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>ข้อเสนอแนะจากคุณครู:</span>
                        </div>
                        <p className="text-blue-950 leading-relaxed">{sub.teacherFeedback}</p>
                      </div>
                    )}

                    {sub.aiFeedback && (
                      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-purple-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>คำแนะนำจาก AI ผู้ช่วยการเรียนรู้:</span>
                        </div>
                        <p className="text-purple-950 leading-relaxed">{sub.aiFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Submit Homework Modal */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-600 p-5 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>ส่งการบ้าน: {selectedAsg.title}</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAsg(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <strong className="text-slate-800 block mb-1">คำชี้แจงโจทย์:</strong>
                {selectedAsg.description}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  คำตอบ / รายงานของนักเรียน *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="พิมพ์คำตอบ อธิบายแนวคิด หรือข้อค้นพบที่นี่..."
                  value={submitText}
                  onChange={(e) => setSubmitText(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  แนบลิงก์รูปภาพ หรือไฟล์เอกสาร (เช่น Google Drive, Canva, Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAsg(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  id="btn-confirm-submit-work"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการส่งการบ้าน'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
