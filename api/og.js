// Vercel Serverless Function — dynamic OG tags
// v3: 진단용 최소 버전 (Firestore 없이) — 경로가 살아있는지 먼저 확인
'use strict';

module.exports = function handler(req, res) {
  var q = req.query || {};
  var type = q.type || '(none)';
  var id   = q.id   || '(none)';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('og v3 ok — type=' + type + ' id=' + id);
};
