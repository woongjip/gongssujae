# 공쓰재(gongssujae) 프로젝트 인수인계 문서

> 이 문서는 Claude 채팅에서 진행하던 작업을 **Claude Code**로 이어가기 위한 종합 요약본입니다.
> Claude Code를 처음 실행한 뒤 이 파일을 읽게 하면 맥락을 그대로 이어받을 수 있습니다.

---

## 1. 프로젝트 개요

**공쓰재**는 공연·전시 업계 종사자를 위한 **전국 단위** 플랫폼입니다.

- **중고거래**: 공연 세트·소품·의상·장비 등을 사고팔거나 무료 나눔
- **일자리**: 공연계 구인·구직
- 콘셉트: "당근마켓 + 공연계 특화"

### 핵심 기능
- 중고 물건 (나누미 = 판매/나눔, 구하미 = 삽니다/구합니다)
- 일자리 (구인·구직)
- 실시간 채팅
- 찜하기, 끌어올리기
- **공연온도** (거래 후기 기반 신뢰 점수, 당근의 매너온도와 유사)
- 공연/전시명 태그 (🎭) 및 공연 종료일 알림
- 지역 필터 (전국)
- 키워드 알림
- 관리자 대시보드 (통계, 신고 관리)

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 프론트엔드 | React (단일 컴포넌트 구조, `src/App.jsx`) |
| 백엔드/DB | Firebase Firestore (실시간 멀티유저 onSnapshot) |
| 인증 | Firebase Auth (이메일/비밀번호) |
| 푸시 알림 | Firebase Cloud Messaging (FCM) |
| 지도 | Kakao Maps JavaScript SDK |
| 배포 | Vercel (PWA) |
| 배포 주소 | https://twr.or.kr (구: https://gongssujae.vercel.app) |
| 저장소 | https://github.com/woongjip/gongssujae |

### 주요 상수 (App.jsx 상단)
```js
const ACCENT="#2D6A4F", LIGHT="#f0f7f4", MID="#52b788", ADMIN_C="#1a237e";
const ITEM_CATS_ALL=["세트","소품","의상","장비","기타"];
const JOB_FIELDS=["전체","조명","무대","음향","분장","영상","기타"];
const ADMIN_PW="admin1234"; // ⚠️ 하드코딩됨 — 보안 개선 필요
```

### Kakao SDK
- JavaScript 키: `9c3090415c027e63579160554b84854d`
- 등록 도메인 (Kakao 콘솔 → 앱 → 플랫폼 키 → JavaScript 키 수정 → JavaScript SDK 도메인):
  - `https://twr.or.kr`
  - `https://gongssujae.vercel.app` (구 도메인, 유지 중)
  - (로컬 개발 시 `http://localhost:5173` 추가 권장)
- 사용 라이브러리: `services`, `geocoder`

---

## 3. 코드 구조 (src/App.jsx, 약 736줄 단일 파일)

- 전체가 하나의 `export default function App()` 안에 들어있는 **단일 파일 구조**
- `useState` 약 55개로 모든 상태 관리
- Firestore `onSnapshot`으로 items / jobs / chats / users / reports 실시간 구독

### 화면(screen) 라우팅
`screen` state 값으로 화면 전환:
`home`, `detail`, `jobdetail`, `post`, `chatlist`, `chat`, `notify`, `mypage`, `admin`

### 게시글 데이터 모델 (emptyForm)
```js
{
  title, category[], itemName, price, desc, region, contact,
  safeNum, tradePlace, tradeLat, tradeLng,   // ← 좌표 필드 (최근 추가)
  photos[], status,                          // selling / reserved / done
  postType,                                  // nanumi / guhami
  showTag, showEndDate                       // 공연 태그 / 종료일
}
```

---

## 4. 가장 최근 작업 내용 (지도 기능)

### 배경 — 해결한 문제들
1. **지도가 안 뜨던 문제**: `autoload=false` 제거 + 스크립트 로딩 완료까지 폴링(`window.kakao.maps.Map` 존재 확인) 방식으로 변경하여 해결
2. **Kakao 401 에러**: Kakao 콘솔에 Vercel 도메인 미등록이 원인 → JavaScript SDK 도메인에 등록하여 해결
3. **키워드 검색 부정확 문제**: "마로니에공원", "혜화역" 같은 텍스트를 `keywordSearch`로 찾으면 엉뚱한 곳(시청 인근)이 잡힘. 전국 서비스라 검색 반경을 좁힐 수도 없음

### 근본 해결책 (구현 완료, 현재 App.jsx에 반영됨)
**게시글 작성 시 지도에서 직접 위치를 클릭해 좌표(tradeLat, tradeLng)를 저장**하는 방식으로 전환.

구현된 내용:
- `emptyForm`에 `tradeLat`, `tradeLng` 필드 추가
- 상태 `showMapPicker`, `mapPickerLoaded` 추가
- 올리기 폼의 거래 희망 장소 옆에 **📍 지도 선택** 버튼 추가
- 지도 위치 선택 모달 추가 (지도 클릭 → 핀 표시 → `coord2Address`로 주소 자동 변환 → 좌표+주소 저장)
- 별도 `MapPicker` 컴포넌트 추가 (App 함수 외부, 한국 중심 level 13에서 시작)
- 상세 화면 지도: 저장된 좌표 있으면 그대로 사용, 없으면(기존 게시글) 키워드 검색 fallback
- `startEdit` 함수에도 좌표 필드 반영

> 이 변경이 적용된 App.jsx가 최신 버전입니다. GitHub에 push되었는지 확인 필요.

---

## 5. 알려진 이슈 / 다음에 할 일

### 버그/개선 후보
- [ ] **아이맥(데스크탑)에서 상세 지도가 가끔 안 뜸** (아이폰은 정상). 강력 새로고침(Cmd+Shift+R)으로 임시 해결되나, 스크립트 캐시/로딩 타이밍 추가 점검 필요
- [ ] 기존 게시글(좌표 없음)은 여전히 키워드 검색 fallback에 의존 → 부정확할 수 있음
- [ ] `ADMIN_PW`가 코드에 하드코딩됨 → 환경변수 또는 Firebase 권한 기반으로 이전 권장
- [x] Firebase OAuth 도메인: Firebase Console → Authentication → Settings → Authorized domains에 `twr.or.kr` 및 `gongssujae.vercel.app` 등록 완료

### 리팩토링 후보
- [ ] 736줄 단일 파일 → 화면별 컴포넌트 분리 (`screens/`, `components/`)
- [ ] 인라인 스타일 객체 다수 → 공통 스타일 정리
- [ ] 상태 55개 → 관련 상태 묶기 (useReducer 또는 context 검토)

---

## 6. Claude Code 시작 가이드

```bash
# 1. 저장소 클론 (아직 로컬에 없다면)
git clone https://github.com/woongjip/gongssujae.git
cd gongssujae

# 2. 의존성 설치
npm install

# 3. 로컬 개발 서버
npm run dev          # 보통 http://localhost:5173

# 4. 배포 (Vercel은 main 브랜치 push 시 자동 배포)
git add .
git commit -m "메시지"
git push
```

### Claude Code에게 처음 시킬 일 (제안)
1. 이 문서와 `src/App.jsx`, `src/firebase.js`를 읽고 현재 구조 파악
2. 위 "알려진 이슈" 중 아이맥 지도 문제부터 점검
3. 점진적으로 컴포넌트 분리 리팩토링

---

*문서 작성: Claude 채팅 세션 인수인계용 · 2026-05-21*
