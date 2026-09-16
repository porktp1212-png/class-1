import React, { useState } from 'react';
import type { Assignment, Submission } from '../../types';
import { gradeSubmission } from '../../services/firestoreService';
import {
  Sparkles,
  CheckCircle2,
  X,
  AlertTriangle,
  Lightbulb,
  Award,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  BrainCircuit,
  Loader2,
} from 'lucide-react';

interface AIGradingModalProps {
  submission: Submission | null;
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIGradingModal: React.FC<AIGradingModalProps> = ({
  submission,
  assignment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !submission || !assignment) return null;

  const [score, setScore] = useState<number>(submission.score ?? Math.round(assignment.maxScore * 0.8));
  const [teacherFeedback, setTeacherFeedback] = useState<string>(submission.teacherFeedback || '');
  const [pointsToAward, setPointsToAward] = useState<number>(submission.pointsAwarded || assignment.pointsReward || 50);

  // AI Evaluation State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    suggestedScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    recommendedImprovement: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRunAiEvaluation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/evaluate-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          studentSubmission: submission.content,
          maxScore: assignment.maxScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI error: ${response.statusText}`);
      }

      const data = await response.json();
      setAiResult(data);
      if (typeof data.suggestedScore === 'number') {
        setScore(data.suggestedScore);
      }
      if (data.feedback) {
        setTeacherFeedback((prev) => (prev ? `${prev}\n\n[ข้อเสนอแนะ AI]: ${data.feedback}` : data.feedback));
      }
    } catch (err: any) {
      console.error(err);
      setAiError('ระบบ AI ประเมินขัดข้อง ชั่วคราว ใช้การตรวจด้วยตนเองแทนได้');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      const aiFeedbackSummary = aiResult
        ? `[จุดแข็ง]: ${aiResult.strengths?.join(', ')} | [ข้อควรพัฒนา]: ${aiResult.weaknesses?.join(', ')} | [แนวทางปรับปรุง]: ${aiResult.recommendedImprovement}`
        : '';

      await gradeSubmission(submission.id, {
        score,
        teacherFeedback,
        aiFeedback: aiFeedbackSummary,
        pointsAwarded: pointsToAward,
        status: 'graded',
        studentId: submission.studentId,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="ai-grading-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <BrainCircuit className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ตรวจการบ้าน & AI ช่วยประเมินรายบุคคล</h2>
              <p className="text-xs text-indigo-100">
                นักเรียน: <strong className="text-white">{submission.studentName}</strong> | {assignment.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Assignment Description & Student Answer */}
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>โจทย์คำสั่งการบ้าน</span>
              </div>
              <p className="text-xs text-slate-600">{assignment.description}</p>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>คำตอบของนักเรียน ({submission.studentName})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  ส่งเมื่อ: {new Date(submission.submittedAt).toLocaleString('th-TH')}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-blue-200/60 shadow-xs">
                {submission.content || 'ไม่มีข้อความตอบ'}
              </p>
            </div>
          </div>

          {/* AI Trigger Box */}
          <div className="p-4 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-indigo-950">AI ผู้ช่วยตรวจและวิเคราะห์จุดอ่อน</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  วิเคราะห์เนื้อหา คำนวณคะแนนเบื้องต้น พร้อมแนะแนวทางพัฒนาผู้เรียนเฉพาะบุคคล
                </p>
              </div>

              <button
                type="button"
                id="btn-run-ai-eval"
                onClick={handleRunAiEvaluation}
                disabled={isAiLoading}
                className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ประเมินด้วย AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {aiError}
              </div>
            )}

            {/* AI Results breakdown */}
            {aiResult && (
              <div className="mt-3 p-4 bg-white rounded-xl border border-indigo-100 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800">ผลการวิเคราะห์โดย Gemini AI</span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                    คะแนนที่แนะนำ: {aiResult.suggestedScore} / {assignment.maxScore}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-slate-700 mb-1">ความเห็นสังเคราะห์:</div>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {aiResult.feedback}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                    <div className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>จุดแข็งที่ทำได้ดี:</span>
                    </div>
                    <ul className="list-disc list-inside text-emerald-900 space-y-0.5 text-[11px]">
                      {aiResult.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <div className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>จุดที่ควรพัฒนา:</span>
                    </div>
                    <ul className="list-disc list-inside text-amber-900 space-y-0.5 text-[11px]">
                      {aiResult.weaknesses?.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg">
                  <div className="font-bold text-purple-900 flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-700" />
                    <span>คำแนะนำในการปรับปรุงการสอนให้ตรงจุดอ่อน (Personalized):</span>
                  </div>
                  <p className="text-purple-950 text-[11px] leading-relaxed">
                    {aiResult.recommendedImprovement}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Teacher Grade & Feedback Inputs */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  คะแนนที่ให้ (เต็ม {assignment.maxScore} คะแนน)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={assignment.maxScore}
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">คะแนน</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  แต้มสะสมรางวัล (Points Reward)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={pointsToAward}
                    onChange={(e) => setPointsToAward(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-amber-600 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> แต้ม
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ข้อเสนอแนะและคำติชมจากครูผู้สอน (ส่งให้นักเรียนเห็น)
              </label>
              <textarea
                rows={3}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="เขียนข้อคิดเห็น ให้กำลังใจ หรือข้อแนะนำเพิ่มเติม..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            id="btn-confirm-grade"
            onClick={handleSaveGrade}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึกคะแนน...' : 'บันทึกคะแนนและมอบแต้ม'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
