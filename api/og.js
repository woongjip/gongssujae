// Vercel Serverless Function — dynamic OG tags for Facebook/Kakao crawlers
// CommonJS format (api/package.json overrides root "type":"module")

const https = require('https');

const PROJECT_ID = "gonssujae";
const DEFAULT_TITLE = "공쓰재";
const DEFAULT_DESC = "공연에 쓰고 남은 물건과 일자리를 나눕니다";
const DEFAULT_IMAGE = "https://twr.or.kr/og-image.png";
const SITE_URL = "https://twr.or.kr";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(e); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  let { type, id } = req.query;

  // vercel.json rewrite 가 ?type=:type&id=:id 형태로 못 넘기는 경우 대비
  if (!type || !id) {
    const m = (req.url || "").match(/\/open\/(item|job)\/([^?#/]+)/);
    if (m) { type = m[1]; id = m[2]; }
  }

  let title = DEFAULT_TITLE;
  let desc = DEFAULT_DESC;
  let image = DEFAULT_IMAGE;
  const redirectUrl = (type && id)
    ? `${SITE_URL}/#/${type}/${id}`
    : SITE_URL;

  if (type && id) {
    try {
      const collection = type === "job" ? "jobs" : "items";
      const apiUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;
      const data = await fetchJson(apiUrl);
      const f = data.fields || {};

      // 숨김 게시글 → 기본값 유지
      if (!f.hidden?.booleanValue) {
        const rawTitle = f.title?.stringValue || null;
        const rawDesc = f.desc?.stringValue || null;
        const photos = f.photos?.arrayValue?.values || [];
        const firstPhoto = photos.find(v => v.stringValue && v.stringValue.startsWith("https://"));

        if (rawTitle) title = `${rawTitle} — 공쓰재`;
        if (rawDesc) desc = rawDesc.slice(0, 120) + (rawDesc.length > 120 ? "…" : "");
        if (firstPhoto) image = firstPhoto.stringValue;
      }
    } catch (_) {
      // 네트워크 오류·없는 문서 → 기본값 fallback
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="공쓰재">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(redirectUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<script>window.location.replace("${esc(redirectUrl)}");</script>
</head>
<body></body>
</html>`);
};
