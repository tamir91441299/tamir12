import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Folder,
  Film,
  Play,
  Download,
  Trash2,
  FolderPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  FileText,
  Database,
  CloudUpload,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import {
  googleSignInWithDrive,
  getDriveAccessToken,
  listDriveFiles,
  deleteDriveFile,
  createDriveFolder,
  uploadJsonBackupToDrive,
  getDriveAbout,
  DriveFile,
  DriveQuota,
  getEmbedDriveUrl,
  logoutDrive,
} from '../lib/googleDriveService';
import { Movie } from '../types';
import { UserAccount } from './AuthModal';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideoForPlay?: (title: string, videoUrl: string, driveFileId: string) => void;
  onImportToCollection?: (movieData: Partial<Movie>) => void;
  currentUser?: UserAccount | null;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onSelectVideoForPlay,
  onImportToCollection,
  currentUser,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<{ name?: string; email?: string; photoUrl?: string } | null>(null);
  const [quota, setQuota] = useState<DriveQuota | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Files & Navigation
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Миний Google Drive' },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyVideos, setOnlyVideos] = useState<boolean>(true);

  // Destructive Action Confirmation Modal state (Mandatory per Guidelines)
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Create folder prompt state
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  const currentFolder = folderStack[folderStack.length - 1];

  const checkConnection = async () => {
    const token = await getDriveAccessToken();
    if (token) {
      setIsConnected(true);
      loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id);
    } else {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const loadDriveData = async (folderId?: string, query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [filesRes, aboutRes] = await Promise.allSettled([
        listDriveFiles({
          folderId: folderId === 'root' ? undefined : folderId,
          q: query || searchQuery,
          onlyVideos,
        }),
        getDriveAbout(),
      ]);

      if (filesRes.status === 'fulfilled') {
        setFiles(filesRes.value.files);
        setNextPageToken(filesRes.value.nextPageToken);
      } else {
        throw filesRes.reason;
      }

      if (aboutRes.status === 'fulfilled') {
        if (aboutRes.value.user) {
          setGoogleUser({
            name: aboutRes.value.user.displayName,
            email: aboutRes.value.user.emailAddress,
            photoUrl: aboutRes.value.user.photoLink,
          });
        }
        if (aboutRes.value.storageQuota) {
          setQuota(aboutRes.value.storageQuota);
        }
      }
    } catch (err: any) {
      console.error('Drive load error:', err);
      setError(err.message || 'Google Drive-аас мэдээлэл авахад алдаа гарлаа');
      if (err.message && err.message.includes('хугацаа дууссан')) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await googleSignInWithDrive();
      if (res) {
        setIsConnected(true);
        setGoogleUser({
          name: res.user.displayName || 'Google Хэрэглэгч',
          email: res.user.email || '',
          photoUrl: res.user.photoURL || undefined,
        });
        setSuccessMessage('🎉 Google Drive амжилттай холбогдлоо!');
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setError(err.message || 'Google Drive холбогдоход алдаа гарлаа.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutDrive();
    setIsConnected(false);
    setGoogleUser(null);
    setFiles([]);
    setQuota(null);
  };

  const handleFolderClick = (folder: DriveFile) => {
    const nextStack = [...folderStack, { id: folder.id, name: folder.name }];
    setFolderStack(nextStack);
    loadDriveData(folder.id);
  };

  const handleNavigateToStackIndex = (index: number) => {
    const target = folderStack[index];
    const newStack = folderStack.slice(0, index + 1);
    setFolderStack(newStack);
    loadDriveData(target.id === 'root' ? undefined : target.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id, searchQuery);
  };

  // Safe file deletion with mandatory confirmation
  const handleConfirmDelete = async () => {
    if (!confirmDeleteFile) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDriveFile(confirmDeleteFile.id);
      setFiles((prev) => prev.filter((f) => f.id !== confirmDeleteFile.id));
      setSuccessMessage(`✓ '${confirmDeleteFile.name}' амжилттай устгагдлаа.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setConfirmDeleteFile(null);
    } catch (err: any) {
      setError(err.message || 'Файл устгахад алдаа гарлаа');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const created = await createDriveFolder(
        newFolderName.trim(),
        currentFolder.id === 'root' ? undefined : currentFolder.id
      );
      setFiles((prev) => [created, ...prev]);
      setShowNewFolderModal(false);
      setNewFolderName('');
      setSuccessMessage(`✓ '${created.name}' хавтас үүсгэгдлээ.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Хавтас үүсгэхэд алдаа гарлаа');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleBackupToDrive = async () => {
    setIsBackingUp(true);
    setError(null);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        user: currentUser?.email || 'guest',
        favorites: JSON.parse(localStorage.getItem('flicknime_favorites') || '[]'),
        history: JSON.parse(localStorage.getItem('flicknime_watch_history') || '[]'),
        purchases: JSON.parse(localStorage.getItem('flicknime_purchased_movies') || '[]'),
        app: 'FlickNime Movie Platform',
      };
      const fileName = `FlickNime_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      await uploadJsonBackupToDrive(
        fileName,
        backupData,
        currentFolder.id === 'root' ? undefined : currentFolder.id
      );
      setSuccessMessage(`🎉 Нөөц хуулбар '${fileName}' таны Google Drive-д хадгалагдлаа!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id);
    } catch (err: any) {
      setError(err.message || 'Нөөцлөлт хийхэд алдаа гарлаа');
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatFileSize = (bytes?: string | number) => {
    if (!bytes) return '--';
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num)) return '--';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121215] border border-cyan-500/30 rounded-2xl max-w-5xl w-full text-zinc-100 shadow-2xl relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-blue-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-300">
                  Google Drive Видео & Файл Холболт
                </h2>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                  v3 Cloud
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Google Drive-аас видеогоо шууд тоглуулах, цуврал/кино оруулах болон мэдээллээ нөөцлөх
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications & Status Banner */}
        {error && (
          <div className="px-4 py-2.5 bg-rose-950/80 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="px-4 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Not Connected View */}
        {!isConnected ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 overflow-y-auto">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/30 to-cyan-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-2xl">
                <HardDrive className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">Google Drive-аа холбох</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Өөрийн Google Drive дээрх кино, анимэ, видео файлуудыг FlickNime-д шууд тоглуулах, импортлох болон үзсэн түүх, эрхүүдээ нөөцлөх боломжтой.
              </p>
            </div>

            {/* Official Google Sign-in Styled Button */}
            <div className="pt-2">
              <button
                type="button"
                id="gdrive-sign-in-btn"
                onClick={handleConnectGoogle}
                disabled={isLoading}
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isLoading ? 'Холбогдож байна...' : 'Google Drive-аар холбогдох'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left pt-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <Film className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-zinc-200">Шууд Тоглуулагч</h4>
                <p className="text-[11px] text-zinc-400">Drive дээрх MP4, MKV видеогоо бүтэн дэлгэцээр үзэх</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-zinc-200">1-товчоор Оруулах</h4>
                <p className="text-[11px] text-zinc-400">Өөрийн кино, цувралд анги нэмж хадгалах</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <Database className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-zinc-200">Аюулгүй Нөөцлөлт</h4>
                <p className="text-[11px] text-zinc-400">Үзсэн түүх, эрх, жагсаалтаа Drive-даа нөөцлөх</p>
              </div>
            </div>
          </div>
        ) : (
          /* Connected Google Drive Content View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* User & Storage Bar */}
            <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {googleUser?.photoUrl ? (
                  <img
                    src={googleUser.photoUrl}
                    alt={googleUser.name}
                    className="w-7 h-7 rounded-full border border-cyan-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-zinc-200">{googleUser?.name || 'Google User'}</span>
                  <span className="text-zinc-500 text-[11px] ml-2">({googleUser?.email})</span>
                </div>
              </div>

              {/* Storage Quota */}
              {quota && quota.limit && (
                <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                  <span>Багтаамж:</span>
                  <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (parseInt(quota.usage || '0', 10) / parseInt(quota.limit, 10)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-zinc-300">
                    {formatFileSize(quota.usage)} / {formatFileSize(quota.limit)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBackupToDrive}
                  disabled={isBackingUp}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                  title="Энэ сайт дахь үзсэн түүх болон тохиргоог Google Drive-д нөөцлөх"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{isBackingUp ? 'Нөөцөлж байна...' : 'Нөөц файл хадгалах'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Шинэ хавтас</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Google Drive холболт салгах"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Breadcrumb & Search Controls */}
            <div className="px-4 py-3 bg-[#16161a] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              {/* Folder Breadcrumb */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs py-1">
                {folderStack.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                    <button
                      type="button"
                      onClick={() => handleNavigateToStackIndex(idx)}
                      className={`px-2 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                        idx === folderStack.length - 1
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {idx === 0 ? <HardDrive className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> : null}
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Filter & Search */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyVideos(!onlyVideos);
                    loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    onlyVideos
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title="Зөвхөн видео болон хавтаснуудыг шүүж харах"
                >
                  <Film className="w-3.5 h-3.5 inline mr-1" />
                  Зөвхөн видео
                </button>

                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Файл хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-36 sm:w-48 bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                </form>

                <button
                  type="button"
                  onClick={() => loadDriveData(currentFolder.id === 'root' ? undefined : currentFolder.id)}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  title="Шинэчлэх"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* File List / Grid Container */}
            <div className="flex-1 p-4 overflow-y-auto min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400">Google Drive файлуудыг уншиж байна...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
                  <Folder className="w-12 h-12 text-zinc-700" />
                  <p className="text-xs text-zinc-400">Энэ хавтсанд тохирох файл олдсонгүй.</p>
                  <p className="text-[11px] text-zinc-600">Google Drive-аасаа видео файл хуулж оруулан үзэх боломжтой.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isVideo = file.mimeType.startsWith('video/');

                    return (
                      <div
                        key={file.id}
                        className="group bg-[#17171c] hover:bg-zinc-800/80 border border-zinc-800 hover:border-cyan-500/40 rounded-xl p-3 flex flex-col justify-between transition-all shadow-md"
                      >
                        {/* File item header */}
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() => (isFolder ? handleFolderClick(file) : null)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                              isFolder
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : isVideo
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {isFolder ? (
                              <Folder className="w-5 h-5" />
                            ) : isVideo ? (
                              <Film className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => (isFolder ? handleFolderClick(file) : null)}
                              className={`text-xs font-bold truncate ${
                                isFolder
                                  ? 'text-amber-300 hover:underline cursor-pointer'
                                  : 'text-zinc-200'
                              }`}
                              title={file.name}
                            >
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                              <span>{formatFileSize(file.size)}</span>
                              {file.videoMediaMetadata?.durationMillis && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {Math.round(
                                      parseInt(file.videoMediaMetadata.durationMillis, 10) / 60000
                                    )}{' '}
                                    мин
                                  </span>
                                </>
                              )}
                              {file.modifiedTime && (
                                <>
                                  <span>•</span>
                                  <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions bar for file */}
                        <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1 text-xs">
                          {isVideo ? (
                            <div className="flex items-center gap-1.5">
                              {/* 1. Play directly */}
                              {onSelectVideoForPlay && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const embedUrl = getEmbedDriveUrl(file.id);
                                    onSelectVideoForPlay(file.name.replace(/\.[^/.]+$/, ''), embedUrl, file.id);
                                    onClose();
                                  }}
                                  className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                  title="Энэ видеог тоглуулагчид шууд үзэх"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Үзэх</span>
                                </button>
                              )}

                              {/* 2. Import into collection */}
                              {onImportToCollection && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const embedUrl = getEmbedDriveUrl(file.id);
                                    onImportToCollection({
                                      title: file.name.replace(/\.[^/.]+$/, ''),
                                      videoUrl: embedUrl,
                                      type: 'movie',
                                      rating: 8.5,
                                      quality: '1080p Full HD',
                                    });
                                    setSuccessMessage(`✓ '${file.name}' киноны жагсаалтад нэмэгдлээ!`);
                                    setTimeout(() => setSuccessMessage(null), 3000);
                                  }}
                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                  title="Сайтын цуглуулга руу кино болгон оруулах"
                                >
                                  <PlusCircle className="w-3 h-3" />
                                  <span>Оруулах</span>
                                </button>
                              )}
                            </div>
                          ) : isFolder ? (
                            <button
                              type="button"
                              onClick={() => handleFolderClick(file)}
                              className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Нээх</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500">Google Drive файл</span>
                          )}

                          {/* Utilities: Open link & Safe Delete */}
                          <div className="flex items-center gap-1">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded text-zinc-400 hover:text-white transition-all"
                                title="Google Drive дээр нээх"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Destructive Delete button triggers mandatory Confirmation Dialog */}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteFile(file)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Устгах"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Folder Sub-Modal */}
        {showNewFolderModal && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateFolder}
              className="bg-[#18181d] border border-zinc-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-cyan-400" />
                  Шинэ хавтас үүсгэх
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Хавтасны нэр (Жишээ: Анимэ 2026)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-black hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingFolder ? 'Үүсгэж байна...' : 'Үүсгэх'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mandatory Explicit Confirmation Dialog for Destructive Operations */}
        {confirmDeleteFile && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#18181d] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-base text-zinc-100">Google Drive-аас устгах уу?</h3>
                <p className="text-xs text-zinc-400">
                  Та <span className="text-rose-300 font-bold">"{confirmDeleteFile.name}"</span> файлыг Google Drive-аасаа устгахдаа итгэлтэй байна уу?
                </p>
                <p className="text-[11px] text-zinc-500">
                  Энэ үйлдлийг буцаах боломжгүй ба таны Google Drive сангаас бүрмөсөн хасагдана.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteFile(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Цуцлах
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  {isDeleting ? 'Устгаж байна...' : 'Тийм, Устгах'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
