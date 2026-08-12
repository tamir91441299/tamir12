import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  ShieldCheck,
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
  Crown
} from 'lucide-react';
import { UserAccount } from './AuthModal';

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
}

export const INITIAL_USERS: UserDetail[] = [
  {
    id: 'usr_001',
    name: 'Тамир (Админ)',
    email: 'tamir91441299@gmail.com',
    phone: '91441299',
    role: 'admin',
    status: 'active',
    packageType: 'full_vip',
    packageExpiry: '2027-01-01',
    walletBalance: 25000,
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
    walletBalance: 12000,
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
    walletBalance: 4000,
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
    walletBalance: 1000,
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
}) => {
  const [users, setUsers] = useState<UserDetail[]>(() => {
    const saved = localStorage.getItem('ioio_registered_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Include current user if exists
    if (currentUser) {
      const exists = INITIAL_USERS.find((u) => u.email === currentUser.email || u.phone === currentUser.phone);
      if (!exists) {
        const addedCurrent: UserDetail = {
          ...currentUser,
          role: 'user',
          status: 'active',
          packageType: 'free',
          packageExpiry: '-',
          walletBalance: userBalance,
          lastLogin: 'Идэвхтэй одоо',
          watchedCount: 1,
          favoriteCount: 0,
        };
        return [addedCurrent, ...INITIAL_USERS];
      }
    }
    return INITIAL_USERS;
  });

  const [search, setSearch] = useState('');
  const [filterPackage, setFilterPackage] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  // Edit balance state modal
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [topupAmountInput, setTopupAmountInput] = useState<number>(5000);

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    packageType: 'full_vip' as 'full_vip' | 'movie' | 'anime' | 'free',
    walletBalance: 10000,
  });

  const saveUsersState = (updatedUsers: UserDetail[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('ioio_registered_users_list', JSON.stringify(updatedUsers));
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

  const handleTopupUserWallet = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const newBal = u.walletBalance + topupAmountInput;
        if (currentUser && u.email === currentUser.email) {
          onUpdateBalance(newBal);
        }
        return {
          ...u,
          walletBalance: newBal,
        };
      }
      return u;
    });
    saveUsersState(updated);
    setEditingUserId(null);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#141417] border border-cyan-500/30 rounded-2xl max-w-5xl w-full text-zinc-100 shadow-2xl relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-cyan-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Хэрэглэгчдийн Мэдээлэл & Удирдлага
                <span className="bg-cyan-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                  {users.length} Хэрэглэгч
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                IOIO TV платформын нийт бүртгэлтэй хэрэглэгчдийн жагсаалт, багц, хэтэвчний үлдэгдэл
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
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
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
                  <div className="flex items-center gap-4 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 text-xs w-full md:w-auto justify-between md:justify-start">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                        Хэтэвч:
                      </span>
                      <span className="font-black text-emerald-400 text-sm">
                        {u.walletBalance.toLocaleString()} ₮
                      </span>
                    </div>

                    <div className="h-6 w-px bg-zinc-800" />

                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                        Үзсэн Кино:
                      </span>
                      <span className="font-bold text-zinc-200">{u.watchedCount} кино</span>
                    </div>

                    <div className="h-6 w-px bg-zinc-800" />

                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                        Дуусах Хугацаа:
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

                    {/* Topup Balance Button */}
                    <button
                      onClick={() => setEditingUserId(u.id)}
                      className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Хэтэвч Цэнэглэх"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Цэнэглэх</span>
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
      </div>

      {/* Topup Sub-Modal */}
      {editingUserId && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1e] border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Хэрэглэгчийн Хэтэвч Цэнэглэх
            </h3>
            <p className="text-xs text-zinc-400">
              Цэнэглэх мөнгөн дүнг сонгох эсвэл оруулна уу:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopupAmountInput(amt)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all ${
                    topupAmountInput === amt
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  +{amt.toLocaleString()} ₮
                </button>
              ))}
            </div>

            <input
              type="number"
              value={topupAmountInput}
              onChange={(e) => setTopupAmountInput(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-sm font-bold text-emerald-400 text-center focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEditingUserId(null)}
                className="w-1/2 bg-zinc-800 text-zinc-300 py-2 rounded-xl text-xs font-bold"
              >
                Цуцлах
              </button>
              <button
                onClick={() => handleTopupUserWallet(editingUserId)}
                className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-xl text-xs font-black"
              >
                Баталгаажуулах
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
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingUserId(selectedUser.id);
                  setSelectedUser(null);
                }}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-black py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1"
              >
                <DollarSign className="w-4 h-4" /> Цэнэглэх
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-xs font-bold"
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
