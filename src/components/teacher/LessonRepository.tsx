import React, { useState } from 'react';
import type { Classroom, Lesson } from '../../types';
import { saveLesson, deleteLesson } from '../../services/firestoreService';
import {
  BookOpen,
  PlusCircle,
  Video,
  FileText,
  Presentation,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Trash2,
  Sparkles,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';

interface LessonRepositoryProps {
  classroom: Classroom | null;
  lessons: Lesson[];
  isTeacher: boolean;
}

export const LessonRepository: React.FC<LessonRepositoryProps> = ({
  classroom,
  lessons,
  isTeacher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('หน่วยการเรียนรู้ที่ 1: เทคโนโลยีชีวภาพ');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'slide' | 'pdf' | 'link' | 'doc'>('video');
  const [isSaving, setIsSaving] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Extract unique units
  const units = Array.from(new Set(lessons.map((l) => l.unit || 'เนื้อหาทั่วไป')));

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || (l.unit || 'เนื้อหาทั่วไป') === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classroom) return;

    setIsSaving(true);
    try {
      const newLesson: Lesson = {
        id: `les_${Date.now()}`,
        classroomId: classroom.id,
        title: title.trim(),
        unit: unit.trim(),
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType,
        createdAt: new Date().toISOString(),
      };
      await saveLesson(newLesson);
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setMediaUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!classroom) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">ยังไม่มีห้องเรียนสำหรับคลังบทเรียน</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          กรุณาสร้างหรือเลือกห้องเรียน เพื่อเข้าถึงหรืออัปโหลดเอกสารประกอบการสอน
        </p>
      </div>
    );
  }

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setIsDeletingLesson(true);
    try {
      await deleteLesson(lessonToDelete.id);
      setLessonToDelete(null);
    } catch (err) {
      console.error('Error deleting lesson:', err);
    } finally {
      setIsDeletingLesson(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">คลังบทเรียนและสื่อการสอน</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์รวมเอกสาร วิดีโอ สไลด์บรรยาย เข้าถึงสะดวกได้จากทุกอุปกรณ์ ทั้งมือถือและแท็บเล็ต
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            id="btn-open-create-lesson"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เพิ่มบทเรียน / สื่อการสอน</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative grow w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบทเรียน หรือคำสำคัญ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {units.length > 0 && (
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs"
          >
            <option value="all">ทุกหน่วยการเรียนรู้ ({lessons.length})</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">ไม่พบบทเรียนในคลัง</h3>
          <p className="text-xs text-slate-500">
            {isTeacher ? 'คุณครูสามารถคลิกปุ่ม "เพิ่มบทเรียน" เพื่อสร้างเนื้อหาใหม่' : 'ยังไม่มีบทเรียนในหัวข้อนี้'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => {
            const isVideo = lesson.mediaType === 'video';
            const isYoutube = isVideo && lesson.mediaUrl?.includes('youtube.com/watch?v=');
            const youtubeId = isYoutube ? lesson.mediaUrl?.split('v=')[1]?.split('&')[0] : null;

            return (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Media Preview if Video */}
                  {youtubeId ? (
                    <div className="aspect-video w-full bg-slate-900 overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={lesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : lesson.mediaUrl && lesson.mediaType === 'slide' ? (
                    <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={lesson.mediaUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1">
                        <Presentation className="w-3 h-3" /> สไลด์ประกอบการสอน
                      </div>
                    </div>
                  ) : null}

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold">
                        {lesson.unit || 'เนื้อหาทั่วไป'}
                      </span>
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => setLessonToDelete(lesson)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="ลบบทเรียน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{lesson.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {lesson.content}
                    </p>
                  </div>
                </div>

                {/* Footer Media Link Button */}
                {lesson.mediaUrl && !youtubeId && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <a
                      href={lesson.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-white hover:bg-slate-100 text-teal-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดเอกสาร / สื่อการสอนฉบับเต็ม</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-600 p-5 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>เพิ่มสื่อหรือบทเรียนใหม่</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ชื่อบทเรียน / หัวข้อ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น บทที่ 3: กฎของเมนเดลและตารางพันธุศาสตร์"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  หน่วยการเรียนรู้ (Unit)
                </label>
                <input
                  type="text"
                  placeholder="เช่น หน่วยการเรียนรู้ที่ 1: เทคโนโลยีชีวภาพ"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  เนื้อหาบทเรียนและคำอธิบาย *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="สรุปเนื้อหาสำคัญ แนวคิดหลัก ข้อควรจำ..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ประเภทสื่อ
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="video">วิดีโอ (YouTube / MP4)</option>
                    <option value="slide">สไลด์บรรยาย (Slides/Images)</option>
                    <option value="pdf">เอกสาร PDF</option>
                    <option value="link">ลิงก์แหล่งค้นคว้า</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL สื่อการสอน (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
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
                  id="btn-save-lesson-submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกเข้าคลังสื่อ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Delete Lesson */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบบทเรียน?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                ต้องการลบ <strong className="text-slate-800">"{lessonToDelete.title}"</strong> ออกจากคลังสื่อการสอนหรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingLesson}
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeletingLesson}
                onClick={confirmDeleteLesson}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                {isDeletingLesson ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
