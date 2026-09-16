import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, registerNewUser, loginGoogle, loginDemo, loading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [grade, setGrade] = useState('ม.3/1');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        if (!email.trim() || !password) {
          setError('กรุณากรอกอีเมลและรหัสผ่าน');
          setIsSubmitting(false);
          return;
        }
        await loginWithCredentials(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError('กรุณาระบุชื่อ-นามสกุล');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || password.length < 6) {
          setError('กรุณากรอกอีเมลและรหัสผ่านอย่างน้อย 6 ตัวอักษร');
          setIsSubmitting(false);
          return;
        }
        await registerNewUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          grade: role === 'student' ? grade : undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบบัญชี');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('การเข้าสู่ระบบด้วย Google ขัดข้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleDemo = async (demoRole: UserRole) => {
    try {
      setError(null);
      await loginDemo(demoRole);
      onClose();
    } catch (err: any) {
      setError('เข้าสู่ระบบตัวอย่างไม่สำเร็จ');
    }
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
    >
      <div
        id="login-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-teal-500 p-5 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md mb-2 shadow-inner">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">EduVibe Cloud LMS</h2>
          <p className="text-xs text-blue-100 mt-0.5">ระบบจัดการเรียนรู้และติดตามผลเรียลไทม์</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              tab === 'register'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            สมัครสมาชิกใหม่ (Register)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บทบาทของคุณ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        role === 'teacher'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>คุณครูผู้สอน</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        role === 'student'
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>นักเรียน</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ระบุชื่อ-นามสกุล"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ระดับชั้น / ห้อง
                    </label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="ม.3/1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@school.ac.th"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tab === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกและเข้าใช้งาน'}</span>
            </button>
          </form>

          {/* Quick Demo Options */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-semibold mb-2">
              ทดลองใช้งานด่วน (1 คลิก):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('teacher')}
                className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-left text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                <div className="font-bold">ครูสมชาย (ครู)</div>
                <div className="text-[10px] text-indigo-600">ตรวจงาน ออกข้อสอบ AI</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-left text-xs font-medium hover:bg-teal-100 transition-colors"
              >
                <div className="font-bold">สมหญิง (นักเรียน)</div>
                <div className="text-[10px] text-teal-600">ส่งงาน สะสมแต้ม</div>
              </button>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
