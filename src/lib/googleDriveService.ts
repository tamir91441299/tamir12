import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
}

export interface DriveQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

// In-memory cache for access token (strictly memory-only as required)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const driveProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  driveProvider.addScope(scope);
});
driveProvider.setCustomParameters({
  prompt: 'consent',
});

// Initialize Auth listener to clear token on sign-out
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setDriveAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleSignInWithDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive нэвтрэлтийн Access Token үүссэнгүй.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logoutDrive = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.error(e);
  }
  cachedAccessToken = null;
};

// Google Drive API Methods
export const listDriveFiles = async (options: {
  q?: string;
  pageSize?: number;
  pageToken?: string;
  folderId?: string;
  onlyVideos?: boolean;
} = {}): Promise<{ files: DriveFile[]; nextPageToken?: string }> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна. Эхлээд Google хаягаараа холбогдоно уу.');
  }

  const queryParts: string[] = ["trashed = false"];

  if (options.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }

  if (options.onlyVideos) {
    queryParts.push("(mimeType contains 'video/' or mimeType = 'application/vnd.google-apps.folder')");
  }

  if (options.q && options.q.trim()) {
    const escapedQuery = options.q.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escapedQuery}'`);
  }

  const finalQuery = queryParts.join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', finalQuery);
  url.searchParams.set('pageSize', String(options.pageSize || 30));
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, webContentLink, iconLink, videoMediaMetadata)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc');

  if (options.pageToken) {
    url.searchParams.set('pageToken', options.pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new Error('Google Drive холболтын хугацаа дууссан байна. Дахин нэвтэрнэ үү.');
    }
    throw new Error(`Google Drive-аас мэдээлэл авахад алдаа гарлаа: ${res.statusText} (${errText})`);
  }

  const data = await res.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
};

export const getDriveFile = async (fileId: string): Promise<DriveFile> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,iconLink,videoMediaMetadata`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Файлын мэдээлэл авахад алдаа гарлаа: ${res.statusText}`);
  }

  return await res.json();
};

export const getDriveAbout = async (): Promise<{ user: any; storageQuota: DriveQuota }> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна.');
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Google Drive багтаамжийн мэдээлэл авахад алдаа гарлаа');
  }

  return await res.json();
};

export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Файл устгахад алдаа гарлаа: ${res.statusText}`);
  }

  return true;
};

export const createDriveFolder = async (name: string, parentFolderId?: string): Promise<DriveFile> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна.');
  }

  const metadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    throw new Error(`Хавтас үүсгэхэд алдаа гарлаа: ${res.statusText}`);
  }

  return await res.json();
};

export const uploadJsonBackupToDrive = async (
  fileName: string,
  jsonData: any,
  parentFolderId?: string
): Promise<DriveFile> => {
  const token = await getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive-д нэвтрээгүй байна.');
  }

  const metadata: any = {
    name: fileName,
    mimeType: 'application/json',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(jsonData, null, 2) +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    throw new Error(`Нөөц файл хадгалахад алдаа гарлаа: ${res.statusText}`);
  }

  return await res.json();
};

export const getEmbedDriveUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};
