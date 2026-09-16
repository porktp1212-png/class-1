import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  Classroom,
  Lesson,
  Assignment,
  Submission,
  AttendanceRecord,
  BehaviorRecord,
  Quiz,
  QuizResult,
  ChatMessage,
  Certificate,
  UserProfile,
} from '../types';

// ================= USER PROFILE =================
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const cleanEmail = (user.email || '').trim().toLowerCase();
  const normalizedUser: UserProfile = {
    ...user,
    email: cleanEmail,
  };

  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      ...normalizedUser,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('saveUserProfile Firestore notice:', error);
  }

  // Also cache locally for instant offline/fallback access
  try {
    const rawList = JSON.parse(localStorage.getItem('eduvibe_registered_users') || '[]');
    const localList: UserProfile[] = Array.isArray(rawList) ? rawList.filter((u): u is UserProfile => Boolean(u && u.id)) : [];
    const idx = localList.findIndex((u) => u && (u.id === user.id || (u.email && u.email.toLowerCase() === cleanEmail)));
    if (idx >= 0) {
      localList[idx] = { ...localList[idx], ...normalizedUser };
    } else {
      localList.push(normalizedUser);
    }
    localStorage.setItem('eduvibe_registered_users', JSON.stringify(localList));
  } catch {
    // ignore
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as any) } as UserProfile;
    }
  } catch (error) {
    console.warn('getUserProfile Firestore notice:', error);
  }

  // Check local cached users
  try {
    const rawList = JSON.parse(localStorage.getItem('eduvibe_registered_users') || '[]');
    const localList: UserProfile[] = Array.isArray(rawList) ? rawList.filter((u): u is UserProfile => Boolean(u && u.id)) : [];
    const found = localList.find((u) => u && u.id === userId);
    if (found) return found;
  } catch {
    // ignore
  }

  return null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  return getUserByEmailOrStudentId(email);
}

