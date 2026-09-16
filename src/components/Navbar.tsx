import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Classroom } from '../types';
import {
  GraduationCap,
  Sparkles,
  Flame,
  Award,
  MessageSquare,
  Bell,
  RefreshCw,
  LogOut,
  LogIn,
  ChevronDown,
  Layers,
  CheckCircle2,
  Plus,
  KeyRound,
  Trash2,
} from 'lucide-react';

interface NavbarProps {
  classrooms: Classroom[];
  activeClassroom: Classroom | null;
  onSelectClassroom: (c: Classroom) => void;
  onOpenChat: () => void;
  onClearAllData?: () => void;
  pendingSubmissionsCount: number;
  onOpenCreateClassroom?: () => void;
  onOpenJoinClassroom?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  classrooms,
  activeClassroom,
  onSelectClassroom,
  onOpenChat,
  onClearAllData,
  pendingSubmissionsCount,
  onOpenCreateClassroom,
  onOpenJoinClassroom,
  onOpenLogin,
}) => {
  const { currentUser, logout } = useAuth();
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">EduVibe</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full">
                  นวัตกรรมโรงเรียน
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ระบบจัดการเรียนรู้และติดตามผลเรียลไทม์</p>
            </div>

            {/* Classroom Selector Dropdown */}
            {classrooms.length > 0 && (
              <div className="relative ml-2 sm:ml-4">
                <button
                  type="button"
                  id="btn-classroom-dropdown"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium transition-colors border border-slate-200"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[140px] truncate sm:max-w-[200px]">
                    {activeClassroom ? activeClassroom.name : 'เลือกห้องเรียน'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showClassDropdown && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                      ห้องเรียนของคุณ ({classrooms.length})
                    </div>
                    {classrooms.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectClassroom(c);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          activeClassroom?.id === c.id ? 'font-semibold text-blue-700 bg-blue-50/60' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div>{c.name}</div>
                          <div className="text-[10px] text-slate-500">รหัส: {c.code}</div>
                        </div>
                        {activeClassroom?.id === c.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}

                    {currentUser?.role === 'teacher' && onOpenCreateClassroom && (
                      <div className="p-1.5 border-t border-slate-100 mt-1">
                        <button
                          type="button"
                          id="btn-dropdown-create-class"
                          onClick={() => {
                            setShowClassDropdown(false);
                            onOpenCreateClassroom();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ สร้างห้องเรียนใหม่</span>
                        </button>
                      </div>
                    )}

                    {currentUser?.role === 'student' && onOpenJoinClassroom && (
                      <div className="p-1.5 border-t border-slate-100 mt-1">
                        <button
                          type="button"
                          id="btn-dropdown-join-class"
                          onClick={() => {
                            setShowClassDropdown(false);
                            onOpenJoinClassroom();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>+ เข้าร่วมห้องเรียนด้วยรหัส</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Button Next to Dropdown */}
            {currentUser?.role === 'teacher' && onOpenCreateClassroom && (
              <button
                type="button"
                id="btn-nav-create-classroom"
                onClick={onOpenCreateClassroom}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0 ml-1"
                title="สร้างห้องเรียนใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>สร้างห้องเรียน</span>
              </button>
            )}

            {currentUser?.role === 'student' && onOpenJoinClassroom && (
              <button
                type="button"
                id="btn-nav-join-classroom"
                onClick={onOpenJoinClassroom}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all shrink-0 ml-1"
                title="เข้าร่วมห้องเรียนด้วยรหัส"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>เข้าร่วมห้อง</span>
              </button>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Clear All System Data (For reset or trial setup) */}
            {onClearAllData && (
              <button
                type="button"
                id="btn-clear-system-data"
                onClick={onClearAllData}
                title="ล้างข้อมูลระบบทั้งหมดเพื่อเริ่มต้นใช้งานจริง"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>ล้างข้อมูลระบบ</span>
              </button>
            )}

            {/* Current Role Badge (Fixed based on user account) */}
            {currentUser && (
              <div
                id="badge-current-role"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs ${
                  currentUser.role === 'teacher'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentUser.role === 'teacher' ? 'bg-indigo-600' : 'bg-teal-600'
                  }`}
                ></span>
                <span>{currentUser.role === 'teacher' ? 'คุณครูผู้สอน' : `นักเรียน (${currentUser.grade || 'ม.3'})`}</span>
              </div>
            )}

            {/* Student Points & Streak */}
            {currentUser?.role === 'student' && (
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
                  title="แต้มสะสมทั้งหมด"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{currentUser.totalPoints} แต้ม</span>
                </div>
                {currentUser.streakDays && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold"
                    title="เข้าเรียนต่อเนื่อง"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>{currentUser.streakDays} วัน</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat button */}
            <button
              type="button"
              id="btn-nav-chat"
              onClick={onOpenChat}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors relative"
              title="แชทติดต่อสื่อสาร"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500"></span>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                id="btn-nav-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors relative"
                title="การแจ้งเตือน"
              >
                <Bell className="w-5 h-5" />
                {pendingSubmissionsCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {pendingSubmissionsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-800">
                    <span>การแจ้งเตือนกิจกรรม</span>
                    <span className="text-[10px] text-blue-600 font-normal">ทั้งหมด</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {currentUser?.role === 'teacher' ? (
                      pendingSubmissionsCount > 0 ? (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                          <div className="font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            มีงานรอนักเรียนส่ง/ครูตรวจ {pendingSubmissionsCount} รายการ
                          </div>
                          <p className="text-[11px] text-amber-700 mt-1">
                            คลิกดูในแดชบอร์ดเพื่อใช้ AI ช่วยตรวจการบ้านเบื้องต้น
                          </p>
                        </div>
                      ) : (
                        <div className="text-slate-500 py-3 text-center">ยังไม่มีงานค้างตรวจในขณะนี้</div>
                      )
                    ) : (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                        <div className="font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          กิจกรรมห้องเรียนใหม่
                        </div>
                        <p className="text-[11px] text-blue-700 mt-1">
                          คุณครูได้อัปเดตสื่อการสอนและแบบทดสอบย่อยแล้ว
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  id="btn-user-avatar"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-400 transition-all"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-xs"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.name}</div>
                      <div className="text-slate-500 truncate text-[11px]">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            currentUser.role === 'teacher'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {currentUser.role === 'teacher'
                            ? `คุณครูผู้สอน ${currentUser.subject ? `• ${currentUser.subject}` : ''}`
                            : `นักเรียน ${currentUser.grade || 'ม.3'} ${currentUser.studentId ? `(${currentUser.studentId})` : ''}`}
                        </span>
                      </div>
                    </div>
                    {onClearAllData && currentUser.role === 'teacher' && (
                      <button
                        type="button"
                        id="btn-nav-clear-all"
                        onClick={() => {
                          setShowUserMenu(false);
                          onClearAllData();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center justify-between border-t border-slate-100 font-medium"
                      >
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>ล้างข้อมูลระบบทั้งหมด</span>
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="btn-nav-logout"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between border-t border-slate-100 mt-1"
                    >
                      <span>ออกจากระบบ</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Login button if not logged in */}
            {!currentUser && onOpenLogin && (
              <button
                type="button"
                id="btn-nav-login"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
