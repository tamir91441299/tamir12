import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Filter,
  Eye,
  Crown,
  Video,
  Film,
  Play,
  Save,
  Link as LinkIcon,
  Bell,
  Clock,
  UserPlus,
  Ticket,
  Copy,
  Check,
  KeyRound,
  Gift,
  Minus,
  Sliders,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { UserAccount } from './AuthModal';
import { Movie } from '../types';
import { SAMPLE_MOVIES } from '../data/movies';
import {
  subscribeUsersFromFirestore,
  saveUserToFirestore,
  subscribeNotificationsFromFirestore,
  deduplicateUserList,
  AppNotification
} from '../lib/userService';
import {
  PromoCode,
  getAllPromoCodes,
  savePromoCode,
  deletePromoCode,
  subscribePromoCodesFromFirestore
} from '../lib/codeService';

export interface UserDetail extends UserAccount {
  role: 'admin' | 'user' | 'vip';
  status: 'active' | 'blocked';
  packageType: 'full_vip' | 'movie' | 'anime' | 'free';
  packageExpiry: string;
  walletBalance: number;
  lastLogin: string;
  watchedCount: number;
  favoriteCount: number;
}

interface UserManagementModalProps {
  currentUser: UserAccount | null;
  onClose: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  movies?: Movie[];
  onUpdateMovieEpisodes?: (movieId: string, episodes: any[]) => void;
}

