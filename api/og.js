// Vercel Serverless Function — dynamic OG tags for Facebook/Kakao crawlers
// Called via: /api/og?type=item&id=xxx  (Step 1 직접 테스트용)
// Later:       /open/:type/:id → vercel.json rewrite 로 라우팅 (Step 2)

const PROJECT_ID = "gonssujae";
const DEFAULT_TITLE = "공쓰재";
const DEFAULT_DESC = "공연에 쓰고 남은 물건과 일자리를 나눕니다";
const DEFAULT_IMAGE = "https://twr.or.kr/og-image.png";
const SITE_URL = "https://twr.or.kr";

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function str(field) {
  return field?.stringValue ?? null;
}

function bool(field) {
  return field?.booleanValue ?? false;
}

function arr(field) {
  return field?.arrayValue?.values ?? [];
}

export default async function handler(req, res) {
  // type·id는 query param 또는 URL path (/open/:type/:id) 에서 추출
  let { type, id } = req.query;

  // vercel.json rewrite 가 ?type=:type&id=:id 형태로 넘겨주지 않는 경우 대비:
  // URL 자체가 /open/item/xxx 형태로 들어온 경우 path에서 파싱
  if (!type || !id) {
    const m = req.url?.match(/\/open\/(item|job)\/([^?#/]+)/);
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
      const resp = await fetch(apiUrl);

      if (resp.ok) {
        const data = await resp.json();
        const f = data.fields ?? {};

        // 숨김 게시글 → 기본값 유지 (개인정보 보호)
        if (!bool(f.hidden)) {
          const rawTitle = str(f.title);
          const rawDesc = str(f.desc);
          const photos = arr(f.photos);
          const firstPhoto = photos.find(v => v.stringValue?.startsWith("https://"))?.stringValue;

          if (rawTitle) title = `${rawTitle} — 공쓰재`;
          if (rawDesc) desc = rawDesc.slice(0, 120) + (rawDesc.length > 120 ? "…" : "");
          if (firstPhoto) image = firstPhoto;
        }
      }
      // resp가 404·오류이면 기본값 그대로 사용
    } catch (_) {
      // 네트워크 오류 등 → 기본값 fallback
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // 5분 CDN 캐시 (수정·삭제 반영 지연 최소화)
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  res.send(`<!DOCTYPE html>
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
}
