import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Copy, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  GitBranch, 
  Code2, 
  Users, 
  History, 
  AlertCircle,
  LogIn,
  Loader2
} from 'lucide-react';
import { UserAccount } from './AuthModal';
import { fetchGitHubAuthConfig, processGitHubLogin, GitHubAuthConfig } from '../lib/githubAuthService';

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
}

export const GitHubConnectModal: React.FC<GitHubConnectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [config, setConfig] = useState<GitHubAuthConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick username for instant testing/connection
  const [customGhUsername, setCustomGhUsername] = useState('tamir-developer');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    fetchGitHubAuthConfig()
      .then((cfg) => {
        setConfig(cfg);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [isOpen]);

  // Listen for popup postMessage according to OAuth integration guidelines
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = async (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.user) {
        setIsAuthorizing(true);
        try {
          const user = await processGitHubLogin(event.data.user);
          setSuccessMsg(`✓ Амжилттай! GitHub @${user.githubLogin || user.name} холбогдлоо.`);
          setTimeout(() => {
            onLoginSuccess(user);
            onClose();
          }, 800);
        } catch (e: any) {
          setErrorMsg(e.message || 'GitHub нэвтрэлтийг боловсруулахад алдаа гарлаа');
        } finally {
          setIsAuthorizing(false);
        }
      } else if (event.data?.type === 'GITHUB_AUTH_ERROR') {
        setErrorMsg('⚠️ GitHub баталгаажуулалт амжилтгүй боллоо: ' + (event.data.error || 'Цуцлагдсан'));
        setIsAuthorizing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLaunchGitHubAuth = () => {
    if (!config?.url) {
      setErrorMsg('GitHub Client ID тохируулаагүй байна. Доорх тохиргооны зааврыг дагана уу эсвэл шуурхай туршилтаар нэвтэрнэ үү.');
      return;
    }

    setIsAuthorizing(true);
    setErrorMsg(null);

    // Open the OAuth provider's URL directly in popup (skill requirement)
    const authWindow = window.open(
      config.url,
      'github_oauth_popup',
      'width=600,height=720,status=no,resizable=yes'
    );

    if (!authWindow) {
      setIsAuthorizing(false);
      setErrorMsg('Цонх нээгдэхийг хөтөч тань хаалаа. Хөтчийнхөө Popup зөвшөөрлийг нээнэ үү.');
    }
  };

  const handleQuickDemoConnect = async () => {
    setIsAuthorizing(true);
    setErrorMsg(null);
    try {
      const cleanLogin = customGhUsername.trim() || 'tamir-developer';
      const mockGhUser = {
        id: Math.floor(10000000 + Math.random() * 90000000),
        login: cleanLogin,
        name: cleanLogin === 'tamir-developer' ? 'Тамир (Lead Developer)' : cleanLogin,
        email: cleanLogin === 'tamir-developer' ? 'tamir91441299@gmail.com' : `${cleanLogin}@github.com`,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        html_url: `https://github.com/${cleanLogin}`,
        bio: 'FlickNime Anime & Cinema Platform Developer',
        public_repos: 12,
        followers: 48,
      };

      const user = await processGitHubLogin(mockGhUser);
      setSuccessMsg(`✓ GitHub @${cleanLogin} хаягаар шууд нэвтэрлээ!`);
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Алдаа гарлаа');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const devCallback = config?.devCallbackUrl || 'https://ais-dev-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app/auth/github/callback';
  const sharedCallback = config?.sharedCallbackUrl || 'https://ais-pre-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app/auth/github/callback';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#161b22] text-zinc-100 rounded-2xl border border-[#30363d] shadow-2xl overflow-hidden my-auto">
        {/* Header with GitHub branding */}
        <div className="p-4 sm:p-5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">GitHub Бүртгэл Холболт</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Код, өөрчлөлт болон системтэй саадгүй холбогдох
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Official Value Banner from User Prompt */}
          <div className="p-3.5 bg-[#21262d] border border-[#30363d] rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#58a6ff] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200 italic leading-relaxed">
                  "Signing in to GitHub gives you organized code storage, seamless collaboration with peers, and a powerful way to track every change."
                </p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  🇲🇳 <strong>Монгол орчуулга:</strong> GitHub-ээр нэвтэрснээр таны кодын сан эмх цэгцтэй найдвартай хадгалагдаж, бусадтай хамтран ажиллах, кодын өөрчлөлт бүрийг алхам тутамд хянах боломжтой болно.
                </p>
              </div>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#30363d]/60 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                <span className="truncate">Код хадгалах</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                <span className="truncate">Хамтран ажиллах</span>
              </div>
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#d29922] shrink-0" />
                <span className="truncate">Өөрчлөлт хянах</span>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Main Action Area */}
          {config?.configured ? (
            /* Live GitHub OAuth ready */
            <div className="space-y-3 p-4 bg-[#0d1117] rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GitHub OAuth Бэлэн (Client ID холбогдсон)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">ID: {config.clientId?.slice(0, 8)}...</span>
              </div>

              <button
                type="button"
                onClick={handleLaunchGitHubAuth}
                disabled={isAuthorizing}
                className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Нэвтэрч байна...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub-ээр Шууд Нэвтрэх (Popup)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Setup Instructions & Test Sign-in */
            <div className="space-y-4">
              {/* Quick Connect / Test Demo Section */}
              <div className="p-3.5 bg-gradient-to-r from-[#1c2128] to-[#21262d] rounded-xl border border-[#30363d] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Шуурхай Туршилтаар Нэвтрэх</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Тохиргоо хийхээс өмнө шалгах</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customGhUsername}
                    onChange={(e) => setCustomGhUsername(e.target.value)}
                    placeholder="GitHub нэрээ оруулна уу"
                    className="bg-black/60 border border-[#30363d] focus:border-[#58a6ff] rounded-lg px-2.5 py-1.5 text-xs text-white flex-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickDemoConnect}
                    disabled={isAuthorizing}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Нэвтрэх</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step Setup Guide */}
              <div className="space-y-2.5 bg-[#0d1117] p-3.5 rounded-xl border border-[#30363d]">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Албан ёсны GitHub OAuth тохируулах заавар:</span>
                </h4>

                {/* Step 1 */}
                <div className="text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-300">1. GitHub Developer Settings нээх:</span>
                    <a
                      href="https://github.com/settings/developers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#58a6ff] hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Нээх</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-zinc-500">
                    "New OAuth App" товч дарж нэрээ "FlickNime" гэж өгнө.
                  </p>
                </div>

                {/* Step 2: Callback URLs */}
                <div className="space-y-1.5 pt-1 border-t border-[#30363d]">
                  <span className="text-[11px] font-semibold text-zinc-300 block">
                    2. Callback URL-уудыг хуулж тавих (Authorization callback URL):
                  </span>

                  {/* Dev Callback URL */}
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Development URL:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(devCallback, 'dev')}
                        className="text-[10px] text-[#58a6ff] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'dev' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'dev' ? 'Хуулагдлаа' : 'Хуулах'}</span>
                      </button>
                    </div>
                    <code className="text-[10px] font-mono text-zinc-300 break-all block selection:bg-blue-600">
                      {devCallback}
                    </code>
                  </div>

                  {/* Shared Callback URL */}
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Shared/Deployed URL:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(sharedCallback, 'shared')}
                        className="text-[10px] text-[#58a6ff] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'shared' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'shared' ? 'Хуулагдлаа' : 'Хуулах'}</span>
                      </button>
                    </div>
                    <code className="text-[10px] font-mono text-zinc-300 break-all block selection:bg-blue-600">
                      {sharedCallback}
                    </code>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="text-[11px] space-y-1 pt-1 border-t border-[#30363d]">
                  <span className="font-semibold text-zinc-300">
                    3. Түлхүүрүүдээ тохируулах:
                  </span>
                  <p className="text-zinc-500">
                    Үүсгэсэн <code className="text-amber-300 font-mono">GITHUB_CLIENT_ID</code> болон <code className="text-amber-300 font-mono">GITHUB_CLIENT_SECRET</code>-ээ AI Studio орчны хувьсагчид хадгалснаар шууд ажиллана.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">
            FlickNime • Secure GitHub Authentication
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
};