export const INITIAL_USERS: UserDetail[] = [
  {
    id: 'usr_001',
    name: 'Тамир (Админ)',
    email: 'admin@ioio.mn',
    phone: '91441299',
    role: 'admin',
    status: 'active',
    packageType: 'full_vip',
    packageExpiry: '2027-01-01',
    walletBalance: 0,
    registeredAt: '2026-01-10',
    lastLogin: 'Өнөөдөр, 21:15',
    watchedCount: 42,
    favoriteCount: 15,
  },
  {
    id: 'usr_002',
    name: 'Бат-Эрдэнэ',
    email: 'bat.erdene@gmail.com',
    phone: '99112233',
    role: 'vip',
    status: 'active',
    packageType: 'full_vip',
    packageExpiry: '2026-10-15',
    walletBalance: 0,
    registeredAt: '2026-02-01',
    lastLogin: 'Өчигдөр, 18:30',
    watchedCount: 28,
    favoriteCount: 8,
  },
  {
    id: 'usr_003',
    name: 'Анужин',
    email: 'anujin.b@yahoo.com',
    phone: '88105544',
    role: 'user',
    status: 'active',
    packageType: 'anime',
    packageExpiry: '2026-09-01',
    walletBalance: 0,
    registeredAt: '2026-03-12',
    lastLogin: 'Өнөөдөр, 14:20',
    watchedCount: 19,
    favoriteCount: 6,
  },
  {
    id: 'usr_004',
    name: 'Ганзориг',
    email: 'ganzorig99@gmail.com',
    phone: '99087766',
    role: 'user',
    status: 'active',
    packageType: 'movie',
    packageExpiry: '2026-08-30',
    walletBalance: 0,
    registeredAt: '2026-04-05',
    lastLogin: '3 хоногийн өмнө',
    watchedCount: 11,
    favoriteCount: 3,
  },
  {
    id: 'usr_005',
    name: 'Мөнх-Оргил',
    email: 'morko@mn.net',
    phone: '95551212',
    role: 'user',
    status: 'blocked',
    packageType: 'free',
    packageExpiry: '-',
    walletBalance: 0,
    registeredAt: '2026-05-20',
    lastLogin: '2 долоо хоногийн өмнө',
    watchedCount: 2,
    favoriteCount: 0,
  },
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  onClose,
  userBalance,
  onUpdateBalance,
  movies,
  onUpdateMovieEpisodes,
}) => {
  const [users, setUsers] = useState<UserDetail[]>(() => {
    const rawList: UserDetail[] = [];
    const saved = localStorage.getItem('ioio_registered_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (u) rawList.push(u);
          });
        }
      } catch (e) {
        // fallback
      }
    }

    INITIAL_USERS.forEach((u) => rawList.push(u));

    // Include current user if exists
    if (currentUser) {
      rawList.unshift({
        ...currentUser,
        role: currentUser.email === 'tamir91441299@gmail.com' ? 'admin' : 'user',
        status: 'active',
        packageType: 'free',
        packageExpiry: '-',
        walletBalance: userBalance,
        lastLogin: 'Идэвхтэй одоо',
        watchedCount: 1,
        favoriteCount: 0,
      });
    }
    return deduplicateUserList(rawList);
  });

  const [search, setSearch] = useState('');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  // Points & Balance Management state
  const [pointsModalUser, setPointsModalUser] = useState<UserDetail | null>(null);
  const [pointsOperation, setPointsOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [pointsInputAmount, setPointsInputAmount] = useState<number>(4000);
  const [selectedGrantPkg, setSelectedGrantPkg] = useState<'none' | 'full_vip' | 'movie' | 'anime'>('none');

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    packageType: 'free' as 'full_vip' | 'movie' | 'anime' | 'free',
    walletBalance: 0,
  });

  // Admin Mode Tabs: 'users' | 'episodes' | 'notifications' | 'codes'
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'episodes' | 'notifications' | 'codes'>('users');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [promoCodesList, setPromoCodesList] = useState<PromoCode[]>(() => getAllPromoCodes());
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // New Promo Code Form State
  const [newCodeForm, setNewCodeForm] = useState({
    code: '',
    type: 'full_vip' as 'full_vip' | 'anime' | 'movie' | 'points',
    value: 5000,
    durationDays: 30,
    description: '',
    maxUses: 100,
  });

  const [selectedMovieId, setSelectedMovieId] = useState<string>('m15'); // Blue Lock S1 default
  const [epNumInput, setEpNumInput] = useState<number>(1);
  const [epTitleInput, setEpTitleInput] = useState<string>('');
  const [epUrlInput, setEpUrlInput] = useState<string>('https://youtu.be/VZPAg8iR8sk');
  const [epDurationInput, setEpDurationInput] = useState<string>('24 мин');

  const allMoviesList = movies || SAMPLE_MOVIES;
  const currentSelectedMovie = allMoviesList.find((m) => m.id === selectedMovieId) || allMoviesList[0];
  const currentMovieEpisodes = currentSelectedMovie?.episodes || [];

  const handleAddOrUpdateEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!epUrlInput.trim() || !currentSelectedMovie) return;

    const title = epTitleInput.trim() || `${epNumInput}-р анги`;
    const newEp = {
      episodeNumber: Number(epNumInput),
      title,
      duration: epDurationInput.trim() || '24 мин',
      videoUrl: epUrlInput.trim()
    };

    const updated = [...currentMovieEpisodes.filter((ep) => ep.episodeNumber !== Number(epNumInput)), newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
    if (onUpdateMovieEpisodes) {
      onUpdateMovieEpisodes(currentSelectedMovie.id, updated);
    }

    setEpTitleInput('');
    setEpNumInput(updated.length + 1);
  };

  const handleDeleteEpisode = (epNumToDelete: number) => {
    if (!currentSelectedMovie) return;
    const updated = currentMovieEpisodes.filter((ep) => ep.episodeNumber !== epNumToDelete);
    if (onUpdateMovieEpisodes) {
      onUpdateMovieEpisodes(currentSelectedMovie.id, updated);
    }
  };

  const handleResetMovieEpisodes = () => {
    if (!currentSelectedMovie) return;
    const defaultMovie = SAMPLE_MOVIES.find((m) => m.id === currentSelectedMovie.id);
    if (defaultMovie && onUpdateMovieEpisodes) {
      onUpdateMovieEpisodes(currentSelectedMovie.id, defaultMovie.episodes || []);
    }
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['VIP', 'CINEMA', 'FLICK', 'BONUS', 'IOIO', 'PROMO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setNewCodeForm((prev) => ({
      ...prev,
      code: `${prefix}-${randNum}`,
      description: `${prefix}-${randNum} Тусгай урамшууллын эрхийн код`,
    }));
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeForm.code.trim()) return;

    const saved = await savePromoCode({
      code: newCodeForm.code.trim().toUpperCase(),
      type: newCodeForm.type,
      value: newCodeForm.type === 'points' ? Number(newCodeForm.value) : 0,
      durationDays: newCodeForm.type !== 'points' ? Number(newCodeForm.durationDays) : 30,
      description: newCodeForm.description.trim() || `${newCodeForm.code.toUpperCase()} Эрхийн Код`,
      maxUses: Number(newCodeForm.maxUses) || 100,
      isActive: true,
      createdBy: currentUser?.name || 'Admin',
    });

    setPromoCodesList((prev) => [saved, ...prev.filter((c) => c.code !== saved.code)]);
    setNewCodeForm({
      code: '',
      type: 'full_vip',
      value: 5000,
      durationDays: 30,
      description: '',
      maxUses: 100,
    });
  };

  const handleDeleteCode = async (codeId: string) => {
    await deletePromoCode(codeId);
    setPromoCodesList((prev) => prev.filter((c) => c.id !== codeId && c.code !== codeId));
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  useEffect(() => {
    const unsubscribeUsers = subscribeUsersFromFirestore((list) => {
      setUsers(deduplicateUserList(list));
    });
    const unsubscribeNotifs = subscribeNotificationsFromFirestore((notifs) => {
      setNotifications(notifs);
    });
    const unsubscribeCodes = subscribePromoCodesFromFirestore((codes) => {
      setPromoCodesList(codes);
    });
    return () => {
      unsubscribeUsers();
      unsubscribeNotifs();
      unsubscribeCodes();
    };
  }, []);

  const saveUsersState = (updatedUsers: UserDetail[]) => {
    const deduplicated = deduplicateUserList(updatedUsers);
    setUsers(deduplicated);
    localStorage.setItem('ioio_registered_users_list', JSON.stringify(deduplicated));
    deduplicated.forEach((u) => {
      saveUserToFirestore(u);
    });
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'active' ? ('blocked' as const) : ('active' as const),
        };
      }
      return u;
    });
    saveUsersState(updated);
  };

  const handleChangePackage = (id: string, newPkg: 'full_vip' | 'movie' | 'anime' | 'free') => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return {
          ...u,
          packageType: newPkg,
          packageExpiry: newPkg === 'free' ? '-' : expiryDate.toISOString().split('T')[0],
          role: newPkg === 'full_vip' ? ('vip' as const) : u.role,
        };
      }
      return u;
    });
    saveUsersState(updated);
    if (selectedUser && selectedUser.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleExtendPackage = (id: string, newPkg: 'full_vip' | 'movie' | 'anime' | 'free', daysToAdd: number) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        if (newPkg === 'free') {
          return {
            ...u,
            packageType: 'free' as const,
            packageExpiry: '-',
            role: 'user' as const,
          };
        }

        let baseDate = new Date();
        if (u.packageExpiry && u.packageExpiry !== '-' && !isNaN(new Date(u.packageExpiry).getTime())) {
          const currentExpiry = new Date(u.packageExpiry);
          if (currentExpiry.getTime() > Date.now()) {
            baseDate = currentExpiry;
          }
        }
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        const expiryStr = baseDate.toISOString().split('T')[0];

        return {
          ...u,
          packageType: newPkg,
          packageExpiry: expiryStr,
          role: newPkg === 'full_vip' ? ('vip' as const) : u.role,
        };
      }
      return u;
    });
    saveUsersState(updated);
    if (selectedUser && selectedUser.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleSetCustomExpiryDate = (id: string, dateStr: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          packageExpiry: dateStr || '-',
        };
      }
      return u;
    });
    saveUsersState(updated);
    if (selectedUser && selectedUser.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleToggleAdminRole = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextRole = u.role === 'admin' ? 'user' : 'admin';
        return {
          ...u,
          role: nextRole as 'admin' | 'user' | 'vip',
        };
      }
      return u;
    });
    saveUsersState(updated);
    if (selectedUser && selectedUser.id === id) {
      const updatedUser = updated.find((u) => u.id === id);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleOpenPointsModal = (
    user: UserDetail,
    defaultOp: 'add' | 'subtract' | 'set' = 'add',
    defaultAmt: number = 4000
  ) => {
    setPointsModalUser(user);
    setPointsOperation(defaultOp);
    setPointsInputAmount(defaultAmt);
    setSelectedGrantPkg('none');
  };

  const handleAdjustUserPoints = (
    userId: string,
    operation: 'add' | 'subtract' | 'set',
    amount: number,
    grantPkg: 'none' | 'full_vip' | 'movie' | 'anime' = 'none'
  ) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    let newBal = target.walletBalance;
    const safeAmt = Math.max(0, Number(amount) || 0);

    if (operation === 'add') {
      newBal = target.walletBalance + safeAmt;
    } else if (operation === 'subtract') {
      newBal = Math.max(0, target.walletBalance - safeAmt);
    } else if (operation === 'set') {
      newBal = safeAmt;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        let pkgUpdates: Partial<UserDetail> = {};
        if (grantPkg && grantPkg !== 'none') {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          pkgUpdates = {
            packageType: grantPkg,
            packageExpiry: expiryDate.toISOString().split('T')[0],
            role: grantPkg === 'full_vip' ? 'vip' : u.role,
          };
        }

        const updatedU: UserDetail = {
          ...u,
          walletBalance: newBal,
          ...pkgUpdates,
        };

        if (currentUser && (u.email === currentUser.email || u.id === currentUser.id)) {
          onUpdateBalance(newBal);
          try {
            localStorage.setItem('ioio_balance', String(newBal));
          } catch (e) {}
        }

        return updatedU;
      }
      return u;
    });

    saveUsersState(updated);
    setPointsModalUser(null);

    if (selectedUser && selectedUser.id === userId) {
      const updatedUser = updated.find((u) => u.id === userId);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleQuickPointsChange = (userId: string, delta: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newBal = Math.max(0, target.walletBalance + delta);
    const updated = users.map((u) => {
      if (u.id === userId) {
        const updatedU = { ...u, walletBalance: newBal };
        if (currentUser && (u.email === currentUser.email || u.id === currentUser.id)) {
          onUpdateBalance(newBal);
          try {
            localStorage.setItem('ioio_balance', String(newBal));
          } catch (e) {}
        }
        return updatedU;
      }
      return u;
    });

    saveUsersState(updated);
    if (selectedUser && selectedUser.id === userId) {
      const updatedUser = updated.find((u) => u.id === userId);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) return;

    const newUser: UserDetail = {
      id: 'usr_' + Date.now(),
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim() || `${Date.now()}@ioio.mn`,
      phone: newUserForm.phone.trim() || '99110000',
      role: newUserForm.packageType === 'full_vip' ? 'vip' : 'user',
      status: 'active',
      packageType: newUserForm.packageType,
      packageExpiry: newUserForm.packageType === 'free' ? '-' : '2026-12-31',
      walletBalance: Number(newUserForm.walletBalance) || 0,
      registeredAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Саяхан бүртгүүлсэн',
      watchedCount: 0,
      favoriteCount: 0,
    };

    saveUsersState([newUser, ...users]);
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      packageType: 'full_vip',
      walletBalance: 10000,
    });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Та энэ хэрэглэгчийн бүртгэлийг устгахдаа итгэлтэй байна уу?')) {
      const updated = users.filter((u) => u.id !== id);
      saveUsersState(updated);
      if (selectedUser?.id === id) setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);

    const matchesPkg = filterPackage === 'all' || u.packageType === filterPackage;

    return matchesSearch && matchesPkg;
  });

  const getPackageBadge = (pkg: string) => {
    switch (pkg) {
      case 'full_vip':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-black">
            <Crown className="w-3 h-3 text-amber-400" /> FULL VIP
          </span>
        );
      case 'movie':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            🎬 Кино Багц
          </span>
        );
      case 'anime':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            🌸 Анимэ Багц
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-[10px]">
            Үнэгүй
          </span>
        );
    }
  };

  const isAdmin = currentUser?.email === 'tamir91441299@gmail.com' || (currentUser as any)?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#16161a] rounded-2xl border border-amber-500/40 p-6 text-center space-y-4 shadow-2xl text-zinc-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-white">⛔ Хандах Эрх Хязгаарлагдсан!</h2>
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-center">
            <p className="text-sm font-extrabold text-amber-300">
              Зөвхөн Тамир админ нэвтэрч болно
            </p>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Системийн удирдлага, хэрэглэгчдийн эрх сунгах болон видео холбоос оруулах хэсэгт зөвхөн админ нэвтрэх боломжтой.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Хаах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#141417] border border-cyan-500/30 rounded-2xl max-w-5xl w-full text-zinc-100 shadow-2xl relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-cyan-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                УДИРДАХ ХЭСЭГ (Админ Самбар)
                <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                  {users.length} Хэрэглэгч
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Админ удирдлага: Хэрэглэгчдийн эрх сунгах, VIP багц олгох, үлдэгдэл цэнэглэх, бүртгэл хянах
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Хэрэглэгч Нэмэх</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-0 bg-zinc-900/90 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
              activeAdminTab === 'users'
                ? 'bg-zinc-800 text-cyan-400 border-cyan-400 shadow'
                : 'text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Хэрэглэгчдийн Удирдлага ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('episodes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
              activeAdminTab === 'episodes'
                ? 'bg-zinc-800 text-cyan-400 border-cyan-400 shadow'
                : 'text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/50'
            }`}
          >
            <Video className="w-4 h-4 text-amber-400" />
            <span>Анимэ & Анги Удирдах ({allMoviesList.filter(m => m.episodes && m.episodes.length > 0).length} контент)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
              activeAdminTab === 'notifications'
                ? 'bg-zinc-800 text-amber-400 border-amber-400 shadow'
                : 'text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/50'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Firebase Мэдэгдэл</span>
            {notifications.length > 0 && (
              <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            id="admin-tab-codes"
            onClick={() => setActiveAdminTab('codes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 ${
              activeAdminTab === 'codes'
                ? 'bg-zinc-800 text-emerald-400 border-emerald-400 shadow'
                : 'text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/50'
            }`}
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>🎟️ Эрхийн Код / Промо ({promoCodesList.length})</span>
          </button>
        </div>

        {activeAdminTab === 'users' ? (
          <>
            {/* Filters and Search Bar */}
            <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Нэр, э-мэйл, дугаараар хайх..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-400 shrink-0">Багцаар:</span>
                <select
                  value={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 py-2 px-3 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">Бүх багц</option>
                  <option value="full_vip">FULL VIP</option>
                  <option value="movie">Кино Багц</option>
                  <option value="anime">Анимэ Багц</option>
                  <option value="free">Үнэгүй</option>
                </select>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="sm:hidden flex items-center gap-1 bg-cyan-500 text-black font-extrabold text-xs px-3 py-2 rounded-xl shrink-0 ml-auto"
                >
                  <Plus className="w-4 h-4" /> Нэмэх
                </button>
              </div>
            </div>

            {/* User Table List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Хайлтад тохирох хэрэглэгч олдсонгүй.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredUsers.map((u, idx) => (
                <div
                  key={`user_row_${u.id}_${idx}`}
                  className={`bg-zinc-900/90 hover:bg-zinc-800/80 border rounded-2xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    u.status === 'blocked'
                      ? 'border-rose-900/50 opacity-60'
                      : u.role === 'admin'
                      ? 'border-cyan-500/40 bg-cyan-950/10'
                      : 'border-zinc-800'
                  }`}
                >
                  {/* Left: User info */}
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-md shrink-0 uppercase ${
                        u.role === 'admin'
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-black'
                          : u.packageType === 'full_vip'
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black'
                          : 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">
                            АДМИН
                          </span>
                        )}
                        {getPackageBadge(u.packageType)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-500" /> {u.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-500" /> {u.phone}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 pt-0.5">
                        <span>Бүртгүүлсэн: {u.registeredAt}</span>
                        <span>•</span>
                        <span>Сүүлд: {u.lastLogin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Wallet & Stats */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 text-xs w-full md:w-auto justify-between md:justify-start">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-emerald-400" />
                        Хэтэвч / Оноо:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-emerald-400 text-sm">
                          {u.walletBalance.toLocaleString()} ₮
                        </span>
                      </div>
                    </div>

                    {/* Fast +/- Presets right in the table */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickPointsChange(u.id, 4000)}
                        className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 px-1.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer shadow-sm"
                        title="+4,000₮ (1 сарын кино/анимэ эрхийн оноо нэмэх)"
                      >
                        +4k
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPointsChange(u.id, 7000)}
                        className="bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700/60 px-1.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer shadow-sm"
                        title="+7,000₮ (1 сарын FULL VIP эрхийн оноо нэмэх)"
                      >
                        +7k
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPointsChange(u.id, -4000)}
                        disabled={u.walletBalance < 4000}
                        className="bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-700/60 disabled:opacity-30 px-1.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer shadow-sm"
                        title="-4,000₮ (Эрхийн оноо хасах)"
                      >
                        -4k
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenPointsModal(u, 'add', 4000)}
                        className="bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 px-2 py-1 rounded text-[10px] font-extrabold flex items-center gap-0.5 transition-all cursor-pointer"
                        title="Оноо нэмэх / хасах дэлгэрэнгүй цонх"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <Minus className="w-2.5 h-2.5" />
                        <span>Оноо</span>
                      </button>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-zinc-800" />

                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                        Үзсэн:
                      </span>
                      <span className="font-bold text-zinc-200">{u.watchedCount} кино</span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-zinc-800" />

                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                        Дуусах:
                      </span>
                      <span className="font-semibold text-amber-300">{u.packageExpiry}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    {/* View User Detail Button */}
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Мэдээлэл харах"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* Manage Points (+ / -) Button */}
                    <button
                      onClick={() => handleOpenPointsModal(u, 'add', 4000)}
                      className="bg-gradient-to-r from-emerald-950 to-cyan-950 hover:from-emerald-900 hover:to-cyan-900 text-emerald-300 border border-emerald-600/70 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Оноо Нэмэх / Хасах"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>+/- Оноо</span>
                    </button>

                    {/* Change Package Dropdown */}
                    <select
                      value={u.packageType}
                      onChange={(e) => handleChangePackage(u.id, e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 py-1.5 px-2 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer font-bold"
                    >
                      <option value="full_vip">FULL VIP</option>
                      <option value="movie">Кино Багц</option>
                      <option value="anime">Анимэ Багц</option>
                      <option value="free">Үнэгүй</option>
                    </select>

                    {/* Toggle Admin Role Button */}
                    <button
                      onClick={() => handleToggleAdminRole(u.id)}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40'
                      }`}
                      title={u.role === 'admin' ? 'Админ эрхтэй (Эрх цуцлах)' : 'Админ эрх олгох'}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      }`}
                      title={u.status === 'active' ? 'Идэвхтэй (Блокпох)' : 'Блоклогдсон (Идэвхжүүлэх)'}
                    >
                      {u.status === 'active' ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete User */}
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 bg-zinc-800 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal footer summary */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Идэвхтэй VIP: <strong className="text-amber-300">{users.filter((u) => u.packageType === 'full_vip').length}</strong>
            </span>
            <span>
              Нийт Хэтэвчний Дүн:{' '}
              <strong className="text-emerald-400">
                {users.reduce((acc, u) => acc + u.walletBalance, 0).toLocaleString()} ₮
              </strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Хаах
          </button>
        </div>
          </>
        ) : activeAdminTab === 'episodes' ? (
          /* Episode & Content Management Tab View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-amber-400" />
                  Контент & Анимэ сонгох
                </span>
                <p className="text-xs text-zinc-400">
                  Анги нэмэх эсвэл бичлэгийн URL линк засах анимэ/ цувралаа сонгоно уу
                </p>
              </div>

              <select
                value={selectedMovieId}
                onChange={(e) => {
                  setSelectedMovieId(e.target.value);
                  const m = allMoviesList.find((item) => item.id === e.target.value);
                  if (m && m.episodes) {
                    setEpNumInput(m.episodes.length + 1);
                  }
                }}
                className="bg-zinc-950 border border-cyan-500/50 text-white font-bold text-sm py-2.5 px-4 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer w-full sm:w-80"
              >
                {allMoviesList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titleMongolian} ({m.title}) {m.episodes ? `[${m.episodes.length} анги]` : '[Кино]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Episode Add / Edit Form */}
            <form onSubmit={handleAddOrUpdateEpisode} className="bg-gradient-to-r from-zinc-900 via-cyan-950/20 to-zinc-900 border border-cyan-500/40 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  "{currentSelectedMovie?.titleMongolian}"-д Шинэ анги / Бичлэг оруулах
                </h3>
                <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  ID: {currentSelectedMovie?.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Ангийн №:
                  </label>
                  <input
                    type="number"
                    value={epNumInput}
                    onChange={(e) => setEpNumInput(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Ангийн гарчиг (Нэр):
                  </label>
                  <input
                    type="text"
                    placeholder={`${epNumInput}-р анги - Тоглолт`}
                    value={epTitleInput}
                    onChange={(e) => setEpTitleInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Хугацаа:
                  </label>
                  <input
                    type="text"
                    value={epDurationInput}
                    onChange={(e) => setEpDurationInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center justify-between">
                  <span>Бичлэгийн линк URL (YouTube / Google Drive / Facebook / Direct Video MP4):</span>
                  <span className="text-[10px] text-cyan-400">Автомат Embed тохируулгатай</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://youtu.be/... эсвэл https://drive.google.com/file/d/..."
                    value={epUrlInput}
                    onChange={(e) => setEpUrlInput(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-sm font-mono text-cyan-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Анги Хадгалах</span>
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 mt-2 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <p>
                    💡 <strong>Google Drive холбоос оруулахдаа:</strong> Бичлэгийг хэрэглэгчид үзэх үед Gmail эрх нэхэхгүй, шууд тоглуулдаг байлгахын тулд Google Drive дээр тухайн бичлэг эсвэл хавтас дээрээ <strong>Share ➡️ General access</strong> хэсгийг <strong>"Anyone with the link" (Холбоос бүхий хүн бүр)</strong> болгож <strong>Viewer</strong> эрхтэйгээр тохируулан линкийг хуулж тавина уу.
                  </p>
                  <p className="text-zinc-500">
                    📺 <strong>YouTube / Facebook / MP4:</strong> YouTube, Facebook болон шууд mp4/m3u8 бичлэгийн линкийг ч систем автоматаар таньж тоглуулагч дээр шууд тоглуулна.
                  </p>
                </div>
              </div>
            </form>

            {/* Existing Episodes List */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  Нийт оруулсан ангиуд ({currentMovieEpisodes.length})
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 hidden sm:inline">
                    1-р анги нь бүх хэрэглэгчдэд ҮНЭГҮЙ үзэх боломжтой
                  </span>
                  <button
                    type="button"
                    onClick={handleResetMovieEpisodes}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Эх анхны ангиудын тохиргоог сэргээх"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Анхны утгаар сэргээх</span>
                  </button>
                </div>
              </div>

              {currentMovieEpisodes.length === 0 ? (
                <div className="text-center py-8 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  Одоогоор анги оруулаагүй байна. Дээрх маягтаар анги нэмнэ үү.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentMovieEpisodes.map((ep) => (
                    <div
                      key={ep.episodeNumber}
                      className="bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 p-3 rounded-xl flex items-center justify-between gap-2 group transition-all"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-cyan-500/20 text-cyan-300 font-extrabold text-xs px-2 py-0.5 rounded border border-cyan-500/30">
                            {ep.episodeNumber}-р анги
                          </span>
                          <span className="text-xs text-zinc-400 font-mono text-[10px]">
                            {ep.duration}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {ep.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">
                          {ep.videoUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEpNumInput(ep.episodeNumber);
                            setEpTitleInput(ep.title);
                            setEpUrlInput(ep.videoUrl);
                            setEpDurationInput(ep.duration);
                          }}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          title="Засах"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEpisode(ep.episodeNumber)}
                          className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          title="Устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeAdminTab === 'notifications' ? (
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between bg-zinc-900 border border-amber-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Firebase Бодит Цагийн Мэдэгдлүүд
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Шинэ хэрэглэгч бүртгүүлэх эсвэл хүсэлт явуулах бүрд Firestore сангаас шууд мэдэгдэл ирнэ.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-amber-500 text-black font-black px-3 py-1 rounded-full">
                Нийт {notifications.length} мэдэгдэл
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-2">
                <Bell className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 font-semibold">Одоогоор шинэ мэдэгдэл байхгүй байна.</p>
                <p className="text-xs text-zinc-500">Шинэ хэрэглэгч бүртгэгдвэл энд автоматаар гарч ирнэ.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((notif, idx) => (
                  <div
                    key={`notif_${notif.id || idx}_${idx}`}
                    className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-start justify-between gap-4 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1">
                          {notif.userName && <span>👤 {notif.userName}</span>}
                          {notif.userEmail && <span>📧 {notif.userEmail}</span>}
                          {notif.userPhone && <span>📞 {notif.userPhone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-[11px] text-amber-400/90 font-mono flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{notif.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeAdminTab === 'codes' ? (
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Header & Intro */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-900 border border-emerald-500/30 p-4 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    Ваучер & Эрхийн Кодын Удирдлага
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                      {promoCodesList.length} Идэвхтэй Код
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Хэрэглэгчдэд өгөх урамшууллын болон төлбөрийн эрхийн код үүсгэх, хуулах, удирдах.
                  </p>
                </div>
              </div>
            </div>

            {/* Create Code Form */}
            <form onSubmit={handleCreatePromoCode} className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <h4 className="text-xs font-black uppercase text-zinc-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Шинэ Эрхийн Код Үүсгэх
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCodeForm({
                        code: 'MEGALOBOX',
                        type: 'anime',
                        value: 0,
                        durationDays: 30,
                        description: '🥊 Мегалобокс (Megalo Box) болон бүх анимэ үзэх 30 хоногийн эрх',
                        maxUses: 100,
                      });
                    }}
                    className="text-[11px] text-rose-300 hover:text-white font-bold bg-rose-950/60 hover:bg-rose-900/60 px-2.5 py-1 rounded-lg border border-rose-800/80 transition-all cursor-pointer"
                  >
                    🥊 Megalo Box Код
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-800/80 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🎲 Санамсаргүй Код</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Код (Нэр):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Жнь: VIP-2025, FREE10K"
                    value={newCodeForm.code}
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-950 border border-zinc-800 font-mono text-sm font-black text-amber-300 p-2.5 rounded-xl uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Төрөл / Эрх:
                  </label>
                  <select
                    value={newCodeForm.type}
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, type: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="full_vip">👑 VIP Бүтэн Багц (Бүх кино+анимэ)</option>
                    <option value="anime">🎌 Анимэ Багц</option>
                    <option value="movie">🎬 Кино Багц</option>
                    <option value="points">💰 Хэтэвчний Оноо Цэнэглэх</option>
                  </select>
                </div>

                <div>
                  {newCodeForm.type === 'points' ? (
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                        Онооны дүн (₮):
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={newCodeForm.value}
                        onChange={(e) => setNewCodeForm({ ...newCodeForm, value: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 text-sm font-black text-emerald-400 p-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                        Хүчинтэй хугацаа (хоногоор):
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newCodeForm.durationDays}
                        onChange={(e) => setNewCodeForm({ ...newCodeForm, durationDays: Number(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 text-sm font-black text-amber-300 p-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                    Тайлбар (Заавал биш):
                  </label>
                  <input
                    type="text"
                    placeholder="Жнь: 3-р сарын урамшууллын эрхийн код"
                    value={newCodeForm.description}
                    onChange={(e) => setNewCodeForm({ ...newCodeForm, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Кодыг Үүсгэж Хадгалах</span>
                </button>
              </div>
            </form>

            {/* Codes List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  Систем дээрх эрхийн кодууд ({promoCodesList.length})
                </h4>
                <span className="text-xs text-zinc-500">
                  Хэрэглэгч төлбөрийн цонхонд энэ кодыг оруулж шууд эрх авна
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {promoCodesList.map((c, idx) => (
                  <div
                    key={`promo_${c.id || c.code}_${idx}`}
                    className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 p-3.5 rounded-xl flex flex-col justify-between gap-3 group transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code, c.id)}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Кодыг хуулах"
                          >
                            {copiedCodeId === c.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Хууллаа</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Хуулах</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-medium line-clamp-2">
                          {c.description}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          c.type === 'full_vip'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : c.type === 'anime'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : c.type === 'movie'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {c.type === 'full_vip'
                          ? '👑 VIP'
                          : c.type === 'anime'
                          ? '🎌 Анимэ'
                          : c.type === 'movie'
                          ? '🎬 Кино'
                          : `💰 +${(c.value || 5000).toLocaleString()} ₮`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                      <span>
                        {c.type === 'points'
                          ? `Оноо: +${(c.value || 5000).toLocaleString()}`
                          : `Хугацаа: ${c.durationDays || 30} хоног`}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">Идэвхтэй ✓</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(c.id)}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Points & Balance Management Sub-Modal */}
      {pointsModalUser && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl relative text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-black font-black flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    Эрхийн Оноо Удирдах (+ / -)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    <span className="text-cyan-400 font-bold">{pointsModalUser.name}</span> ({pointsModalUser.email || pointsModalUser.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPointsModalUser(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance & User Package Info */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Одоогийн үлдэгдэл оноо:</span>
                <span className="text-lg font-black text-emerald-400">
                  {pointsModalUser.walletBalance.toLocaleString()} ₮
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Идэвхтэй багц:</span>
                <div>{getPackageBadge(pointsModalUser.packageType)}</div>
              </div>
            </div>

            {/* Operation Mode Tabs: Add (+) | Subtract (-) | Set (=) */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setPointsOperation('add')}
                className={`py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsOperation === 'add'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Оноо Нэмэх (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointsOperation('subtract')}
                className={`py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsOperation === 'subtract'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Оноо Хасах (-)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointsOperation('set')}
                className={`py-2 text-xs font-black rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  pointsOperation === 'set'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Тогтоох (=)</span>
              </button>
            </div>

            {/* Quick Presets tailored for permission / package points */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
                <span>Эрх авах онооны бэлэн сонголтууд:</span>
                <span className="text-zinc-500 text-[10px]">
                  {pointsOperation === 'add' ? 'Нэмэгдэх дүн' : pointsOperation === 'subtract' ? 'Хасагдах дүн' : 'Шинэ үлдэгдэл'}
                </span>
              </span>

              {pointsOperation === 'add' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '+4,000 ₮ (Кино/Анимэ эрх)', val: 4000, color: 'border-cyan-500/40 text-cyan-300 font-bold' },
                    { label: '+7,000 ₮ (FULL VIP эрх)', val: 7000, color: 'border-amber-500/40 text-amber-300 font-black' },
                    { label: '+1,000 ₮', val: 1000, color: 'border-zinc-800 text-zinc-300' },
                    { label: '+5,000 ₮', val: 5000, color: 'border-zinc-800 text-zinc-300' },
                    { label: '+10,000 ₮', val: 10000, color: 'border-emerald-500/40 text-emerald-300 font-bold' },
                    { label: '+20,000 ₮', val: 20000, color: 'border-emerald-500/40 text-emerald-300 font-bold' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPointsInputAmount(p.val)}
                      className={`p-2 text-xs rounded-xl border bg-zinc-900/90 hover:bg-zinc-800 transition-all text-left cursor-pointer ${
                        pointsInputAmount === p.val
                          ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30'
                          : p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {pointsOperation === 'subtract' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: '-4,000 ₮ (Эрхийн оноо)', val: 4000, color: 'border-rose-500/40 text-rose-300 font-bold' },
                    { label: '-7,000 ₮ (VIP оноо)', val: 7000, color: 'border-rose-500/40 text-rose-300 font-black' },
                    { label: '-1,000 ₮', val: 1000, color: 'border-zinc-800 text-zinc-300' },
                    { label: '-5,000 ₮', val: 5000, color: 'border-zinc-800 text-zinc-300' },
                    { label: '-10,000 ₮', val: 10000, color: 'border-rose-500/40 text-rose-300 font-bold' },
                    { label: 'Бүгдийг 0 болгох', val: pointsModalUser.walletBalance, color: 'border-rose-700/60 text-rose-400 font-extrabold' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPointsInputAmount(p.val)}
                      className={`p-2 text-xs rounded-xl border bg-zinc-900/90 hover:bg-zinc-800 transition-all text-left cursor-pointer ${
                        pointsInputAmount === p.val
                          ? 'border-rose-400 bg-rose-950/40 ring-2 ring-rose-500/30'
                          : p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {pointsOperation === 'set' && (
                <div className="grid grid-cols-3 gap-2">
                  {[0, 4000, 7000, 10000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPointsInputAmount(val)}
                      className={`py-2 text-xs font-black rounded-xl border bg-zinc-900/90 hover:bg-zinc-800 transition-all cursor-pointer ${
                        pointsInputAmount === val
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                          : 'border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {val.toLocaleString()} ₮
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">
                {pointsOperation === 'add'
                  ? 'Нэмэх дүн (₮):'
                  : pointsOperation === 'subtract'
                  ? 'Хасах дүн (₮):'
                  : 'Шууд тохируулах тогтмол дүн (₮):'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={pointsInputAmount}
                  onChange={(e) => setPointsInputAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl py-2.5 px-4 text-base font-black text-center text-white focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">
                  ₮
                </span>
              </div>
            </div>

            {/* Live Calculation Preview */}
            {(() => {
              const current = pointsModalUser.walletBalance;
              let nextBal = current;
              if (pointsOperation === 'add') nextBal = current + pointsInputAmount;
              else if (pointsOperation === 'subtract') nextBal = Math.max(0, current - pointsInputAmount);
              else if (pointsOperation === 'set') nextBal = pointsInputAmount;

              return (
                <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block font-bold">Одоо:</span>
                    <span className="font-bold text-zinc-300">{current.toLocaleString()} ₮</span>
                  </div>
                  <div className="text-center font-black">
                    <span className="text-[10px] text-zinc-500 block">Өөрчлөлт:</span>
                    <span
                      className={
                        pointsOperation === 'add'
                          ? 'text-emerald-400'
                          : pointsOperation === 'subtract'
                          ? 'text-rose-400'
                          : 'text-cyan-400'
                      }
                    >
                      {pointsOperation === 'add' ? '+' : pointsOperation === 'subtract' ? '-' : '='}{' '}
                      {pointsInputAmount.toLocaleString()} ₮
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block font-bold">Шинэ үлдэгдэл:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {nextBal.toLocaleString()} ₮
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Optional Package Grant shortcut */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 uppercase font-bold block">
                🎁 Багцын эрхийг давхар сунгах / олгох (Сонголттой):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'none', label: 'Өөрчлөхгүй' },
                  { id: 'full_vip', label: 'FULL VIP' },
                  { id: 'movie', label: 'Кино Багц' },
                  { id: 'anime', label: 'Анимэ Багц' },
                ].map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedGrantPkg(pkg.id as any)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center truncate ${
                      selectedGrantPkg === pkg.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {pkg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPointsModalUser(null)}
                className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Болих
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAdjustUserPoints(
                    pointsModalUser.id,
                    pointsOperation,
                    pointsInputAmount,
                    selectedGrantPkg
                  )
                }
                className="w-2/3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-black" />
                <span>Хадгалах & Баталгаажуулах</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Sub-Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-[#1a1a1e] border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Шинэ Хэрэглэгч Нэмэх
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                Нэр:
              </label>
              <input
                type="text"
                required
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                placeholder="Жишээ: Дорж"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                Э-мэйл:
              </label>
              <input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="dorj@gmail.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                Утасны дугаар:
              </label>
              <input
                type="tel"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                placeholder="9911XXXX"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Багц:
                </label>
                <select
                  value={newUserForm.packageType}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      packageType: e.target.value as any,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white"
                >
                  <option value="full_vip">FULL VIP</option>
                  <option value="movie">Кино Багц</option>
                  <option value="anime">Анимэ Багц</option>
                  <option value="free">Үнэгүй</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Эхлэх үлдэгдэл:
                </label>
                <input
                  type="number"
                  value={newUserForm.walletBalance}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, walletBalance: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-1/2 bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-bold"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-xl text-xs font-black"
              >
                Бүртгэх
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected User Detail Sub-Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1e] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-zinc-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-black text-xl flex items-center justify-center shadow-lg uppercase">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                    {selectedUser.name}
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/90 p-4 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Дугаар:</span>
                <span className="font-bold text-white">{selectedUser.phone}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Бүртгэлийн ID:</span>
                <span className="font-mono text-zinc-300 text-[11px]">{selectedUser.id}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Идэвхтэй Багц:</span>
                <div>{getPackageBadge(selectedUser.packageType)}</div>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Дуусах хугацаа:</span>
                <span className="font-extrabold text-amber-300">{selectedUser.packageExpiry}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Хэтэвчний үлдэгдэл:</span>
                <span className="font-black text-emerald-400 text-sm">{selectedUser.walletBalance.toLocaleString()} ₮</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Төлөв:</span>
                <span className={`font-bold ${selectedUser.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedUser.status === 'active' ? 'Идэвхтэй ✓' : 'Блоклогдсон ✕'}
                </span>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Үзсэн кино:</span>
                <span className="font-bold text-zinc-200">{selectedUser.watchedCount} кино</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Сүүлд нэвтэрсэн:</span>
                <span className="font-semibold text-zinc-300">{selectedUser.lastLogin}</span>
              </div>
            </div>

            {/* Admin Points Control Section */}
            <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Эрхийн Оноо & Хэтэвч Удирдах
                </span>
                <span className="text-xs font-black text-emerald-400">
                  Үлдэгдэл: {selectedUser.walletBalance.toLocaleString()} ₮
                </span>
              </div>

              {/* Fast single click +/- points presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPointsChange(selectedUser.id, 4000)}
                  className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="+4,000₮ нэмэх"
                >
                  <Plus className="w-3 h-3" />
                  +4,000 ₮ (Эрх)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPointsChange(selectedUser.id, 7000)}
                  className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 p-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="+7,000₮ VIP оноо нэмэх"
                >
                  <Plus className="w-3 h-3" />
                  +7,000 ₮ (VIP)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPointsChange(selectedUser.id, -4000)}
                  disabled={selectedUser.walletBalance < 4000}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 disabled:opacity-30 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="-4,000₮ оноо хасах"
                >
                  <Minus className="w-3 h-3" />
                  -4,000 ₮
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPointsChange(selectedUser.id, -7000)}
                  disabled={selectedUser.walletBalance < 7000}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 disabled:opacity-30 p-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="-7,000₮ VIP оноо хасах"
                >
                  <Minus className="w-3 h-3" />
                  -7,000 ₮
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetU = selectedUser;
                  setSelectedUser(null);
                  handleOpenPointsModal(targetU, 'add', 4000);
                }}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 p-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Дэлгэрэнгүй Оноо Нэмэх / Хасах цонх нээх (+ / -)</span>
              </button>
            </div>

            {/* Admin Package Control Section */}
            <div className="bg-zinc-900/90 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Эрх олгох & Сунгах (Админ Удирдлага)
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Шууд өөрчлөгдөнө</span>
              </div>

              {/* Package Extend Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExtendPackage(selectedUser.id, 'full_vip', 30)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  FULL VIP (+30 хоног)
                </button>
                <button
                  onClick={() => handleExtendPackage(selectedUser.id, 'full_vip', 365)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  FULL VIP (+1 жил)
                </button>
                <button
                  onClick={() => handleExtendPackage(selectedUser.id, 'movie', 30)}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  🎬 Кино багц (+30 хоног)
                </button>
                <button
                  onClick={() => handleExtendPackage(selectedUser.id, 'anime', 30)}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  ⛩️ Анимэ багц (+30 хоног)
                </button>
              </div>

              {/* Custom Expiry Date or Revoke */}
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-zinc-400 font-semibold block">
                    Дуусах огноо гараар тохируулах:
                  </label>
                  <input
                    type="date"
                    value={selectedUser.packageExpiry === '-' ? '' : selectedUser.packageExpiry}
                    onChange={(e) => handleSetCustomExpiryDate(selectedUser.id, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-amber-300 p-1.5 rounded-lg focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <button
                  onClick={() => handleExtendPackage(selectedUser.id, 'free', 0)}
                  className="mt-4 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                  title="Хэрэглэгчийн багцыг цуцалж Үнэгүй болгох"
                >
                  Эрх Цуцлах
                </button>
              </div>

              {/* Toggle Admin Privilege */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Админ Эрх:
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    {selectedUser.role === 'admin' ? 'Админ эрхтэй (Удирдаж чадна)' : 'Энгийн хэрэглэгч'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleAdminRole(selectedUser.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                    selectedUser.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                      : 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {selectedUser.role === 'admin' ? 'Админ Эрх Буцаах' : 'Админ Эрх Олгох 👑'}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetU = selectedUser;
                  setSelectedUser(null);
                  handleOpenPointsModal(targetU, 'add', 4000);
                }}
                className="w-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" /> +/- Оноо Удирдах
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
