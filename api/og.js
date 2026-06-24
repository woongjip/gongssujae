'use strict';

// Vercel Serverless Function — dynamic OG tags for Facebook/Kakao crawlers
// CommonJS (api/package.json: {"type":"commonjs"})

var https = require('https');

var PROJECT_ID   = 'gonssujae';
var DEFAULT_TITLE = '공쓰재';
var DEFAULT_DESC  = '공연에 쓰고 남은 물건과 일자리를 나눕니다';
var DEFAULT_IMAGE = 'https://twr.or.kr/og-image.png';
var SITE_URL      = 'https://twr.or.kr';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// HTTPS GET → JSON, 5초 타임아웃
function fetchJson(urlStr) {
  return new Promise(function(resolve, reject) {
    var settled = false;
    function done(fn, val) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(val);
    }
    var timer = setTimeout(function() {
      done(reject, new Error('og/fetchJson timeout: ' + urlStr));
    }, 5000);

    var req = https.get(urlStr, function(res) {
      var body = '';
      res.on('data', function(c) { body += c; });
      res.on('end', function() {
        try {
          done(resolve, { status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          done(reject, e);
        }
      });
      res.on('error', function(e) { done(reject, e); });
    });
    req.on('error', function(e) { done(reject, e); });
  });
}

function buildHtml(title, desc, image, redirectUrl) {
  return '<!DOCTYPE html>\n<html lang="ko">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>' + esc(title) + '</title>\n' +
    '<meta property="og:type" content="article">\n' +
    '<meta property="og:site_name" content="공쓰재">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n' +
    '<meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:image" content="' + esc(image) + '">\n' +
    '<meta property="og:image:width" content="1200">\n' +
    '<meta property="og:image:height" content="630">\n' +
    '<meta property="og:url" content="' + esc(redirectUrl) + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="twitter:title" content="' + esc(title) + '">\n' +
    '<meta name="twitter:description" content="' + esc(desc) + '">\n' +
    '<meta name="twitter:image" content="' + esc(image) + '">\n' +
    '<script>window.location.replace("' + esc(redirectUrl) + '");</script>\n' +
    '</head>\n<body></body>\n</html>';
}

module.exports = async function handler(req, res) {
  // 최상위 try-catch: 어떤 에러도 밖으로 나가지 않게
  try {
    var q    = req.query || {};
    var type = q.type || '';
    var id   = q.id   || '';

    // query param이 없으면 URL path에서 파싱 (/open/item/xxx)
    if (!type || !id) {
      var m = (req.url || '').match(/\/(item|job)\/([^?#/]+)/);
      if (m) { type = m[1]; id = m[2]; }
    }

    var title       = DEFAULT_TITLE;
    var desc        = DEFAULT_DESC;
    var image       = DEFAULT_IMAGE;
    var redirectUrl = (type && id) ? SITE_URL + '/#/' + type + '/' + id : SITE_URL;

    if (type && id) {
      try {
        var collection = (type === 'job') ? 'jobs' : 'items';
        // (default) 은 URL에서 유효한 문자 — 인코딩 불필요
        var apiUrl = 'https://firestore.googleapis.com/v1/projects/' +
          PROJECT_ID + '/databases/(default)/documents/' + collection + '/' + id;

        console.log('[og] Firestore 호출:', apiUrl);
        var result = await fetchJson(apiUrl);
        console.log('[og] Firestore 응답 status:', result.status);

        if (result.status === 200) {
          var f = (result.data && result.data.fields) ? result.data.fields : {};

          // hidden===true 게시글 → 기본값 유지 (제목·사진 노출 안 함)
          var isHidden = f.hidden && f.hidden.booleanValue === true;
          if (!isHidden) {
            var rawTitle = (f.title && f.title.stringValue) ? f.title.stringValue : null;
            var rawDesc  = (f.desc  && f.desc.stringValue)  ? f.desc.stringValue  : null;

            // photos 배열에서 첫 번째 https:// URL 추출
            var firstPhoto = null;
            var photoVals = f.photos &&
                            f.photos.arrayValue &&
                            Array.isArray(f.photos.arrayValue.values)
                              ? f.photos.arrayValue.values
                              : [];
            for (var i = 0; i < photoVals.length; i++) {
              var pv = photoVals[i];
              if (pv && pv.stringValue && pv.stringValue.indexOf('https://') === 0) {
                firstPhoto = pv.stringValue;
                break;
              }
            }

            if (rawTitle) title = rawTitle + ' — 공쓰재';  // — (em dash)
            if (rawDesc)  desc  = rawDesc.slice(0, 120) + (rawDesc.length > 120 ? '…' : '');
            if (firstPhoto) image = firstPhoto;

            console.log('[og] 결과 title:', title, '| image:', image ? image.slice(0, 60) : '(기본값)');
          } else {
            console.log('[og] hidden 게시글 — 기본값 사용');
          }
        } else {
          console.log('[og] Firestore 응답 없음 (status=' + result.status + ') — 기본값 사용');
        }
      } catch(e) {
        // Firestore 호출 실패 → 기본값으로 fallback, 함수는 계속 실행
        console.error('[og] Firestore 오류 (fallback):', e && e.message);
      }
    }

    var html = buildHtml(title, desc, image, redirectUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.end(html);

  } catch(fatal) {
    // 절대로 여기까지 오면 안 되지만, 만약 오면 기본 OG HTML이라도 반환
    console.error('[og] FATAL:', fatal && fatal.message);
    try {
      var fallbackHtml = buildHtml(DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_IMAGE, SITE_URL);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fallbackHtml);
    } catch(_) {}
  }
};
