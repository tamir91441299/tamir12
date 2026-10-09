import { Router, Request, Response } from 'express';
import { collection, doc, setDoc, getDoc, getDocs, query, where, limit } from 'firebase/firestore/lite';
import { getServerDb } from '../lib/firestoreDb.ts';
import { readStoredUsers, saveRegisteredUser } from './users.js';

const router = Router();

// Runtime URLs provided by environment or constants
const DEFAULT_DEV_URL = 'https://ais-dev-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app';
const DEFAULT_PRE_URL = 'https://ais-pre-7rcommzb7lgr2mqd6oz3ym-634365350981.asia-northeast1.run.app';

function getAppBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const parsed = new URL(String(origin));
      return parsed.origin;
    } catch {}
  }
  return DEFAULT_DEV_URL;
}

/**
 * GET /api/auth/github/url
 * Returns the GitHub OAuth authorization URL or configuration status.
 * Following skill constraints: Popup must open provider's authorize URL directly.
 */
router.get('/api/auth/github/url', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/github/callback`;
  const state = 'gh_' + Math.random().toString(36).substring(2, 15);

  const isConfigured = Boolean(clientId && clientId.trim().length > 0);

  let authorizeUrl = '';
  if (isConfigured) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state: state,
    });
    authorizeUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  res.json({
    configured: isConfigured,
    url: authorizeUrl,
    clientId: isConfigured ? clientId : null,
    redirectUri,
    devCallbackUrl: `${DEFAULT_DEV_URL}/auth/github/callback`,
    sharedCallbackUrl: `${DEFAULT_PRE_URL}/auth/github/callback`,
  });
});

/**
 * GET /auth/github/callback and /auth/github/callback/
 * Handles the OAuth provider redirect.
 * Exchanges the code for an access token with GitHub, retrieves user information,
 * and posts a message back to the popup opener window.
 */
router.get(['/auth/github/callback', '/auth/github/callback/'], async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error as string;
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET || '';
  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/github/callback`;

  if (error || !code) {
    const errMessage = error || 'Баталгаажуулах код ирсэнгүй';
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="mn">
      <head>
        <meta charset="utf-8">
        <title>GitHub Нэвтрэх Алдаа</title>
        <style>
          body { background: #0d1117; color: #f85149; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; max-width: 420px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>⚠️ GitHub Нэвтрэлт цуцлагдлаа</h3>
          <p style="color:#8b949e; font-size:13px;">${errMessage}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: ${JSON.stringify(errMessage)} }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </div>
      </body>
      </html>
    `);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || 'GitHub access token авахад алдаа гарлаа';
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="mn">
        <head>
          <meta charset="utf-8">
          <title>GitHub Нэвтрэх Алдаа</title>
          <style>
            body { background: #0d1117; color: #c9d1d9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; max-width: 420px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <h3 style="color:#f85149;">⚠️ Баталгаажуулалтын алдаа</h3>
            <p style="color:#8b949e; font-size:13px;">${errMsg}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
                setTimeout(() => window.close(), 2000);
              }
            </script>
          </div>
        </body>
        </html>
      `);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'FlickNime-App',
      },
    });

    if (!userRes.ok) {
      throw new Error('GitHub хэрэглэгчийн мэдээллийг татаж чадсангүй');
    }

    const ghUser = await userRes.json();

    // 3. If email is not public, fetch primary email
    let userEmail = ghUser.email;
    if (!userEmail) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'FlickNime-App',
          },
        });
        if (emailsRes.ok) {
          const emails = await emailsRes.json();
          if (Array.isArray(emails)) {
            const primary = emails.find((e: any) => e.primary && e.verified) || emails[0];
            if (primary && primary.email) {
              userEmail = primary.email;
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch GitHub private emails:', e);
      }
    }

    const normalizedUser = {
      id: ghUser.id,
      login: ghUser.login,
      name: ghUser.name || ghUser.login,
      email: userEmail || `${ghUser.login}@github.com`,
      avatar_url: ghUser.avatar_url,
      html_url: ghUser.html_url,
      bio: ghUser.bio || '',
      public_repos: ghUser.public_repos || 0,
      followers: ghUser.followers || 0,
    };

    // 4. Return popup close script with postMessage
    return res.send(`
      <!DOCTYPE html>
      <html lang="mn">
      <head>
        <meta charset="utf-8">
        <title>GitHub Баталгаажлаа</title>
        <style>
          body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #58a6ff; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${normalizedUser.avatar_url}" alt="Avatar" class="avatar" />
          <h3 style="color:#58a6ff; margin:0 0 6px 0;">Сайн байна уу, ${normalizedUser.name}!</h3>
          <p style="color:#8b949e; font-size:13px; margin:0 0 14px 0;">GitHub хаягаар амжилттай нэвтэрлээ. Цонх хаагдаж байна...</p>
          <div style="font-size:12px; color:#58a6ff;">✓ Системд холбогдлоо</div>
          <script>
            const authPayload = ${JSON.stringify(normalizedUser)};
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', user: authPayload }, '*');
              setTimeout(() => {
                window.close();
              }, 800);
            } else {
              window.location.href = '/';
            }
          </script>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    console.error('GitHub OAuth callback error:', err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <body style="background:#0d1117; color:#f85149; font-family:sans-serif; padding:40px; text-align:center;">
        <h3>⚠️ Серверийн алдаа</h3>
        <p style="color:#8b949e;">${err.message || 'Алдаа гарлаа'}</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
            setTimeout(() => window.close(), 2500);
          }
        </script>
      </body>
      </html>
    `);
  }
});

