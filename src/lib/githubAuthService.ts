import { UserAccount } from '../components/AuthModal';
import {
  persistActiveSession,
  saveUserToFirestore,
  sendAdminNotification,
} from './userService';

export interface GitHubAuthConfig {
  configured: boolean;
  url: string | null;
  clientId: string | null;
  redirectUri: string;
  devCallbackUrl: string;
  sharedCallbackUrl: string;
}

export interface GitHubUserPayload {
  id: number | string;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  html_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
}

/**
 * Fetch current GitHub OAuth configuration status and authorize URL from backend
 */
export async function fetchGitHubAuthConfig(): Promise<GitHubAuthConfig> {
  try {
    const res = await fetch('/api/auth/github/url');
    if (!res.ok) throw new Error('Failed to fetch GitHub auth config');
    return await res.json();
  } catch (err) {
    console.warn('GitHub auth config fetch warning:', err);
    return {
      configured: false,
      url: null,
      clientId: null,
      redirectUri: 'https://ais-dev-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app/auth/github/callback',
      devCallbackUrl: 'https://ais-dev-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app/auth/github/callback',
      sharedCallbackUrl: 'https://ais-pre-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app/auth/github/callback',
    };
  }
}

/**
 * Process authenticated GitHub user payload into a FlickNime UserAccount
 */
export async function processGitHubLogin(ghUser: GitHubUserPayload): Promise<UserAccount> {
  const res = await fetch('/api/auth/github/quick-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ githubUser: ghUser }),
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.user) {
    throw new Error(data.error || 'GitHub хэрэглэгчийг системд бүртгэж чадсангүй');
  }

  const user: UserAccount = data.user;
  persistActiveSession(user, true);

  // Sync to local firestore wrapper
  try {
    await saveUserToFirestore(user, {
      avatarUrl: user.avatarUrl,
      githubLogin: user.githubLogin,
      githubId: user.githubId,
      authProvider: 'github',
    });
  } catch (e) {
    console.warn('Local firestore notice on GitHub login:', e);
  }

  // Send admin notification
  try {
    await sendAdminNotification({
      type: 'NEW_USER',
      title: `🐙 GitHub-ээр нэвтэрлээ: @${user.githubLogin || user.name}`,
      message: `ID: #${user.customId || user.id} | Email: ${user.email} | GitHub: github.com/${user.githubLogin || ''}`,
      userName: user.name,
      userEmail: user.email,
    });
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent('ioio_new_user_registered', { detail: user }));
  } catch {}

  return user;
}
