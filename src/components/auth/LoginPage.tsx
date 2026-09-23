import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  UserCheck,
  CheckCircle2,
  Mail,
  User,
  BrainCircuit,
  Award,
  CalendarCheck,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  IdCard,
  BookMarked,
} from 'lucide-react';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const {
    loginWithCredentials,
    registerNewUser,
    loginGoogle,
    loginDemo,
    loading: authLoading,
  } = useAuth();

  // Tab: 'login' (เข้าสู่ระบบ) vs 'register' (สมัครสมาชิก)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Common UI states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form states
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGrade, setRegGrade] = useState('ม.3/1');
  const [regStudentId, setRegStudentId] = useState('');
  const [regSubject, setRegSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError('กรุณากรอกอีเมล หรือ เลขประจำตัวนักเรียน');
      return;
    }
    if (!loginPassword) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await loginWithCredentials(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'อีเมล/เลขประจำตัว หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล หรือชื่อจริงของคุณ');
      return;
    }
    if (!regEmail.trim()) {
      setError('กรุณากรอกอีเมลสำหรับสร้างบัญชี');
      return;
    }
    if (regPassword.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัย');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerNewUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        grade: regRole === 'student' ? regGrade.trim() : undefined,
        studentId: regRole === 'student' ? (regStudentId.trim() || undefined) : undefined,
        subject: regRole === 'teacher' ? (regSubject.trim() || undefined) : undefined,
      });
      setSuccessMsg('สร้างบัญชีและบันทึกลงฐานข้อมูล Cloud Firestore สำเร็จ ยินดีต้อนรับสู่ระบบ EduVibe!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Login
  const handleDemoLogin = async (role: UserRole) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await loginDemo(role);
    } catch (err: any) {
      console.error(err);
      setError('ไม่สามารถเข้าสู่ระบบตัวอย่างได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async (rolePreference?: UserRole) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await loginGoogle(rolePreference);
    } catch (err: any) {
      console.error(err);
      setError('การเข้าสู่ระบบด้วย Google ขัดข้อง หรือถูกปิดหน้าต่าง กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black tracking-tight text-xl text-white">EduVibe</span>
              <span className="text-xs text-blue-400 font-semibold ml-2.5 px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60">
                School Cloud v2.5
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud Firestore Connected</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="grow flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Platform Presentation & Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>แพลตฟอร์มจัดการเรียนการสอนอัจฉริยะ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              เชื่อมต่อห้องเรียน <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-teal-300 to-indigo-300">
                ก้าวล้ำด้วยระบบ AI & Cloud
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
              นวัตกรรมระบบจัดการการเรียนรู้สำหรับคุณครูและนักเรียน บันทึกคะแนน การเช็คชื่อ ส่งงาน ตรวจการบ้านพร้อม AI Rubric และคลังข้อสอบย่อยไว้ในที่เดียว
            </p>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI ออกข้อสอบ & ตรวจงาน</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">วิเคราะห์คำตอบพร้อมคะแนนอัตโนมัติ</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">เช็คชื่อ & พฤติกรรมสด</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">บันทึกเวลาเรียนและคะแนนความดี</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">แต้มสะสม & เกียรติบัตร</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">แรงจูงใจ Gamification สูงสุด</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cloud Firestore</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">ซิงค์ข้อมูลเรียลไทม์ ปลอดภัยสูง</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div
              id="auth-card-container"
              className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 text-left relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-teal-400 to-indigo-500"></div>

              {/* Main Auth Tabs: เข้าสู่ระบบ vs สมัครสมาชิก */}
              <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700/70 mb-6">
                <button
                  type="button"
                  id="tab-auth-login"
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  type="button"
                  id="tab-auth-register"
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิกใหม่</span>
                </button>
              </div>

              {/* Card Title */}
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeTab === 'login' ? 'เข้าสู่ระบบบัญชีโรงเรียน' : 'ลงทะเบียนบัญชีใหม่'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'login'
                    ? 'กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานห้องเรียนของคุณทันที'
                    : 'สร้างบัญชีผู้ใช้งานสำหรับครูผู้สอนหรือนักเรียน'}
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div
                  id="auth-error-banner"
                  className="mb-5 p-3.5 bg-red-950/70 border border-red-800/90 rounded-xl text-xs text-red-300 flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Notice */}
              {successMsg && (
                <div
                  id="auth-success-banner"
                  className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-800/90 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 1: LOGIN (เข้าสู่ระบบ) */}
              {/* ========================================================= */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {/* Email or Student ID Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        อีเมลผู้ใช้งาน หรือ เลขประจำตัวนักเรียน <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="input-login-email"
                          type="text"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="เช่น somchai@school.ac.th หรือ 65001"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        สามารถกรอกอีเมลของโรงเรียน, อีเมลส่วนตัว, หรือเลขประจำตัวนักเรียนที่ลงทะเบียนไว้
                      </p>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          รหัสผ่าน <span className="text-red-400">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          id="input-login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="กรอกรหัสผ่านของคุณ"
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Login Button */}
                    <button
                      type="submit"
                      id="btn-submit-login"
                      disabled={isSubmitting || authLoading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>กำลังตรวจสอบข้อมูล...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>เข้าสู่ระบบ & เริ่มต้นใช้งาน</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="grow border-t border-slate-700/60"></div>
                    <span className="shrink mx-3 text-slate-400 text-[11px] font-medium uppercase">
                      หรือเข้าสู่ระบบด้วย
                    </span>
                    <div className="grow border-t border-slate-700/60"></div>
                  </div>

                  {/* Google Login */}
                  <button
                    type="button"
                    id="btn-login-google"
                    disabled={isSubmitting || authLoading}
                    onClick={() => handleGoogleLogin()}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>เข้าสู่ระบบด้วย Google Account</span>
                  </button>

                  {/* Switch to Register link */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">ยังไม่มีบัญชีใช้งานใช่หรือไม่? </span>
                    <button
                      type="button"
                      id="link-go-to-register"
                      onClick={() => {
                        setActiveTab('register');
                        setError(null);
                      }}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer ml-1"
                    >
                      สมัครบัญชีใหม่ที่นี่
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: REGISTER (สมัครสมาชิกใหม่) */}
              {/* ========================================================= */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Step 1: Role Selector Cards */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      เลือกบทบาทของคุณ <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        id="btn-register-role-teacher"
                        onClick={() => setRegRole('teacher')}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          regRole === 'teacher'
                            ? 'border-indigo-500 bg-indigo-950/70 text-white shadow-sm ring-1 ring-indigo-500'
                            : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <UserCheck
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            regRole === 'teacher' ? 'text-indigo-400' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">คุณครูผู้สอน</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            จัดการห้อง สั่งงาน ออกข้อสอบ AI
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        id="btn-register-role-student"
                        onClick={() => setRegRole('student')}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          regRole === 'student'
                            ? 'border-teal-500 bg-teal-950/70 text-white shadow-sm ring-1 ring-teal-500'
                            : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <BookOpen
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            regRole === 'student' ? 'text-teal-400' : 'text-slate-500'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">นักเรียน</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            ส่งงาน สอบย่อย สะสมแต้ม
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ชื่อ-นามสกุล <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="input-reg-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={
                          regRole === 'teacher'
                            ? 'เช่น ครูวิภาดา สดใส'
                            : 'เช่น ด.ช. ธนกร มุ่งมั่น'
                        }
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      อีเมล <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="input-reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@school.ac.th หรือ user@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Role Specific Fields */}
                  {regRole === 'student' ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          ระดับชั้น / ห้อง
                        </label>
                        <input
                          id="input-reg-grade"
                          type="text"
                          value={regGrade}
                          onChange={(e) => setRegGrade(e.target.value)}
                          placeholder="เช่น ม.3/1"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          เลขประจำตัว (ถ้ามี)
                        </label>
                        <div className="relative">
                          <IdCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            id="input-reg-student-id"
                            type="text"
                            value={regStudentId}
                            onChange={(e) => setRegStudentId(e.target.value)}
                            placeholder="เช่น 65042"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        กลุ่มสาระการเรียนรู้ / วิชาที่สอน
                      </label>
                      <div className="relative">
                        <BookMarked className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="input-reg-subject"
                          type="text"
                          value={regSubject}
                          onChange={(e) => setRegSubject(e.target.value)}
                          placeholder="เช่น วิทยาศาสตร์, คณิตศาสตร์, ภาษาไทย, ภาษาอังกฤษ"
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        รหัสผ่าน <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          id="input-reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="อย่างน้อย 6 ตัวอักษร"
                          className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          id="input-reg-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="กรอกรหัสผ่านซ้ำ"
                          className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Register Button */}
                  <button
                    type="submit"
                    id="btn-submit-register"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังสร้างบัญชีของคุณ...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>ยืนยันการสมัครและเข้าสู่ระบบทันที</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="grow border-t border-slate-700/60"></div>
                    <span className="shrink mx-3 text-slate-400 text-[11px] font-medium uppercase">
                      หรือ
                    </span>
                    <div className="grow border-t border-slate-700/60"></div>
                  </div>

                  {/* Register with Google Button */}
                  <button
                    type="button"
                    id="btn-register-google"
                    disabled={isSubmitting || authLoading}
                    onClick={() => handleGoogleLogin(regRole)}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>สมัครด้วย Google ({regRole === 'teacher' ? 'บทบาทครู' : 'บทบาทนักเรียน'})</span>
                  </button>

                  {/* Switch to Login link */}
                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">มีบัญชีผู้ใช้งานอยู่แล้ว? </span>
                    <button
                      type="button"
                      id="link-go-to-login"
                      onClick={() => {
                        setActiveTab('login');
                        setError(null);
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer ml-1"
                    >
                      เข้าสู่ระบบที่นี่
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Security Info */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Cloud Firestore Database</span>
                </span>
                <span>EduVibe LMS Security</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EduVibe School Cloud - นวัตกรรมระบบบริหารการเรียนรู้โรงเรียน</span>
          <span className="text-slate-400">Google Firebase & Cloud Firestore Integrated</span>
        </div>
      </footer>
    </div>
  );
};