/**
 * POST /api/auth/github/quick-auth
 * Fast login / connect with GitHub account data (works for both live verified payload and dev/demo testing)
 */
router.post('/api/auth/github/quick-auth', async (req: Request, res: Response) => {
  try {
    const { githubUser } = req.body;
    if (!githubUser || (!githubUser.id && !githubUser.login)) {
      return res.status(400).json({ success: false, error: 'GitHub хэрэглэгчийн мэдээлэл дутуу байна.' });
    }

    const cleanGhId = String(githubUser.id || githubUser.login);
    const cleanGhLogin = String(githubUser.login || 'developer');
    const cleanEmail = String(githubUser.email || `${cleanGhLogin}@github.com`).toLowerCase().trim();
    const cleanName = String(githubUser.name || cleanGhLogin);
    const avatarUrl = String(githubUser.avatar_url || `https://github.com/${cleanGhLogin}.png`);

    // 5-digit custom ID: derived or generated
    const customIdSuffix = cleanGhLogin.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'GH';
    const random2 = Math.floor(10 + Math.random() * 90).toString();
    const generatedCustomId = (customIdSuffix + random2).slice(0, 5).padEnd(5, '0');

    // Determine admin role
    const isAdmin = cleanEmail === 'tamir91441299@gmail.com' || cleanEmail === 'batorgiltamir9@gmail.com';
    const role = isAdmin ? 'admin' : 'user';

    // Check if user already exists in storage
    const existingList = readStoredUsers();
    let existingUser = existingList.find((u: any) => {
      if (!u) return false;
      const uEmail = String(u.email || '').toLowerCase().trim();
      const uGhId = String(u.githubId || '');
      const uGhLogin = String(u.githubLogin || '').toLowerCase();
      return (
        (uGhId && uGhId === cleanGhId) ||
        (uGhLogin && uGhLogin === cleanGhLogin.toLowerCase()) ||
        (cleanEmail && uEmail && uEmail === cleanEmail)
      );
    });

    const now = new Date();
    const formattedRegisteredAt = `${now.toLocaleDateString('mn-MN')} ${now.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}`;

    let userRecord: any;

    if (existingUser) {
      userRecord = {
        ...existingUser,
        name: existingUser.name || cleanName,
        email: existingUser.email || cleanEmail,
        avatarUrl: avatarUrl,
        githubLogin: cleanGhLogin,
        githubId: cleanGhId,
        githubAvatar: avatarUrl,
        githubUrl: githubUser.html_url || `https://github.com/${cleanGhLogin}`,
        authProvider: 'github',
        role: existingUser.role === 'admin' || isAdmin ? 'admin' : (existingUser.role || 'user'),
      };
    } else {
      userRecord = {
        id: `gh_${cleanGhId}`,
        customId: generatedCustomId,
        name: cleanName,
        email: cleanEmail,
        phone: '',
        registeredAt: formattedRegisteredAt,
        registeredTimestamp: Date.now(),
        role: role,
        status: 'active',
        packageType: 'free',
        packageExpiry: '-',
        walletBalance: 0,
        purchasedMovies: [],
        avatarUrl: avatarUrl,
        githubLogin: cleanGhLogin,
        githubId: cleanGhId,
        githubAvatar: avatarUrl,
        githubUrl: githubUser.html_url || `https://github.com/${cleanGhLogin}`,
        authProvider: 'github',
        isMockUser: false,
      };
    }

    // Save to server storage
    saveRegisteredUser(userRecord);

    // Save to Firestore if available
    const db = getServerDb();
    if (db) {
      try {
        await setDoc(doc(db, 'users', userRecord.id), userRecord, { merge: true });
        if (userRecord.customId) {
          await setDoc(doc(db, 'users', userRecord.customId), userRecord, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore sync notice for GitHub user:', err);
      }
    }

    return res.json({
      success: true,
      user: userRecord,
    });
  } catch (error: any) {
    console.error('Quick auth error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Серверийн алдаа' });
  }
});

export default router;
