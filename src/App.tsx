/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  Plus,
  Search,
  Trash2,
  Clock,
  Check,
  X,
  User as UserIcon,
  LogIn,
  LogOut,
  RotateCcw,
  Phone,
} from 'lucide-react';

// =========================================================================
// TYPES
// =========================================================================

export type BookGenre = 'English Literature' | 'Mathematics' | 'Coding' | 'Science' | 'General';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: BookGenre;
  isAvailable: boolean;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
  type: 'STUDENT' | 'FACULTY';
}

export interface BorrowRecord {
  id: number;
  bookId: number;
  bookTitle: string;
  memberId: number;
  memberName: string;
  memberType: 'STUDENT' | 'FACULTY';
  issueTime: string;
  returnTime: string | null;
  status: 'ISSUED' | 'RETURNED';
}

// =========================================================================
// SEED DATA
// =========================================================================

const INITIAL_BOOKS: Book[] = [
  { id: 1, title: 'Introduction to Java Programming', author: 'Daniel Liang', genre: 'Coding', isAvailable: true },
  { id: 2, title: 'Head First Java', author: 'Kathy Sierra', genre: 'Coding', isAvailable: false },
  { id: 3, title: 'Clean Code: A Handbook of Agile Craftsmanship', author: 'Robert C. Martin', genre: 'Coding', isAvailable: true },
  { id: 4, title: 'Data Structures and Algorithms in Java', author: 'Robert Lafore', genre: 'Coding', isAvailable: true },
  { id: 5, title: 'Higher Engineering Mathematics', author: 'Dr. B. S. Grewal', genre: 'Mathematics', isAvailable: true },
  { id: 6, title: 'Discrete Mathematics & Its Applications', author: 'Kenneth H. Rosen', genre: 'Mathematics', isAvailable: false },
  { id: 7, title: 'Linear Algebra Done Right', author: 'Sheldon Axler', genre: 'Mathematics', isAvailable: true },
  { id: 8, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'English Literature', isAvailable: false },
  { id: 9, title: 'The Catcher in the Rye', author: 'J. D. Salinger', genre: 'English Literature', isAvailable: false },
  { id: 10, title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'English Literature', isAvailable: true },
  { id: 11, title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'English Literature', isAvailable: true },
  { id: 12, title: 'University Physics with Modern Physics', author: 'Hugh D. Young', genre: 'Science', isAvailable: true },
  { id: 13, title: 'Concepts of Physics', author: 'Dr. H. C. Verma', genre: 'Science', isAvailable: true },
  { id: 14, title: 'The Lean Startup', author: 'Eric Ries', genre: 'Coding', isAvailable: false },
];

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', type: 'STUDENT' },
  { id: 2, name: 'Priya Verma', phone: '9123456780', type: 'STUDENT' },
  { id: 3, name: 'Dr. S. K. Gupta', phone: '9811223344', type: 'FACULTY' },
  { id: 4, name: 'Ananya Deshmukh', phone: '9820011223', type: 'STUDENT' },
];

const INITIAL_RECORDS: BorrowRecord[] = [
  { id: 1, bookId: 2, bookTitle: 'Head First Java', memberId: 1, memberName: 'Rahul Sharma', memberType: 'STUDENT', issueTime: '2026-10-20 09:30 AM', returnTime: null, status: 'ISSUED' },
  { id: 2, bookId: 6, bookTitle: 'Discrete Mathematics & Its Applications', memberId: 2, memberName: 'Priya Verma', memberType: 'STUDENT', issueTime: '2026-10-20 11:15 AM', returnTime: null, status: 'ISSUED' },
  { id: 3, bookId: 8, bookTitle: 'The Great Gatsby', memberId: 3, memberName: 'Dr. S. K. Gupta', memberType: 'FACULTY', issueTime: '2026-10-20 02:45 PM', returnTime: null, status: 'ISSUED' },
  { id: 4, bookId: 9, bookTitle: 'The Catcher in the Rye', memberId: 4, memberName: 'Ananya Deshmukh', memberType: 'STUDENT', issueTime: '2026-10-21 08:00 AM', returnTime: null, status: 'ISSUED' },
  { id: 5, bookId: 14, bookTitle: 'The Lean Startup', memberId: 1, memberName: 'Rahul Sharma', memberType: 'STUDENT', issueTime: '2026-10-21 10:20 AM', returnTime: null, status: 'ISSUED' },
];

