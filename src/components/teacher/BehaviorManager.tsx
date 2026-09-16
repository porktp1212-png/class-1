import React, { useState } from 'react';
import type { Classroom, BehaviorRecord, UserProfile } from '../../types';
import { addBehaviorRecord } from '../../services/firestoreService';
import {
  HeartHandshake,
  PlusCircle,
  ThumbsUp,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  Filter,
  Users,
} from 'lucide-react';

interface BehaviorManagerProps {
  classroom: Classroom | null;
  behaviors: BehaviorRecord[];
  students?: UserProfile[];
}

export const BehaviorManager: React.FC<BehaviorManagerProps> = ({
  classroom,
  behaviors,
  students,
}) => {
  const studentList = (students || []).filter((s): s is UserProfile => Boolean(s && s.id));
  const [selectedStudentId, setSelectedStudentId] = useState(studentList[0]?.id || '');
  const [type, setType] = useState<'positive' | 'needs_improvement'>('positive');
  const [category, setCategory] = useState('จิตอาสาและความรับผิดชอบ');
  const [scoreDelta, setScoreDelta] = useState(10);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [filterStudent, setFilterStudent] = useState<string>('all');

  React.useEffect(() => {
    if (studentList.length > 0 && (!selectedStudentId || !studentList.some((s) => s.id === selectedStudentId))) {
      setSelectedStudentId(studentList[0].id);
    }
  }, [studentList.length, selectedStudentId]);

  const positiveCategories = [
    { name: 'จิตอาสาและความรับผิดชอบ', points: 15 },
    { name: 'การมีส่วนร่วมและกล้าแสดงออก', points: 10 },
    { name: 'ทำงานกลุ่มยอดเยี่ยม', points: 15 },
    { name: 'ความซื่อสัตย์และมีวินัย', points: 20 },
    { name: 'ส่งงานล่วงหน้า', points: 10 },
  ];

  const improvementCategories = [
    { name: 'พูดคุยรบกวนสมาธิเพื่อน', points: -5 },
    { name: 'ส่งงานล่าช้ากว่ากำหนด', points: -5 },
    { name: 'ไม่นำอุปกรณ์การเรียนมา', points: -5 },
    { name: 'ขาดความร่วมมือในกิจกรรมกลุ่ม', points: -10 },
  ];

  const handleSelectCategory = (cat: { name: string; points: number }) => {
    setCategory(cat.name);
    setScoreDelta(cat.points);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroom) return;
    const student = studentList.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setIsSaving(true);
    try {
      const record: BehaviorRecord = {
        id: `beh_${Date.now()}`,
        classroomId: classroom.id,
        studentId: student.id,
        studentName: student.name,
        type,
        category,
        scoreDelta: Number(scoreDelta),
        note: note.trim() || undefined,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      await addBehaviorRecord(record);
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!classroom) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">ยังไม่มีห้องเรียนสำหรับบันทึกพฤติกรรม</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          กรุณาสร้างหรือเลือกห้องเรียน เพื่อเริ่มบันทึกแต้มความดีและพฤติกรรมของนักเรียน
        </p>
      </div>
    );
  }

  const filteredBehaviors = behaviors.filter((b) => {
    if (filterStudent === 'all') return true;
    return b.studentId === filterStudent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">บันทึกพฤติกรรมและการมีส่วนร่วม</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เสริมแรงบวกด้วยแต้มพฤติกรรมดี ติดตามพัฒนาการทางอารมณ์และสังคม (SEL)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Record Form */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>เพิ่มบันทึกพฤติกรรม</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                เลือกนักเรียน *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
              >
                {studentList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            {/* Type selector */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ประเภทพฤติกรรม
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('positive');
                    handleSelectCategory(positiveCategories[0]);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    type === 'positive'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>พฤติกรรมเชิงบวก (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('needs_improvement');
                    handleSelectCategory(improvementCategories[0]);
                  }}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    type === 'needs_improvement'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>ควรพัฒนา (-)</span>
                </button>
              </div>
            </div>

            {/* Quick Category chips */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                เลือกหัวข้อสำเร็จรูป
              </label>
              <div className="space-y-1.5">
                {(type === 'positive' ? positiveCategories : improvementCategories).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCategory(c)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      category === c.name
                        ? type === 'positive'
                          ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-900'
                          : 'border-amber-500 bg-amber-50 font-semibold text-amber-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="font-bold">{c.points > 0 ? `+${c.points}` : c.points} แต้ม</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                รายละเอียด / บันทึกเพิ่มเติม
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ระบุเหตุการณ์หรือคำชมเชย..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกพฤติกรรมและปรับแต้ม'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: History of behavior logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900">
                ประวัติบันทึกพฤติกรรม ({filteredBehaviors.length} รายการ)
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                >
                  <option value="all">นักเรียนทุกคน</option>
                  {studentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredBehaviors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">ยังไม่มีบันทึกพฤติกรรม</div>
            ) : (
              <div className="space-y-2.5">
                {filteredBehaviors.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.studentName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            b.type === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.category}
                        </span>
                      </div>
                      {b.note && <p className="text-slate-600 text-[11px]">"{b.note}"</p>}
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>วันที่: {b.date}</span>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-extrabold px-2.5 py-1 rounded-lg shrink-0 ${
                        b.scoreDelta > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {b.scoreDelta > 0 ? `+${b.scoreDelta}` : b.scoreDelta} แต้ม
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