export async function getUserByEmailOrStudentId(identifier: string): Promise<UserProfile | null> {
  const clean = identifier.trim();
  const cleanLower = clean.toLowerCase();

  // 1. Direct doc ID match
  try {
    const docRef = doc(db, 'users', clean);
    const snapDoc = await getDoc(docRef);
    if (snapDoc.exists()) {
      return { id: snapDoc.id, ...(snapDoc.data() as any) } as UserProfile;
    }
  } catch {
    // ignore
  }

  // 2. Query by email in Firestore
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanLower));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as any) } as UserProfile;
    }
  } catch (error) {
    console.warn('getUserByEmailOrStudentId email query notice:', error);
  }

  // 3. Query by studentId in Firestore
  try {
    const qStd = query(collection(db, 'users'), where('studentId', '==', clean));
    const snapStd = await getDocs(qStd);
    if (!snapStd.empty) {
      const docSnap = snapStd.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as any) } as UserProfile;
    }
  } catch {
    // ignore
  }

  // 4. Scan all documents in users collection (case-insensitive fallback)
  try {
    const snapAll = await getDocs(collection(db, 'users'));
    for (const d of snapAll.docs) {
      const data = { id: d.id, ...(d.data() as any) } as UserProfile;
      if (
        data.email?.toLowerCase() === cleanLower ||
        data.studentId === clean ||
        data.studentId?.toLowerCase() === cleanLower ||
        data.id === clean
      ) {
        return data;
      }
    }
  } catch {
    // ignore
  }

  // 5. Check local cache
  try {
    const rawList = JSON.parse(localStorage.getItem('eduvibe_registered_users') || '[]');
    const localList: UserProfile[] = Array.isArray(rawList) ? rawList.filter((u): u is UserProfile => Boolean(u && u.id)) : [];
    const found = localList.find(
      (u) =>
        u && (
          u.email?.toLowerCase() === cleanLower ||
          u.studentId === clean ||
          u.studentId?.toLowerCase() === cleanLower ||
          u.id === clean
        )
    );
    if (found) return found;
  } catch {
    // ignore
  }

  return null;
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const path = 'users';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// ================= CLASSROOMS =================
export function subscribeClassrooms(
  arg1: string | ((classrooms: Classroom[]) => void),
  arg2?: 'teacher' | 'student' | ((classrooms: Classroom[]) => void),
  arg3?: (classrooms: Classroom[]) => void
) {
  const path = 'classrooms';
  let callback: (classrooms: Classroom[]) => void;
  let q: any;

  if (typeof arg1 === 'function') {
    callback = arg1;
    q = query(collection(db, path));
  } else if (typeof arg2 === 'function') {
    callback = arg2;
    q = query(collection(db, path));
  } else {
    callback = arg3 || (() => {});
    const userId = arg1;
    const role = arg2;
    q =
      role === 'teacher'
        ? query(collection(db, path), where('teacherId', '==', userId))
        : query(collection(db, path), where('studentIds', 'array-contains', userId));
  }

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Classroom[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function createClassroom(classroom: Classroom): Promise<void> {
  const path = `classrooms/${classroom.id}`;
  try {
    await setDoc(doc(db, 'classrooms', classroom.id), classroom);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateClassroom(classroomId: string, updates: Partial<Classroom>): Promise<void> {
  const path = `classrooms/${classroomId}`;
  try {
    await updateDoc(doc(db, 'classrooms', classroomId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteClassroom(classroomId: string): Promise<void> {
  const path = `classrooms/${classroomId}`;
  try {
    // 1. Delete classroom document itself
    await deleteDoc(doc(db, 'classrooms', classroomId));

    // 2. Cascade delete related classroom child records to keep database clean and stable
    const cascadeCollections = [
      'assignments',
      'submissions',
      'attendance',
      'behavior_records',
      'quizzes',
      'quiz_results',
      'lessons',
      'messages',
    ];

    for (const colName of cascadeCollections) {
      try {
        const q = query(collection(db, colName), where('classroomId', '==', classroomId));
        const snap = await getDocs(q);
        const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (childErr) {
        console.warn(`Notice during cleanup of ${colName} for classroom ${classroomId}:`, childErr);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function removeStudentFromClassroom(classroomId: string, studentId: string): Promise<void> {
  const path = `classrooms/${classroomId}`;
  try {
    const docRef = doc(db, 'classrooms', classroomId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data() as Classroom;
    const currentStudents = (data.studentIds || []).filter((id) => id !== studentId);
    await updateDoc(docRef, { studentIds: currentStudents });
  } catch (error) {
    console.warn('removeStudentFromClassroom notice:', error);
  }
}

export async function addStudentToClassroom(classroomId: string, studentId: string): Promise<void> {
  const path = `classrooms/${classroomId}`;
  try {
    const docRef = doc(db, 'classrooms', classroomId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data() as Classroom;
    const currentStudents = data.studentIds || [];
    if (!currentStudents.includes(studentId)) {
      await updateDoc(docRef, { studentIds: [...currentStudents, studentId] });
    }
  } catch (error) {
    console.warn('addStudentToClassroom notice:', error);
  }
}

export async function enrollStudentInDefaultClassrooms(studentId: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'classrooms'));
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as Classroom;
      const current = data.studentIds || [];
      if (!current.includes(studentId)) {
        await updateDoc(doc(db, 'classrooms', docSnap.id), {
          studentIds: [...current, studentId],
        });
      }
    }
  } catch (error) {
    console.warn('enrollStudentInDefaultClassrooms notice:', error);
  }
}

export async function getClassroomStudents(studentIds: string[]): Promise<UserProfile[]> {
  const result: UserProfile[] = [];
  const foundMap = new Set<string>();

  if (!studentIds || studentIds.length === 0) {
    return [];
  }

  // 1. Check local registered cache first
  try {
    const rawList = JSON.parse(localStorage.getItem('eduvibe_registered_users') || '[]');
    const localList: UserProfile[] = Array.isArray(rawList) ? rawList.filter((u): u is UserProfile => Boolean(u && u.id)) : [];
    for (const id of studentIds) {
      const found = localList.find((u) => u && u.id === id);
      if (found && found.id && !foundMap.has(found.id)) {
        result.push(found);
        foundMap.add(found.id);
      }
    }
  } catch {
    // ignore
  }

  // 2. Fetch from Firestore users collection
  for (const id of studentIds) {
    if (!foundMap.has(id)) {
      try {
        const profile = await getUserProfile(id);
        if (profile && profile.id) {
          result.push(profile);
          foundMap.add(profile.id);
        }
      } catch {
        // ignore
      }
    }
  }

  return result;
}

export async function getAllRegisteredStudents(): Promise<UserProfile[]> {
  const result: UserProfile[] = [];
  const map = new Map<string, UserProfile>();

  // 1. Local storage registered users
  try {
    const rawList = JSON.parse(localStorage.getItem('eduvibe_registered_users') || '[]');
    const localList: UserProfile[] = Array.isArray(rawList) ? rawList.filter((u): u is UserProfile => Boolean(u && u.id)) : [];
    localList.forEach((u) => {
      if (u && u.role === 'student' && u.id) map.set(u.id, u);
    });
  } catch {
    // ignore
  }

  // 2. Firestore users collection
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const data = { id: docSnap.id, ...(docSnap.data() as any) } as UserProfile;
      if (data && data.id) {
        map.set(data.id, data);
      }
    });
  } catch {
    // ignore
  }

  map.forEach((student) => result.push(student));
  return result;
}

export async function clearAllSystemData(): Promise<void> {
  const collections = [
    'classrooms',
    'assignments',
    'submissions',
    'attendance',
    'behavior_records',
    'quizzes',
    'quiz_results',
    'lessons',
    'messages',
    'certificates',
    'users'
  ];

  try {
    for (const colName of collections) {
      const snap = await getDocs(collection(db, colName));
      const deletePromises = snap.docs.map((d) => deleteDoc(doc(db, colName, d.id)));
      await Promise.all(deletePromises);
    }
  } catch (err) {
    console.error('Error clearing Firestore collections:', err);
  }

  // Clear local storage cache
  try {
    localStorage.removeItem('eduvibe_registered_users');
    localStorage.removeItem('eduvibe_local_submissions');
    localStorage.removeItem('eduvibe_local_classrooms');
    sessionStorage.removeItem('eduvibe_pending_reg');
  } catch {
    // ignore
  }
}

export async function joinClassroomByCode(code: string, studentId: string): Promise<Classroom | null> {
  const path = 'classrooms';
  try {
    const q = query(collection(db, path), where('code', '==', code.toUpperCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const classDoc = snap.docs[0];
    const data = classDoc.data() as Classroom;
    const currentStudents = data.studentIds || [];
    if (!currentStudents.includes(studentId)) {
      await updateDoc(doc(db, 'classrooms', classDoc.id), {
        studentIds: [...currentStudents, studentId],
      });
    }
    return { id: classDoc.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}

// ================= LESSONS =================
export function subscribeLessons(classroomId: string, callback: (lessons: Lesson[]) => void) {
  const path = 'lessons';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Lesson[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const path = `lessons/${lesson.id}`;
  try {
    await setDoc(doc(db, 'lessons', lesson.id), lesson);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const path = `lessons/${lessonId}`;
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= ASSIGNMENTS =================
export function subscribeAssignments(classroomId: string, callback: (assignments: Assignment[]) => void) {
  const path = 'assignments';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Assignment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveAssignment(assignment: Assignment): Promise<void> {
  const path = `assignments/${assignment.id}`;
  try {
    await setDoc(doc(db, 'assignments', assignment.id), assignment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= SUBMISSIONS =================
export function subscribeSubmissions(classroomId: string, callback: (subs: Submission[]) => void) {
  const path = 'submissions';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Submission[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function submitHomework(submission: Submission): Promise<void> {
  const path = `submissions/${submission.id}`;
  try {
    await setDoc(doc(db, 'submissions', submission.id), submission);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function gradeSubmission(
  submissionId: string,
  updates: {
    score: number;
    teacherFeedback: string;
    aiFeedback?: string;
    pointsAwarded: number;
    status: 'graded';
    studentId: string;
  }
): Promise<void> {
  const path = `submissions/${submissionId}`;
  try {
    await updateDoc(doc(db, 'submissions', submissionId), {
      score: updates.score,
      teacherFeedback: updates.teacherFeedback,
      ...(updates.aiFeedback ? { aiFeedback: updates.aiFeedback } : {}),
      pointsAwarded: updates.pointsAwarded,
      status: 'graded',
    });

    // Award points to student user profile
    const userDoc = await getDoc(doc(db, 'users', updates.studentId));
    if (userDoc.exists()) {
      const currentPts = userDoc.data().totalPoints || 0;
      const newPts = currentPts + updates.pointsAwarded;
      const newLvl = Math.floor(newPts / 200) + 1;
      await updateDoc(doc(db, 'users', updates.studentId), {
        totalPoints: newPts,
        level: newLvl,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ================= ATTENDANCE =================
export function subscribeAttendance(classroomId: string, callback: (records: AttendanceRecord[]) => void) {
  const path = 'attendance';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: AttendanceRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  const path = `attendance/${record.id}`;
  try {
    await setDoc(doc(db, 'attendance', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= BEHAVIOR =================
export function subscribeBehavior(classroomId: string, callback: (behaviors: BehaviorRecord[]) => void) {
  const path = 'behavior';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: BehaviorRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addBehaviorRecord(record: BehaviorRecord): Promise<void> {
  const path = `behavior/${record.id}`;
  try {
    await setDoc(doc(db, 'behavior', record.id), record);

    // Adjust student points
    const userDoc = await getDoc(doc(db, 'users', record.studentId));
    if (userDoc.exists()) {
      const currentPts = userDoc.data().totalPoints || 0;
      const newPts = Math.max(0, currentPts + record.scoreDelta);
      const newLvl = Math.floor(newPts / 200) + 1;
      await updateDoc(doc(db, 'users', record.studentId), {
        totalPoints: newPts,
        level: newLvl,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= QUIZZES =================
export function subscribeQuizzes(classroomId: string, callback: (quizzes: Quiz[]) => void) {
  const path = 'quizzes';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Quiz[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveQuiz(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeQuizResults(studentId: string, callback: (results: QuizResult[]) => void) {
  const path = 'quiz_results';
  try {
    const q = query(collection(db, path), where('studentId', '==', studentId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: QuizResult[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function submitQuizResult(result: QuizResult): Promise<void> {
  const path = `quiz_results/${result.id}`;
  try {
    await setDoc(doc(db, 'quiz_results', result.id), result);

    if (result.pointsEarned > 0) {
      const userDoc = await getDoc(doc(db, 'users', result.studentId));
      if (userDoc.exists()) {
        const currentPts = userDoc.data().totalPoints || 0;
        const newPts = currentPts + result.pointsEarned;
        const newLvl = Math.floor(newPts / 200) + 1;
        await updateDoc(doc(db, 'users', result.studentId), {
          totalPoints: newPts,
          level: newLvl,
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= CHAT =================
export function subscribeMessages(classroomId: string, callback: (msgs: ChatMessage[]) => void) {
  const path = 'messages';
  try {
    const q = query(collection(db, path), where('classroomId', '==', classroomId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function sendChatMessage(msg: ChatMessage): Promise<void> {
  const path = `messages/${msg.id}`;
  try {
    await setDoc(doc(db, 'messages', msg.id), msg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= CERTIFICATES =================
export function subscribeCertificates(studentId: string, callback: (certs: Certificate[]) => void) {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), where('studentId', '==', studentId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Certificate[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        callback(list.sort((a, b) => (b.issuedDate || '').localeCompare(a.issuedDate || '')));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function issueCertificate(cert: Certificate): Promise<void> {
  const path = `certificates/${cert.id}`;
  try {
    await setDoc(doc(db, 'certificates', cert.id), cert);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Aliases for convenient importing
export {
  subscribeClassrooms as subscribeToClassrooms,
  subscribeAssignments as subscribeToAssignments,
  subscribeSubmissions as subscribeToSubmissions,
  subscribeAttendance as subscribeToAttendance,
  subscribeBehavior as subscribeToBehaviors,
  subscribeQuizzes as subscribeToQuizzes,
  subscribeLessons as subscribeToLessons,
  subscribeMessages as subscribeToMessages,
  subscribeCertificates as subscribeToCertificates,
};