const STORAGE_KEY_USER = 'lib_user_clean_v7';

// =========================================================================
// API CLIENT (talks to the Java backend via the Vite /api proxy)
// =========================================================================

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiSend<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: T = null as T;
  try { data = await res.json(); } catch { /* 204 No Content */ }
  return { status: res.status, data };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'books' | 'members' | 'issue-return'>('books');

  const [user, setUser] = useState<string>('Admin');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>('Admin');

  // Data state — seeds paint instantly, then replaced by API data on mount
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [records, setRecords] = useState<BorrowRecord[]>(INITIAL_RECORDS);
  // False when the Java backend is unreachable (e.g. static hosting on Vercel)
  // — handlers then mutate local state so the app remains fully usable.
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);

  useEffect(() => {
    // Load all lists from the Java backend; fall back to local demo mode if unreachable
    (async () => {
      try {
        const [b, m, r] = await Promise.all([
          apiGet<Book[]>('/api/books'),
          apiGet<Member[]>('/api/members'),
          apiGet<BorrowRecord[]>('/api/records'),
        ]);
        setBooks(b);
        setMembers(m);
        setRecords(r);
      } catch (e) {
        console.warn('Backend unreachable — running in local demo mode (data resets on reload).', e);
        setApiAvailable(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) setUser(savedUser);
    } catch (e) { console.error(e); }
  }, []);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [searchAuthor, setSearchAuthor] = useState<string>('');

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showReturnConfirmModal, setShowReturnConfirmModal] = useState<boolean>(false);

  // Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState<BookGenre>('Coding');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberType, setNewMemberType] = useState<'STUDENT' | 'FACULTY'>('STUDENT');

  const [issueBookId, setIssueBookId] = useState<number>(0);
  const [issueMemberId, setIssueMemberId] = useState<number>(0);

  const [selectedReturnRecord, setSelectedReturnRecord] = useState<BorrowRecord | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getMemberBorrowLimit = (type: 'STUDENT' | 'FACULTY'): number => {
    return type === 'FACULTY' ? 5 : 2;
  };

  // Used only in local demo mode (no backend) — the API generates timestamps when available
  const getFormattedTimestamp = (): string => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = pad(hours) + ':' + pad(d.getMinutes()) + ' ' + ampm;
    return dateStr + ' ' + timeStr;
  };

  const getActiveIssuedCountForMember = (memberId: number): number => {
    return records.filter((r) => r.memberId === memberId && r.status === 'ISSUED').length;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = loginInput.trim() || 'Admin';
    setUser(val);
    localStorage.setItem(STORAGE_KEY_USER, val);
    setShowLoginModal(false);
    notify(`Signed in as ${val}`);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser('');
    notify('Signed out');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const localAdd = () => {
      const newBook: Book = {
        id: books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1,
        title: newTitle.trim(),
        author: newAuthor.trim(),
        genre: newGenre,
        isAvailable: true,
      };
      setBooks((prev) => [newBook, ...prev]);
      setNewTitle('');
      setNewAuthor('');
      setShowAddBookModal(false);
      notify(`Book added to catalog`);
    };

    if (!apiAvailable) { localAdd(); return; }

    try {
      const { status, data } = await apiSend<Book>('POST', '/api/books', {
        title: newTitle.trim(),
        author: newAuthor.trim(),
        genre: newGenre,
      });
      if (status === 201) {
        setBooks((prev) => [data, ...prev]);
        setNewTitle('');
        setNewAuthor('');
        setShowAddBookModal(false);
        notify(`Book added to catalog`);
      } else {
        notify((data as { error?: string })?.error || 'Failed to add book');
      }
    } catch {
      setApiAvailable(false);
      localAdd();
    }
  };

  const handleDeleteBook = async (id: number) => {
    const localDelete = () => {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      notify('Book removed from catalog');
    };

    if (!apiAvailable) { localDelete(); return; }

    try {
      const { status } = await apiSend('DELETE', `/api/books/${id}`);
      if (status === 204 || status === 200) {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        notify('Book removed from catalog');
      } else {
        notify('Failed to delete book');
      }
    } catch {
      setApiAvailable(false);
      localDelete();
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const localAdd = () => {
      const newM: Member = {
        id: members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1,
        name: newMemberName.trim(),
        phone: newMemberPhone.trim(),
        type: newMemberType,
      };
      setMembers((prev) => [...prev, newM]);
      setNewMemberName('');
      setNewMemberPhone('');
      setShowAddMemberModal(false);
      notify(`Member registered`);
    };

    if (!apiAvailable) { localAdd(); return; }

    try {
      const { status, data } = await apiSend<Member>('POST', '/api/members', {
        name: newMemberName.trim(),
        phone: newMemberPhone.trim(),
        type: newMemberType,
      });
      if (status === 201) {
        setMembers((prev) => [...prev, data]);
        setNewMemberName('');
        setNewMemberPhone('');
        setShowAddMemberModal(false);
        notify(`Member registered`);
      } else {
        notify((data as { error?: string })?.error || 'Failed to register member');
      }
    } catch {
      setApiAvailable(false);
      localAdd();
    }
  };

  const handleDeleteMember = async (id: number) => {
    const localDelete = () => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      notify('Member removed');
    };

    if (!apiAvailable) { localDelete(); return; }

    try {
      const { status } = await apiSend('DELETE', `/api/members/${id}`);
      if (status === 204 || status === 200) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        notify('Member removed');
      } else {
        notify('Failed to remove member');
      }
    } catch {
      setApiAvailable(false);
      localDelete();
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const available = books.filter((b) => b.isAvailable);
    const bId = issueBookId || (available[0] ? available[0].id : 0);
    const mId = issueMemberId || (members[0] ? members[0].id : 0);

    const b = books.find((x) => x.id === bId);
    const m = members.find((x) => x.id === mId);

    if (!b || !m || !b.isAvailable) {
      notify('Selected book is unavailable');
      return;
    }

    const currentHolding = getActiveIssuedCountForMember(m.id);
    const quota = getMemberBorrowLimit(m.type);
    if (currentHolding >= quota) {
      notify(`Quota reached: limit is ${quota} books`);
      return;
    }

    const localIssue = () => {
      const newRec: BorrowRecord = {
        id: records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1,
        bookId: b.id,
        bookTitle: b.title,
        memberId: m.id,
        memberName: m.name,
        memberType: m.type,
        issueTime: getFormattedTimestamp(),
        returnTime: null,
        status: 'ISSUED',
      };
      setRecords((prev) => [newRec, ...prev]);
      setBooks((prev) => prev.map((x) => (x.id === b.id ? { ...x, isAvailable: false } : x)));
      setShowIssueModal(false);
      notify(`Issued at ${newRec.issueTime}`);
    };

    if (!apiAvailable) { localIssue(); return; }

    try {
      const { status, data } = await apiSend<BorrowRecord | { error: string }>('POST', '/api/issue', {
        bookId: b.id,
        memberId: m.id,
      });

      if (status === 201) {
        const rec = data as BorrowRecord;
        setRecords((prev) => [rec, ...prev]);
        setBooks((prev) => prev.map((x) => (x.id === b.id ? { ...x, isAvailable: false } : x)));
        setShowIssueModal(false);
        notify(`Issued at ${rec.issueTime}`);
      } else {
        notify((data as { error?: string })?.error || 'Failed to issue book');
      }
    } catch {
      setApiAvailable(false);
      localIssue();
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedReturnRecord) return;

    const localReturn = () => {
      const returnTimestamp = getFormattedTimestamp();
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedReturnRecord.id ? { ...r, returnTime: returnTimestamp, status: 'RETURNED' as const } : r
        )
      );
      setBooks((prev) => prev.map((b) => (b.id === selectedReturnRecord.bookId ? { ...b, isAvailable: true } : b)));
      setShowReturnConfirmModal(false);
      setSelectedReturnRecord(null);
      notify(`Returned at ${returnTimestamp}`);
    };

    if (!apiAvailable) { localReturn(); return; }

    try {
      const { status, data } = await apiSend<BorrowRecord | { error: string }>('POST', '/api/return', {
        recordId: selectedReturnRecord.id,
      });

      if (status === 200) {
        const updated = data as BorrowRecord;
        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setBooks((prev) => prev.map((b) => (b.id === updated.bookId ? { ...b, isAvailable: true } : b)));
        setShowReturnConfirmModal(false);
        setSelectedReturnRecord(null);
        notify(`Returned at ${updated.returnTime}`);
      } else {
        notify((data as { error?: string })?.error || 'Failed to return book');
      }
    } catch {
      setApiAvailable(false);
      localReturn();
    }
  };

  const filteredBooks = books.filter((b) => {
    const genreMatch = selectedGenre === 'All' || b.genre === selectedGenre;
    const titleMatch = !searchTitle || b.title.toLowerCase().includes(searchTitle.toLowerCase());
    const authorMatch = !searchAuthor || b.author.toLowerCase().includes(searchAuthor.toLowerCase());
    return genreMatch && titleMatch && authorMatch;
  });

  const availableBooks = books.filter((b) => b.isAvailable);
  const activeIssuedRecords = records.filter((r) => r.status === 'ISSUED');

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col antialiased selection:bg-slate-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-[4px] shadow-md text-xs font-medium flex items-center gap-2">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          BACKGROUND HEADER ARTWORK
          Using the user's provided desktop banner image
          ========================================================================= */}
      <div className="w-full h-40 sm:h-48 md:h-52 overflow-hidden bg-[#faf7f2] border-b border-slate-200 relative select-none">
        <img
          src="/assets/aistudio/desktop_85bf147a.webp"
          alt="Library System"
          className="w-full h-full object-cover object-top opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 pointer-events-none" />
      </div>

      {/* =========================================================================
          PRIMARY NAVBAR
          Books | Active Members | Issue / Return
          Clean, less rounded, professional typography, vector icons only.
          ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand Logo & Title (without extraneous AI subtext) */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-slate-900 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Library Management System
            </span>
          </div>

          {/* Navigation Links: Exactly 3 items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                activeTab === 'books'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Books</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                activeTab === 'members'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Members</span>
            </button>

            <button
              onClick={() => setActiveTab('issue-return')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                activeTab === 'issue-return'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Issue / Return</span>
            </button>
          </nav>

          {/* User Status / Action */}
          <div className="flex items-center text-xs">
            {user ? (
              <div className="flex items-center gap-2 border border-slate-200 px-2.5 py-1 rounded-[4px] bg-slate-50">
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-medium text-slate-800">{user}</span>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-[4px] bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          PAGE CONTENT: INDEPENDENT PAGES WITH WHITE BACKGROUND
          ========================================================================= */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 bg-white">
        
        {/* =======================================================================
            PAGE 1: BOOKS (INDEPENDENT)
            ======================================================================= */}
        {activeTab === 'books' && (
          <div className="space-y-4">
            {/* Header bar without random subtext */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Books Catalog</h1>
              </div>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Book</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[4px]">
              {/* Genre Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1">
                {(['All', 'Coding', 'Mathematics', 'English Literature', 'Science'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-[4px] transition-colors cursor-pointer border ${
                      selectedGenre === g
                        ? 'bg-white border-slate-300 text-slate-900 font-semibold shadow-xs'
                        : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Search Inputs */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search title..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-[4px] bg-white w-36 sm:w-44 focus:outline-slate-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Author..."
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-[4px] bg-white w-28 sm:w-36 focus:outline-slate-400"
                />
                {(searchTitle || searchAuthor || selectedGenre !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTitle('');
                      setSearchAuthor('');
                      setSelectedGenre('All');
                    }}
                    className="p-1.5 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 rounded-[4px] bg-white cursor-pointer"
                    title="Reset search"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Books Table */}
            <div className="border border-slate-200 rounded-[4px] overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold w-16">ID</th>
                    <th className="p-3 font-semibold">Title</th>
                    <th className="p-3 font-semibold">Author</th>
                    <th className="p-3 font-semibold">Genre</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No books match the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-slate-400 font-mono">#{b.id}</td>
                        <td className="p-3 font-medium text-slate-900">{b.title}</td>
                        <td className="p-3 text-slate-600">{b.author}</td>
                        <td className="p-3 text-slate-600">{b.genre}</td>
                        <td className="p-3">
                          {b.isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 text-xs font-medium">
                              <Check className="w-3 h-3 text-slate-700" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Borrowed
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-3">
                          {b.isAvailable && (
                            <button
                              onClick={() => {
                                setIssueBookId(b.id);
                                setShowIssueModal(true);
                              }}
                              className="text-slate-900 hover:underline font-medium cursor-pointer"
                            >
                              Issue
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBook(b.id)}
                            className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =======================================================================
            PAGE 2: ACTIVE MEMBERS (INDEPENDENT)
            ======================================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Active Members</h1>
              </div>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Member</span>
              </button>
            </div>

            {/* Member Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((m) => {
                const holdingBooks = records.filter((r) => r.memberId === m.id && r.status === 'ISSUED');
                const quota = getMemberBorrowLimit(m.type);
                const isMax = holdingBooks.length >= quota;

                return (
                  <div
                    key={m.id}
                    className="border border-slate-200 rounded-[4px] p-4 bg-white flex flex-col justify-between"
                  >
                    <div>
                      {/* Member Info */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {m.phone}
                            </span>
                            <span>&bull;</span>
                            <span className="font-medium text-slate-700">{m.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                              isMax
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {holdingBooks.length} / {quota} Borrowed
                          </span>
                        </div>
                      </div>

                      {/* Books Held by Member */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          Currently Borrowed:
                        </div>
                        {holdingBooks.length === 0 ? (
                          <div className="text-xs text-slate-400 italic">No books borrowed</div>
                        ) : (
                          <div className="space-y-2">
                            {holdingBooks.map((rec) => (
                              <div
                                key={rec.id}
                                className="border border-slate-200 p-2.5 rounded-[4px] flex items-center justify-between text-xs bg-slate-50/50"
                              >
                                <div className="truncate pr-2">
                                  <div className="font-medium text-slate-900 truncate">{rec.bookTitle}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Issued: {rec.issueTime}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedReturnRecord(rec);
                                    setShowReturnConfirmModal(true);
                                  }}
                                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-[4px] font-medium cursor-pointer text-xs"
                                >
                                  Return
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Member Card Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {!isMax ? (
                        <button
                          onClick={() => {
                            setIssueMemberId(m.id);
                            setShowIssueModal(true);
                          }}
                          className="text-slate-800 hover:underline font-medium cursor-pointer"
                        >
                          + Issue Book
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Limit reached</span>
                      )}
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =======================================================================
            PAGE 3: ISSUE / RETURN DESK (INDEPENDENT)
            ======================================================================= */}
        {activeTab === 'issue-return' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h1 className="text-lg font-bold text-slate-900">Issue / Return Desk</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issue Desk Form */}
              <div className="border border-slate-200 rounded-[4px] p-5 bg-white">
                <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-4">
                  Issue Book
                </h2>

                {availableBooks.length === 0 ? (
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-[4px] border border-slate-200 text-xs">
                    No books are currently available for issue.
                  </div>
                ) : (
                  <form onSubmit={handleIssueBook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Book:
                      </label>
                      <select
                        value={issueBookId || availableBooks[0]?.id}
                        onChange={(e) => setIssueBookId(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                      >
                        {availableBooks.map((b) => (
                          <option key={b.id} value={b.id}>
                            #{b.id} - {b.title} ({b.genre})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Member:
                      </label>
                      <select
                        value={issueMemberId || members[0]?.id}
                        onChange={(e) => setIssueMemberId(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                      >
                        {members.map((m) => {
                          const count = getActiveIssuedCountForMember(m.id);
                          const quota = getMemberBorrowLimit(m.type);
                          return (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.type}) &bull; {count}/{quota} Borrowed
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 rounded-[4px] cursor-pointer transition-colors"
                      >
                        Confirm Issue
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Return Desk List */}
              <div className="border border-slate-200 rounded-[4px] p-5 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                  <h2 className="font-bold text-sm text-slate-900">Return Book</h2>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeIssuedRecords.length} Active
                  </span>
                </div>

                {activeIssuedRecords.length === 0 ? (
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-[4px] border border-slate-200 text-xs">
                    No books are currently checked out.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {activeIssuedRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="border border-slate-200 p-3 rounded-[4px] flex items-center justify-between text-xs bg-slate-50/50"
                      >
                        <div className="truncate pr-3">
                          <div className="font-semibold text-slate-900 truncate">{rec.bookTitle}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Borrower: {rec.memberName} ({rec.memberType})
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Issued: {rec.issueTime}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedReturnRecord(rec);
                            setShowReturnConfirmModal(true);
                          }}
                          className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-[4px] font-medium cursor-pointer text-xs"
                        >
                          Return
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS WITH CLEAN RECTANGULAR EDGES & CRISP STYLING
          ========================================================================= */}

      {/* Modal 1: Add Book */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] p-5 max-w-sm w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Book</h3>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert C. Martin"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Genre</label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value as BookGenre)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                >
                  <option value="Coding">Coding</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Literature">English Literature</option>
                  <option value="Science">Science</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] p-5 max-w-sm w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Register Member</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9812345678"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Classification</label>
                <select
                  value={newMemberType}
                  onChange={(e) => setNewMemberType(e.target.value as 'STUDENT' | 'FACULTY')}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                >
                  <option value="STUDENT">Student (Limit: 2 books)</option>
                  <option value="FACULTY">Faculty (Limit: 5 books)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] font-medium cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Issue Book */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] p-5 max-w-sm w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Issue Book</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {availableBooks.length === 0 ? (
              <div className="text-xs text-slate-600 space-y-3">
                <p>No available books.</p>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="w-full py-1.5 text-xs bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleIssueBook} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Book</label>
                  <select
                    value={issueBookId || availableBooks[0]?.id}
                    onChange={(e) => setIssueBookId(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                  >
                    {availableBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        #{b.id} - {b.title} ({b.genre})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Member</label>
                  <select
                    value={issueMemberId || members[0]?.id}
                    onChange={(e) => setIssueMemberId(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                  >
                    {members.map((m) => {
                      const count = getActiveIssuedCountForMember(m.id);
                      const quota = getMemberBorrowLimit(m.type);
                      return (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type}) &bull; {count}/{quota}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] font-medium cursor-pointer"
                  >
                    Confirm Issue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 4: Confirm Return */}
      {showReturnConfirmModal && selectedReturnRecord && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] p-5 max-w-sm w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Confirm Return</h3>
              <button
                onClick={() => setShowReturnConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="border border-slate-200 p-3 rounded-[4px] space-y-1 bg-slate-50/50">
                <div>
                  <span className="text-slate-500">Book:</span> <strong>{selectedReturnRecord.bookTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Member:</span> {selectedReturnRecord.memberName} ({selectedReturnRecord.memberType})
                </div>
                <div className="text-slate-500 font-mono pt-1 text-[11px]">
                  Issued: {selectedReturnRecord.issueTime}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnConfirmModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] font-medium cursor-pointer"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] p-5 max-w-xs w-full shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Sign In</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="e.g. Admin or Librarian"
                  className="w-full text-xs p-2 border border-slate-300 rounded-[4px] bg-white focus:outline-slate-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-[4px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[4px] font-medium cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
