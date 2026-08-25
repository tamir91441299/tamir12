import { Router, Request, Response } from "express";
import https from "https";
import http from "http";
import { URL } from "url";

const router = Router();

// High speed multi-quality video cluster
const QUALITY_FALLBACK_VIDEOS: Record<string, string[]> = {
  "1080p": [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ],
  "720p": [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  ],
  "480p": [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  ],
  "360p": [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  ],
  "auto": [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ],
};

const FALLBACK_VIDEOS = QUALITY_FALLBACK_VIDEOS["1080p"];

function getFallbackForQuality(qualityKey: string = "1080p", seed: string = ""): string {
  const list = QUALITY_FALLBACK_VIDEOS[qualityKey] || QUALITY_FALLBACK_VIDEOS["1080p"];
  if (!seed) return list[0];
  const idx = Math.abs(seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % list.length;
  return list[idx];
}

// Cache of Google Drive direct download cookies/tokens and resolved direct streaming URLs
interface CachedStream {
  url: string;
  cookies?: string[];
  expires: number;
}
const directUrlCache = new Map<string, CachedStream>();

// Middleware for CORS on all stream endpoints
router.use("/api/stream", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept, User-Agent");
  res.header("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

/**
 * Resolves Google Drive file ID into a direct streaming URL, handling large-file virus confirmation tokens
 */
async function resolveGoogleDriveStreamUrl(fileId: string): Promise<{ url: string; cookies?: string[] }> {
  const cached = directUrlCache.get(fileId);
  if (cached && cached.expires > Date.now()) {
    return { url: cached.url, cookies: cached.cookies };
  }

  const initialUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;
  
  return new Promise((resolve) => {
    const parsed = new URL(initialUrl);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          "Accept": "*/*",
        },
      },
      (res) => {
        const cookies = res.headers["set-cookie"] || [];

        // If redirect, grab redirect location
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          let directUrl = res.headers.location;
          if (directUrl.startsWith("/")) {
            directUrl = `https://${parsed.hostname}${directUrl}`;
          }
          const result = { url: directUrl, cookies };
          directUrlCache.set(fileId, { ...result, expires: Date.now() + 1000 * 60 * 45 });
          resolve(result);
          return;
        }

        // If directly returned video stream
        const contentType = (res.headers["content-type"] || "").toLowerCase();
        if (contentType.includes("video") || contentType.includes("octet-stream")) {
          const result = { url: initialUrl, cookies };
          directUrlCache.set(fileId, { ...result, expires: Date.now() + 1000 * 60 * 45 });
          resolve(result);
          return;
        }

        // Read response body if confirmation HTML is returned for files > 100MB
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString();
          if (body.length > 50000) res.destroy();
        });

        res.on("end", () => {
          // Look for confirm token in HTML
          const confirmMatch = body.match(/confirm=([0-9A-Za-z_-]+)/);
          const uuidMatch = body.match(/uuid=([0-9A-Za-z_-]+)/);

          if (confirmMatch && confirmMatch[1]) {
            let confirmedUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmMatch[1]}`;
            if (uuidMatch && uuidMatch[1]) {
              confirmedUrl += `&uuid=${uuidMatch[1]}`;
            }
            const result = { url: confirmedUrl, cookies };
            directUrlCache.set(fileId, { ...result, expires: Date.now() + 1000 * 60 * 45 });
            resolve(result);
            return;
          }

          // Fallback direct url
          const fallbackDirect = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;
          resolve({ url: fallbackDirect, cookies });
        });
      }
    );

    req.on("error", () => {
      resolve({ url: initialUrl });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ url: initialUrl });
    });

    req.end();
  });
}

/**
 * Proxy stream endpoint for Google Drive and external videos (Server 1).
 */
router.get("/api/stream/drive/:fileId", async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const quality = (req.query.quality as string) || "1080p";
  console.log(`📡 [Stream Proxy] Request for Drive File ID: "${fileId}" (${quality})`);
  if (!fileId || typeof fileId !== "string" || fileId.length < 10) {
    console.warn(`⚠️ [Stream Proxy] Invalid File ID "${fileId}", falling back.`);
    res.redirect(302, getFallbackForQuality(quality, fileId || "default"));
    return;
  }

  try {
    const { url: targetUrl, cookies } = await resolveGoogleDriveStreamUrl(fileId);
    console.log(`✅ [Stream Proxy] Resolved target stream URL for "${fileId}":`, targetUrl);
    pipeStreamWithRange(targetUrl, req, res, fileId, 0, cookies);
  } catch (err) {
    console.error("❌ [Stream Proxy] Error resolving stream drive:", err);
    if (!res.headersSent) {
      res.redirect(302, getFallbackForQuality(quality, fileId));
    }
  }
});

router.get("/api/stream/proxy", (req: Request, res: Response) => {
  const videoUrl = req.query.url as string;
  const quality = (req.query.quality as string) || "1080p";
  if (!videoUrl) {
    res.redirect(302, getFallbackForQuality(quality, "default"));
    return;
  }

  pipeStreamWithRange(videoUrl, req, res);
});

function pipeStreamWithRange(
  targetUrlStr: string,
  clientReq: Request,
  clientRes: Response,
  fallbackDriveId?: string,
  redirectCount = 0,
  initialCookies?: string[]
) {
  if (redirectCount > 8) {
    if (!clientRes.headersSent) {
      clientRes.redirect(302, FALLBACK_VIDEOS[0]);
    }
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrlStr);
  } catch {
    if (!clientRes.headersSent) {
      clientRes.redirect(302, FALLBACK_VIDEOS[0]);
    }
    return;
  }

  const clientRange = clientReq.headers.range;
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Encoding": "identity",
    "Referer": "https://drive.google.com/",
  };

  if (initialCookies && initialCookies.length > 0) {
    headers["Cookie"] = initialCookies.join("; ");
  }

  if (clientRange) {
    headers["Range"] = clientRange;
  }

  const isHttps = parsedUrl.protocol === "https:";
  const client = isHttps ? https : http;

  const requestOptions = {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isHttps ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: clientReq.method === "HEAD" ? "HEAD" : "GET",
    headers,
  };

  const proxyReq = client.request(requestOptions, (proxyRes) => {
    // Handle redirects
    if (proxyRes.statusCode && [301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
      let nextUrl = proxyRes.headers.location;
      if (nextUrl.startsWith("/")) {
        nextUrl = `${parsedUrl.protocol}//${parsedUrl.host}${nextUrl}`;
      }
      const newCookies = proxyRes.headers["set-cookie"] || initialCookies;
      if (fallbackDriveId) {
        directUrlCache.set(fallbackDriveId, {
          url: nextUrl,
          cookies: newCookies,
          expires: Date.now() + 1000 * 60 * 45,
        });
      }
      pipeStreamWithRange(nextUrl, clientReq, clientRes, fallbackDriveId, redirectCount + 1, newCookies);
      return;
    }

    const statusCode = proxyRes.statusCode || 200;
    const contentType = (proxyRes.headers["content-type"] || "").toLowerCase();

    // If Google Drive returns HTML error page (e.g., restricted access or Google quota exceeded)
    if (statusCode >= 400 || contentType.includes("text/html")) {
      const q = (clientReq.query?.quality as string) || "1080p";
      console.warn(`Drive stream returned (${statusCode}, ${contentType}), streaming high-speed ${q} fallback node`);
      if (!clientRes.headersSent) {
        clientRes.redirect(302, getFallbackForQuality(q, fallbackDriveId || ""));
      }
      return;
    }

    const responseHeaders: Record<string, string | string[] | undefined> = {
      "Content-Type": contentType.includes("video") ? contentType : "video/mp4",
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Range, Origin, Content-Type, Accept",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
      "Cache-Control": "public, max-age=7200",
    };

    if (proxyRes.headers["content-length"]) {
      responseHeaders["Content-Length"] = proxyRes.headers["content-length"];
    }
    if (proxyRes.headers["content-range"]) {
      responseHeaders["Content-Range"] = proxyRes.headers["content-range"];
    }

    clientRes.writeHead(statusCode, responseHeaders);

    if (clientReq.method === "HEAD") {
      clientRes.end();
      proxyReq.destroy();
      return;
    }

    proxyRes.pipe(clientRes);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy request error:", err);
    if (!clientRes.headersSent) {
      const q = (clientReq.query?.quality as string) || "1080p";
      clientRes.redirect(302, getFallbackForQuality(q, fallbackDriveId || ""));
    }
  });

  clientReq.on("close", () => {
    proxyReq.destroy();
  });

  proxyReq.end();
}

export default router;
