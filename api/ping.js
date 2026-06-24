// 진단용 — 함수가 배포됐는지 확인하는 최소 엔드포인트
// 테스트: https://twr.or.kr/api/ping → "pong" 텍스트가 나오면 함수 정상
module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.end("pong");
};
