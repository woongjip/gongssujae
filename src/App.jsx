import { useState, useMemo, useRef, useEffect, Fragment, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  db, auth, storage, storageRef, uploadBytes, getDownloadURL, deleteObject,
  registerFCMToken, unregisterFCMToken, requestAndRegisterFCM, logEvent,
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, getDocs, where, increment, arrayUnion, arrayRemove,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, sendPasswordResetEmail, sendEmailVerification, deleteUser,
  deleteField
} from "./firebase";

const ACCENT="#228BB5",LIGHT="#E3F3F9",MID="#3DA1B2",ADMIN_C="#1a237e";
function storagePathFromUrl(url){try{const m=url.match(/\/o\/(.+?)(?:\?|$)/);return m?decodeURIComponent(m[1]):null;}catch{return null;}}
const NO_SHOW=["공연없음","없음","공연 없음","없음","none","없"];
const hasShowTag=t=>t&&!NO_SHOW.includes(t.trim());
const BG="#FAFAF8",DIVIDER="#EDEAE5";
const TAB_ITEM="#228BB5",TAB_JOB="#C8902A",TAB_SPACE="#5B4A8A";
const ITEM_CATS_ALL=["세트","소품","의상","장비","기타"];
const ITEM_CATS=["전체",...ITEM_CATS_ALL];
const JOB_FIELDS=["전체","조명","무대","음향","분장","영상","기타"];
const JOB_FIELD_STYLE={
  "조명":{bg:"#F5A623",text:"#7A4F00",light:"#FEF3DC",icon:"ti-bulb"},
  "무대":{bg:"#7C5CBF",text:"#3B1F7A",light:"#EDE8F7",icon:"ti-layout-board"},
  "음향":{bg:"#2A9D8F",text:"#0D5049",light:"#D9F2EF",icon:"ti-volume"},
  "분장":{bg:"#E8657A",text:"#8B1C2E",light:"#FDEAED",icon:"ti-brush"},
  "영상":{bg:"#3D5A99",text:"#1A2D5A",light:"#E0E6F5",icon:"ti-video"},
  "기타":{bg:"#8C8C8C",text:"#3A3A3A",light:"#EFEFEF",icon:"ti-dots"},
};
const jfs=(f)=>JOB_FIELD_STYLE[f]||JOB_FIELD_STYLE["기타"];
const INTERESTS=["조명","무대","음향","분장","의상","소품","연출","기획","배우","스태프"];
const REGIONS=["서울 종로구","서울 중구","서울 용산구","서울 성동구","서울 광진구","서울 동대문구","서울 중랑구","서울 성북구","서울 강북구","서울 도봉구","서울 노원구","서울 은평구","서울 서대문구","서울 마포구","서울 양천구","서울 강서구","서울 구로구","서울 금천구","서울 영등포구","서울 동작구","서울 관악구","서울 서초구","서울 강남구","서울 송파구","서울 강동구","부산 중구","부산 서구","부산 동구","부산 영도구","부산 부산진구","부산 동래구","부산 남구","부산 북구","부산 해운대구","부산 사하구","부산 금정구","부산 강서구","부산 연제구","부산 수영구","부산 사상구","부산 기장군","대구 중구","대구 동구","대구 서구","대구 남구","대구 북구","대구 수성구","대구 달서구","대구 달성군","인천 중구","인천 동구","인천 미추홀구","인천 연수구","인천 남동구","인천 부평구","인천 계양구","인천 서구","인천 강화군","광주 동구","광주 서구","광주 남구","광주 북구","광주 광산구","대전 동구","대전 중구","대전 서구","대전 유성구","대전 대덕구","울산 중구","울산 남구","울산 동구","울산 북구","울산 울주군","세종 세종시","경기 수원시","경기 성남시","경기 고양시","경기 용인시","경기 부천시","경기 안양시","경기 남양주시","경기 화성시","경기 평택시","경기 의정부시","경기 시흥시","경기 파주시","경기 광명시","경기 김포시","경기 군포시","경기 광주시","경기 이천시","경기 양주시","경기 오산시","경기 구리시","경기 안성시","경기 포천시","경기 의왕시","경기 하남시","경기 여주시","강원 춘천시","강원 원주시","강원 강릉시","강원 동해시","강원 태백시","강원 속초시","강원 삼척시","충북 청주시","충북 충주시","충북 제천시","충남 천안시","충남 공주시","충남 보령시","충남 아산시","충남 서산시","전북 전주시","전북 익산시","전북 군산시","전북 정읍시","전북 남원시","전남 목포시","전남 여수시","전남 순천시","전남 나주시","경북 포항시","경북 경주시","경북 김천시","경북 안동시","경북 구미시","경북 영주시","경북 경산시","경남 창원시","경남 진주시","경남 통영시","경남 사천시","경남 김해시","경남 밀양시","경남 거제시","경남 양산시","제주 제주시","제주 서귀포시"];
const METRO_NAMES={"서울":"서울특별시","부산":"부산광역시","대구":"대구광역시","인천":"인천광역시","광주":"광주광역시","대전":"대전광역시","울산":"울산광역시","세종":"세종특별자치시","경기":"경기도","강원":"강원특별자치도","충북":"충청북도","충남":"충청남도","전북":"전북특별자치도","전남":"전라남도","경북":"경상북도","경남":"경상남도","제주":"제주특별자치도"};
const METROS=[...new Set(REGIONS.map(r=>r.split(" ")[0]))];
function fmtTime(ts){const d=ts?.toDate?.();if(!d)return"";const now=new Date();const diff=now-d;const m=Math.floor(diff/60000);if(m<1)return"방금 전";if(m<60)return`${m}분 전`;const h=Math.floor(m/60);if(h<24&&d.toDateString()===now.toDateString())return`${h}시간 전`;const yest=new Date(now);yest.setDate(yest.getDate()-1);if(d.toDateString()===yest.toDateString())return"어제";return`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;}
function fmtMsgTime(ts){const d=ts?.toDate?.();if(!d)return"";return d.toLocaleTimeString("ko-KR",{hour:"numeric",minute:"2-digit",hour12:true});}
function fmtDateLabel(ts){const d=ts?.toDate?.();if(!d)return"";return d.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});}
const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||('ontouchstart' in window);
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
const isKakaoInApp=/KAKAOTALK/i.test(navigator.userAgent);
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const shellStyle=isMobile
  ?{width:"100%",height:"100dvh",fontFamily:"sans-serif",background:BG,position:"relative",overflow:"hidden"}
  :isStandalone
    ?{width:"100%",maxWidth:768,margin:"0 auto",fontFamily:"sans-serif",overflow:"hidden",background:BG,height:"100vh",position:"relative"}
    :{width:"100%",maxWidth:768,margin:"0 auto",fontFamily:"sans-serif",border:`1px solid ${DIVIDER}`,borderRadius:20,overflow:"hidden",background:BG,height:"min(1024px, 92vh)",position:"relative"};
const emptyForm={title:"",category:[],itemName:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:"",tradeLat:null,tradeLng:null,photos:[],status:"selling",postType:"nanumi",showTag:"",showEndDate:"",listingMode:"nanumi"};
const emptyJform={title:"",org:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:"",jobType:"guin",jobStatus:"active",photos:[]};

function RegionPicker({open,onChange,onClose}){
  const [step,setStep]=useState("metro");
  const [selMetro,setSelMetro]=useState("");
  useEffect(()=>{if(open){setStep("metro");setSelMetro("");}}, [open]);
  if(!open)return null;
  const districts=REGIONS.filter(r=>r.split(" ")[0]===selMetro).map(r=>r.split(" ").slice(1).join(" "));
  const drop={position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:220,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"};
  const row={padding:"10px 14px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f5f5f5"};
  return(
    <div style={drop}>
      {step==="metro"?(
        METROS.map(m=>(
          <div key={m} onClick={()=>{setSelMetro(m);setStep("district");}} style={row}>
            {METRO_NAMES[m]}
          </div>
        ))
      ):(
        <>
          <div onClick={()=>setStep("metro")} style={{...row,borderBottom:"0.5px solid #e0e0e0",color:ACCENT,fontWeight:600}}>
            <i className="ti ti-arrow-left" style={{fontSize:11,marginRight:5}}/>{METRO_NAMES[selMetro]}
          </div>
          {districts.map(d=>(
            <div key={d} onClick={()=>{onChange(`${METRO_NAMES[selMetro]} ${d}`);onClose();}} style={row}>
              {d}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// index.html에서 SDK를 로드했으므로 준비될 때까지만 폴링
function loadKakaoSDK(cb){
  const poll=(n=0)=>{
    if(window.kakao?.maps?.Map){cb();}
    else if(n<50){setTimeout(()=>poll(n+1),200);}
  };
  poll();
}

async function resizeImage(file){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const MAX=600;let w=img.width,h=img.height;
        if(w>h&&w>MAX){h=Math.round(h*MAX/w);w=MAX;}
        else if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
        canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",0.65));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function getCroppedImg(imageSrc,pixelCrop,rotation=0){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      if(rotation===0){
        const canvas=document.createElement("canvas");
        canvas.width=800;canvas.height=600;
        canvas.getContext("2d").drawImage(img,pixelCrop.x,pixelCrop.y,pixelCrop.width,pixelCrop.height,0,0,800,600);
        resolve(canvas.toDataURL("image/jpeg",0.65));
        return;
      }
      // 회전 적용: safe-area 캔버스에 회전 후 crop
      const maxSide=Math.max(img.width,img.height);
      const safe=Math.ceil(2*((maxSide/2)*Math.sqrt(2)));
      const c1=document.createElement("canvas");
      c1.width=safe;c1.height=safe;
      const x1=c1.getContext("2d");
      x1.translate(safe/2,safe/2);
      x1.rotate((rotation*Math.PI)/180);
      x1.translate(-img.width/2,-img.height/2);
      x1.drawImage(img,0,0);
      const imgData=x1.getImageData(0,0,safe,safe);
      const c2=document.createElement("canvas");
      c2.width=pixelCrop.width;c2.height=pixelCrop.height;
      c2.getContext("2d").putImageData(imgData,
        Math.round(0-safe/2+img.width/2-pixelCrop.x),
        Math.round(0-safe/2+img.height/2-pixelCrop.y));
      const out=document.createElement("canvas");
      out.width=800;out.height=600;
      out.getContext("2d").drawImage(c2,0,0,800,600);
      resolve(out.toDataURL("image/jpeg",0.65));
    };
    img.onerror=reject;
    img.src=imageSrc;
  });
}

function MapPicker({loaded,onSelect}){
  const mapRef=useRef(null);

  useEffect(()=>{
    if(!loaded||!mapRef.current)return;
    // fallback: 서울 시청. 지도가 즉시 동네 수준으로 열리게 level 4로 시작.
    const FALLBACK_LAT=37.5663,FALLBACK_LNG=126.9779,ZOOM=4;
    const center=new window.kakao.maps.LatLng(FALLBACK_LAT,FALLBACK_LNG);
    const map=new window.kakao.maps.Map(mapRef.current,{center,level:ZOOM});
    map.relayout(); // Safari/PWA: paint 전 생성 시 빈 지도 방지
    let marker=null;
    window.kakao.maps.event.addListener(map,"click",(e)=>{
      const lat=e.latLng.getLat();
      const lng=e.latLng.getLng();
      if(marker)marker.setMap(null);
      marker=new window.kakao.maps.Marker({map,position:e.latLng});
      const gc=new window.kakao.maps.services.Geocoder();
      gc.coord2Address(lng,lat,(result,status)=>{
        let address="";
        if(status===window.kakao.maps.services.Status.OK)
          address=result[0]?.road_address?.address_name||result[0]?.address?.address_name||"";
        onSelect(lat,lng,address||`${lat.toFixed(5)},${lng.toFixed(5)}`);
      });
    });
    // 위치 권한이 있으면 사용자 동네로 이동. 실패/거부는 서울 시청 유지.
    if('geolocation' in navigator){
      let active=true;
      navigator.geolocation.getCurrentPosition(
        (pos)=>{if(active)map.setCenter(new window.kakao.maps.LatLng(pos.coords.latitude,pos.coords.longitude));},
        ()=>{},
        {enableHighAccuracy:false,timeout:5000,maximumAge:60000}
      );
      return()=>{active=false;};
    }
  },[loaded]);

  if(!loaded)return(
    <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:8}}>🗺️</div><div style={{fontSize:13,color:"#aaa"}}>지도 로딩 중...</div></div>
    </div>
  );

  // position:absolute 로 Safari flex 자식의 height:100% 오계산 방지
  return <div ref={mapRef} style={{position:"absolute",inset:0}}/>;
}

function parseHash(h){const m=h.match(/^#\/(item|job)\/([^/]+)$/);return m?{type:m[1],id:m[2]}:null;}

// index.html 인라인 스크립트(카카오 SDK 이전)에서 저장한 hash 사용
// window.__entryHash가 없으면 현재 hash로 폴백
const ENTRY_HASH=window.__entryHash||window.location.hash;
console.log('[공쓰재] ENTRY_HASH (module load):', ENTRY_HASH, '| window.location.hash now:', window.location.hash);

export default function App(){
  // Firebase Auth
  const [currentUser,setCurrentUser]=useState(null);
  const [userProfile,setUserProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [authStep,setAuthStep]=useState("splash"); // 첫 방문도 바로 메인 앱으로
  const [showWelcome,setShowWelcome]=useState(()=>{
    if(localStorage.getItem('welcomeSeen'))return false;
    // 공유 링크로 진입한 경우 welcome 스킵 — 모듈 레벨 ENTRY_HASH 사용 (hash가 지워진 후에도 안전)
    if(ENTRY_HASH&&parseHash(ENTRY_HASH))return false;
    return true;
  });
  const [loginPromptMsg,setLoginPromptMsg]=useState(null); // 비로그인 액션 안내 모달
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPw,setConfirmPw]=useState("");
  const [authError,setAuthError]=useState("");
  const [authBusy,setAuthBusy]=useState(false);
  const [terms,setTerms]=useState({all:false,service:false,privacy:false,age:false});
  const [regProf,setRegProf]=useState({name:"",phone:"",address:"",affiliation:"",interests:[],accountType:"개인"});

  // App state
  const [screen,setScreen]=useState("home");
  const [mainTab,setMainTab]=useState("items");
  const [btab,setBtab]=useState("home");
  const [selItem,setSelItem]=useState(null);
  const [selJob,setSelJob]=useState(null);
  const [cat,setCat]=useState("전체");
  const [typeFilter,setTypeFilter]=useState("전체");
  const [fld,setFld]=useState("전체");
  const [q,setQ]=useState("");
  const [items,setItems]=useState([]);
  const [jobs,setJobs]=useState([]);
  const [chatRooms,setChatRooms]=useState([]);
  const [messages,setMessages]=useState([]);
  const [activeChat,setActiveChat]=useState(null);
  const [chatLabel,setChatLabel]=useState("");
  const [chatMsg,setChatMsg]=useState("");
  const [contactConfirm,setContactConfirm]=useState(null);
  const [postMode,setPostMode]=useState("item");
  const [posted,setPosted]=useState(false);
  const [formError,setFormError]=useState("");
  const [fullscreenMapData,setFullscreenMapData]=useState(null);
  const [addrToast,setAddrToast]=useState(false);
  const [showPWABanner,setShowPWABanner]=useState(false);
  const [showPWAModal,setShowPWAModal]=useState(false);
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [showPushModal,setShowPushModal]=useState(false);
  const [showAppMenu,setShowAppMenu]=useState(false);
  const [showR,setShowR]=useState(false);
  const [showJR,setShowJR]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [editJob,setEditJob]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [jform,setJform]=useState(emptyJform);
  const [showTagFilter,setShowTagFilter]=useState("");
  const [localFirst,setLocalFirst]=useState(false);
  const [reviewModal,setReviewModal]=useState(null);
  const [reportModal,setReportModal]=useState(null); // {targetType,targetId,title}
  const [reportReason,setReportReason]=useState("");
  const [reportDetail,setReportDetail]=useState("");
  const [reportToast,setReportToast]=useState(false);
  const [withdrawModal,setWithdrawModal]=useState(null); // null | "confirm1" | "confirm2"
  const [withdrawInput,setWithdrawInput]=useState("");
  const [withdrawing,setWithdrawing]=useState(false);
  const [mypageTab,setMypageTab]=useState("info");
  const [boostToast,setBoostToast]=useState(false);
  const [showPrefR,setShowPrefR]=useState(false);
  const [prefRSearch,setPrefRSearch]=useState("");
  const [profileEdit,setProfileEdit]=useState({name:"",phone:"",address:"",affiliation:"",interests:[]});
  const [profileSaved,setProfileSaved]=useState(false);
  const [sellerProfile,setSellerProfile]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [adminTab,setAdminTab]=useState("dashboard");
  const [allUsers,setAllUsers]=useState([]);
  const [allUserPrivate,setAllUserPrivate]=useState({});
  const [adminUserQ,setAdminUserQ]=useState("");
  const [emailVerifSent,setEmailVerifSent]=useState(false);
  const [reports,setReports]=useState([]);
  const [showMapPicker,setShowMapPicker]=useState(false);
  const [mapPickerLoaded,setMapPickerLoaded]=useState(false);
  const [showSearch,setShowSearch]=useState(false);
  const [photoIdx,setPhotoIdx]=useState(0);
  const [cropQueue,setCropQueue]=useState([]);
  const [cropTarget,setCropTarget]=useState("item"); // "item" | "job"
  const [cropSrc,setCropSrc]=useState(null);
  const [cropPx,setCropPx]=useState({x:0,y:0,width:0,height:0});
  const [cropZoom,setCropZoom]=useState(1);
  const [cropPos,setCropPos]=useState({x:0,y:0});
  const [cropRotation,setCropRotation]=useState(0);

  const listRef=useRef(null);
  const scrollPos=useRef(0);
  const chatEnd=useRef(null);
  const screenRef=useRef("home");
  const initialHashDone=useRef(false);
  const entryNavDone=useRef(false); // 진입 해시 네비게이션 완료 여부 (Phase1/2 중복 방지)
  const hashNavRef=useRef(null);
  const pwaModalShownRef=useRef(false);
  const standaloneNotifAsked=useRef(false);

  // ── Android 설치 프롬프트 캡처 ──
  useEffect(()=>{
    const handler=(e)=>{e.preventDefault();setDeferredPrompt(e);};
    window.addEventListener('beforeinstallprompt',handler);
    return()=>window.removeEventListener('beforeinstallprompt',handler);
  },[]);

  // ── 카카오 공유 SDK 초기화 (window.Kakao — 지도 SDK와 별개) ──
  useEffect(()=>{
    if(window.Kakao&&!window.Kakao.isInitialized()){
      window.Kakao.init("9c3090415c027e63579160554b84854d");
    }
  },[]);

  // ── PWA 설치 배너: 로그인 후 최초 1회 ──
  useEffect(()=>{
    if(!currentUser||isStandalone)return;
    if(localStorage.getItem('pwaInstallDismissed'))return;
    setShowPWABanner(true);
  },[currentUser]);

  // ── PWA 설치 안내 모달 닫힌 직후 알림 권한 요청 ──
  useEffect(()=>{
    if(showPWAModal){pwaModalShownRef.current=true;return;}
    if(!pwaModalShownRef.current)return;
    pwaModalShownRef.current=false;
    if(!currentUser)return;
    if(typeof Notification==="undefined"||Notification.permission!=="default")return;
    if(localStorage.getItem('pushDismissed'))return;
    const t=setTimeout(()=>setShowPushModal(true),350);
    return()=>clearTimeout(t);
  },[showPWAModal,currentUser]);

  // ── standalone(설치형) 앱 진입 시 알림 권한 요청 ──
  useEffect(()=>{
    if(!isStandalone||standaloneNotifAsked.current||authLoading||!currentUser)return;
    if(typeof Notification==="undefined"||Notification.permission!=="default")return;
    if(localStorage.getItem('pushDismissed'))return;
    standaloneNotifAsked.current=true;
    const t=setTimeout(()=>setShowPushModal(true),1500);
    return()=>clearTimeout(t);
  },[currentUser,authLoading]);

  // ── Firebase Auth listener ──
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async user=>{
      if(user){
        setCurrentUser(user);
        try{
          const snap=await getDoc(doc(db,"users",user.uid));
          if(snap.exists()){
            const userData={...snap.data()};
            const admin=userData.isAdmin===true;
            setIsAdmin(admin);
            // 민감 필드는 userPrivate에서 로드, 구 계정은 자동 마이그레이션
            try{
              const privSnap=await getDoc(doc(db,"userPrivate",user.uid));
              const privData=privSnap.exists()?privSnap.data():{};
              // userPrivate에서 민감 필드 병합
              userData.phone=privData.phone||"";
              userData.email=privData.email||user.email||"";
              userData.address=privData.address||"";
              userData.interests=privData.interests||[];
              userData.temp=privData.temp??36.5;
              userData.preferredRegion=privData.preferredRegion||"";
              // 구 계정 마이그레이션: users에 남아있는 민감 필드 → userPrivate으로 이동
              const PRIV_KEYS=["phone","email","address","interests","temp","preferredRegion"];
              const toPrivate={},toDel={};
              for(const k of PRIV_KEYS){
                if(privData[k]==null){
                  const val=k==="email"?(snap.data()[k]||user.email):snap.data()[k];
                  if(val!=null&&val!==""&&!(Array.isArray(val)&&val.length===0)){
                    toPrivate[k]=val;
                    if(snap.data()[k]!=null)toDel[k]=deleteField();
                  }
                }
              }
              if(Object.keys(toPrivate).length>0){
                await setDoc(doc(db,"userPrivate",user.uid),toPrivate,{merge:true});
                if(Object.keys(toDel).length>0)await updateDoc(doc(db,"users",user.uid),toDel);
              }
            }catch(e){console.log("userPrivate load:",e);}
            setUserProfile(userData);
          }
          registerFCMToken(user.uid);
        }catch(e){console.log("profile load:",e);}
      }else{
        setCurrentUser(null);setUserProfile(null);setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return()=>unsub();
  },[]);

  // isAdmin 실시간 감시: Firestore에서 isAdmin 필드가 바뀌면 즉시 반영
  useEffect(()=>{
    if(!currentUser)return;
    const unsub=onSnapshot(doc(db,"users",currentUser.uid),snap=>{
      const admin=snap.data()?.isAdmin===true;
      setIsAdmin(admin);
      console.log("[onSnapshot users] uid:",currentUser.uid,"isAdmin:",admin,snap.data()?.isAdmin);
    });
    return()=>unsub();
  },[currentUser]);

  // ── Firestore items — 비로그인도 구독 (규칙: read: true) ──
  useEffect(()=>{
    const unsub=onSnapshot(query(collection(db,"items"),orderBy("createdAt","desc")),snap=>{
      setItems(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[]);

  // ── Firestore jobs — 비로그인도 구독 (규칙: read: true) ──
  useEffect(()=>{
    const unsub=onSnapshot(query(collection(db,"jobs"),orderBy("createdAt","desc")),snap=>{
      setJobs(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[]);

  // ── Chat rooms ──
  useEffect(()=>{
    if(!currentUser||!userProfile)return;
    const unsub=onSnapshot(
      query(collection(db,"chats"),where("participants","array-contains",currentUser.uid)),
      snap=>{
        const rooms=snap.docs.map(d=>({id:d.id,...d.data()}))
          .sort((a,b)=>(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0));
        setChatRooms(rooms);
      }
    );
    return()=>unsub();
  },[currentUser,userProfile]);

  // ── Chat messages ──
  useEffect(()=>{
    if(!activeChat||screen!=="chat"||!currentUser)return;
    setMessages([]);
    const unsub=onSnapshot(
      query(collection(db,"chats",activeChat,"messages"),orderBy("createdAt")),
      snap=>setMessages(snap.docs.map(d=>({id:d.id,...d.data(),from:d.data().from===currentUser.uid?"me":"other"})))
    );
    return()=>unsub();
  },[activeChat,screen,currentUser]);

  // ── Admin: users + reports + userPrivate ──
  useEffect(()=>{
    if(!isAdmin||!currentUser)return;
    const u1=onSnapshot(collection(db,"users"),snap=>setAllUsers(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"reports"),snap=>setReports(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const u3=onSnapshot(collection(db,"userPrivate"),snap=>{const m={};snap.docs.forEach(d=>{m[d.id]=d.data();});setAllUserPrivate(m);});
    return()=>{u1();u2();u3();};
  },[isAdmin,currentUser]);

  // 채팅방을 보는 중 새 메시지 도착 시 즉시 다시 읽음 처리.
  // 상대방의 increment가 내 리셋보다 늦게 반영돼도 0으로 유지된다.
  useEffect(()=>{
    if(screen==="chat"&&activeChat&&currentUser&&messages.length>0)markChatRead(activeChat);
  },[messages]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{if(screen==="home"&&listRef.current)setTimeout(()=>{listRef.current.scrollTop=scrollPos.current;},30);},[screen]);
  useEffect(()=>{logEvent('screen_view',{screen_name:screen});},[screen]);

  // selItem을 items 실시간 데이터와 동기화 — 상세 화면 찜·채팅수 즉시 반영
  useEffect(()=>{
    if(!selItem)return;
    const updated=items.find(i=>i.id===selItem.id);
    if(updated)setSelItem(updated);
  },[items]);

  // ── 판매자 프로필 조회 ──
  useEffect(()=>{
    const id=screen==="detail"?selItem?.sellerId:screen==="jobdetail"?selJob?.sellerId:null;
    if(!id){setSellerProfile(null);return;}
    getDoc(doc(db,"users",id)).then(snap=>{
      if(snap.exists())setSellerProfile({id:snap.id,...snap.data()});
      else setSellerProfile(null);
    }).catch(()=>setSellerProfile(null));
  },[screen,selItem?.id,selJob?.id]);

  // ── 채팅 읽음 처리 ──
  // currentUser를 의존성에 포함: 로그인 정보가 늦게 채워져도 markChatRead가 재실행된다.
  useEffect(()=>{
    if(screen!=="chat"||!activeChat||!currentUser)return;
    markChatRead(activeChat);
  },[screen,activeChat,currentUser]);

  useEffect(()=>{
    if(!userProfile)return;
    setProfileEdit({name:userProfile.name||"",phone:userProfile.phone||"",address:userProfile.address||"",affiliation:userProfile.affiliation||"",interests:userProfile.interests||[]});
  },[userProfile?.name,userProfile?.phone,userProfile?.address,userProfile?.affiliation,userProfile?.interests]);


  // ── Auth functions ──
  function isValidPhone(v){const d=v.replace(/[^0-9]/g,"");return d.length>=10&&d.length<=11;}

  async function handleLogin(){
    setAuthError("");setAuthBusy(true);
    try{
      await signInWithEmailAndPassword(auth,email,password);
      window.location.hash="";
      goHome();
    }catch(e){setAuthError("이메일 또는 비밀번호를 확인해주세요");}
    setAuthBusy(false);
  }

  async function handleResetPassword(){
    if(!email.trim()){setAuthError("이메일 주소를 입력해주세요");return;}
    setAuthError("");setAuthBusy(true);
    try{
      await sendPasswordResetEmail(auth,email.trim());
    }catch(e){
      // 보안상 계정 존재 여부 노출 안 함 — 어떤 에러든 같은 메시지
    }
    setAuthBusy(false);
    setAuthStep("resetSent");
  }

  async function completeRegistration(){
    if(!regProf.name.trim()){setAuthError("이름을 입력해주세요");return;}
    if(!regProf.phone.trim()){setAuthError("전화번호를 입력해주세요");return;}
    if(!isValidPhone(regProf.phone)){setAuthError("전화번호 형식이 올바르지 않아요 (예: 010-1234-5678)");return;}
    setAuthError("");setAuthBusy(true);
    try{
      const cred=await createUserWithEmailAndPassword(auth,email,password);
      const{phone,address,interests,...publicProf}=regProf;
      // users: 공개 필드만 (판매자 카드에 표시되는 것)
      const publicData={name:publicProf.name,affiliation:publicProf.affiliation,accountType:publicProf.accountType,isAdmin:false,status:"active",createdAt:serverTimestamp()};
      // userPrivate: 민감 필드 (본인·어드민만 읽기 가능)
      const privateData={phone,address:address||"",interests:interests||[],email,temp:36.5};
      setUserProfile({...publicData,...privateData}); // optimistic
      await setDoc(doc(db,"users",cred.user.uid),publicData);
      await setDoc(doc(db,"userPrivate",cred.user.uid),privateData);
      try{await sendEmailVerification(cred.user);}catch(e){console.log("email verif:",e);}
      if(typeof Notification!=="undefined"&&Notification.permission==="default"&&!localStorage.getItem('pushDismissed')){
        setShowPushModal(true);
      }
      window.location.hash="";
      goHome();
    }catch(e){
      if(e.code==="auth/email-already-in-use")setAuthError("이미 사용 중인 이메일입니다");
      else setAuthError("회원가입 실패: 다시 시도해주세요");
      setUserProfile(null);
    }
    setAuthBusy(false);
  }

  async function handleLogout(){
    if(currentUser)await unregisterFCMToken(currentUser.uid);
    await signOut(auth);
    setIsAdmin(false);setAuthStep("splash");
  }

  function allTerms(v){setTerms({all:v,service:v,privacy:v,age:v});}

  // ── App functions ──
  const go=(s,b)=>{setScreen(s);if(b!==undefined)setBtab(b);};
  const goHome=()=>go("home","home");
  const goDetailBack=()=>{if(window.location.hash)history.back();else go("home");};

  function goDetail(item){scrollPos.current=listRef.current?.scrollTop||0;setSelItem(item);go("detail");window.location.hash=`#/item/${item.id}`;logEvent('item_view',{item_id:item.id,item_name:item.title});updateDoc(doc(db,"items",item.id),{viewCount:increment(1)}).catch(()=>{});}

  // 비로그인 시 모달 표시 후 false 반환, 로그인 시 true 반환
  function requireLogin(msg){if(currentUser)return true;setLoginPromptMsg(msg);return false;}

  async function handleHashNav(hash){
    const p=parseHash(hash);
    console.log('[공쓰재] handleHashNav 호출. hash:',hash,'→ 파싱:', p);
    if(!p)return;
    const doNotFound=()=>{
      console.error('[공쓰재] doNotFound 호출! hash 지워짐. ENTRY_HASH:',ENTRY_HASH);
      console.trace('[공쓰재] doNotFound 호출 스택');
      entryNavDone.current=true;
      window.location.hash="";
      setNotFoundToast(true);setTimeout(()=>setNotFoundToast(false),2500);go("home");
    };
    console.log('[공쓰재] Phase1 handleHashNav 시작. hash:',hash,'items.length:',items.length,'entryNavDone:',entryNavDone.current);
    if(p.type==="item"){
      let item=items.find(i=>i.id===p.id);
      if(!item){
        console.log('[공쓰재] Phase1: items에 없음 → getDoc 시도. id:',p.id);
        try{
          const s=await getDoc(doc(db,"items",p.id));
          console.log('[공쓰재] Phase1: getDoc 완료. exists:',s.exists());
          if(s.exists())item={id:s.id,...s.data()};
          else{console.error('[공쓰재] Phase1: 문서 없음(exists=false)');doNotFound();return;}
        }catch(e){
          console.warn('[공쓰재] Phase1: getDoc 예외 발생 → hash 보존, Phase2 대기. error:',e.message||e);
          return;
        }
      }
      if(entryNavDone.current){console.log('[공쓰재] Phase1: entryNavDone=true, Phase2가 이미 처리');return;}
      if(item.hidden===true){console.warn('[공쓰재] Phase1: item.hidden=true');doNotFound();return;}
      console.log('[공쓰재] Phase1: 성공! detail로 이동. id:',item.id);
      entryNavDone.current=true;
      setSelItem(item);go("detail");
      logEvent('item_view',{item_id:item.id,item_name:item.title});
      updateDoc(doc(db,"items",item.id),{viewCount:increment(1)}).catch(()=>{});
    }else if(p.type==="job"){
      let job=jobs.find(j=>j.id===p.id);
      if(!job){
        console.log('[공쓰재] Phase1: jobs에 없음 → getDoc 시도. id:',p.id);
        try{
          const s=await getDoc(doc(db,"jobs",p.id));
          console.log('[공쓰재] Phase1: job getDoc 완료. exists:',s.exists());
          if(s.exists())job={id:s.id,...s.data()};
          else{console.error('[공쓰재] Phase1: job 문서 없음');doNotFound();return;}
        }catch(e){
          console.warn('[공쓰재] Phase1: job getDoc 예외 → hash 보존. error:',e.message||e);
          return;
        }
      }
      if(entryNavDone.current){console.log('[공쓰재] Phase1: job entryNavDone=true');return;}
      if(job.hidden===true){console.warn('[공쓰재] Phase1: job.hidden=true');doNotFound();return;}
      console.log('[공쓰재] Phase1: job 성공! jobdetail로 이동. id:',job.id);
      entryNavDone.current=true;
      setSelJob(job);go("jobdetail");
    }
  }
  // hashNavRef는 매 렌더마다 최신 클로저(items/jobs 포함)를 유지
  hashNavRef.current=handleHashNav;
  // screenRef도 항상 최신 screen 유지
  screenRef.current=screen;

  async function openChat(itemId,itemTitle,sellerId){
    if(!requireLogin("채팅하려면 로그인이 필요해요"))return;
    if(sellerId===currentUser.uid){alert("본인 게시글에는 채팅할 수 없습니다");return;}
    if(typeof Notification!=="undefined"&&Notification.permission==="default"&&!localStorage.getItem('pushDismissed')){
      setShowPushModal(true);
    }
    const chatId=[currentUser.uid,sellerId].sort().join("_")+"_"+itemId;
    setActiveChat(chatId);setChatLabel(itemTitle);go("chat","chatlist");
    const chatRef=doc(db,"chats",chatId);
    const snap=await getDoc(chatRef);
    if(!snap.exists()){
      await setDoc(chatRef,{participants:[currentUser.uid,sellerId],itemId,itemTitle,lastMessage:"",updatedAt:serverTimestamp()});
      updateDoc(doc(db,"items",itemId),{chatCount:increment(1)}).catch(()=>{});
    }
  }

  function markChatRead(chatId){
    if(!currentUser||!chatId)return;
    localStorage.setItem(`chatRead_${chatId}`,Date.now().toString());
    updateDoc(doc(db,"chats",chatId),{
      [`lastRead.${currentUser.uid}`]:serverTimestamp(),
      [`unreadCount.${currentUser.uid}`]:0,
    }).catch(()=>{});
    // Firestore 왕복 전에 즉시 뱃지를 보정한다.
    // 방금 읽은 방의 unreadCount는 0으로 간주하고 나머지를 합산한다.
    if(navigator.setAppBadge){
      const uid=currentUser.uid;
      const remaining=chatRooms.reduce((sum,r)=>{
        if(r.id===chatId)return sum;
        return sum+(r.unreadCount?.[uid]||0);
      },0);
      const p=remaining>0?navigator.setAppBadge(remaining):navigator.clearAppBadge();
      p?.catch(()=>{});
    }
  }

  async function sendMsg(){
    if(!chatMsg.trim()||!activeChat||!currentUser)return;
    const text=chatMsg;setChatMsg("");
    const uid=currentUser.uid;
    // recipientId: participants에서 안정적으로 도출. onSnapshot 미도착이면 getDoc 폴백.
    let recipientId=activeChatRoom?.participants?.find(p=>p!==uid);
    if(!recipientId){
      try{
        const snap=await getDoc(doc(db,"chats",activeChat));
        recipientId=snap.data()?.participants?.find(p=>p!==uid);
      }catch(e){
        console.error("[sendMsg] participants 조회 실패:",e);
      }
    }
    if(!recipientId)console.error("[sendMsg] recipientId를 구할 수 없음. chatId:",activeChat,"uid:",uid);
    // unreadCount + lastMessage + updatedAt 한 번에 원자적으로 업데이트
    try{
      await updateDoc(doc(db,"chats",activeChat),{
        ...(recipientId?{[`unreadCount.${recipientId}`]:increment(1)}:{}),
        lastMessage:text,
        updatedAt:serverTimestamp(),
      });
    }catch(e){
      console.error("[sendMsg] chat 업데이트 실패:",e);
    }
    await addDoc(collection(db,"chats",activeChat,"messages"),{text,from:uid,fromName:userProfile?.name||userProfile?.affiliation||"사용자",createdAt:serverTimestamp()});
    markChatRead(activeChat);
  }

  async function sendContactShare(){
    if(!activeChat||!currentUser)return;
    try{
      const snap=await getDoc(doc(db,"userPrivate",currentUser.uid));
      const phone=snap.exists()?snap.data().phone:"";
      if(!phone){alert("전화번호가 등록되어 있지 않아요.\n마이페이지에서 추가해주세요.");return;}
      setContactConfirm({phone});
    }catch(e){console.error("[sendContactShare]",e);alert("연락처를 불러오지 못했어요.");}
  }

  async function confirmContactShare(phone){
    setContactConfirm(null);
    if(!activeChat||!currentUser)return;
    const uid=currentUser.uid;
    try{
      await updateDoc(doc(db,"chats",activeChat),{lastMessage:"연락처를 공유했어요",updatedAt:serverTimestamp()});
      await addDoc(collection(db,"chats",activeChat,"messages"),{type:"contact_share",phone,from:uid,fromName:userProfile?.name||userProfile?.affiliation||"사용자",createdAt:serverTimestamp()});
      markChatRead(activeChat);
    }catch(e){console.error("[confirmContactShare]",e);alert("공유에 실패했어요.");}
  }

  async function toggleLike(itemId,e){
    e?.stopPropagation();
    if(!requireLogin("찜하려면 로그인이 필요해요"))return;
    const item=items.find(i=>i.id===itemId);if(!item)return;
    const isLiked=(item.likedBy||[]).includes(currentUser.uid);
    try{
      await updateDoc(doc(db,"items",itemId),{likedBy:isLiked?arrayRemove(currentUser.uid):arrayUnion(currentUser.uid)});
    }catch(err){
      console.log("찜 오류 (Firestore 규칙 확인 필요):",err);
    }
  }

  function showFormError(msg){setFormError(msg);setTimeout(()=>setFormError(""),2500);}

  // base64 data URL → Firebase Storage 업로드 → https:// URL 반환.
  // 이미 https:// 이면 재업로드 없이 그대로 반환 (수정 시 기존 사진 보존).
  async function uploadPhotosToStorage(photos,docId,prefix="items"){
    if(!photos?.length)return[];
    return Promise.all(photos.map(async(photo,i)=>{
      if(photo.startsWith("https://"))return photo;
      const blob=await(await fetch(photo)).blob();
      const sRef=storageRef(storage,`${prefix}/${docId}/${i}_${Date.now()}.jpg`);
      await uploadBytes(sRef,blob);
      return getDownloadURL(sRef);
    }));
  }

  async function submitItem(){
    if(!form.title){showFormError("제목을 입력해주세요");return;}
    if(form.listingMode==="sale"&&!form.price){showFormError("판매 가격을 입력해주세요");return;}
    if(form.listingMode==="sale"&&parseInt(form.price)>100000000){showFormError("가격은 1억원 이하로 입력해주세요");return;}
    if(!currentUser)return;
    const derivedPostType=form.listingMode==="guhami"?"guhami":"nanumi";
    const derivedPrice=form.listingMode==="sale"?(parseInt(form.price)||0):0;
    // contact·safeNum을 분리해서 itemPrivate에만 저장
    const {listingMode,contact,safeNum,...formData}=form;
    const privateData={contact:contact||"",safeNum:!!safeNum,sellerId:currentUser.uid};
    const data={...formData,postType:derivedPostType,price:derivedPrice,showTag:formData.showTag?.trim()||"",seller:userProfile?.affiliation||userProfile?.name||"익명",sellerId:currentUser.uid,si:(userProfile?.name||userProfile?.affiliation||"나")[0],likedBy:editItem?.likedBy||[]};
    if(editItem){
      let photos;
      try{photos=await uploadPhotosToStorage(data.photos,editItem.id);}
      catch(e){console.error("[submitItem] 사진 업로드 실패:",e);showFormError("사진 업로드에 실패했어요. 다시 시도해주세요.");return;}
      const updated={...data,photos};
      try{await updateDoc(doc(db,"items",editItem.id),{...updated,createdAt:editItem.createdAt});}
      catch(e){console.error("[submitItem] items 수정 실패:",e);showFormError("저장에 실패했어요. 다시 시도해주세요.");return;}
      // itemPrivate 저장 실패 시 에러 표시 (items 수정은 이미 완료됐으나 연락처 유실 방지)
      try{
        await setDoc(doc(db,"itemPrivate",editItem.id),privateData,{merge:true});
      }catch(e){
        console.error("[submitItem] itemPrivate 수정 실패:",e);
        showFormError("연락처 저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
      setSelItem({...updated,id:editItem.id});
    }else{
      const newRef=doc(collection(db,"items"));
      let photos;
      try{photos=await uploadPhotosToStorage(data.photos,newRef.id);}
      catch(e){console.error("[submitItem] 사진 업로드 실패:",e);showFormError("사진 업로드에 실패했어요. 다시 시도해주세요.");return;}
      // items 먼저 저장
      try{await setDoc(newRef,{...data,photos,createdAt:serverTimestamp()});}
      catch(e){console.error("[submitItem] items 저장 실패:",e);showFormError("저장에 실패했어요. 다시 시도해주세요.");return;}
      // itemPrivate 저장 실패 시 items 롤백
      try{
        await setDoc(doc(db,"itemPrivate",newRef.id),privateData);
      }catch(e){
        console.error("[submitItem] itemPrivate 저장 실패, items 롤백:",e);
        try{await deleteDoc(doc(db,"items",newRef.id));}catch(_){}
        showFormError("연락처 저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
    }
    setEditItem(null);setForm(emptyForm);setPosted(true);
    setTimeout(()=>{setPosted(false);go(editItem?"detail":"home",editItem?undefined:"home");},1200);
  }

  async function startEdit(item){
    const listingMode=item.postType==="guhami"?"guhami":(item.price>0?"sale":"nanumi");
    // itemPrivate에서 연락처 읽기, 없으면(마이그레이션 전 구글 글) item에서 fallback
    let contact=item.contact||"";
    let safeNum=item.safeNum||false;
    try{
      const privSnap=await getDoc(doc(db,"itemPrivate",item.id));
      if(privSnap.exists()){contact=privSnap.data().contact||"";safeNum=privSnap.data().safeNum||false;}
    }catch(e){console.log("[startEdit] itemPrivate load:",e);}
    setForm({title:item.title,category:item.category||[],itemName:item.itemName||"",price:item.price?.toString()||"",desc:item.desc||"",region:item.region||"",contact,safeNum,tradePlace:item.tradePlace||"",tradeLat:item.tradeLat||null,tradeLng:item.tradeLng||null,photos:item.photos||[],status:item.status||"selling",postType:item.postType||"nanumi",showTag:item.showTag||"",showEndDate:item.showEndDate||"",listingMode});
    setEditItem(item);setPostMode("item");go("post","post");
  }

  async function changeStatus(itemId,status){
    await updateDoc(doc(db,"items",itemId),{status});
    setSelItem(p=>p?{...p,status}:p);
    // [임시 비활성화] 후기 모달 진입 막음 — 추후 재설계
    // if(status==="done"){const item=items.find(i=>i.id===itemId);if(item)setTimeout(()=>setReviewModal(item),400);}
  }

  async function boostItem(id){
    await updateDoc(doc(db,"items",id),{createdAt:serverTimestamp()});
    setBoostToast(true);setTimeout(()=>setBoostToast(false),2000);
  }

  async function submitReview(positive){
    if(!reviewModal||!currentUser)return;
    // 리뷰 기록만 남기고 temp 업데이트는 Cloud Function(onReviewCreated)이 처리.
    // 문서 ID = itemId_reviewerId → 같은 거래 중복 평가 방지
    try{
      await setDoc(doc(db,"reviews",`${reviewModal.id}_${currentUser.uid}`),{
        itemId:reviewModal.id,
        reviewerId:currentUser.uid,
        revieweeId:reviewModal.sellerId,
        positive,
        delta:positive?0.3:-0.3,
        createdAt:serverTimestamp(),
      });
    }catch(e){console.error("[submitReview] setDoc 실패:",e);}
    setReviewModal(null);
  }

  async function submitJob(){
    if(!jform.title){showFormError("공고 제목을 입력해주세요");return;}
    if(!currentUser)return;
    const wasEditing=!!editJob;
    const {photos:rawPhotos,...jformRest}=jform;
    const data={...jformRest,org:jformRest.org||userProfile?.affiliation||userProfile?.name||"나",icon:editJob?.icon||"📋",sellerId:currentUser.uid};
    try{
      if(editJob){
        let photos;
        try{photos=await uploadPhotosToStorage(rawPhotos,editJob.id,"jobs");}
        catch(e){console.error("[submitJob] 사진 업로드 실패:",e);showFormError("사진 업로드에 실패했어요. 다시 시도해주세요.");return;}
        const updated={...data,photos,createdAt:editJob.createdAt};
        await updateDoc(doc(db,"jobs",editJob.id),updated);
        setSelJob({...updated,id:editJob.id});
      }else{
        const newRef=doc(collection(db,"jobs"));
        let photos;
        try{photos=await uploadPhotosToStorage(rawPhotos,newRef.id,"jobs");}
        catch(e){console.error("[submitJob] 사진 업로드 실패:",e);showFormError("사진 업로드에 실패했어요. 다시 시도해주세요.");return;}
        await setDoc(newRef,{...data,photos,createdAt:serverTimestamp()});
      }
    }catch(e){
      console.error("[submitJob]",e);
      showFormError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setEditJob(null);setJform(emptyJform);setPosted(true);
    setTimeout(()=>{setPosted(false);if(wasEditing){go("jobdetail");}else{setMainTab("jobs");goHome();}},1200);
  }

  function startEditJob(job){setJform({title:job.title,org:job.org||"",field:job.field,type:job.type,pay:job.pay,date:job.date,desc:job.desc,location:job.location,jobType:job.jobType||"guin",jobStatus:job.jobStatus||"active",photos:job.photos||[]});setEditJob(job);setPostMode("job");go("post","post");}
  async function changeJobStatus(id,s){await updateDoc(doc(db,"jobs",id),{jobStatus:s});setSelJob(p=>p?{...p,jobStatus:s}:p);}
  async function toggleCat(c){setForm(p=>({...p,category:p.category.includes(c)?p.category.filter(x=>x!==c):[...p.category,c]}));}
  function handlePhotos(e,target="item"){
    const files=Array.from(e.target.files);
    if(!files.length)return;
    e.target.value="";
    const readers=files.map(f=>new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.readAsDataURL(f);}));
    Promise.all(readers).then(srcs=>{
      setCropTarget(target);
      setCropQueue(srcs);
      setCropSrc(srcs[0]);
      setCropZoom(1);setCropPos({x:0,y:0});setCropRotation(0);
    });
  }
  async function handleCropConfirm(){
    try{
      const dataUrl=await getCroppedImg(cropSrc,cropPx,cropRotation);
      if(cropTarget==="job") setJform(p=>({...p,photos:[...(p.photos||[]),dataUrl]}));
      else setForm(p=>({...p,photos:[...p.photos,dataUrl]}));
    }catch(e){console.error("[crop]",e);}
    const remaining=cropQueue.slice(1);
    setCropQueue(remaining);
    if(remaining.length>0){setCropSrc(remaining[0]);setCropZoom(1);setCropPos({x:0,y:0});setCropRotation(0);}
    else setCropSrc(null);
  }
  function handleCropCancel(){
    const remaining=cropQueue.slice(1);
    setCropQueue(remaining);
    if(remaining.length>0){setCropSrc(remaining[0]);setCropZoom(1);setCropPos({x:0,y:0});setCropRotation(0);}
    else setCropSrc(null);
  }
  const onCropComplete=useCallback((_,px)=>setCropPx(px),[]);

  async function toggleUserStatus(uid){const u=allUsers.find(x=>x.id===uid);if(u)await updateDoc(doc(db,"users",uid),{status:u.status==="active"?"suspended":"active"});}
  async function toggleAdminRole(uid){
    const u=allUsers.find(x=>x.id===uid);if(!u)return;
    if(u.isAdmin===true&&allUsers.filter(x=>x.isAdmin===true).length<=1){alert("마지막 어드민은 해제할 수 없어요.");return;}
    const msg=u.isAdmin===true?"이 회원의 어드민 권한을 해제할까요?":"이 회원에게 어드민 권한을 부여할까요?";
    if(window.confirm(msg))await updateDoc(doc(db,"users",uid),{isAdmin:!u.isAdmin});
  }
  async function submitReport(targetType,targetId,reason,detail){
    if(!currentUser||!reason)return;
    await addDoc(collection(db,"reports"),{reporterId:currentUser.uid,targetType,targetId,reason,detail:detail||"",status:"pending",createdAt:serverTimestamp()});
    setReportModal(null);setReportReason("");setReportDetail("");
    setReportToast(true);setTimeout(()=>setReportToast(false),3000);
  }
  async function deleteItem(id){
    const item=items.find(i=>i.id===id);
    // Storage 사진 삭제 (실패해도 계속)
    if(item?.photos?.length){
      await Promise.allSettled(item.photos.map(url=>{
        const path=storagePathFromUrl(url);
        if(!path)return Promise.resolve();
        return deleteObject(storageRef(storage,path));
      }));
    }
    // itemPrivate 삭제
    await deleteDoc(doc(db,"itemPrivate",id)).catch(()=>{});
    // 연결된 채팅 soft-delete (leftBy) — chatRooms 상태 대신 직접 쿼리
    try{
      const chatSnap=await getDocs(query(collection(db,"chats"),where("itemId","==",id)));
      await Promise.allSettled(chatSnap.docs.map(d=>
        updateDoc(d.ref,{leftBy:arrayUnion(currentUser?.uid)})
      ));
    }catch(e){console.warn("[deleteItem] 채팅 soft-delete 실패:",e);}
    // 본문 삭제
    await deleteDoc(doc(db,"items",id));
  }
  async function deleteJob(id){
    const job=jobs.find(j=>j.id===id);
    if(job?.photos?.length){
      await Promise.allSettled(job.photos.map(url=>{
        const path=storagePathFromUrl(url);
        if(!path)return Promise.resolve();
        return deleteObject(storageRef(storage,path));
      }));
    }
    try{
      const chatSnap=await getDocs(query(collection(db,"chats"),where("itemId","==",id)));
      await Promise.allSettled(chatSnap.docs.map(d=>
        updateDoc(d.ref,{leftBy:arrayUnion(currentUser?.uid)})
      ));
    }catch(e){console.warn("[deleteJob] 채팅 soft-delete 실패:",e);}
    await deleteDoc(doc(db,"jobs",id));
  }
  async function deleteCurrentUser(){
    if(!currentUser)return;
    const uid=currentUser.uid;
    setWithdrawing(true);
    try{
      // 1. 내 게시글 익명화 (items·jobs)
      const myItemsSnap=await getDocs(query(collection(db,"items"),where("sellerId","==",uid)));
      await Promise.allSettled(myItemsSnap.docs.map(d=>updateDoc(d.ref,{seller:"탈퇴한 회원",si:"탈"})));
      await Promise.allSettled(myItemsSnap.docs.map(d=>deleteDoc(doc(db,"itemPrivate",d.id)).catch(()=>{})));
      const myJobsSnap=await getDocs(query(collection(db,"jobs"),where("sellerId","==",uid)));
      await Promise.allSettled(myJobsSnap.docs.map(d=>updateDoc(d.ref,{org:"탈퇴한 회원"})));
      // 2. 찜한 글 likedBy에서 내 uid 제거
      await Promise.allSettled(likedItems.map(item=>updateDoc(doc(db,"items",item.id),{likedBy:arrayRemove(uid)})));
      // 3. 채팅 soft-delete
      const myChatsSnap=await getDocs(query(collection(db,"chats"),where("participants","array-contains",uid)));
      await Promise.allSettled(myChatsSnap.docs.map(d=>updateDoc(d.ref,{leftBy:arrayUnion(uid)})));
      // 4. userPrivate 삭제
      await deleteDoc(doc(db,"userPrivate",uid)).catch(()=>{});
      // 5. users 삭제
      await deleteDoc(doc(db,"users",uid));
      // 6. Firebase Auth 삭제 (반드시 마지막)
      await deleteUser(auth.currentUser);
      goHome();
    }catch(e){
      setWithdrawing(false);
      if(e.code==="auth/requires-recent-login"){
        setWithdrawModal(null);
        alert("보안을 위해 재로그인 후 다시 탈퇴해 주세요.");
      }else{
        alert("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        console.error("[deleteCurrentUser]",e);
      }
    }
  }
  async function hideItem(id,hide){await updateDoc(doc(db,"items",id),{hidden:hide});}
  async function hideJob(id,hide){await updateDoc(doc(db,"jobs",id),{hidden:hide});}
  async function updateReport(id,status){await updateDoc(doc(db,"reports",id),{status});}

  function openKakaoMap(address){
    if(!address)return;
    const q=encodeURIComponent(address);
    const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if(isMobile){
      window.location.href=`kakaomap://search?q=${q}`;
      setTimeout(()=>window.open(`https://map.kakao.com/?q=${q}`,"_blank"),1500);
    }else{
      window.open(`https://map.kakao.com/?q=${q}`,"_blank");
    }
  }

  useEffect(()=>setPhotoIdx(0),[selItem?.id]);

  // 구게시글 base64 사진 → Storage 자동 마이그레이션.
  // 소유자가 상세를 열 때 백그라운드에서 변환 후 selItem 상태와 Firestore를 모두 갱신.
  // "카톡" 버튼을 누르기 전에 https:// URL이 준비되어 공유 카드에 실제 사진이 뜸.
  useEffect(()=>{
    if(!selItem||!currentUser)return;
    if(selItem.sellerId!==currentUser.uid)return;
    const needsMigration=selItem.photos?.some(p=>typeof p==="string"&&p.startsWith("data:"));
    if(!needsMigration)return;
    let cancelled=false;
    (async()=>{
      try{
        const uploaded=await uploadPhotosToStorage(selItem.photos,selItem.id);
        if(cancelled)return;
        await updateDoc(doc(db,"items",selItem.id),{photos:uploaded});
        setSelItem(p=>p?{...p,photos:uploaded}:p);
      }catch(e){}
    })();
    return()=>{cancelled=true;};
  },[selItem?.id,currentUser?.uid]);

  // 카카오맵 로드
  useEffect(()=>{
    if(screen!=="detail"||!selItem?.tradePlace)return;
    let cancelled=false;

    loadKakaoSDK(()=>{
      if(cancelled)return;
      const el=document.getElementById("kakaoMapDetail");
      if(!el)return;
      try{
        const lat=selItem.tradeLat||37.5665;
        const lng=selItem.tradeLng||126.9780;
        const coords=new window.kakao.maps.LatLng(lat,lng);
        const map=new window.kakao.maps.Map(el,{center:coords,level:4,draggable:false,scrollwheel:false,disableDoubleClickZoom:true,keyboardShortcuts:false});
        map.relayout(); // Safari/PWA: paint 전 생성 시 빈 지도 방지
        new window.kakao.maps.Marker({map,position:coords});
        if(!selItem.tradeLat){
          const ps=new window.kakao.maps.services.Places();
          ps.keywordSearch(selItem.tradePlace,(result,status)=>{
            if(cancelled)return;
            if(status===window.kakao.maps.services.Status.OK){
              const c=new window.kakao.maps.LatLng(result[0].y,result[0].x);
              map.setCenter(c);
              new window.kakao.maps.Marker({map,position:c});
            }
          });
        }
      }catch(e){console.log("map error:",e);}
    });

    return()=>{cancelled=true;};
  },[screen,selItem?.tradePlace]);

  // 전체화면 지도 초기화
  useEffect(()=>{
    if(!fullscreenMapData)return;
    let cancelled=false;
    loadKakaoSDK(()=>{
      if(cancelled)return;
      const el=document.getElementById("kakaoMapFullscreen");
      if(!el)return;
      try{
        const lat=fullscreenMapData.lat||37.5665;
        const lng=fullscreenMapData.lng||126.9780;
        const coords=new window.kakao.maps.LatLng(lat,lng);
        const map=new window.kakao.maps.Map(el,{center:coords,level:4,draggable:true,scrollwheel:true,disableDoubleClickZoom:false,keyboardShortcuts:true});
        map.relayout();
        new window.kakao.maps.Marker({map,position:coords});
        if(!fullscreenMapData.lat&&fullscreenMapData.place){
          const ps=new window.kakao.maps.services.Places();
          ps.keywordSearch(fullscreenMapData.place,(result,status)=>{
            if(cancelled)return;
            if(status===window.kakao.maps.services.Status.OK){
              const c=new window.kakao.maps.LatLng(result[0].y,result[0].x);
              map.setCenter(c);
              new window.kakao.maps.Marker({map,position:c});
            }
          });
        }
      }catch(e){console.log("fullscreen map error:",e);}
    });
    return()=>{cancelled=true;};
  },[fullscreenMapData]);

  async function updateMyProfile(updates){
    if(!currentUser)return;
    const PRIV=["phone","email","address","interests","temp","preferredRegion"];
    const priv={},pub={};
    Object.entries(updates).forEach(([k,v])=>{if(PRIV.includes(k))priv[k]=v;else pub[k]=v;});
    if(Object.keys(pub).length>0)await updateDoc(doc(db,"users",currentUser.uid),pub);
    if(Object.keys(priv).length>0)await setDoc(doc(db,"userPrivate",currentUser.uid),priv,{merge:true});
    setUserProfile(p=>({...p,...updates}));
  }

  // ── Computed ──
  const filtItems=useMemo(()=>{
    let l=items.filter(i=>i.hidden!==true);
    if(typeFilter==="나눔")l=l.filter(i=>i.postType==="nanumi"&&i.price===0);
    else if(typeFilter==="구함")l=l.filter(i=>i.postType==="guhami");
    else if(typeFilter==="판매")l=l.filter(i=>i.postType==="nanumi"&&i.price>0);
    if(showTagFilter)l=l.filter(i=>i.showTag===showTagFilter);
    if(q)l=l.filter(i=>i.title?.includes(q)||i.itemName?.includes(q)||i.region?.includes(q)||i.showTag?.includes(q));
    if(localFirst&&userProfile?.preferredRegion){const city=userProfile.preferredRegion.split(" ")[0];l=[...l.filter(i=>i.region?.startsWith(city)),...l.filter(i=>!i.region?.startsWith(city))];}
    return l;
  },[items,typeFilter,q,showTagFilter,localFirst,userProfile?.preferredRegion]);

  const nanumiDoneCount=useMemo(()=>items.filter(i=>i.postType==="nanumi"&&i.status==="done").length,[items]);
  const filtJobs=useMemo(()=>{let l=jobs.filter(j=>j.hidden!==true);if(fld!=="전체")l=l.filter(j=>j.field===fld);if(q)l=l.filter(j=>j.title?.includes(q)||j.org?.includes(q));return l;},[jobs,fld,q,currentUser]);
  const filtPrefR=useMemo(()=>REGIONS.filter(r=>r.includes(prefRSearch)),[prefRSearch]);
  const likedItems=useMemo(()=>items.filter(i=>i.likedBy?.includes(currentUser?.uid)),[items,currentUser]);
  const myItems=useMemo(()=>items.filter(i=>i.sellerId===currentUser?.uid),[items,currentUser]);
  const filtAdminUsers=useMemo(()=>adminUserQ?allUsers.filter(u=>u.name?.includes(adminUserQ)||u.affiliation?.includes(adminUserQ)):allUsers,[allUsers,adminUserQ]);
  const unreadMsgCount=useMemo(()=>{
    const uid=currentUser?.uid;
    if(!uid)return 0;
    return chatRooms.filter(r=>!r.leftBy?.includes(uid)).reduce((sum,r)=>{
      if(r.id===activeChat&&screen==="chat")return sum;
      return sum+(r.unreadCount?.[uid]||0);
    },0);
  },[chatRooms,activeChat,screen,currentUser]);

  // ── 앱 아이콘 뱃지 (App Badging API, iOS 16.4+) ──
  useEffect(()=>{
    if(!navigator.setAppBadge)return;
    const p=unreadMsgCount>0?navigator.setAppBadge(unreadMsgCount):navigator.clearAppBadge();
    p?.catch(()=>{});
  },[unreadMsgCount]);

  // 백그라운드→포그라운드 복귀 시 뱃지 재보정 (iOS PWA onSnapshot 재연결 지연 대응)
  useEffect(()=>{
    if(!navigator.setAppBadge)return;
    const onVisible=()=>{
      if(document.visibilityState!=="visible")return;
      const p=unreadMsgCount>0?navigator.setAppBadge(unreadMsgCount):navigator.clearAppBadge();
      p?.catch(()=>{});
    };
    document.addEventListener("visibilitychange",onVisible);
    return()=>document.removeEventListener("visibilitychange",onVisible);
  },[unreadMsgCount]);

  // ── Hash routing ──
  // Phase1: auth 완료 후 1회 실행. ENTRY_HASH 사용 (window.location.hash가 이미 지워졌어도 안전)
  useEffect(()=>{
    if(initialHashDone.current)return;
    if(authLoading)return;
    initialHashDone.current=true;
    const hash=ENTRY_HASH||window.location.hash;
    console.log('[공쓰재] Phase1 effect 실행. hash:',hash,'authLoading:',authLoading,'currentUser:',!!currentUser);
    if(hash)hashNavRef.current(hash);
  },[authLoading,currentUser]);

  // Phase2: items/jobs 로드 후 재시도 — Phase1의 getDoc 타이밍 실패 커버
  useEffect(()=>{
    if(entryNavDone.current||authLoading)return;
    const p=parseHash(ENTRY_HASH||"");if(!p)return;
    console.log('[공쓰재] Phase2 effect 실행. items.length:',items.length,'jobs.length:',jobs.length,'entryNavDone:',entryNavDone.current);
    if(p.type==="item"){
      const found=items.find(i=>i.id===p.id);
      if(!found){console.log('[공쓰재] Phase2: 아직 item 없음, 대기 중');return;}
      console.log('[공쓰재] Phase2: item 찾음! id:',found.id,'hidden:',found.hidden);
      entryNavDone.current=true;
      if(found.hidden===true){window.location.hash="";setNotFoundToast(true);setTimeout(()=>setNotFoundToast(false),2500);go("home");return;}
      setSelItem(found);go("detail");
      logEvent('item_view',{item_id:found.id,item_name:found.title});
      updateDoc(doc(db,"items",found.id),{viewCount:increment(1)}).catch(()=>{});
    }else if(p.type==="job"){
      const found=jobs.find(j=>j.id===p.id);
      if(!found){console.log('[공쓰재] Phase2: 아직 job 없음, 대기 중');return;}
      console.log('[공쓰재] Phase2: job 찾음! id:',found.id,'hidden:',found.hidden);
      entryNavDone.current=true;
      if(found.hidden===true){window.location.hash="";setNotFoundToast(true);setTimeout(()=>setNotFoundToast(false),2500);go("home");return;}
      setSelJob(found);go("jobdetail");
    }
  },[items,jobs,authLoading]);

  // hashchange: 브라우저 뒤로가기 or 앞으로가기
  useEffect(()=>{
    const onHashChange=()=>{
      const hash=window.location.hash;
      const parsed=parseHash(hash);
      console.warn('[공쓰재] 앱 hashchange 핸들러 실행! hash:',hash||'(empty)','parsed:',parsed,'screen:',screenRef.current,'entryNavDone:',entryNavDone.current);
      if(!parsed){
        // ★ 이 분기가 실행되면 screen을 리셋 — 범인 여기
        console.warn('[공쓰재] parsed=null → screen:',screenRef.current,'→ home 이동 여부:',(screenRef.current==="detail"||screenRef.current==="jobdetail"));
        if(screenRef.current==="detail"||screenRef.current==="jobdetail")go("home");
      }else{
        hashNavRef.current(hash);
      }
    };
    window.addEventListener("hashchange",onHashChange);
    return()=>window.removeEventListener("hashchange",onHashChange);
  },[]);

  const activeChatRoom=useMemo(()=>chatRooms.find(r=>r.id===activeChat),[chatRooms,activeChat]);
  const activeChatLinked=useMemo(()=>{const id=activeChatRoom?.itemId;if(!id)return null;return items.find(i=>i.id===id)||jobs.find(j=>j.id===id)||null;},[activeChatRoom,items,jobs]);
  const catStats=useMemo(()=>ITEM_CATS_ALL.map(c=>({label:c,value:items.filter(i=>i.category?.includes(c)).length})),[items]);
  const regionStats=useMemo(()=>{const m={};items.forEach(i=>{const c=i.region?.split(" ")[0]||"기타";m[c]=(m[c]||0)+1;});return Object.entries(m).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);},[items]);
  const adminStats=useMemo(()=>({totalUsers:allUsers.length,activeUsers:allUsers.filter(u=>u.status!=="suspended").length,totalItems:items.length,doneItems:items.filter(i=>i.status==="done").length,totalJobs:jobs.length,reports:reports.filter(r=>r.status==="pending").length}),[allUsers,items,jobs,reports]);

  // ── UI Helpers ──
  const inp={width:"100%",borderRadius:10,border:"0.5px solid #e0e0e0",padding:"10px 12px",fontSize:14,boxSizing:"border-box",outline:"none"};
  const tabColor=mainTab==="jobs"?TAB_JOB:mainTab==="spaces"?TAB_SPACE:TAB_ITEM;
  const chip=(label,active,fn)=>(<button key={label} onClick={fn} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:active?tabColor:"#e0e0e0",background:active?tabColor:"#fff",color:active?"#fff":"#555",fontSize:12,cursor:"pointer",fontWeight:active?500:400}}>{label}</button>);
  const tb=(t)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 0",cursor:"pointer",fontSize:11,color:btab===t?ACCENT:"#aaa",fontWeight:btab===t?500:400,border:"none",background:"none"});
  const tic=(t)=>({fontSize:22,color:btab===t?ACCENT:"#bbb"});
  const mkBadge=(label,bg,color)=>(<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:bg,color,fontWeight:500}}>{label}</span>);
  const [shareToast,setShareToast]=useState(false);
  const [shareModal,setShareModal]=useState(null); // {type:'item'|'job', post}
  const [notFoundToast,setNotFoundToast]=useState(false);
  const [moreMenu,setMoreMenu]=useState(null); // "item"|"job"|null
  const sharePost=(title,text,shareUrl)=>{const url=shareUrl||"https://twr.or.kr";if(navigator.share){navigator.share({title,text,url}).catch(()=>{});}else{navigator.clipboard?.writeText(url).then(()=>{setShareToast(true);setTimeout(()=>setShareToast(false),2000);});}};
  const copyLink=(url)=>{
    const ok=()=>{setShareToast(true);setTimeout(()=>setShareToast(false),2000);};
    const fallback=()=>{try{const el=document.createElement("textarea");el.value=url;el.style.cssText="position:fixed;top:-9999px;opacity:0";document.body.appendChild(el);el.focus();el.select();document.execCommand("copy");el.remove();}catch(_){}ok();};
    try{navigator.clipboard.writeText(url).then(ok).catch(fallback);}catch(_){fallback();}
  };
  const shareKakao=(type,post)=>{
    if(!window.Kakao?.Share)return;
    // 카카오 인앱 브라우저는 hash도 query도 소실 → path 방식으로 전달
    // Vercel rewrite: /open/item/{id} → index.html → 앱에서 #/item/{id}로 변환
    const url=`https://twr.or.kr/open/${type}/${post.id}`;
    console.log('[공쓰재] shareKakao URL:', url);
    const desc=type==="item"
      ?[post.postType==="guhami"?"구함":post.price?`${Number(post.price).toLocaleString()}원`:"나눔",post.region].filter(Boolean).join(" · ")
      :[post.field,post.jobType==="gujik"?"구직":"구인",post.region].filter(Boolean).join(" · ");
    // Storage URL(https://)만 카카오 서버에서 가져올 수 있음. base64 또는 없으면 로고 fallback.
    const firstPhoto=post.photos?.find(p=>typeof p==="string"&&p.startsWith("https://"));
    const imageUrl=firstPhoto||"https://twr.or.kr/gongssujae_logo_full.png";
    window.Kakao.Share.sendDefault({
      objectType:"feed",
      content:{
        title:post.title,
        description:`${desc} · 공쓰재`,
        imageUrl,
        link:{mobileWebUrl:url,webUrl:url},
      },
      buttons:[{title:"공쓰재에서 보기",link:{mobileWebUrl:url,webUrl:url}}],
    });
  };
  const CAT_ICON={"세트":"🎪","소품":"🪑","의상":"👘","장비":"🔦","기타":"📦"};
  const STATUS_LABEL={"selling":"판매중","reserved":"예약중","done":"거래완료"};
  const STATUS_STYLE={"selling":{background:"#e8f5e9",color:"#2e7d32"},"reserved":{background:"#fff3e0",color:"#e65100"},"done":{background:"rgba(0,0,0,0.35)",color:"#fff"}};
  const regionShort=(r)=>r?r.replace(/^[가-힣]+ /,""):"";
  const itemBadges=(item)=>[item.postType==="guhami"&&mkBadge("구하미","#fce4ec","#c62828"),item.status==="reserved"&&mkBadge("예약중","#fff3e0","#e65100"),item.status==="done"&&mkBadge("거래완료","#f5f5f5","#9e9e9e")].filter(Boolean);
  const jobBadges=(job)=>[job.jobType==="gujik"&&mkBadge("구직","#f3e5f5","#6a1b9a"),job.jobStatus==="done"&&mkBadge("완료","#f5f5f5","#9e9e9e")].filter(Boolean);
  const jbadge=(t)=>mkBadge(t,t==="장기"?"#e8f4fd":"#fff3e0",t==="장기"?"#1565c0":"#e65100");
  const encoreBadge=(count)=><span style={{fontSize:11,color:ACCENT,fontWeight:600}}>👏 앙코르 {count||0}회</span>;
  const showTagPill=(tag,clickable)=>tag?<button onClick={clickable?()=>{setShowTagFilter(tag);goHome();}:undefined} style={{fontSize:10,padding:"2px 10px",borderRadius:10,background:"#e8eaf6",color:"#3949ab",fontWeight:500,border:"none",cursor:clickable?"pointer":"default"}}>🎭 {tag}</button>:null;
  const StatCard=({label,value,color="#1a1a1a"})=>(<div style={{flex:"1 1 calc(33% - 8px)",background:"#f9f9f9",borderRadius:12,padding:"12px 10px",minWidth:80}}><div style={{fontSize:22,fontWeight:700,color}}>{value}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{label}</div></div>);
  const BarChart=({data,color=ACCENT})=>{const max=Math.max(...data.map(d=>d.value),1);return data.map(d=>(<div key={d.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:44,fontSize:11,color:"#888",textAlign:"right",flexShrink:0}}>{d.label}</div><div style={{flex:1,height:18,background:"#f0f0f0",borderRadius:9,overflow:"hidden"}}><div style={{height:"100%",width:`${(d.value/max)*100}%`,background:color,borderRadius:9}}/></div><div style={{width:16,fontSize:11,color:"#555",fontWeight:500,textAlign:"right"}}>{d.value}</div></div>));};

  // ── Welcome (첫 방문 인트로, 로그인 여부 무관) ──
  if(showWelcome)return(
    <div className="app-shell" style={{...shellStyle,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"0 32px",boxSizing:"border-box",background:BG}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%"}}>
        <img src="/gongssujae_logo_full.png" alt="공쓰재" style={{width:"100%",maxWidth:200,marginBottom:40}}/>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a",textAlign:"center",lineHeight:1.5,marginBottom:12,letterSpacing:"-0.3px"}}>공연 쓰고 남은 거, 재활용</div>
        <div style={{fontSize:14,color:"#888",textAlign:"center",lineHeight:1.8,letterSpacing:"-0.1px"}}>공연에 쓰고 남은 물건과<br/>일자리를 나눕니다</div>
      </div>
      <div style={{width:"100%",paddingBottom:"max(40px,env(safe-area-inset-bottom,40px))"}}>
        <button onClick={()=>{localStorage.setItem('welcomeSeen','1');setShowWelcome(false);}} style={{width:"100%",height:54,borderRadius:16,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 20px ${ACCENT}55`}}>둘러보기</button>
      </div>
    </div>
  );

  // ── Loading ──
  if(authLoading)return(
    <div className="app-shell" style={{...shellStyle,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}><img src="/gongssujae_symbol.png" alt="공쓰재" style={{height:64,marginBottom:12}}/><div style={{fontSize:12,color:"#ccc",marginTop:6}}>로딩 중...</div></div>
    </div>
  );

  // ── Auth Screens ──
  if(!currentUser||!userProfile){
    const wrap=ch=>(<div className="app-shell" style={{...shellStyle,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>{ch}</div>);
    const backBtn=to=>(<button onClick={()=>{setAuthStep(to);setAuthError("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",marginBottom:20,alignSelf:"flex-start"}}><i className="ti ti-arrow-left"/></button>);
    const ErrBox=()=>authError?<div style={{fontSize:12,color:"#c62828",marginBottom:12,padding:"8px 12px",background:"#ffebee",borderRadius:8}}>{authError}</div>:null;

    // authStep==="splash": 재방문 비로그인 → fall-through to 메인 앱 (둘러보기 모드)

    if(authStep==="login")return wrap(<>
      {backBtn("splash")}
      <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>로그인</div>
      <div style={{fontSize:13,color:"#999",marginBottom:24}}>이메일과 비밀번호를 입력하세요</div>
      <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>이메일</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소" type="email" style={inp}/></div>
      <div style={{marginBottom:16}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>비밀번호</div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" type="password" onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={inp}/></div>
      <ErrBox/>
      <button onClick={handleLogin} disabled={authBusy} style={{width:"100%",height:48,borderRadius:12,border:"none",background:email&&password?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:12}}>{authBusy?"로그인 중...":"로그인"}</button>
      <button onClick={()=>{setAuthStep("resetPw");setAuthError("");}} style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",marginBottom:16}}>비밀번호를 잊으셨나요?</button>
      <button onClick={()=>{setAuthStep("register");setAuthError("");}} style={{background:"none",border:"none",color:ACCENT,fontSize:13,cursor:"pointer"}}>계정이 없으신가요? 회원가입 →</button>
    </>);

    if(authStep==="resetPw")return wrap(<>
      {backBtn("login")}
      <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>비밀번호 재설정</div>
      <div style={{fontSize:13,color:"#999",marginBottom:24}}>가입한 이메일을 입력하면 재설정 링크를 보내드려요</div>
      <div style={{marginBottom:16}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>이메일</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소" type="email" onKeyDown={e=>e.key==="Enter"&&handleResetPassword()} style={inp}/></div>
      <ErrBox/>
      <button onClick={handleResetPassword} disabled={authBusy} style={{width:"100%",height:48,borderRadius:12,border:"none",background:email.trim()?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>{authBusy?"전송 중...":"재설정 메일 보내기"}</button>
    </>);

    if(authStep==="resetSent")return(
      <div className="app-shell" style={{...shellStyle,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,boxSizing:"border-box"}}>
        <div style={{fontSize:48,marginBottom:20}}>📬</div>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8,textAlign:"center"}}>메일을 보냈어요</div>
        <div style={{fontSize:14,color:"#888",textAlign:"center",lineHeight:1.7,marginBottom:32}}>재설정 링크를 이메일로 보냈어요.<br/>메일함을 확인해주세요.<br/><span style={{fontSize:12,color:"#bbb"}}>(스팸 폴더도 확인해보세요)</span></div>
        <button onClick={()=>{setAuthStep("login");setAuthError("");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>로그인으로 돌아가기</button>
      </div>
    );

    if(authStep==="register")return wrap(<>
      {backBtn("splash")}
      <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>회원가입</div>
      <div style={{fontSize:13,color:"#999",marginBottom:24}}>공쓰재에 오신 것을 환영해요!</div>
      <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>이메일</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="이메일 주소" type="email" style={inp}/></div>
      <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>비밀번호 (6자 이상)</div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" type="password" style={inp}/></div>
      <div style={{marginBottom:16}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>비밀번호 확인</div><input value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="비밀번호 재입력" type="password" style={inp}/></div>
      <ErrBox/>
      <button onClick={()=>{
        if(!email||!password||!confirmPw){setAuthError("모든 항목을 입력해주세요");return;}
        if(password!==confirmPw){setAuthError("비밀번호가 일치하지 않습니다");return;}
        if(password.length<6){setAuthError("비밀번호는 6자 이상이어야 합니다");return;}
        setAuthError("");setAuthStep("terms");
      }} style={{width:"100%",height:48,borderRadius:12,border:"none",background:email&&password&&confirmPw?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:16}}>다음</button>
      <button onClick={()=>{setAuthStep("login");setAuthError("");}} style={{background:"none",border:"none",color:ACCENT,fontSize:13,cursor:"pointer"}}>이미 계정이 있으신가요? 로그인 →</button>
    </>);

    if(authStep==="terms")return wrap(<>
      {backBtn("register")}
      <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>약관 동의</div>
      <div style={{fontSize:13,color:"#999",marginBottom:18}}>서비스 이용을 위해 약관에 동의해주세요</div>
      <div onClick={()=>allTerms(!terms.all)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:LIGHT,borderRadius:12,marginBottom:12,cursor:"pointer"}}><div style={{width:22,height:22,borderRadius:22,background:terms.all?ACCENT:"#fff",border:`1.5px solid ${terms.all?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{terms.all&&<i className="ti ti-check" style={{fontSize:13,color:"#fff"}}/>}</div><span style={{fontSize:14,fontWeight:500,color:ACCENT}}>전체 동의</span></div>
      <div style={{flex:1,minHeight:0,overflowY:"auto"}}>{[{k:"service",l:"[필수] 중고물품 거래 이용약관",d:"거래 당사자 간 책임, 분쟁 해결, 금지 품목을 규정합니다."},{k:"privacy",l:"[필수] 개인정보 수집 및 이용 동의",d:"연락처 등 개인정보를 서비스 제공 목적으로 수집·이용합니다."},{k:"age",l:"[필수] 만 14세 이상 확인",d:"본 서비스는 만 14세 이상만 이용 가능합니다."}].map(({k,l,d})=>(<div key={k} style={{marginBottom:10}}><div onClick={()=>setTerms(p=>({...p,[k]:!p[k],all:false}))} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 0"}}><div style={{width:20,height:20,borderRadius:20,background:terms[k]?ACCENT:"#fff",border:`1.5px solid ${terms[k]?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{terms[k]&&<i className="ti ti-check" style={{fontSize:12,color:"#fff"}}/>}</div><span style={{fontSize:13,color:"#333"}}>{l}</span></div><div style={{fontSize:11,color:"#aaa",padding:"0 0 4px 30px",lineHeight:1.6}}>{d}</div></div>))}</div>
      <button onClick={()=>{if(terms.service&&terms.privacy&&terms.age)setAuthStep("profile");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:(terms.service&&terms.privacy&&terms.age)?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginTop:12}}>다음</button>
    </>);

    if(authStep==="profile")return wrap(<>
      <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>프로필 등록</div>
      <div style={{fontSize:13,color:"#999",marginBottom:18}}>이름·전화번호는 필수입니다</div>
      <div style={{flex:1,minHeight:0,overflowY:"auto"}}>
        {[{l:"이름",k:"name",ph:"예: 김민준",req:true},{l:"전화번호",k:"phone",ph:"010-0000-0000",t:"tel",req:true},{l:"주소",k:"address",ph:"예: 서울 마포구"},{l:"소속",k:"affiliation",ph:"예: 극단 파도"}].map(f=>(<div key={f.k} style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:5,fontWeight:500}}>{f.l}{f.req&&<span style={{color:"#e25",marginLeft:2}}>*</span>}</div><input value={regProf[f.k]} onChange={e=>setRegProf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} type={f.t||"text"} style={inp}/></div>))}
        <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>계정 유형</div><div style={{display:"flex",gap:8}}>{[["개인","👤"],["단체","🏢"]].map(([t,icon])=>(<button key={t} onClick={()=>setRegProf(p=>({...p,accountType:t}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${regProf.accountType===t?ACCENT:"#e0e0e0"}`,background:regProf.accountType===t?LIGHT:"#fff",color:regProf.accountType===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:regProf.accountType===t?600:400}}>{icon} {t}</button>))}</div></div>
        <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:8,fontWeight:500}}>관심 분야</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{INTERESTS.map(i=>{const a=regProf.interests.includes(i);return(<button key={i} onClick={()=>setRegProf(p=>({...p,interests:a?p.interests.filter(x=>x!==i):[...p.interests,i]}))} style={{padding:"6px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:13,cursor:"pointer"}}>{i}</button>);})}</div></div>
        <ErrBox/>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={completeRegistration} disabled={authBusy} style={{width:"100%",height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>{authBusy?"처리 중...":"완료"}</button>
      </div>
    </>);

    // 위 어떤 authStep에도 해당 안 되면(= splash) 메인 앱으로 fall-through
  }

  // ── Main App (로그인 사용자 + 비로그인 둘러보기) ──
  return(
    <div className="app-shell" style={{...shellStyle,display:"flex",flexDirection:"column"}} onClick={()=>moreMenu&&setMoreMenu(null)}>

      {/* 홈 */}
      {screen==="home"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
        <div style={{padding:"14px 16px 0",borderBottom:`0.5px solid ${DIVIDER}`,background:BG,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{userSelect:"none",display:"flex",alignItems:"center",gap:8}}>
              <img src="/gongssujae_symbol.png" alt="공쓰재 심볼" style={{height:26}}/>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:ACCENT,letterSpacing:-0.5}}>공쓰재</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:1}}>공연 쓰고 남은 거, 재활용</div>
              </div>
            </div>
            <div style={{display:"flex",gap:2,alignItems:"center"}}>
              <button onClick={()=>setShowSearch(s=>{if(s)setQ("");return !s;})} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:showSearch?ACCENT:"#888",padding:"4px 8px"}}><i className="ti ti-search"/></button>
              <button onClick={()=>go("notify","")} style={{position:"relative",background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888",padding:"4px 8px"}}>
                <i className="ti ti-bell"/>
                {unreadMsgCount>0&&<span style={{position:"absolute",top:2,right:4,width:8,height:8,borderRadius:"50%",background:"#e53935"}}/>}
              </button>
              <button onClick={()=>setShowAppMenu(true)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888",padding:"4px 8px"}}><i className="ti ti-menu-2"/></button>
            </div>
          </div>
          {showSearch&&<div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:12,padding:"9px 12px",marginBottom:10,gap:8}}>
            <i className="ti ti-search" style={{fontSize:16,color:"#aaa"}}/>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="물건, 지역, 공연명 검색" style={{flex:1,border:"none",background:"none",fontSize:13,outline:"none"}}/>
            {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:16,padding:0}}><i className="ti ti-x"/></button>}
          </div>}
          {showTagFilter&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",background:"#e8eaf6",borderRadius:10,marginBottom:10}}><span style={{fontSize:12,color:"#3949ab",fontWeight:500}}>🎭 {showTagFilter} 필터 중</span><button onClick={()=>setShowTagFilter("")} style={{background:"none",border:"none",cursor:"pointer",color:"#3949ab",fontSize:14}}>✕</button></div>}
          <div style={{display:"flex"}}>{[["items","물건",TAB_ITEM],["jobs","일자리",TAB_JOB],["spaces","공간",TAB_SPACE]].map(([t,l,c])=>(<button key={t} onClick={()=>{setMainTab(t);setQ("");setShowSearch(false);setCat("전체");setFld("전체");setTypeFilter("전체");}} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:15,fontWeight:mainTab===t?700:400,color:mainTab===t?c:"#999",borderBottom:mainTab===t?`2px solid ${c}`:"2px solid transparent"}}>{l}</button>))}</div>
        </div>
        {mainTab!=="spaces"&&<div style={{padding:"8px 16px",borderBottom:`0.5px solid ${DIVIDER}`,overflowX:"auto",display:"flex",gap:6,flexShrink:0}}>
          {mainTab==="items"?<>
            {[["전체","전체"],["🌿 나눔","나눔"],["구함","구함"],["판매","판매"]].map(([label,val])=>chip(label,typeFilter===val,()=>setTypeFilter(val)))}
          </>:JOB_FIELDS.map(f=>chip(f,fld===f,()=>setFld(f)))}
        </div>}
        {showPWABanner&&<div style={{margin:"8px 16px 0",padding:"11px 14px",background:"#EBF5FB",borderRadius:14,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontSize:20,flexShrink:0}}>📲</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:ACCENT,marginBottom:1}}>앱처럼 쓰려면 홈 화면에 추가하세요</div>
            <div style={{fontSize:11,color:"#777"}}>설치 없이 앱 경험 · 채팅 알림 받기</div>
          </div>
          <button onClick={()=>setShowPWAModal(true)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${ACCENT}`,background:"none",color:ACCENT,fontSize:11,cursor:"pointer",fontWeight:500,flexShrink:0}}>안내</button>
          <button onClick={()=>{localStorage.setItem('pwaInstallDismissed','1');setShowPWABanner(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#aaa",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
        </div>}
        <div ref={listRef} style={{flex:1,minHeight:0,overflowY:"auto",paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))",background:BG}}>
          {mainTab==="items"&&nanumiDoneCount>0&&<div style={{margin:"12px 16px 0",padding:"14px 16px",background:LIGHT,borderRadius:14,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22,flexShrink:0}}>🌿</span>
            <span style={{fontSize:13,color:ACCENT,fontWeight:500,lineHeight:1.5}}>지금까지 <strong>{nanumiDoneCount}개</strong>가 버려지지 않고<br/>다음 무대를 찾았어요</span>
          </div>}
          {mainTab==="spaces"&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"40px 32px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:20}}>🏛️</div>
            <div style={{fontSize:18,fontWeight:600,color:"#2a2a2a",marginBottom:10,lineHeight:1.4}}>공간 탭이 곧 열려요</div>
            <div style={{fontSize:14,color:"#888",lineHeight:1.7}}>극장·연습실·전시장을 나누고 빌리는<br/>공간 기능이 준비 중이에요.<br/>공연에 쓸 공간이 필요하거나<br/>비는 시간을 나누고 싶다면 곧 만날 수 있어요.</div>
            <div style={{marginTop:28,padding:"10px 20px",borderRadius:20,background:LIGHT,color:TAB_SPACE,fontSize:13,fontWeight:500}}>준비 중</div>
          </div>)}
          {mainTab==="items"&&items.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>아직 등록된 물건이 없어요<br/><span style={{fontSize:12}}>첫 번째 물건을 올려보세요!</span></div>}
          {mainTab==="items"&&items.length>0&&filtItems.length===0&&<div style={{textAlign:"center",color:"#bbb",marginTop:60,padding:"0 32px"}}>
            <div style={{fontSize:22,marginBottom:10}}>🔍</div>
            <div style={{fontSize:14,color:"#999",fontWeight:500,marginBottom:6}}>검색 결과가 없어요</div>
            <div style={{fontSize:12,color:"#bbb",marginBottom:20}}>다른 검색어나 카테고리를 시도해보세요</div>
            <button onClick={()=>{setQ("");setCat("전체");}} style={{padding:"8px 20px",borderRadius:20,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:13,cursor:"pointer",fontWeight:500}}>검색 초기화</button>
          </div>}
          {mainTab==="items"&&filtItems.map(item=>{
            const isLocal=localFirst&&userProfile?.preferredRegion&&item.region?.startsWith(userProfile.preferredRegion.split(" ")[0]);
            const isNanumi=item.postType==="nanumi"&&item.price===0;
            const isSale=item.postType==="nanumi"&&item.price>0;
            const isGuhami=item.postType==="guhami";
            return(<div key={item.id} onClick={()=>goDetail(item)} style={{display:"flex",gap:14,padding:"16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",opacity:item.status==="done"?0.5:1,background:isLocal?"#f4faf7":"#fff",alignItems:"flex-start"}}>
              {/* 130×130 사진 + 오버레이 */}
              <div style={{width:130,height:130,borderRadius:14,flexShrink:0,overflow:"hidden",background:LIGHT,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {item.photos?.length>0
                  ?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  :<span style={{fontSize:42}}>{(item.category?.[0]&&CAT_ICON[item.category[0]])||"📦"}</span>}
                {(item.status==="reserved"||item.status==="done")&&<div style={{position:"absolute",top:6,left:6,padding:"2px 8px",borderRadius:8,fontSize:10,fontWeight:600,...(STATUS_STYLE[item.status]||{})}}>{STATUS_LABEL[item.status]}</div>}
                {(item.likedBy?.length||0)>0&&<div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.45)",borderRadius:10,padding:"2px 7px",display:"flex",alignItems:"center",gap:3}}>
                  <i className="ti ti-heart" style={{fontSize:10,color:"#fff"}}/>
                  <span style={{fontSize:10,color:"#fff",fontWeight:500}}>{item.likedBy.length}</span>
                </div>}
              </div>
              {/* 텍스트 */}
              <div style={{flex:1,minWidth:0,paddingTop:2}}>
                {/* 유형 배지 */}
                {isNanumi&&<span style={{display:"inline-block",fontSize:11,padding:"2px 8px",borderRadius:10,background:"#E3F3F9",color:ACCENT,fontWeight:600,marginBottom:5}}>🌿 나눔</span>}
                {isSale&&<span style={{display:"inline-block",fontSize:11,padding:"2px 8px",borderRadius:10,background:"#F2F2F2",color:"#777",fontWeight:500,marginBottom:5}}>판매</span>}
                {isGuhami&&<span style={{display:"inline-block",fontSize:11,padding:"2px 8px",borderRadius:10,background:"#FEF3E8",color:"#B25E0A",fontWeight:600,marginBottom:5}}>구함</span>}
                {/* 제목 */}
                <div style={{fontSize:16,fontWeight:500,color:"#1a1a1a",lineHeight:1.35,marginBottom:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.title}</div>
                {/* 공연 출처 */}
                {hasShowTag(item.showTag)&&<div style={{fontSize:12,color:ACCENT,marginBottom:5,fontWeight:500,display:"flex",alignItems:"center",gap:4}}><i className="ti ti-theater" style={{fontSize:11}}/>{item.showTag}에서 나온</div>}
                {/* 가격 (판매/구함만) */}
                {isSale&&<div style={{fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.price?.toLocaleString()}원</div>}
                {isGuhami&&<div style={{fontSize:13,color:"#B25E0A",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.price>0?`예산 ${item.price?.toLocaleString()}원`:"가격 협의"}</div>}
                {/* 메타 */}
                <div style={{fontSize:12,color:"#bbb"}}>
                  <i className="ti ti-map-pin" style={{fontSize:11,marginRight:2}}/>
                  {regionShort(item.region)}{item.createdAt&&<> · {fmtTime(item.createdAt)}</>}{isLocal&&<span style={{color:ACCENT}}> · 내 지역</span>}
                </div>
              </div>
            </div>);
          })}
          {mainTab==="jobs"&&jobs.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>아직 등록된 공고가 없어요</div>}
          {mainTab==="jobs"&&jobs.length>0&&filtJobs.length===0&&<div style={{textAlign:"center",color:"#bbb",marginTop:60,padding:"0 32px"}}>
            <div style={{fontSize:22,marginBottom:10}}>🔍</div>
            <div style={{fontSize:14,color:"#999",fontWeight:500,marginBottom:6}}>검색 결과가 없어요</div>
            <div style={{fontSize:12,color:"#bbb",marginBottom:20}}>다른 검색어나 분야를 시도해보세요</div>
            <button onClick={()=>{setQ("");setFld("전체");}} style={{padding:"8px 20px",borderRadius:20,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:13,cursor:"pointer",fontWeight:500}}>검색 초기화</button>
          </div>}
          {mainTab==="jobs"&&filtJobs.map(job=>{const fs=jfs(job.field);const isGujik=job.jobType==="gujik";return(<div key={job.id} onClick={()=>{setSelJob(job);go("jobdetail");window.location.hash=`#/job/${job.id}`;}} style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",opacity:job.jobStatus==="done"?0.55:1,background:BG}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:96,height:96,borderRadius:16,overflow:"hidden",flexShrink:0,position:"relative"}}>
                {job.photos?.length>0
                  ?<img src={job.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  :<div style={{width:"100%",height:"100%",background:fs.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}><i className={`ti ${fs.icon}`} style={{fontSize:26,color:"#fff"}}/><span style={{fontSize:11,color:"#fff",fontWeight:600,letterSpacing:0.3}}>{job.field}</span></div>}
              </div>
              <div style={{flex:1,minWidth:0,paddingTop:2}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:isGujik?"#D9F2EF":"#FFF0E0",color:isGujik?"#0D5049":"#C05000",fontWeight:600}}>{isGujik?"구직":"구인"}</span>
                  {job.jobStatus==="done"&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"#f0f0f0",color:"#999",fontWeight:500}}>완료</span>}
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:job.type==="장기"?"#E0E6F5":"#FFF3E0",color:job.type==="장기"?"#1A2D5A":"#C05000",fontWeight:500}}>{job.type}</span>
                </div>
                <div style={{fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:4,lineHeight:1.3}}>{job.title}</div>
                <div style={{fontSize:15,fontWeight:500,color:fs.bg,marginBottom:6}}>{job.pay||"협의"}</div>
                <div style={{fontSize:12,color:"#999"}}>{[job.org,job.location,job.date].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          </div>);})}
        </div>
      </div>)}

      {/* 물건 상세 */}
      {screen==="detail"&&selItem&&(()=>{
        const isLiked=selItem.likedBy?.includes(currentUser?.uid);
        const isOwner=selItem.sellerId===currentUser?.uid;
        const isNanumi=selItem.postType==="nanumi"&&selItem.price===0;
        const isSale=selItem.postType==="nanumi"&&selItem.price>0;
        const isGuhami=selItem.postType==="guhami";
        const photos=selItem.photos||[];
        return(
        <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG,paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))",boxSizing:"border-box"}}>
          {/* 헤더 */}
          <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={goDetailBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button></div>
            <div style={{display:"flex",gap:4,alignItems:"center",position:"relative"}}>
              <button onClick={()=>setShareModal({type:"item",post:selItem})} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-share"/></button>
              {currentUser&&<button onClick={()=>setMoreMenu(m=>m==="item"?null:"item")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-dots-vertical"/></button>}
              {currentUser&&moreMenu==="item"&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",right:0,background:"#fff",borderRadius:14,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",zIndex:100,minWidth:140,overflow:"hidden",border:`0.5px solid ${DIVIDER}`}}>
                {isOwner&&<><button onClick={()=>{boostItem(selItem.id);setMoreMenu(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#333",textAlign:"left"}}><i className="ti ti-arrow-up" style={{color:ACCENT}}/>끌어올리기</button>
                <button onClick={()=>{const isHidden=selItem.hidden===true;setMoreMenu(null);if(isHidden){hideItem(selItem.id,false);}else if(window.confirm("잠시 내리기\n\n다른 사람 목록에서 숨겨져요.\n언제든지 다시 올릴 수 있어요.")){hideItem(selItem.id,true);}}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:selItem.hidden===true?"#2e7d32":"#555",textAlign:"left",borderTop:`0.5px solid ${DIVIDER}`}}><i className="ti ti-eye-off" style={{color:selItem.hidden===true?"#2e7d32":"#888"}}/>{selItem.hidden===true?"다시 올리기":"잠시 내리기"}</button>
                <button onClick={()=>{startEdit(selItem);setMoreMenu(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#333",textAlign:"left",borderTop:`0.5px solid ${DIVIDER}`}}><i className="ti ti-pencil" style={{color:ACCENT}}/>수정</button>
                <button onClick={()=>{setMoreMenu(null);if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteItem(selItem.id).then(()=>{window.location.hash="";goHome();});}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#e53935",textAlign:"left",borderTop:`0.5px solid ${DIVIDER}`}}><i className="ti ti-trash"/>삭제</button></>}
                {!isOwner&&<button onClick={()=>{setMoreMenu(null);setReportModal({targetType:"item",targetId:selItem.id,title:selItem.title});setReportReason("");setReportDetail("");}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#e53935",textAlign:"left"}}>🚩 신고하기</button>}
              </div>}
            </div>
          </div>
          <div style={{flex:1,minHeight:0,overflowY:"auto"}}>
            {/* 메인 사진 */}
            <div style={{aspectRatio:"4/3",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {photos.length>0
                ?<img src={photos[photoIdx]} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>
                :<span style={{fontSize:72}}>{(selItem.category?.[0]&&CAT_ICON[selItem.category[0]])||"📦"}</span>}
            </div>
            {/* 썸네일 줄 */}
            {photos.length>1&&<div style={{display:"flex",gap:8,padding:"10px 16px",background:"#fff",overflowX:"auto"}}>
              {photos.map((ph,i)=>(
                <div key={i} onClick={()=>setPhotoIdx(i)} style={{width:52,height:52,borderRadius:10,overflow:"hidden",flexShrink:0,border:`2px solid ${i===photoIdx?ACCENT:"transparent"}`,cursor:"pointer",boxSizing:"border-box"}}>
                  <img src={ph} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                </div>
              ))}
            </div>}
            <div style={{padding:16,background:"#fff",marginBottom:8}}>
              {/* 유형 배지 + 가격 */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                {isNanumi&&<span style={{fontSize:12,padding:"3px 10px",borderRadius:10,background:"#E3F3F9",color:ACCENT,fontWeight:600}}>🌿 나눔</span>}
                {isSale&&<><span style={{fontSize:12,padding:"3px 10px",borderRadius:10,background:"#F2F2F2",color:"#777",fontWeight:500,flexShrink:0}}>판매</span><span style={{fontSize:20,fontWeight:700,color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{selItem.price?.toLocaleString()}원</span></>}
                {isGuhami&&<><span style={{fontSize:12,padding:"3px 10px",borderRadius:10,background:"#FEF3E8",color:"#B25E0A",fontWeight:600,flexShrink:0}}>구함</span><span style={{fontSize:16,color:"#B25E0A",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{selItem.price>0?`예산 ${selItem.price?.toLocaleString()}원`:"가격 협의"}</span></>}
              </div>
              {/* 제목 */}
              <div style={{fontSize:21,fontWeight:600,lineHeight:1.4,marginBottom:10,color:"#1a1a1a"}}>{selItem.title}</div>
              {/* 공연 출처 박스 */}
              {hasShowTag(selItem.showTag)&&<div style={{background:"#E3F3F9",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>🎭</span>
                <span style={{fontSize:13,color:ACCENT,fontWeight:500}}>{selItem.showTag}에서 쓰던 거예요</span>
              </div>}
              {/* 오너 상태 변경 */}
              {isOwner&&<div style={{display:"flex",gap:6,marginBottom:14}}>{[["selling","판매중","#e8f5e9","#2e7d32"],["reserved","예약중","#fff3e0","#e65100"],["done","거래완료","#f5f5f5","#9e9e9e"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>changeStatus(selItem.id,k)} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${selItem.status===k?color:"#e0e0e0"}`,background:selItem.status===k?bg:"#fff",color:selItem.status===k?color:"#aaa",fontSize:11,cursor:"pointer",fontWeight:selItem.status===k?500:400}}>{l}</button>))}</div>}
              {/* 설명 */}
              {selItem.desc&&<div style={{padding:14,background:BG,borderRadius:12,marginBottom:12}}><p style={{margin:0,fontSize:14,lineHeight:1.8,color:"#333"}}>{selItem.desc}</p></div>}
              {/* 메타 */}
              <div style={{display:"flex",gap:12,fontSize:12,color:"#aaa",flexWrap:"wrap",marginBottom:14}}>
                {selItem.region&&<span><i className="ti ti-map-pin" style={{fontSize:11,marginRight:2}}/>{regionShort(selItem.region)}</span>}
                {selItem.createdAt&&<span><i className="ti ti-clock" style={{fontSize:11,marginRight:2}}/>{fmtTime(selItem.createdAt)}</span>}
                {(selItem.likedBy?.length||0)>0&&<span><i className="ti ti-heart" style={{fontSize:11,marginRight:2}}/>{selItem.likedBy.length}명 찜</span>}
                {(selItem.chatCount||0)>0&&<span><i className="ti ti-message-circle" style={{fontSize:11,marginRight:2}}/>{selItem.chatCount}명 채팅</span>}
                {(selItem.viewCount||0)>0&&<span><i className="ti ti-eye" style={{fontSize:11,marginRight:2}}/>{selItem.viewCount} 조회</span>}
              </div>
            </div>
            {/* 연락처 */}
            {selItem.contact&&<div style={{background:"#fff",padding:"14px 16px",marginBottom:8,borderRadius:0}}>
              <div style={{fontSize:11,color:"#aaa",marginBottom:6}}>연락처</div>
              <div style={{fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-phone" style={{fontSize:15,color:ACCENT}}/>{selItem.contact}{selItem.safeNum&&<span style={{fontSize:10,background:LIGHT,color:ACCENT,padding:"2px 8px",borderRadius:10,fontWeight:500}}>안심번호</span>}</div>
            </div>}
            {/* 거래 장소 + 지도 */}
            {selItem.tradePlace&&<div style={{background:"#fff",marginBottom:8}}>
              <div style={{padding:"14px 16px 8px"}}>
                <div style={{fontSize:11,color:"#aaa",marginBottom:6}}>받으러 올 곳</div>
                <div style={{fontSize:14,display:"flex",alignItems:"center",gap:6}}><i className="ti ti-map-pin" style={{fontSize:15,color:ACCENT}}/>{selItem.tradePlace}</div>
              </div>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setFullscreenMapData({lat:selItem.tradeLat||null,lng:selItem.tradeLng||null,place:selItem.tradePlace})}>
                <div id="kakaoMapDetail" style={{height:180,background:LIGHT}}/>
                {/* 투명 클릭 레이어: 카카오맵 touch 이벤트 차단, 탭을 전체화면으로 전달 */}
                <div style={{position:"absolute",inset:0,zIndex:10}}/>
                <div style={{position:"absolute",top:8,right:8,zIndex:11,background:"rgba(0,0,0,0.52)",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:11,display:"flex",alignItems:"center",gap:4,pointerEvents:"none"}}><i className="ti ti-arrows-maximize" style={{fontSize:12}}/>전체화면</div>
              </div>
            </div>}
            {/* 판매자 카드 */}
            {(()=>{
              const sp=sellerProfile;
              const enc=sp?.encoreCount||0;
              const postCount=items.filter(i=>i.sellerId===selItem.sellerId).length;
              const displayName=sp?.affiliation||sp?.name||selItem.seller||"익명";
              const subName=sp?.affiliation&&sp?.name?sp.name:null;
              const avatar=sp?.accountType==="단체"?"🏢":(displayName[0]||"?");
              return(
                <div style={{background:"#fff",padding:"16px",marginBottom:8,borderTop:`0.5px solid ${DIVIDER}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:LIGHT,border:`1.5px solid ${ACCENT}22`,display:"flex",alignItems:"center",justifyContent:"center",color:ACCENT,fontWeight:700,fontSize:sp?.accountType==="단체"?20:16,flexShrink:0}}>{avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:subName?2:3}}>
                        <span style={{fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</span>
                        <span style={{fontSize:10,padding:"1px 7px",borderRadius:6,background:LIGHT,color:ACCENT,fontWeight:500,flexShrink:0}}>{sp?.accountType||"개인"}</span>
                      </div>
                      {subName&&<div style={{fontSize:12,color:"#888",marginBottom:3}}>{subName}</div>}
                      <div style={{display:"flex",gap:8,fontSize:12,flexWrap:"wrap"}}>
                        <span style={{color:ACCENT,fontWeight:600}}>👏 앙코르 {enc}회{enc===0&&<span style={{color:"#bbb",fontWeight:400}}> (곧 시작돼요)</span>}</span>
                        <span style={{color:"#bbb"}}>· 물건 게시글 {postCount}개</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* 하단 버튼 */}
          <div style={{paddingTop:12,paddingLeft:16,paddingRight:16,paddingBottom:"calc(20px + env(safe-area-inset-bottom, 0px))",borderTop:`0.5px solid ${DIVIDER}`,flexShrink:0,display:"flex",gap:8,background:"#fff"}}>
            <button onClick={()=>toggleLike(selItem.id)} style={{width:50,height:54,borderRadius:14,border:`1px solid ${isLiked?"#e25":"#e8e8e8"}`,background:isLiked?"#fff0f2":"#fff",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-heart" style={{color:isLiked?"#e25":"#bbb"}}/></button>
            {!isOwner&&selItem.seller==="탈퇴한 회원"
              ?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#aaa"}}>탈퇴한 회원의 게시물입니다</div>
              :!isOwner&&<button onClick={()=>openChat(selItem.id,selItem.title,selItem.sellerId)} style={{flex:1,height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {isNanumi?<>🤝 이어받기</>:<><i className="ti ti-message-circle" style={{fontSize:20}}/>채팅하기</>}
            </button>}
            {isOwner&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#aaa"}}>내 게시글입니다</div>}
          </div>
        </div>
      );})()}

      {/* 공고 상세 */}
      {screen==="jobdetail"&&selJob&&(()=>{const fs=jfs(selJob.field);const isOwner=selJob.sellerId===currentUser?.uid;const isGujik=selJob.jobType==="gujik";return(
        <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG,paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))",boxSizing:"border-box"}}>
          {/* 상단 내비 */}
          <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={goDetailBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
              <span style={{fontWeight:500,fontSize:15}}>공고 상세</span>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center",position:"relative"}}>
              <button onClick={()=>setShareModal({type:"job",post:selJob})} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-share"/></button>
              {currentUser&&<button onClick={()=>setMoreMenu(m=>m==="job"?null:"job")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-dots-vertical"/></button>}
              {currentUser&&moreMenu==="job"&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",right:0,background:"#fff",borderRadius:14,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",zIndex:100,minWidth:140,overflow:"hidden",border:`0.5px solid ${DIVIDER}`}}>
                {isOwner&&<><button onClick={()=>{const isHidden=selJob.hidden===true;setMoreMenu(null);if(isHidden){hideJob(selJob.id,false);}else if(window.confirm("잠시 내리기\n\n다른 사람 목록에서 숨겨져요.\n언제든지 다시 올릴 수 있어요.")){hideJob(selJob.id,true);}}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:selJob.hidden===true?"#2e7d32":"#555",textAlign:"left"}}><i className="ti ti-eye-off" style={{color:selJob.hidden===true?"#2e7d32":"#888"}}/>{selJob.hidden===true?"다시 올리기":"잠시 내리기"}</button>
                <button onClick={()=>{startEditJob(selJob);setMoreMenu(null);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#333",textAlign:"left",borderTop:`0.5px solid ${DIVIDER}`}}><i className="ti ti-pencil" style={{color:ACCENT}}/>수정</button>
                <button onClick={()=>{setMoreMenu(null);if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteJob(selJob.id).then(()=>{window.location.hash="";goHome();});}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#e53935",textAlign:"left",borderTop:`0.5px solid ${DIVIDER}`}}><i className="ti ti-trash"/>삭제</button></>}
                {!isOwner&&<button onClick={()=>{setMoreMenu(null);setReportModal({targetType:"job",targetId:selJob.id,title:selJob.title});setReportReason("");setReportDetail("");}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#e53935",textAlign:"left"}}>🚩 신고하기</button>}
              </div>}
            </div>
          </div>
          <div style={{flex:1,minHeight:0,overflowY:"auto",paddingBottom:16}}>
            {/* 직군 헤더 배너 */}
            <div style={{height:132,background:fs.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
              <div style={{width:52,height:52,borderRadius:16,background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <i className={`ti ${fs.icon}`} style={{fontSize:28,color:"#fff"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{selJob.field}</span>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"rgba(255,255,255,0.25)",color:"#fff",fontWeight:600}}>{isGujik?"구직":"구인"}</span>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:"rgba(255,255,255,0.2)",color:"#fff",fontWeight:500}}>{selJob.type}</span>
              </div>
            </div>
            {/* 사진 갤러리 (있을 때만) */}
            {selJob.photos?.length>0&&<div style={{display:"flex",gap:6,overflowX:"auto",padding:"12px 16px",background:"#fff",borderBottom:`0.5px solid ${DIVIDER}`}}>{selJob.photos.map((ph,i)=>(<img key={i} src={ph} style={{height:160,width:"auto",borderRadius:10,objectFit:"cover",flexShrink:0}} alt=""/>))}</div>}
            <div style={{padding:"16px 16px 0"}}>
              {/* 제목 */}
              <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a",marginBottom:16,lineHeight:1.3}}>{selJob.title}</div>
              {/* 3칸 요약 박스 */}
              <div style={{display:"flex",borderRadius:14,overflow:"hidden",border:`1px solid ${DIVIDER}`,marginBottom:16,background:"#fff"}}>
                {[["보수",selJob.pay||"협의"],["기간",selJob.date||"-"],["지역",selJob.location||"-"]].map(([k,v],i)=>(
                  <div key={k} style={{flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<2?`1px solid ${DIVIDER}`:"none"}}>
                    <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>{k}</div>
                    <div style={{fontSize:13,fontWeight:600,color:i===0?fs.bg:"#1a1a1a",lineHeight:1.3}}>{v}</div>
                  </div>
                ))}
              </div>
              {/* 단체 */}
              {selJob.org&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:"#fff",borderRadius:12,marginBottom:12}}>
                <i className="ti ti-building" style={{fontSize:16,color:"#aaa"}}/>
                <span style={{fontSize:14,color:"#333"}}>{selJob.org}</span>
              </div>}
              {/* 상태 변경 (오너) */}
              {isOwner&&<div style={{display:"flex",gap:8,marginBottom:12}}>{[["active","진행중","#e8f5e9","#2e7d32"],["done","완료","#f5f5f5","#9e9e9e"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>changeJobStatus(selJob.id,k)} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${selJob.jobStatus===k?color:"#e0e0e0"}`,background:selJob.jobStatus===k?bg:"#fff",color:selJob.jobStatus===k?color:"#aaa",fontSize:12,cursor:"pointer",fontWeight:selJob.jobStatus===k?500:400}}>{l}</button>))}</div>}
              {/* 설명 */}
              {selJob.desc&&<div style={{padding:"14px 16px",background:"#fff",borderRadius:14,marginBottom:12}}>
                <p style={{margin:0,fontSize:14,lineHeight:1.8,color:"#333"}}>{selJob.desc}</p>
              </div>}
              <div style={{fontSize:11,color:"#ccc",textAlign:"right",marginBottom:16}}>{fmtTime(selJob.createdAt)}</div>
            </div>
            {/* 작성자 카드 */}
            {(()=>{
              const sp=sellerProfile;
              const enc=sp?.encoreCount||0;
              const postCount=jobs.filter(j=>j.sellerId===selJob.sellerId).length;
              const displayName=sp?.affiliation||sp?.name||selJob.org||"익명";
              const subName=sp?.affiliation&&sp?.name?sp.name:null;
              const avatar=sp?.accountType==="단체"?"🏢":(displayName[0]||"?");
              return(
                <div style={{background:"#fff",padding:"16px",marginBottom:8,borderTop:`0.5px solid ${DIVIDER}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:LIGHT,border:`1.5px solid ${ACCENT}22`,display:"flex",alignItems:"center",justifyContent:"center",color:ACCENT,fontWeight:700,fontSize:sp?.accountType==="단체"?20:16,flexShrink:0}}>{avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:subName?2:3}}>
                        <span style={{fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</span>
                        <span style={{fontSize:10,padding:"1px 7px",borderRadius:6,background:LIGHT,color:ACCENT,fontWeight:500,flexShrink:0}}>{sp?.accountType||"개인"}</span>
                      </div>
                      {subName&&<div style={{fontSize:12,color:"#888",marginBottom:3}}>{subName}</div>}
                      <div style={{display:"flex",gap:8,fontSize:12,flexWrap:"wrap"}}>
                        <span style={{color:ACCENT,fontWeight:600}}>👏 앙코르 {enc}회{enc===0&&<span style={{color:"#bbb",fontWeight:400}}> (곧 시작돼요)</span>}</span>
                        <span style={{color:"#bbb"}}>· 일자리 게시글 {postCount}개</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* 하단 버튼 */}
          <div style={{paddingTop:12,paddingLeft:16,paddingRight:16,paddingBottom:"calc(20px + env(safe-area-inset-bottom, 0px))",borderTop:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>
            {!isOwner&&selJob.org==="탈퇴한 회원"
              ?<div style={{textAlign:"center",fontSize:13,color:"#aaa",paddingTop:8}}>탈퇴한 회원의 게시물입니다</div>
              :!isOwner
              ?<button onClick={()=>openChat(selJob.id,selJob.title,selJob.sellerId)} style={{width:"100%",height:54,borderRadius:14,border:"none",background:fs.bg,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><i className="ti ti-message-circle" style={{fontSize:22}}/>지원 · 문의하기</button>
              :<div style={{textAlign:"center",fontSize:13,color:"#aaa",paddingTop:8}}>내 공고입니다</div>}
          </div>
        </div>
      );})()}

      {/* 올리기 */}
      {screen==="post"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG}}>
        <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}><button onClick={()=>{setEditItem(null);setEditJob(null);setForm(emptyForm);setJform(emptyJform);goHome();}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-x"/></button><span style={{fontWeight:500,fontSize:15}}>{editItem||editJob?"수정":"올리기"}</span></div>
        {!editItem&&!editJob&&<div style={{display:"flex",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>{[["item","중고 물건"],["job","일자리 공고"]].map(([t,l])=>(<button key={t} onClick={()=>setPostMode(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:postMode===t?500:400,color:postMode===t?ACCENT:"#aaa",borderBottom:postMode===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>}
        <div style={{flex:1,minHeight:0,overflowY:"auto",padding:16,paddingBottom:"calc(32px + env(safe-area-inset-bottom, 0px))"}}>
          {(postMode==="item"||editItem)?(
            <>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>유형</div><div style={{display:"flex",gap:6}}>{[["nanumi","🌿 나눔",LIGHT,ACCENT],["sale","판매","#fff8e1","#e65100"],["guhami","구함","#fce4ec","#c62828"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>setForm(p=>({...p,listingMode:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${form.listingMode===k?color:"#e0e0e0"}`,background:form.listingMode===k?bg:"#fff",color:form.listingMode===k?color:"#aaa",fontSize:13,fontWeight:form.listingMode===k?600:400,cursor:"pointer"}}>{l}</button>))}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>사진 ({form.photos.length}/5)</div><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}><label style={{width:72,height:72,borderRadius:12,border:`1.5px dashed ${MID}`,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><i className="ti ti-camera" style={{fontSize:22,color:ACCENT}}/><span style={{fontSize:10,color:ACCENT,marginTop:2}}>추가</span><input type="file" accept="image/*" multiple onChange={handlePhotos} style={{display:"none"}}/></label>{form.photos.map((ph,i)=>(<div key={i} style={{position:"relative",flexShrink:0}}><img src={ph} style={{width:72,height:72,borderRadius:12,objectFit:"cover"}} alt=""/><button onClick={()=>setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#333",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>))}</div></div>
              {[{l:"제목",k:"title",ph:"예: 나무 의자 세트"},{l:"물품명",k:"itemName",ph:"예: 나무 의자"}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>))}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#666",marginBottom:2,fontWeight:500}}>🎭 공연/전시 출처</div>
                <div style={{fontSize:11,color:"#aaa",marginBottom:6,lineHeight:1.5}}>어느 공연·전시에서 쓰던 건지 적어주세요.<br/>출처가 있으면 더 믿고 가져가요.</div>
                <input value={form.showTag} onChange={e=>setForm(p=>({...p,showTag:e.target.value}))} placeholder="예: 햄릿 - 극단 도롱뇽" style={inp}/>
              </div>
              {form.listingMode==="sale"&&<div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>판매 가격 <span style={{color:"#e53935",fontSize:11}}>*</span></div><input value={form.price} onChange={e=>{const v=e.target.value;if(v===""||parseInt(v)<=100000000)setForm(p=>({...p,price:v}));}} placeholder="예: 15000 (최대 1억원)" type="number" min="0" max="100000000" style={inp}/></div>}
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>📅 공연 종료일</div><input value={form.showEndDate} onChange={e=>setForm(p=>({...p,showEndDate:e.target.value}))} type="date" style={inp}/></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>카테고리 (복수 선택)</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ITEM_CATS_ALL.map(c=>{const a=form.category.includes(c);return(<button key={c} onClick={()=>toggleCat(c)} style={{padding:"5px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{c}</button>);})}</div></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>지역</div><div style={{position:"relative"}}><input value={form.region} readOnly onClick={()=>setShowR(v=>!v)} placeholder="지역 선택" style={{...inp,cursor:"pointer"}}/><RegionPicker open={showR} onChange={v=>setForm(p=>({...p,region:v}))} onClose={()=>setShowR(false)}/></div></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>연락처</div><input value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="010-0000-0000" style={{...inp,marginBottom:6}}/><label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#666"}}><input type="checkbox" checked={form.safeNum} onChange={e=>setForm(p=>({...p,safeNum:e.target.checked}))}/>안심번호로 표시하기</label></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>거래 희망 장소</div><div style={{display:"flex",gap:6}}><input value={form.tradePlace} onChange={e=>setForm(p=>({...p,tradePlace:e.target.value,tradeLat:null,tradeLng:null}))} placeholder="예: 대학로 마로니에공원 앞" style={{...inp,flex:1}}/><button type="button" onClick={()=>{setShowMapPicker(true);loadKakaoSDK(()=>setMapPickerLoaded(true));}} style={{flexShrink:0,padding:"0 12px",borderRadius:10,border:`1px solid ${ACCENT}`,background:LIGHT,color:ACCENT,fontSize:12,cursor:"pointer",fontWeight:500,whiteSpace:"nowrap"}}>📍 지도 선택</button></div>{form.tradeLat&&<div style={{fontSize:11,color:ACCENT,marginTop:4}}>📍 위치 선택 완료</div>}</div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>설명</div><textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="물건 상태, 주의사항 등" rows={3} style={{...inp,resize:"none"}}/></div>
              <button onClick={submitItem} style={{width:"100%",height:46,borderRadius:12,border:"none",background:form.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>{editItem?"수정 완료":"올리기"}</button>
            </>
          ):(
            <>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>사진 <span style={{color:"#bbb",fontWeight:400}}>(선택, 최대 5장)</span></div><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>{(jform.photos||[]).length<5&&<label style={{width:72,height:72,borderRadius:12,border:`1.5px dashed ${MID}`,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><i className="ti ti-camera" style={{fontSize:22,color:ACCENT}}/><span style={{fontSize:10,color:ACCENT,marginTop:2}}>추가</span><input type="file" accept="image/*" multiple onChange={e=>handlePhotos(e,"job")} style={{display:"none"}}/></label>}{(jform.photos||[]).map((ph,i)=>(<div key={i} style={{position:"relative",flexShrink:0}}><img src={ph} style={{width:72,height:72,borderRadius:12,objectFit:"cover"}} alt=""/><button onClick={()=>setJform(p=>({...p,photos:(p.photos||[]).filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#333",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>))}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>구인 / 구직</div><div style={{display:"flex",gap:8}}>{[["guin","구인","#e8f4fd","#1565c0"],["gujik","구직","#f3e5f5","#6a1b9a"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>setJform(p=>({...p,jobType:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${jform.jobType===k?color:"#e0e0e0"}`,background:jform.jobType===k?bg:"#fff",color:jform.jobType===k?color:"#aaa",fontSize:13,fontWeight:jform.jobType===k?600:400,cursor:"pointer"}}>{l}</button>))}</div></div>
              {[{l:"공고 제목",k:"title",ph:"예: 조명 디자이너 구합니다"},{l:"단체/기관명",k:"org",ph:"예: 극단 파도"},{l:"기간",k:"date",ph:"예: 2025.07.01~07.10"},{l:"보수",k:"pay",ph:"예: 협의 / 일 80,000원",ml:50}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={jform[f.k]||""} onChange={e=>setJform(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} maxLength={f.ml||undefined} style={inp}/></div>))}
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>지역</div><div style={{position:"relative"}}><input value={jform.location||""} readOnly onClick={()=>setShowJR(v=>!v)} placeholder="지역 선택" style={{...inp,cursor:"pointer"}}/><RegionPicker open={showJR} onChange={v=>setJform(p=>({...p,location:v}))} onClose={()=>setShowJR(false)}/></div></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>공고 내용</div><textarea value={jform.desc} onChange={e=>setJform(p=>({...p,desc:e.target.value}))} placeholder="모집 조건, 담당 업무 등" rows={3} style={{...inp,resize:"none"}}/></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>분야</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["조명","무대","음향","분장","영상","기타"].map(f=>(<button key={f} onClick={()=>setJform(p=>({...p,field:f}))} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:jform.field===f?ACCENT:"#e0e0e0",background:jform.field===f?ACCENT:"#fff",color:jform.field===f?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{f}</button>))}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>고용 형태</div><div style={{display:"flex",gap:6}}>{["단기","장기"].map(t=>(<button key={t} onClick={()=>setJform(p=>({...p,type:t}))} style={{padding:"5px 16px",borderRadius:20,border:"0.5px solid",borderColor:jform.type===t?ACCENT:"#e0e0e0",background:jform.type===t?ACCENT:"#fff",color:jform.type===t?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{t}</button>))}</div></div>
              <button onClick={submitJob} style={{width:"100%",height:46,borderRadius:12,border:"none",background:jform.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>{editJob?"수정 완료":"공고 올리기"}</button>
            </>
          )}
          {posted&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:ACCENT,color:"#fff",padding:"12px 24px",borderRadius:14,fontSize:14,fontWeight:500,zIndex:200}}>✓ 완료!</div>}
          {formError&&<div style={{position:"fixed",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:"#e53935",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>{formError}</div>}
        </div>
      </div>)}

      {/* 채팅 목록 */}
      {screen==="chatlist"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG}}><div style={{padding:"20px 16px 14px",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}><div style={{fontSize:18,fontWeight:500}}>채팅</div></div><div style={{flex:1,minHeight:0,overflowY:"auto",paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))"}}>{chatRooms.filter(r=>!r.leftBy?.includes(currentUser?.uid)).length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>채팅이 없습니다<br/><span style={{fontSize:12}}>물건 상세에서 채팅을 시작하세요</span></div>}{chatRooms.filter(r=>!r.leftBy?.includes(currentUser?.uid)).map(room=>{const linked=items.find(i=>i.id===room.itemId)||jobs.find(j=>j.id===room.itemId);const thumb=linked?.photos?.[0];const price=linked?.price!=null?(linked.price===0?(linked.postType==="guhami"?"가격 협의":"무료 나눔"):`${linked.price.toLocaleString()}원`):null;const uid=currentUser?.uid;const myLastRead=uid?room?.lastRead?.[uid]:null;const isUnread=room.lastMessage&&(myLastRead?(room.updatedAt?.seconds||0)>(myLastRead?.seconds||0):(room.updatedAt?.seconds||0)*1000>parseInt(localStorage.getItem(`chatRead_${room.id}`)||"0"));return(<div key={room.id} onClick={()=>{setActiveChat(room.id);setChatLabel(room.itemTitle||"채팅");go("chat","chatlist");}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",alignItems:"center",background:isUnread?"#EBF5FB":"#fff"}}><div style={{position:"relative",flexShrink:0}}><div style={{width:52,height:52,borderRadius:12,background:LIGHT,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{thumb?<img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(linked?.icon||"💬")}</div>{isUnread&&<div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:"50%",background:"#e25",border:"2px solid #fff"}}/>}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:isUnread?600:500,marginBottom:1}}>{room.itemTitle||"채팅"}</div>{price&&<div style={{fontSize:11,color:ACCENT,fontWeight:500,marginBottom:2}}>{price}</div>}</div><div style={{fontSize:11,color:"#bbb",flexShrink:0,marginLeft:6}}>{room.updatedAt?.toDate?.()?.toLocaleDateString("ko-KR",{month:"numeric",day:"numeric"})||""}</div></div><div style={{fontSize:12,color:isUnread?"#333":"#999",fontWeight:isUnread?500:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{room.lastMessage||"새 채팅"}</div></div></div>);})}</div></div>)}

      {/* 채팅 */}
      {screen==="chat"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))",boxSizing:"border-box",background:BG}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={()=>go("chatlist","chatlist")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{chatLabel}</div><div style={{fontSize:11,color:"#aaa"}}>채팅</div></div></div>{activeChatLinked&&<div onClick={()=>{if(items.find(i=>i.id===activeChatLinked.id))goDetail(activeChatLinked);else{setSelJob(activeChatLinked);go("jobdetail","chat");window.location.hash=`#/job/${activeChatLinked.id}`;}}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"0.5px solid #f0f0f0",background:"#fafafa",cursor:"pointer",flexShrink:0}}>{activeChatLinked.photos?.[0]?<img src={activeChatLinked.photos[0]} style={{width:40,height:40,borderRadius:8,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:40,height:40,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{activeChatLinked.icon||"📦"}</div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeChatLinked.title}</div>{activeChatLinked.price!=null&&<div style={{fontSize:11,color:ACCENT,fontWeight:500,marginTop:1}}>{activeChatLinked.price===0?(activeChatLinked.postType==="guhami"?"가격 협의":"무료 나눔"):`${activeChatLinked.price.toLocaleString()}원`}</div>}</div><i className="ti ti-chevron-right" style={{fontSize:14,color:"#ccc",flexShrink:0}}/></div>}<div style={{flex:1,minHeight:0,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>{messages.map((msg,i)=>{const isMe=msg.from==="me";const prev=messages[i-1];const next=messages[i+1];const d=msg.createdAt?.toDate?.();const pd=prev?.createdAt?.toDate?.();const nd=next?.createdAt?.toDate?.();const showDate=d&&(!pd||d.toDateString()!==pd.toDateString());const sameMinNext=nd&&d&&nd.getFullYear()===d.getFullYear()&&nd.getMonth()===d.getMonth()&&nd.getDate()===d.getDate()&&nd.getHours()===d.getHours()&&nd.getMinutes()===d.getMinutes()&&next.from===msg.from;const showTime=d&&!sameMinNext;return(<Fragment key={msg.id||i}>{showDate&&<div style={{textAlign:"center",margin:"8px 0"}}><span style={{fontSize:11,color:"#aaa",background:"#f0f0f0",borderRadius:10,padding:"3px 12px"}}>{fmtDateLabel(msg.createdAt)}</span></div>}<div style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}><div style={{maxWidth:"75%"}}>{!isMe&&<div style={{fontSize:10,color:"#aaa",marginBottom:2}}>{msg.fromName}</div>}<div style={{display:"flex",alignItems:"flex-end",gap:4,flexDirection:isMe?"row-reverse":"row"}}>{msg.type==="contact_share"?(<div style={{padding:"12px 16px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isMe?ACCENT:"#fff",border:isMe?"none":"1.5px solid #e0e0e0",minWidth:160}}><div style={{fontSize:11,color:isMe?"rgba(255,255,255,0.75)":"#aaa",marginBottom:4,fontWeight:500}}>📞 연락처 공유</div><div style={{fontSize:16,fontWeight:700,color:isMe?"#fff":"#1a1a1a",letterSpacing:"0.5px",marginBottom:isMe?0:10}}>{msg.phone}</div>{!isMe&&<button onClick={()=>navigator.clipboard.writeText(msg.phone).then(()=>alert("복사됐어요!"))} style={{width:"100%",padding:"7px 0",borderRadius:8,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:12,fontWeight:600,cursor:"pointer"}}>복사</button>}</div>):(<div style={{padding:"10px 14px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isMe?ACCENT:"#f3f3f3",color:isMe?"#fff":"#1a1a1a",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{msg.text}</div>)}{showTime&&<div style={{fontSize:10,color:"#aaa",flexShrink:0,marginBottom:2}}>{fmtMsgTime(msg.createdAt)}</div>}</div></div></div></Fragment>);})}{messages.length===0&&<div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:40}}>메시지를 보내보세요</div>}<div ref={chatEnd}/></div><div style={{flexShrink:0,padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,alignItems:"center",background:"#fff"}}><button onClick={sendContactShare} title="연락처 공유" style={{width:40,height:40,borderRadius:"50%",border:"none",background:LIGHT,color:ACCENT,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>📞</button><textarea value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(isMobile)return;if(e.shiftKey)return;e.preventDefault();sendMsg();}}} placeholder="메시지를 입력하세요" rows={1} style={{flex:1,borderRadius:22,border:"1px solid #e0e0e0",padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa",resize:"none",overflow:"hidden",lineHeight:1.5,fontFamily:"inherit"}}/><button onClick={sendMsg} style={{width:44,height:44,borderRadius:"50%",border:"none",background:chatMsg.trim()?ACCENT:"#ddd",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-send"/></button></div></div>)}

      {/* 알림 */}
      {screen==="notify"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><span style={{fontWeight:500,fontSize:15}}>알림 설정</span></div><div style={{flex:1,minHeight:0,overflowY:"auto",padding:16,paddingBottom:"calc(80px + env(safe-area-inset-bottom, 0px))"}}>{(()=>{const perm=typeof Notification!=="undefined"?Notification.permission:"default";return perm==="granted"?(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#e8f5e9",borderRadius:12,marginBottom:14}}><span style={{fontSize:16}}>🔔</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#2e7d32"}}>알림이 켜져 있어요</div><div style={{fontSize:11,color:"#4caf50",marginTop:1}}>채팅 메시지 알림을 받을 수 있어요</div></div></div>):perm==="denied"?(<div style={{padding:"12px 14px",background:"#fff3e0",borderRadius:12,marginBottom:14}}><div style={{fontSize:13,fontWeight:600,color:"#e65100",marginBottom:3}}>🔕 알림이 차단되어 있어요</div><div style={{fontSize:11,color:"#888",lineHeight:1.6}}>브라우저 설정 → 사이트 권한에서<br/>twr.or.kr 알림을 허용해주세요</div></div>):(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:LIGHT,borderRadius:12,marginBottom:14}}><span style={{fontSize:16}}>🔔</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:ACCENT}}>채팅 알림 받기</div><div style={{fontSize:11,color:"#888",marginTop:1}}>메시지를 놓치지 않으려면 알림을 켜주세요</div></div><button onClick={async()=>{const ok=await requestAndRegisterFCM(currentUser?.uid);if(!ok&&Notification.permission==="denied")alert("브라우저 설정에서 알림을 허용해주세요");}} style={{padding:"6px 12px",borderRadius:8,border:"none",background:ACCENT,color:"#fff",fontSize:12,cursor:"pointer",fontWeight:500,flexShrink:0}}>켜기</button></div>);})()}
<div style={{fontSize:12,color:"#aaa",marginTop:8,lineHeight:1.6}}>채팅 알림 외 키워드·공고 알림은 추후 지원 예정이에요.</div></div></div>)}

      {/* 마이페이지 — 비로그인 */}
      {screen==="mypage"&&!currentUser&&(
        <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG,alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
          <i className="ti ti-user-circle" style={{fontSize:56,color:"#ddd",marginBottom:16}}/>
          <div style={{fontSize:17,fontWeight:600,color:"#333",marginBottom:8,textAlign:"center"}}>로그인이 필요해요</div>
          <div style={{fontSize:13,color:"#aaa",textAlign:"center",lineHeight:1.7,marginBottom:32}}>글쓰기·찜·채팅 등 모든 기능을<br/>로그인 후 이용할 수 있어요</div>
          <button onClick={()=>{setAuthStep("login");setAuthError("");go("auth");}} style={{width:"100%",maxWidth:280,height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>로그인하기</button>
          <button onClick={()=>{setAuthStep("register");setAuthError("");go("auth");}} style={{width:"100%",maxWidth:280,height:50,borderRadius:14,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:14,fontWeight:500,cursor:"pointer"}}>회원가입</button>
        </div>
      )}
      {/* 마이페이지 */}
      {screen==="mypage"&&currentUser&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG}}>
        <div style={{padding:"18px 16px 0",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:600}}>{(userProfile?.name||userProfile?.affiliation||"나")[0]}</div>{userProfile?.accountType==="단체"&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:14}}>🏢</span>}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:500}}>{userProfile?.name||userProfile?.affiliation||"공쓰재 사용자"}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:1,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#aaa"}}>{userProfile?.email||currentUser?.email}</span>
                {!currentUser?.emailVerified&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:6,background:"#fff3e0",color:"#e65100",fontWeight:500}}>미인증</span>}
              </div>
              <div style={{marginTop:5}}>{encoreBadge(userProfile?.encoreCount)}<span style={{fontSize:10,color:"#bbb",marginLeft:6}}>(곧 시작돼요)</span></div>
            </div>
          </div>
          <div style={{display:"flex"}}>{[["info","정보"],["liked","찜 목록"],["myitems","내 게시글"],["hidden","잠시 내린 글"]].map(([t,l])=>(<button key={t} onClick={()=>setMypageTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:mypageTab===t?500:400,color:mypageTab===t?ACCENT:"#aaa",borderBottom:mypageTab===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>
        </div>
        <div style={{flex:1,minHeight:0,overflowY:"auto",paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))"}}>
          {mypageTab==="info"&&(<>
            <div style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,background:"#fff"}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:8}}>계정 유형</div>
              <div style={{display:"flex",gap:8}}>{[["개인","👤"],["단체","🏢"]].map(([t,icon])=>(<button key={t} onClick={()=>updateMyProfile({accountType:t})} style={{flex:1,padding:"8px 0",borderRadius:10,border:`1.5px solid ${userProfile?.accountType===t?ACCENT:"#e0e0e0"}`,background:userProfile?.accountType===t?LIGHT:"#fff",color:userProfile?.accountType===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:userProfile?.accountType===t?600:400}}>{icon} {t}</button>))}</div>
            </div>
            <div style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,background:"#fff"}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:6}}>📍 선호 지역</div>
              <div style={{position:"relative"}}><input value={userProfile?.preferredRegion||""} readOnly onClick={()=>setShowPrefR(true)} placeholder="지역 선택" style={{...inp,cursor:"pointer",fontSize:13,color:userProfile?.preferredRegion?"#1a1a1a":"#aaa"}}/>{showPrefR&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:160,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}><div style={{padding:"8px 12px",borderBottom:"0.5px solid #f0f0f0",position:"sticky",top:0,background:"#fff"}}><input value={prefRSearch} onChange={e=>setPrefRSearch(e.target.value)} placeholder="지역 검색" style={{width:"100%",border:"none",outline:"none",fontSize:13}} autoFocus/></div><div onClick={()=>{updateMyProfile({preferredRegion:""});setShowPrefR(false);}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",color:"#aaa",borderBottom:"0.5px solid #f9f9f9"}}>선택 안함</div>{filtPrefR.slice(0,20).map(r=>(<div key={r} onClick={()=>{updateMyProfile({preferredRegion:r});setShowPrefR(false);setPrefRSearch("");}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f9f9f9",background:userProfile?.preferredRegion===r?LIGHT:"#fff",color:userProfile?.preferredRegion===r?ACCENT:"#333"}}>{r}</div>))}</div>)}</div>
            </div>
            <div style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,background:"#fff"}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:10}}>프로필 정보</div>
              {[["이름","name","예: 김민준","text"],["전화번호","phone","010-0000-0000","tel"],["주소","address","예: 서울 마포구","text"],["소속","affiliation","예: 극단 파도","text"]].map(([label,key,ph,type])=>(
                <div key={key} style={{marginBottom:10}}>
                  <div style={{fontSize:11,color:"#888",marginBottom:4}}>{label}</div>
                  <input value={profileEdit[key]} onChange={e=>setProfileEdit(p=>({...p,[key]:e.target.value}))} placeholder={ph} type={type} style={{...inp,fontSize:13}}/>
                </div>
              ))}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#888",marginBottom:6}}>관심 분야</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{INTERESTS.map(i=>{const a=profileEdit.interests.includes(i);return(<button key={i} onClick={()=>setProfileEdit(p=>({...p,interests:a?p.interests.filter(x=>x!==i):[...p.interests,i]}))} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{i}</button>);})}</div>
              </div>
              <button onClick={async()=>{await updateMyProfile({name:profileEdit.name,phone:profileEdit.phone,address:profileEdit.address,affiliation:profileEdit.affiliation,interests:profileEdit.interests});setProfileSaved(true);setTimeout(()=>setProfileSaved(false),2000);}} style={{width:"100%",height:42,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",marginTop:4}}>저장</button>
              {profileSaved&&<div style={{textAlign:"center",fontSize:12,color:ACCENT,marginTop:8,fontWeight:500}}>저장되었습니다</div>}
            </div>
            {!currentUser?.emailVerified&&<div style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,background:"#fff"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fff3e0",borderRadius:10}}>
                <span style={{fontSize:14}}>✉️</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#e65100"}}>이메일 인증이 필요해요</div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:1}}>가입 시 발송된 인증 메일을 확인해주세요</div>
                </div>
                <button onClick={async()=>{try{await sendEmailVerification(currentUser);setEmailVerifSent(true);setTimeout(()=>setEmailVerifSent(false),3000);}catch(e){alert("잠시 후 다시 시도해주세요");}}} style={{padding:"5px 10px",borderRadius:8,border:"none",background:"#e65100",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:500,flexShrink:0}}>재발송</button>
              </div>
              <div style={{fontSize:11,color:"#999",marginTop:7,paddingLeft:2}}>📬 인증 메일이 스팸함(정크함)에 있을 수 있어요. 메일이 안 보이면 확인해주세요.</div>
              {emailVerifSent&&<div style={{fontSize:11,color:"#e65100",textAlign:"center",marginTop:6,fontWeight:500}}>인증 메일을 재발송했어요. 메일함을 확인해주세요</div>}
            </div>}
            <div onClick={()=>go("notify","")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",background:"#fff"}}><div style={{display:"flex",alignItems:"center",gap:10}}><i className="ti ti-bell" style={{fontSize:18,color:"#555"}}/><span style={{fontSize:14}}>알림 설정</span></div><i className="ti ti-chevron-right" style={{fontSize:16,color:"#ccc"}}/></div>
            <div onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:10,padding:"16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",background:"#fff"}}><i className="ti ti-logout" style={{fontSize:18,color:"#e25"}}/><span style={{fontSize:14,color:"#e25"}}>로그아웃</span></div>
            {isAdmin&&<div onClick={()=>go("admin")} style={{padding:"12px 16px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:12,color:ADMIN_C,fontWeight:500}}>🔐 관리자 패널</span></div>}
            <div onClick={()=>setWithdrawModal("confirm1")} style={{padding:"16px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:12,color:"#bbb"}}>회원 탈퇴</span></div>
          </>)}
          {mypageTab==="liked"&&(likedItems.length===0?<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>찜한 물건이 없어요</div>:likedItems.map(item=>(<div key={item.id} onClick={()=>goDetail(item)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}><div style={{width:64,height:64,borderRadius:10,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:24}}>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{item.title}</div><div style={{fontSize:11,color:"#bbb"}}>{item.region}</div><div style={{fontSize:13,fontWeight:500,color:item.price===0?ACCENT:"#1a1a1a",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.price===0?"무료 나눔":`${item.price?.toLocaleString()}원`}</div></div><button onClick={e=>{e.stopPropagation();toggleLike(item.id,e);}} style={{background:"none",border:"none",cursor:"pointer",color:"#e25",fontSize:18,alignSelf:"center",flexShrink:0}}><i className="ti ti-heart-filled"/></button></div>)))}
          {mypageTab==="myitems"&&(myItems.length===0?<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>등록한 물건이 없어요</div>:myItems.map(item=>{const isHid=item.hidden===true;return(<div key={item.id} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",alignItems:"center",opacity:isHid?0.5:1}}><div onClick={()=>goDetail(item)} style={{width:56,height:56,borderRadius:10,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:22}}>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>goDetail(item)}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:13,fontWeight:500}}>{item.title}</span>{isHid&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:6,background:"#f0f0f0",color:"#888",fontWeight:600}}>잠시 내림</span>}</div><div style={{fontSize:11,color:item.status==="done"?"#9e9e9e":item.status==="reserved"?"#e65100":ACCENT,fontWeight:500}}>{item.status==="done"?"거래완료":item.status==="reserved"?"예약중":"판매중"}</div></div><div style={{display:"flex",gap:6}}>{isHid?<button onClick={()=>hideItem(item.id,false)} style={{background:"#e8f5e9",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#2e7d32",cursor:"pointer",fontWeight:500}}>다시 올리기</button>:<><button onClick={()=>boostItem(item.id)} style={{background:LIGHT,border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:ACCENT,cursor:"pointer",fontWeight:500}}>⬆</button><button onClick={()=>startEdit(item)} style={{background:"#f5f5f5",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#666",cursor:"pointer"}}>수정</button></>}</div></div>);}))}
          {mypageTab==="hidden"&&(()=>{const hiddenItems=myItems.filter(i=>i.hidden===true);const myJobsList=jobs.filter(j=>j.sellerId===currentUser?.uid&&j.hidden===true);const total=hiddenItems.length+myJobsList.length;return total===0?<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>잠시 내린 게시글이 없어요</div>:<>{hiddenItems.length>0&&<><div style={{padding:"12px 16px 4px",fontSize:11,color:"#aaa",fontWeight:500}}>물건 ({hiddenItems.length})</div>{hiddenItems.map(item=>(<div key={item.id} style={{display:"flex",gap:12,padding:"12px 16px",borderBottom:"0.5px solid #f5f5f5",alignItems:"center"}}><div onClick={()=>goDetail(item)} style={{width:48,height:48,borderRadius:8,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:20}}>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>goDetail(item)}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{item.title}</div><div style={{fontSize:11,color:"#aaa"}}>{fmtTime(item.createdAt)}</div></div><button onClick={()=>hideItem(item.id,false)} style={{background:"#e8f5e9",border:"none",borderRadius:8,padding:"5px 9px",fontSize:11,color:"#2e7d32",cursor:"pointer",fontWeight:500,flexShrink:0}}>다시 올리기</button></div>))}</>}{myJobsList.length>0&&<><div style={{padding:"12px 16px 4px",fontSize:11,color:"#aaa",fontWeight:500}}>일자리 ({myJobsList.length})</div>{myJobsList.map(job=>(<div key={job.id} style={{display:"flex",gap:12,padding:"12px 16px",borderBottom:"0.5px solid #f5f5f5",alignItems:"center"}}><div style={{width:48,height:48,borderRadius:8,flexShrink:0,background:jfs(job.field).light,display:"flex",alignItems:"center",justifyContent:"center"}}><i className={`ti ${jfs(job.field).icon}`} style={{fontSize:20,color:jfs(job.field).bg}}/></div><div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>{setSelJob(job);go("jobdetail");window.location.hash=`#/job/${job.id}`;}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{job.title}</div><div style={{fontSize:11,color:"#aaa"}}>{job.field} · {fmtTime(job.createdAt)}</div></div><button onClick={()=>hideJob(job.id,false)} style={{background:"#e8f5e9",border:"none",borderRadius:8,padding:"5px 9px",fontSize:11,color:"#2e7d32",cursor:"pointer",fontWeight:500,flexShrink:0}}>다시 올리기</button></div>))}</>}</>;})()}
        </div>
      </div>)}

      {/* 관리자 */}
      {screen==="admin"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
        <div style={{padding:"14px 16px",background:ADMIN_C,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}><div><div style={{fontSize:15,fontWeight:600,color:"#fff"}}>🔐 관리자 모드</div><div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:1}}>공쓰재 Admin</div></div><button onClick={()=>{goHome();}} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer"}}>나가기</button></div>
        <div style={{display:"flex",background:"#f8f9ff",borderBottom:"0.5px solid #e0e0e0",flexShrink:0}}>{[["dashboard","대시보드"],["users","회원"],["posts","게시글"],["stats","통계"],["reports","신고"]].map(([t,l])=>(<button key={t} onClick={()=>setAdminTab(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:adminTab===t?600:400,color:adminTab===t?ADMIN_C:"#888",borderBottom:adminTab===t?`2px solid ${ADMIN_C}`:"2px solid transparent"}}>{l}{t==="reports"&&reports.filter(r=>r.status==="pending").length>0&&<span style={{marginLeft:3,fontSize:9,background:"#e25",color:"#fff",borderRadius:8,padding:"1px 4px"}}>{reports.filter(r=>r.status==="pending").length}</span>}</button>))}</div>
        <div style={{flex:1,minHeight:0,overflowY:"auto",padding:16}}>
          {adminTab==="dashboard"&&(<>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}><StatCard label="총 회원" value={adminStats.totalUsers} color={ADMIN_C}/><StatCard label="활성 회원" value={adminStats.activeUsers} color="#2e7d32"/><StatCard label="총 게시글" value={adminStats.totalItems}/><StatCard label="거래완료" value={adminStats.doneItems} color="#e65100"/><StatCard label="일자리" value={adminStats.totalJobs}/><StatCard label="신고" value={adminStats.reports} color={adminStats.reports>0?"#c62828":"#9e9e9e"}/></div>
            <div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>최근 가입 회원</div>
            {[...allUsers].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5).map(u=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:32,height:32,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||allUserPrivate[u.id]?.email||""}</div><div style={{fontSize:11,color:"#aaa"}}>{allUserPrivate[u.id]?.email||""}</div></div><span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:u.status==="suspended"?"#ffebee":"#e8f5e9",color:u.status==="suspended"?"#c62828":"#2e7d32",fontWeight:500}}>{u.status==="suspended"?"정지":"활성"}</span></div>))}
          </>)}
          {adminTab==="users"&&(<><input value={adminUserQ} onChange={e=>setAdminUserQ(e.target.value)} placeholder="이름 또는 소속 검색" style={{...inp,marginBottom:14}}/><div style={{fontSize:12,color:"#aaa",marginBottom:8}}>총 {filtAdminUsers.length}명</div>{filtAdminUsers.map(u=>(<div key={u.id} style={{padding:"12px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||"미입력"}<span style={{fontSize:10,color:"#aaa",marginLeft:6}}>{u.accountType}</span></div><div style={{fontSize:11,color:"#888"}}>{allUserPrivate[u.id]?.email||""}</div>{allUserPrivate[u.id]?.phone&&<div style={{fontSize:11,color:"#555",marginTop:1}}>📞 {allUserPrivate[u.id].phone}</div>}<div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:10,color:ACCENT,fontWeight:600}}>👏 앙코르 {u.encoreCount||0}회</span>{u.isAdmin&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:"#fff3e0",color:"#e65100",fontWeight:600}}>👑 어드민</span>}<span style={{fontSize:10,color:"#aaa"}}>{u.affiliation||"소속 미입력"}</span></div></div><div style={{display:"flex",gap:5,flexShrink:0}}>{u.id!==currentUser?.uid&&<button onClick={()=>toggleAdminRole(u.id)} style={{background:u.isAdmin?"#fff3e0":"#f5f5f5",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:u.isAdmin?"#e65100":"#666",cursor:"pointer",fontWeight:500}}>{u.isAdmin?"어드민 해제":"👑 지정"}</button>}{u.id!==currentUser?.uid&&<button onClick={()=>{const msg=u.status==="suspended"?"이 회원을 활성화하시겠어요?":"이 회원을 정지하시겠어요?";if(window.confirm(msg))toggleUserStatus(u.id);}} style={{background:u.status==="suspended"?"#e8f5e9":"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:u.status==="suspended"?"#2e7d32":"#c62828",cursor:"pointer",fontWeight:500}}>{u.status==="suspended"?"활성화":"정지"}</button>}</div></div></div>))}</>)}
          {adminTab==="posts"&&(<><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>중고 물건 ({items.length})</div>{[...items].sort((a,b)=>(b.viewCount||0)-(a.viewCount||0)).map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}} alt=""/>:<span>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{item.title}<span style={{fontSize:10,color:(item.viewCount||0)>0?"#555":"#ccc",marginLeft:6,fontWeight:400}}>👁 {item.viewCount||0}</span></div><div style={{fontSize:11,color:"#aaa"}}>{item.seller} · {item.region}</div></div><button onClick={()=>{if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteItem(item.id);}} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}<div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:16,marginBottom:10}}>일자리 공고 ({jobs.length})</div>{jobs.map(job=>(<div key={job.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{job.icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{job.title}</div><div style={{fontSize:11,color:"#aaa"}}>{job.org} · {job.location}</div></div><button onClick={()=>{if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteJob(job.id);}} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}</>)}
          {adminTab==="stats"&&(<><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>📦 카테고리별</div><BarChart data={catStats}/></div><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>📍 지역별</div><BarChart data={regionStats} color={ADMIN_C}/></div><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>🏷 나누미 / 구하미</div>{(()=>{const nan=items.filter(i=>i.postType==="nanumi").length;const gu=items.filter(i=>i.postType==="guhami").length;const tot=nan+gu||1;return(<div><div style={{display:"flex",height:20,borderRadius:10,overflow:"hidden",marginBottom:8}}><div style={{width:`${(nan/tot)*100}%`,background:ACCENT}}/><div style={{width:`${(gu/tot)*100}%`,background:"#c62828"}}/></div><div style={{display:"flex",gap:16,fontSize:12}}><span style={{color:ACCENT}}>■ 나누미 {nan}개</span><span style={{color:"#c62828"}}>■ 구하미 {gu}개</span></div></div>);})()}</div></>)}
          {adminTab==="reports"&&(()=>{
            const stLabel={pending:"검토중",resolved:"처리완료",rejected:"반려"};
            const stStyle={pending:{bg:"#ffebee",col:"#c62828"},resolved:{bg:"#e8f5e9",col:"#2e7d32"},rejected:{bg:"#f5f5f5",col:"#9e9e9e"}};
            const pending=reports.filter(r=>r.status==="pending");
            const done=reports.filter(r=>r.status!=="pending");
            const renderReport=r=>{
              const isDone=r.status!=="pending";
              const st=stStyle[r.status]||stStyle.rejected;
              const typeLabel=r.targetType==="item"?"물건":"일자리";
              const linkedItem=r.targetType==="item"?items.find(i=>i.id===r.targetId):null;
              const linkedJob=r.targetType==="job"?jobs.find(j=>j.id===r.targetId):null;
              const hasTarget=linkedItem||linkedJob;
              return(
                <div key={r.id} style={{padding:"14px 0",borderBottom:"0.5px solid #f5f5f5",opacity:isDone?0.45:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:st.bg,color:st.col,fontWeight:500}}>{stLabel[r.status]||r.status}</span>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#f0f4ff",color:"#3949ab",fontWeight:500}}>{typeLabel}</span>
                    </div>
                    <span style={{fontSize:11,color:"#bbb"}}>{r.createdAt?.toDate?.()?.toLocaleDateString("ko-KR")||""}</span>
                  </div>
                  <div style={{fontSize:12,color:"#888",marginBottom:hasTarget?6:isDone?0:8}}>사유: {r.reason}{r.detail?` — ${r.detail}`:""}</div>
                  {hasTarget&&<button onClick={()=>{if(linkedItem){goDetail(linkedItem);}else{setSelJob(linkedJob);go("jobdetail");window.location.hash=`#/job/${linkedJob.id}`;}}} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,border:`0.5px solid ${ACCENT}`,background:"none",color:ACCENT,fontSize:11,cursor:"pointer",marginBottom:isDone?0:8}}>
                    <i className="ti ti-external-link" style={{fontSize:11}}/>글 보기
                  </button>}
                  {!isDone&&<div style={{display:"flex",gap:8,marginTop:hasTarget?0:0}}>
                    <button onClick={()=>updateReport(r.id,"resolved")} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",background:"#e8f5e9",color:"#2e7d32",fontSize:12,cursor:"pointer",fontWeight:500}}>처리 완료</button>
                    <button onClick={()=>updateReport(r.id,"rejected")} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",background:"#f5f5f5",color:"#888",fontSize:12,cursor:"pointer"}}>반려</button>
                  </div>}
                </div>
              );
            };
            return(
              <>
                <div style={{fontSize:12,color:"#aaa",marginBottom:12}}>신고 목록 ({reports.length}) · 검토중 {pending.length}</div>
                {reports.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:40,fontSize:14}}>신고 접수 없음</div>}
                {pending.map(renderReport)}
                {done.length>0&&<>
                  <div style={{fontSize:11,color:"#bbb",fontWeight:500,marginTop:16,marginBottom:4,paddingTop:12,borderTop:"0.5px solid #f0f0f0"}}>처리된 신고 ({done.length})</div>
                  {done.map(renderReport)}
                </>}
              </>
            );
          })()}
        </div>
      </div>)}

      {/* 앱 정보 화면들 */}
      {["appinfo","guide","notice","contact","terms","privacy"].includes(screen)&&(()=>{
        const titles={appinfo:"공쓰재 소개",guide:"이용 안내",notice:"공지사항",contact:"문의하기",terms:"이용약관",privacy:"개인정보처리방침"};
        const Art=({t,children})=>(
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1a1a1a",marginBottom:7,paddingBottom:5,borderBottom:`1px solid ${DIVIDER}`}}>{t}</div>
            <div style={{fontSize:13,color:"#444",lineHeight:1.9}}>{children}</div>
          </div>
        );
        const Br=()=><br/>;
        const termsContent=(
          <div style={{padding:"20px 20px 120px"}}>
            <div style={{fontSize:11,color:"#aaa",marginBottom:22,paddingBottom:14,borderBottom:`1px solid ${DIVIDER}`}}>
              시행일: 2026년 6월 19일 · 운영: (주)스탭서울컴퍼니
            </div>
            <Art t="제1조 (목적)">
              이 약관은 (주)스탭서울컴퍼니(이하 "회사")이 운영하는 공쓰재 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 관계를 규정함을 목적으로 합니다.
            </Art>
            <Art t="제2조 (정의)">
              ① "서비스"란 공연·문화예술 분야의 소품·의상·장비 등 물품 나눔 및 거래, 일자리 정보 공유, 공간 연결(준비 중) 등을 위한 공쓰재 플랫폼을 말합니다.<Br/>
              ② "회원"이란 이 약관에 동의하고 회원가입을 완료한 자를 말합니다.<Br/>
              ③ "게시물"이란 회원이 서비스에 등록한 물품 정보·사진·일자리 공고·채팅 메시지 등 일체의 정보를 말합니다.
            </Art>
            <Art t="제3조 (약관의 효력 및 변경)">
              ① 이 약관은 서비스를 이용하는 모든 회원에게 적용됩니다.<Br/>
              ② 회사는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 시행 7일 전에 고지합니다.<Br/>
              ③ 고지 후 7일 이내에 이의를 제기하지 않으면 변경 약관에 동의한 것으로 봅니다.
            </Art>
            <Art t="제4조 (회원가입 및 계정)">
              ① 회원가입은 이름·전화번호·이메일 등 필수 정보를 입력하고 본 약관에 동의함으로써 완료됩니다.<Br/>
              ② 회원은 본인 정보만 등록할 수 있으며, 타인 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.<Br/>
              ③ 계정의 보안 관리 책임은 회원 본인에게 있습니다.<Br/>
              ④ 회원은 언제든지 서비스 내 MY → 설정 메뉴에서 회원 탈퇴를 요청할 수 있습니다.
            </Art>
            <Art t="제5조 (서비스 이용)">
              ① 비회원은 등록된 게시물을 열람할 수 있으나, 글쓰기·채팅·찜 등의 기능은 회원 가입 후 이용 가능합니다.<Br/>
              ② 서비스는 인터넷 연결이 필요하며, 회사는 서비스 품질 향상 또는 운영상의 이유로 서비스를 변경·중단할 수 있습니다.
            </Art>
            <Art t="제6조 (게시물 및 거래 책임)">
              ① 공쓰재는 회원 간 나눔·거래를 연결하는 중개 플랫폼입니다. 실제 거래·나눔의 당사자는 판매자·나누미 회원과 구매자·구하미 회원 본인이며, 회사는 거래 당사자가 아닙니다.<Br/>
              ② 회사는 회원 간 거래 과정에서 발생하는 분쟁·손해에 대해 법령에서 정한 경우를 제외하고 책임을 지지 않습니다.<Br/>
              ③ 회원은 게시물의 정확성·적법성에 책임을 지며, 타인의 저작권이나 권리를 침해하는 내용을 게시해서는 안 됩니다.<Br/>
              ④ 게시물의 저작권은 해당 회원에게 있으며, 회사는 서비스 운영 목적 범위에서 게시물을 노출·활용할 수 있습니다.
            </Art>
            <Art t="제7조 (금지 행위)">
              회원은 다음 행위를 해서는 안 됩니다.<Br/>
              · 불법 물품·저작권 침해물 거래 또는 게시<Br/>
              · 사기, 허위 정보 게시, 가격 조작<Br/>
              · 타인에 대한 욕설·혐오·차별적 표현<Br/>
              · 스팸 메시지, 광고 도배, 반복적 도발<Br/>
              · 타인의 개인정보 무단 수집·이용<Br/>
              · 서비스 운영 또는 서버를 방해하는 일체의 행위
            </Art>
            <Art t="제8조 (게시물 삭제 및 계정 제한)">
              ① 회사는 제7조 금지 행위에 해당하거나 서비스 운영 정책을 위반하는 게시물을 예고 없이 삭제할 수 있습니다.<Br/>
              ② 회사는 위반 정도에 따라 회원의 서비스 이용을 일시 정지하거나 계정을 영구 정지할 수 있습니다.<Br/>
              ③ 계정 정지에 이의가 있는 경우 운영팀 이메일로 이의 신청할 수 있습니다.
            </Art>
            <Art t="제9조 (면책)">
              ① 회사는 회원 간 거래·나눔에서 발생하는 분쟁에 대해 중재 의무를 지지 않습니다.<Br/>
              ② 천재지변, 서버 장애, 네트워크 문제 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.<Br/>
              ③ 회원이 게시한 정보의 정확성·신뢰성에 대해 회사는 보증하지 않습니다.
            </Art>
            <Art t="제10조 (분쟁 해결 및 준거법)">
              ① 이 약관은 대한민국 법령에 따라 해석됩니다.<Br/>
              ② 서비스 이용과 관련한 분쟁의 관할 법원은 민사소송법에 따른 관할 법원으로 합니다.
            </Art>
            <Art t="제11조 (운영자 연락처)">
              회사명: (주)스탭서울컴퍼니<Br/>
              서비스명: 공쓰재<Br/>
              이메일: w3master@staffseoul.com
            </Art>
            <div style={{marginTop:8,padding:"12px 14px",background:"#f9f9f9",borderRadius:10,fontSize:11,color:"#aaa",lineHeight:1.7}}>
              ※ 이 약관은 초안이며, 정식 법률 검토를 거쳐 확정됩니다.<Br/>
              부칙: 이 약관은 2026년 6월 19일부터 시행합니다.
            </div>
          </div>
        );
        const placeholder=(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
            <div style={{fontSize:32,marginBottom:12}}>🚧</div>
            <div style={{fontSize:14,color:"#aaa",textAlign:"center"}}>콘텐츠를 준비 중이에요</div>
          </div>
        );
        const privacyContent=(
          <div style={{padding:"20px 20px 120px"}}>
            <div style={{fontSize:11,color:"#aaa",marginBottom:22,paddingBottom:14,borderBottom:`1px solid ${DIVIDER}`}}>
              시행일: 2026년 6월 19일 · 운영: (주)스탭서울컴퍼니
            </div>
            <Art t="1. 수집하는 개인정보 항목 및 수집 방법">
              <div style={{marginBottom:10}}>
                <span style={{fontWeight:600,fontSize:12,color:ACCENT}}>필수 항목</span>
                <div style={{marginTop:6,background:"#f9f9f9",borderRadius:8,overflow:"hidden"}}>
                  {[
                    ["이름","회원가입 시","거래 당사자 식별"],
                    ["전화번호","회원가입 시","거래 연락 수단"],
                    ["이메일","회원가입 시","계정 인증·비밀번호 재설정"],
                  ].map(([item,when,why],i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"8px 12px",borderBottom:i<2?`0.5px solid ${DIVIDER}`:"none",fontSize:12}}>
                      <span style={{width:80,color:"#1a1a1a",fontWeight:500,flexShrink:0}}>{item}</span>
                      <span style={{width:90,color:"#666",flexShrink:0}}>{when}</span>
                      <span style={{color:"#888",flex:1}}>{why}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span style={{fontWeight:600,fontSize:12,color:"#888"}}>선택 항목</span>
                <div style={{marginTop:6,background:"#f9f9f9",borderRadius:8,overflow:"hidden"}}>
                  {[
                    ["주소","회원가입 시","지역 기반 매칭"],
                    ["소속","회원가입 시","프로필 표시"],
                    ["관심 분야","회원가입 시","맞춤 정보 제공"],
                    ["거래장소","게시글 등록 시","지도 표시"],
                    ["기기 토큰(FCM)","알림 허용 시","채팅 알림 전송"],
                    ["게시글·채팅 내용","서비스 이용 중","서비스 제공"],
                  ].map(([item,when,why],i,arr)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"8px 12px",borderBottom:i<arr.length-1?`0.5px solid ${DIVIDER}`:"none",fontSize:12}}>
                      <span style={{width:80,color:"#1a1a1a",fontWeight:500,flexShrink:0}}>{item}</span>
                      <span style={{width:90,color:"#666",flexShrink:0}}>{when}</span>
                      <span style={{color:"#888",flex:1}}>{why}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Art>
            <Art t="2. 개인정보 이용 목적">
              · 회원 식별 및 서비스 이용 관리<Br/>
              · 물품 나눔·거래 연결 및 채팅 서비스 제공<Br/>
              · 일자리 정보 공유 서비스 제공<Br/>
              · 채팅 알림(푸시 메시지) 발송<Br/>
              · 부정 이용 방지 및 서비스 운영·개선<Br/>
              · 공지사항 전달
            </Art>
            <Art t="3. 보유 및 이용 기간">
              · 회원 정보(이름·연락처 등): 탈퇴 즉시 삭제 (단, 관계 법령에 따른 보관 의무가 있는 경우 해당 기간 보관)<Br/>
              · 기기 토큰(FCM): 로그아웃 또는 알림 해제 시 즉시 삭제<Br/>
              · 게시글: 탈퇴 후에도 익명 처리(작성자 표시 → "탈퇴한 회원", 연락처 삭제)되어 보존될 수 있습니다.<Br/>
              · 채팅 내역: 거래 상대방 보호를 위해 탈퇴 후 즉시 삭제되지 않으며, 탈퇴 회원을 식별할 수 없는 형태로 처리됩니다.<Br/>
              · 거래장소(좌표): 해당 게시글 삭제 시 함께 삭제<Br/><Br/>
              관련 법령에 의한 의무 보관 기간이 있는 경우 해당 기간 동안 분리 보관 후 파기합니다.
            </Art>
            <Art t="4. 제3자 제공 및 처리위탁">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.<Br/><Br/>
              <div style={{background:"#f9f9f9",borderRadius:8,overflow:"hidden"}}>
                {[
                  ["Firebase (Google LLC)","인증·데이터베이스·파일 저장·FCM 알림","미국 (국외이전)"],
                  ["Kakao Corp.","지도 표시·카카오톡 공유","국내"],
                  ["Google Analytics","서비스 이용 통계 (익명화 처리)","미국 (국외이전)"],
                ].map(([co,task,loc],i,arr)=>(
                  <div key={i} style={{padding:"10px 12px",borderBottom:i<arr.length-1?`0.5px solid ${DIVIDER}`:"none",fontSize:12}}>
                    <div style={{fontWeight:600,color:"#1a1a1a",marginBottom:3}}>{co}</div>
                    <div style={{color:"#666",marginBottom:2}}>위탁 업무: {task}</div>
                    <div style={{color:"#888"}}>서버 위치: {loc}</div>
                  </div>
                ))}
              </div>
              <Br/>
              Firebase 및 Google Analytics의 미국 서버 이전에 관한 정보는 Google 개인정보처리방침에서 확인할 수 있습니다.
            </Art>
            <Art t="5. 이용자의 권리 및 행사 방법">
              이용자는 언제든지 다음 권리를 행사할 수 있습니다.<Br/>
              · 개인정보 열람 요청<Br/>
              · 개인정보 정정·삭제 요청<Br/>
              · 개인정보 처리 정지 요청<Br/><Br/>
              앱 내 MY → 설정에서 직접 수정·탈퇴하거나, 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있습니다. 요청을 받은 날로부터 10일 이내에 처리합니다.
            </Art>
            <Art t="6. 개인정보 파기 절차 및 방법">
              이용 목적이 달성된 개인정보는 지체 없이 파기합니다.<Br/>
              · 전자적 파일: 복구 불가능한 방법으로 영구 삭제<Br/>
              · 법령에 의한 보관 필요 정보: 별도 DB에 분리 보관 후 기간 만료 시 파기
            </Art>
            <Art t="7. 개인정보 보호책임자">
              이용자의 개인정보 관련 문의·불만·피해 구제를 담당합니다.<Br/><Br/>
              책임자: (주)스탭서울컴퍼니<Br/>
              이메일: w3master@staffseoul.com<Br/><Br/>
              개인정보 침해 관련 신고·상담은 아래 기관에도 문의할 수 있습니다.<Br/>
              · 개인정보보호위원회: privacy.go.kr / 국번 없이 182<Br/>
              · 한국인터넷진흥원 개인정보침해신고센터: privacy.kisa.or.kr / 118
            </Art>
            <Art t="8. 방침 변경 시 고지">
              이 방침을 변경할 경우 시행 7일 전에 서비스 내 공지를 통해 사전 고지합니다.
            </Art>
            <div style={{marginTop:8,padding:"12px 14px",background:"#f9f9f9",borderRadius:10,fontSize:11,color:"#aaa",lineHeight:1.7}}>
              ※ 이 방침은 초안이며, 정식 법률 검토를 거쳐 확정됩니다.<Br/>
              부칙: 이 방침은 2026년 6월 19일부터 시행합니다.
            </div>
          </div>
        );
        const appinfoContent=(
          <div style={{padding:"0 0 120px"}}>
            <div style={{background:`linear-gradient(135deg,${ACCENT},#1a6a8a)`,padding:"28px 20px 24px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)",letterSpacing:2,marginBottom:6}}>TWR · THEATRE WASTE RECYCLE</div>
              <div style={{fontSize:22,fontWeight:700,color:"#fff",lineHeight:1.3,marginBottom:4}}>공연 쓰고 남은 거,<br/>재활용</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>공쓰재</div>
            </div>
            <div style={{padding:"24px 20px 0"}}>
              <p style={{fontSize:14,lineHeight:1.9,color:"#333",marginBottom:20}}>
                공연이 끝나면 무대 위 소품과 세트는 갈 곳을 잃습니다. 폐기하자니 비용이 들고, 어딘가 필요한 곳이 있을 것 같은데 연결할 길이 없었습니다. 우리는 이렇게 버려지는 것들을 '공연쓰레기'라 부릅니다.
              </p>
              <p style={{fontSize:14,lineHeight:1.9,color:"#333",marginBottom:20}}>
                공쓰재는 공연쓰레기를 폐기하는 대신, 필요한 사람과 나누는 통로입니다. 쓰고 남은 무대 소품과 세트, 의상, 분장 도구, 장비를 누구나 쉽게 나누고 구할 수 있습니다.
              </p>
              <p style={{fontSize:14,lineHeight:1.9,color:"#333",marginBottom:20}}>
                우리가 바라는 건 공연과 환경이 함께 가는 길입니다. 무대 위 물건들이 한 번 쓰이고 사라지는 대신, 다시 쓰이고 순환하면서 — 제작비를 아끼고, 더 좋은 작품을 만들고, 무대기술 아이디어가 자유롭게 오가는 공연 커뮤니티가 되기를 바랍니다.
              </p>
              <div style={{padding:"14px 16px",background:LIGHT,borderRadius:12,marginBottom:24}}>
                <div style={{fontSize:13,fontWeight:600,color:ACCENT,marginBottom:2}}>나눔이 우선입니다.</div>
                <div style={{fontSize:13,lineHeight:1.8,color:"#555"}}>사고파는 것보다, 함께 쓰는 것이 공쓰재의 마음입니다.</div>
              </div>
              <div style={{marginBottom:28}}>
                <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:10}}>나누는 물품</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {["목재","가구","의상","분장 도구","댄스플로어","암막","소품","그 외 모든 것"].map(tag=>(
                    <span key={tag} style={{padding:"5px 12px",borderRadius:20,background:"#fff",border:`1px solid ${DIVIDER}`,fontSize:12,color:"#555"}}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{borderTop:`1px solid ${DIVIDER}`,paddingTop:20,textAlign:"center"}}>
                <div style={{fontSize:11,color:"#bbb",lineHeight:1.8}}>
                  Powered by 스탭서울<br/>
                  Sponsored by You
                </div>
              </div>
            </div>
          </div>
        );
        const guideContent=(
          <div style={{padding:"20px 20px 120px"}}>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:17,fontWeight:700,color:"#1a1a1a",lineHeight:1.4,marginBottom:16}}>
                공쓰재는 나누미와 구하미의 공간입니다
              </div>
              <div style={{display:"flex",gap:10,marginBottom:24}}>
                <div style={{flex:1,padding:"14px 14px",background:LIGHT,borderRadius:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:ACCENT,marginBottom:4}}>나누미</div>
                  <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>쓰고 남은 걸<br/>나누는 사람</div>
                </div>
                <div style={{flex:1,padding:"14px 14px",background:"#f0f4ff",borderRadius:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#5b6abf",marginBottom:4}}>구하미</div>
                  <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>필요한 걸<br/>구하는 사람</div>
                </div>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:"#888",marginBottom:16}}>나누미와 구하미의 공쓰재 일기</div>
              {[
                ["하나.","나누미는 철수를 앞두고 걱정입니다. 이 소품들, 폐기하자니 돈이 들고 남 주자니 누구한테 줘야 할지 모르겠습니다."],
                ["둘.","구하미는 스탭 회의를 마치고 막막합니다. 연출이 생전 본 적도 없는 걸 구해 오라고 합니다. 그때 그 공연에서 봤던 그건 어디 가면 구할까요?"],
                ["셋.","나누미는 공쓰재에 물건을 올립니다. 사진 한 장 찍어 올리고, 물품 정보를 적습니다. 구하미는 둘러보다 마음에 드는 걸 발견합니다."],
                ["넷.","구하미가 채팅으로 말을 겁니다. 둘은 약속 장소와 시간을 정합니다."],
                ["다섯.","철수하는 날, 두 사람은 현장에서 만납니다. 버려질 뻔한 소품이 새 무대로 갑니다."],
              ].map(([num,text])=>(
                <div key={num} style={{display:"flex",gap:12,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:700,color:ACCENT}}>{num}</span>
                  </div>
                  <div style={{fontSize:13,lineHeight:1.8,color:"#444",paddingTop:8}}>{text}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:12}}>올릴 때 이렇게 하면 좋아요</div>
              {["물품 전체가 잘 보이는 선명한 사진 한 장","물품 정보 — 사이즈(가로·세로·높이), 색상, 특징과 장점","물품 위치 — 구하미가 찾으러 올 곳 (예: 서울시 성북구)","나누미 소개 — 단체나 작품을 적으면 홍보도 돼요 (예: ○○극단)"].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                  <span style={{color:ACCENT,fontSize:14,flexShrink:0,marginTop:1}}>·</span>
                  <span style={{fontSize:13,color:"#444",lineHeight:1.7}}>{t}</span>
                </div>
              ))}
              <div style={{marginTop:12,padding:"12px 14px",background:"#f9f9f9",borderRadius:10,fontSize:12,color:"#666",lineHeight:1.7}}>
                구하미는 '물품 위치' 대신, 찾는 물건을 봤던 공연이나 단체명을 적으면 좋아요.
              </div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:12}}>이렇게 쓰세요</div>
              {["둘러보기는 로그인 없이 자유롭게","글쓰기·채팅·찜은 회원가입 후","물건이나 일자리를 올려요 (나눔 · 구함 · 판매)","마음에 들면 채팅으로 연락해요","연락처는 채팅에서 본인이 원할 때만 공유돼요"].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{i+1}</span>
                  </div>
                  <span style={{fontSize:13,color:"#444",lineHeight:1.7,paddingTop:3}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        );
        const noticeContent=(
          <div style={{padding:"20px 20px 120px"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#1a1a1a",marginBottom:20}}>공쓰재 거래, 이것만 기억해주세요</div>
            {[
              {icon:"ti-heart",title:"나눔이 먼저입니다.",text:"공쓰재는 무상 나눔을 우선으로 합니다. 필요한 경우 판매도 할 수 있지만, 함께 쓰는 마음이 먼저입니다."},
              {icon:"ti-map-pin",title:"현장에서 받아주세요.",text:"창고 없는 극단들을 위한 취지입니다. 철수하는 날 현장에서 주고받는 것을 권합니다. 택배는 양쪽이 합의하면 가능하지만, 책임은 거래 당사자에게 있어요."},
              {icon:"ti-users",title:"책임은 거래 당사자에게.",text:"공쓰재는 만남의 자리를 열어줄 뿐, 거래의 당사자는 나누미와 구하미 본인입니다. 손해·배상에 대한 책임은 실제 거래자에게 있습니다."},
              {icon:"ti-shield",title:"개인정보를 조심하세요.",text:"거래 중 연락처 등 개인정보가 오갈 수 있으니 각별히 주의해주세요. 공쓰재는 채팅 안에서 본인이 원할 때만 연락처가 공유되도록 하고 있습니다."},
              {icon:"ti-check",title:"거래가 끝나면 상태를 바꿔주세요.",text:"거래 완료 표시를 안 하면, 이미 나눈 물건에 계속 연락이 올 수 있어요."},
            ].map(({icon,title,text})=>(
              <div key={title} style={{display:"flex",gap:12,marginBottom:18,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:10,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className={`ti ${icon}`} style={{fontSize:17,color:ACCENT}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:3}}>{title}</div>
                  <div style={{fontSize:13,color:"#555",lineHeight:1.8}}>{text}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:8,borderTop:`1px solid ${DIVIDER}`,paddingTop:20}}>
              <div style={{padding:"16px",background:LIGHT,borderRadius:12}}>
                <div style={{fontSize:13,fontWeight:700,color:ACCENT,marginBottom:6}}>공지 · 공쓰재 베타 오픈 🎉</div>
                <div style={{fontSize:13,color:"#444",lineHeight:1.8,marginBottom:12}}>
                  공연 쓰고 남은 거, 재활용하는 공쓰재가 문을 열었습니다. 나누미와 구하미 여러분의 참여를 기다립니다. 버려질 뻔한 무대 위 물건들이 새 작품으로 이어지길 바랍니다.
                </div>
                <div style={{fontSize:12,color:"#888"}}>문의 — w3master@staffseoul.com</div>
                <div style={{fontSize:12,color:"#888"}}>facebook.com/twr.or.kr</div>
              </div>
            </div>
          </div>
        );
        const contactContent=(
          <div style={{padding:"28px 20px 120px"}}>
            <div style={{fontSize:14,color:"#555",lineHeight:1.8,marginBottom:28}}>
              공쓰재 이용 관련 문의, 오류 신고, 의견을 보내주세요.
            </div>
            {[
              {icon:"ti-mail",label:"이메일",value:"w3master@staffseoul.com",action:()=>window.location.href="mailto:w3master@staffseoul.com"},
              {icon:"ti-brand-facebook",label:"페이스북",value:"facebook.com/twr.or.kr",action:()=>window.open("https://www.facebook.com/twr.or.kr","_blank")},
            ].map(({icon,label,value,action})=>(
              <div key={label} onClick={action} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",background:"#fff",borderRadius:14,border:`1px solid ${DIVIDER}`,marginBottom:12,cursor:"pointer"}}>
                <div style={{width:40,height:40,borderRadius:12,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className={`ti ${icon}`} style={{fontSize:20,color:ACCENT}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"#aaa",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:13,color:"#1a1a1a",fontWeight:500}}>{value}</div>
                </div>
                <i className="ti ti-external-link" style={{fontSize:15,color:"#ccc"}}/>
              </div>
            ))}
          </div>
        );
        const bodyContents={terms:termsContent,privacy:privacyContent,appinfo:appinfoContent,guide:guideContent,notice:noticeContent,contact:contactContent};
        return(
          <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}>
              <button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
              <span style={{fontWeight:500,fontSize:15}}>{titles[screen]}</span>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {bodyContents[screen]||placeholder}
            </div>
          </div>
        );
      })()}

      {/* 공유 복사 토스트 */}
      {shareModal&&(()=>{
        const{type,post}=shareModal;
        const hashUrl=`https://twr.or.kr/#/${type}/${post.id}`;
        const shareText=type==="item"
          ?`${post.postType==="guhami"?"구함":post.price?`${post.price.toLocaleString()}원`:"나눔"} — ${post.title} | 공쓰재`
          :`${post.field} ${post.jobType==="gujik"?"구직":"구인"} — ${post.title} | 공쓰재`;
        const opts=[
          {key:"copy",icon:"ti-link",label:"링크 복사",iconColor:ACCENT,iconBg:LIGHT,
           action:()=>{copyLink(hashUrl);setShareModal(null);}},
          ...(window.Kakao?.Share?[{key:"kakao",label:"카카오톡",
           action:()=>{shareKakao(type,post);setShareModal(null);}}]:[]),
          ...(!!navigator.share?[{key:"share",icon:"ti-share",label:"다른 앱으로 공유",iconColor:"#555",iconBg:"#f0f0f0",
           action:()=>{navigator.share({title:post.title,text:shareText,url:hashUrl}).catch(()=>{});setShareModal(null);}}]:[]),
        ];
        return(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShareModal(null)}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",paddingBottom:"calc(16px + env(safe-area-inset-bottom,0px))",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"18px 20px 14px",borderBottom:`0.5px solid ${DIVIDER}`}}>
                <div style={{width:36,height:4,borderRadius:4,background:"#e0e0e0",margin:"0 auto 12px"}}/>
                <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>공유하기</div>
              </div>
              {opts.map((opt,i)=>(
                <button key={opt.key} onClick={opt.action} style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 20px",border:"none",borderBottom:i<opts.length-1?`0.5px solid ${DIVIDER}`:"none",background:"none",cursor:"pointer",boxSizing:"border-box",textAlign:"left"}}>
                  {opt.key==="kakao"
                    ?<div style={{width:42,height:42,borderRadius:12,background:"#FEE500",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>💬</div>
                    :<div style={{width:42,height:42,borderRadius:12,background:opt.iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className={`ti ${opt.icon}`} style={{fontSize:20,color:opt.iconColor}}/></div>
                  }
                  <span style={{fontSize:15,color:"#1a1a1a",fontWeight:400}}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
      {shareToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:ACCENT,color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>🔗 링크가 복사됐어요</div>}
      {notFoundToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:"#555",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>이 게시글은 더 이상 볼 수 없어요</div>}
      {reportToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:"#333",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>🚩 신고가 접수됐어요. 검토 후 조치할게요</div>}

      {/* PWA 설치 안내 모달 */}
      {showPWAModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShowPWAModal(false)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>📲 홈 화면에 추가하기</div>
          <div style={{fontSize:13,color:"#888",marginBottom:20}}>앱 설치 없이 앱처럼 사용할 수 있어요</div>
          {isKakaoInApp?(
            /* 카카오 인앱 브라우저 — iOS/Android 공통: 외부 브라우저로 열어야 홈화면 추가 가능 */
            <div style={{padding:"16px",background:"#fff8e1",borderRadius:14,marginBottom:12,border:"1px solid #ffe082"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#e65100",marginBottom:8}}>⚠️ 카카오톡 내에서는 추가가 불가능해요</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.9}}>
                {isIOS?(
                  <>오른쪽 하단 <strong>···</strong> 메뉴 →<br/><strong>'Safari로 열기'</strong>를 선택해주세요.<br/>Safari에서 홈 화면에 추가할 수 있어요.</>
                ):(
                  <>오른쪽 상단 <strong>···</strong> 메뉴 →<br/><strong>'다른 브라우저로 열기'</strong>를 선택해주세요.<br/>Chrome에서 홈 화면에 추가할 수 있어요.</>
                )}
              </div>
              <div style={{marginTop:12,padding:"8px 12px",background:"#f5f5f5",borderRadius:8,fontSize:12,color:"#888",fontFamily:"monospace"}}>twr.or.kr</div>
            </div>
          ):isIOS?(
            /* iOS Safari */
            <>
              <div style={{padding:"14px",background:LIGHT,borderRadius:14,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:ACCENT,marginBottom:8}}>iPhone / iPad (Safari)</div>
                <div style={{fontSize:13,color:"#444",lineHeight:2}}>
                  1. 하단 가운데 <strong>공유 버튼 <span style={{fontSize:16}}>⎙</span></strong> 탭<br/>
                  2. 스크롤해서 <strong>'홈 화면에 추가'</strong> 선택<br/>
                  3. 오른쪽 위 <strong>'추가'</strong> 탭
                </div>
              </div>
              <div style={{fontSize:11,color:"#aaa",textAlign:"center"}}>Safari 브라우저에서만 홈 화면 추가가 가능해요</div>
            </>
          ):deferredPrompt?(
            /* Android — 설치 프롬프트 있음 */
            <>
              <div style={{fontSize:13,color:"#555",marginBottom:16,lineHeight:1.6}}>아래 버튼을 누르면 홈 화면에 바로 추가돼요.</div>
              <button onClick={async()=>{deferredPrompt.prompt();const r=await deferredPrompt.userChoice;if(r.outcome==="accepted"){localStorage.setItem('pwaInstallDismissed','1');setShowPWABanner(false);}setDeferredPrompt(null);setShowPWAModal(false);}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>홈 화면에 추가하기</button>
            </>
          ):(
            /* Android Chrome — 수동 */
            <div style={{padding:"14px",background:LIGHT,borderRadius:14,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:ACCENT,marginBottom:8}}>Android (Chrome)</div>
              <div style={{fontSize:13,color:"#444",lineHeight:2}}>
                1. 오른쪽 위 <strong>⋮ 메뉴</strong> 탭<br/>
                2. <strong>'홈 화면에 추가'</strong> 선택<br/>
                3. <strong>'추가'</strong> 탭
              </div>
            </div>
          )}
          <button onClick={()=>{localStorage.setItem('pwaInstallDismissed','1');setShowPWABanner(false);setShowPWAModal(false);}} style={{width:"100%",marginTop:16,padding:"12px 0",borderRadius:14,border:"none",background:"#f5f5f5",color:"#999",fontSize:13,cursor:"pointer"}}>다시 보지 않기</button>
        </div>
      </div>)}

      {/* 푸시 알림 권한 요청 모달 */}
      {/* 비로그인 행동 차단 — 로그인 안내 모달 */}
      {contactConfirm&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setContactConfirm(null)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:28,textAlign:"center",marginBottom:10}}>📞</div>
          <div style={{fontSize:17,fontWeight:700,textAlign:"center",marginBottom:8}}>연락처를 공유하시겠어요?</div>
          <div style={{fontSize:20,fontWeight:700,color:ACCENT,textAlign:"center",marginBottom:6,letterSpacing:"1px"}}>{contactConfirm.phone}</div>
          <div style={{fontSize:12,color:"#aaa",textAlign:"center",marginBottom:28}}>상대방 채팅창에 번호가 표시됩니다</div>
          <button onClick={()=>confirmContactShare(contactConfirm.phone)} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>공유하기</button>
          <button onClick={()=>setContactConfirm(null)} style={{width:"100%",height:44,borderRadius:14,border:"none",background:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>취소</button>
        </div>
      </div>)}
      {loginPromptMsg&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setLoginPromptMsg(null)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:28,textAlign:"center",marginBottom:10}}>🔐</div>
          <div style={{fontSize:17,fontWeight:700,textAlign:"center",marginBottom:8}}>로그인이 필요해요</div>
          <div style={{fontSize:13,color:"#888",textAlign:"center",lineHeight:1.7,marginBottom:24}}>{loginPromptMsg}</div>
          <button onClick={()=>{setLoginPromptMsg(null);setAuthStep("login");setAuthError("");}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>로그인하기</button>
          <button onClick={()=>setLoginPromptMsg(null)} style={{width:"100%",height:44,borderRadius:14,border:"none",background:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>닫기</button>
        </div>
      </div>)}

      {showPushModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShowPushModal(false)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:18,textAlign:"center",marginBottom:8}}>🔔</div>
          <div style={{fontSize:16,fontWeight:700,textAlign:"center",marginBottom:6}}>채팅 알림 받기</div>
          <div style={{fontSize:13,color:"#888",textAlign:"center",lineHeight:1.7,marginBottom:24}}>채팅 메시지를 놓치지 않으려면<br/>알림을 허용해주세요</div>
          <button onClick={async()=>{const ok=await requestAndRegisterFCM(currentUser?.uid);localStorage.setItem('pushDismissed','1');setShowPushModal(false);if(!ok&&typeof Notification!=="undefined"&&Notification.permission==="denied"){alert("브라우저 설정에서 알림을 허용해주세요");}}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>알림 허용하기</button>
          <button onClick={()=>{localStorage.setItem('pushDismissed','1');setShowPushModal(false);}} style={{width:"100%",height:44,borderRadius:14,border:"none",background:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>나중에</button>
        </div>
      </div>)}

      {/* 앱 메뉴 바텀 시트 */}
      {showAppMenu&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShowAppMenu(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",boxSizing:"border-box",paddingBottom:"calc(16px + env(safe-area-inset-bottom,0px))"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,borderRadius:2,background:"#e0e0e0",margin:"14px auto 18px"}}/>
            {!currentUser&&<>
              <div onClick={()=>{setShowAppMenu(false);setAuthStep("login");setAuthError("");go("auth");}} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",cursor:"pointer"}}>
                <div style={{width:34,height:34,borderRadius:10,background:"#fff3e0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className="ti ti-login" style={{fontSize:18,color:"#e65100"}}/>
                </div>
                <span style={{fontSize:14,color:"#1a1a1a",fontWeight:500}}>로그인 / 회원가입</span>
                <i className="ti ti-chevron-right" style={{fontSize:15,color:"#ccc",marginLeft:"auto"}}/>
              </div>
              <div style={{height:"0.5px",background:DIVIDER,margin:"4px 0"}}/>
            </>}
            {[
              {icon:"ti-info-circle",  label:"공쓰재 소개",      action:()=>{go("appinfo");setShowAppMenu(false);}},
              {icon:"ti-book",         label:"이용 안내",         action:()=>{go("guide");setShowAppMenu(false);}},
              {icon:"ti-speakerphone", label:"공지사항",          action:()=>{go("notice");setShowAppMenu(false);}},
              {icon:"ti-mail",         label:"문의하기",          action:()=>{go("contact");setShowAppMenu(false);}},
              {divider:true},
              {icon:"ti-file-text",   label:"이용약관",          action:()=>{go("terms");setShowAppMenu(false);}},
              {icon:"ti-shield",       label:"개인정보처리방침",  action:()=>{go("privacy");setShowAppMenu(false);}},
              {divider:true},
              {icon:"ti-brand-facebook",  label:"페이스북",      action:()=>{window.open("https://www.facebook.com/twr.or.kr","_blank");setShowAppMenu(false);}},
              {icon:"ti-brand-instagram", label:"인스타그램",     action:()=>{window.open("https://www.instagram.com/twr.or.kr","_blank");setShowAppMenu(false);}},
            ].map((item,i)=>
              item.divider
                ?<div key={i} style={{height:"0.5px",background:DIVIDER,margin:"4px 0"}}/>
                :<div key={i} onClick={item.disabled?undefined:item.action}
                   style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",cursor:item.disabled?"default":"pointer",opacity:item.disabled?0.35:1}}>
                    <div style={{width:34,height:34,borderRadius:10,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${item.icon}`} style={{fontSize:18,color:ACCENT}}/>
                    </div>
                    <span style={{fontSize:14,color:"#1a1a1a"}}>{item.label}</span>
                    {!item.disabled&&<i className="ti ti-chevron-right" style={{fontSize:15,color:"#ccc",marginLeft:"auto"}}/>}
                 </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      {screen!=="admin"&&(<div style={{position:"absolute",bottom:0,left:0,right:0,background:"#fff",borderTop:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",zIndex:50,paddingBottom:"env(safe-area-inset-bottom, 0px)",height:"calc(64px + env(safe-area-inset-bottom, 0px))"}}>
        <button style={tb("home")} onClick={goHome}><i className="ti ti-home" style={tic("home")}/>홈</button>
        <button style={tb("post")} onClick={()=>{if(!requireLogin("글을 올리려면 로그인이 필요해요"))return;setEditItem(null);setEditJob(null);setForm(emptyForm);setJform({...emptyJform,org:userProfile?.affiliation||""});setPostMode(mainTab==="jobs"?"job":"item");go("post","post");}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-24}}><i className="ti ti-plus" style={{fontSize:22,color:"#fff"}}/></div>
          <span style={{marginTop:2}}>올리기</span>
        </button>
        <button style={tb("chatlist")} onClick={()=>{if(!requireLogin("채팅을 보려면 로그인이 필요해요"))return;go("chatlist","chatlist");}}>
          <div style={{position:"relative",display:"inline-flex"}}>
            <i className="ti ti-message-circle" style={tic("chatlist")}/>
            {unreadMsgCount>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#e25",color:"#fff",borderRadius:10,fontSize:9,padding:"0 4px",lineHeight:"16px",minWidth:14,textAlign:"center",fontWeight:600}}>{unreadMsgCount}</span>}
          </div>
          채팅
        </button>
        <button style={tb("mypage")} onClick={()=>go("mypage","mypage")}><i className="ti ti-user" style={tic("mypage")}/>MY</button>
      </div>)}

      {/* 전체화면 지도 */}
      {fullscreenMapData&&(
        <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",background:"#000"}}>
          <div style={{flexShrink:0,background:BG,padding:"14px 16px",paddingTop:"calc(14px + env(safe-area-inset-top,0px))",display:"flex",alignItems:"center",gap:10,borderBottom:`0.5px solid ${DIVIDER}`}}>
            <button onClick={()=>setFullscreenMapData(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",flexShrink:0}}><i className="ti ti-arrow-left"/></button>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fullscreenMapData.place}</div>
              <div style={{fontSize:11,color:"#aaa",marginTop:1}}>거래 희망 장소</div>
            </div>
          </div>
          <div style={{flex:1,position:"relative"}}>
            <div id="kakaoMapFullscreen" style={{position:"absolute",inset:0}}/>
          </div>
          <div style={{flexShrink:0,background:"#fff",padding:"12px 16px",paddingBottom:"calc(12px + env(safe-area-inset-bottom,0px))",borderTop:`0.5px solid ${DIVIDER}`}}>
            <button onClick={()=>{navigator.clipboard.writeText(fullscreenMapData.place).catch(()=>{const t=document.createElement("textarea");t.value=fullscreenMapData.place;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);});setAddrToast(true);setTimeout(()=>setAddrToast(false),2200);}} style={{width:"100%",height:48,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><i className="ti ti-copy" style={{fontSize:17}}/>주소 복사</button>
            {addrToast&&<div style={{textAlign:"center",fontSize:12,color:ACCENT,marginTop:8,fontWeight:500}}>주소가 복사됐어요</div>}
          </div>
        </div>
      )}

      {/* 지도 위치 선택 모달 */}
      {showMapPicker&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",flexDirection:"column"}}>
          <div style={{background:"#fff",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div><div style={{fontSize:15,fontWeight:600}}>위치 선택</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>지도를 클릭하면 핀이 꽂혀요</div></div>
            <button onClick={()=>setShowMapPicker(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}>✕</button>
          </div>
          <div style={{flex:1,position:"relative"}}>
            <MapPicker loaded={mapPickerLoaded} onSelect={(lat,lng,address)=>{setForm(p=>({...p,tradePlace:address,tradeLat:lat,tradeLng:lng}));setShowMapPicker(false);}}/>
          </div>
        </div>
      )}


      {/* 사진 크롭 모달 */}
      {cropSrc&&(<div style={{position:"absolute",inset:0,background:"#000",zIndex:300,display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,position:"relative"}}>
          <Cropper image={cropSrc} crop={cropPos} zoom={cropZoom} rotation={cropRotation} aspect={4/3} onCropChange={setCropPos} onZoomChange={setCropZoom} onCropComplete={onCropComplete} style={{containerStyle:{borderRadius:0}}}/>
        </div>
        <div style={{padding:"10px 16px 4px",background:"#111",display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setCropRotation(r=>(r-90+360)%360)} style={{width:40,height:40,borderRadius:10,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-rotate-clockwise-2" style={{transform:"scaleX(-1)"}}/></button>
          <input type="range" min={1} max={3} step={0.01} value={cropZoom} onChange={e=>setCropZoom(Number(e.target.value))} style={{flex:1,accentColor:ACCENT}}/>
          <button onClick={()=>setCropRotation(r=>(r+90)%360)} style={{width:40,height:40,borderRadius:10,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-rotate-clockwise-2"/></button>
        </div>
        <div style={{display:"flex",gap:8,padding:"8px 16px",paddingBottom:"calc(16px + env(safe-area-inset-bottom,0px))",background:"#111"}}>
          <button onClick={handleCropCancel} style={{flex:1,height:48,borderRadius:12,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:15,cursor:"pointer"}}>취소</button>
          <button onClick={handleCropConfirm} style={{flex:2,height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>확인 {cropQueue.length>1?`(${cropQueue.length}장 남음)`:""}</button>
        </div>
      </div>)}

      {/* 신고 모달 */}
      {reportModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setReportModal(null)}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>🚩 신고하기</div>
        <div style={{fontSize:13,color:"#888",marginBottom:16}}>"{reportModal.title}"</div>
        {[["스팸/광고","스팸 또는 광고성 게시글"],["부적절한 내용","혐오·음란·폭력 등"],["사기 의심","허위 정보 또는 사기 의심"],["기타","직접 입력"]].map(([r,desc])=>(<button key={r} onClick={()=>setReportReason(r)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 14px",marginBottom:6,border:`1.5px solid ${reportReason===r?ACCENT:"#e0e0e0"}`,borderRadius:12,background:reportReason===r?"#f0f4ff":"#fff",cursor:"pointer",textAlign:"left"}}><div><div style={{fontSize:13,fontWeight:500,color:reportReason===r?ACCENT:"#333"}}>{r}</div><div style={{fontSize:11,color:"#aaa",marginTop:1}}>{desc}</div></div>{reportReason===r&&<i className="ti ti-check" style={{color:ACCENT,fontSize:16}}/>}</button>))}
        {reportReason==="기타"&&<textarea value={reportDetail} onChange={e=>setReportDetail(e.target.value)} placeholder="신고 사유를 입력해주세요" rows={3} style={{width:"100%",borderRadius:10,border:"0.5px solid #e0e0e0",padding:"10px 12px",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",marginTop:4,fontFamily:"inherit"}}/>}
        <button onClick={()=>submitReport(reportModal.targetType,reportModal.targetId,reportReason,reportDetail)} disabled={!reportReason} style={{width:"100%",marginTop:14,height:50,borderRadius:14,border:"none",background:reportReason?ACCENT:"#e0e0e0",color:"#fff",fontSize:15,fontWeight:600,cursor:reportReason?"pointer":"default"}}>신고 접수</button>
        <button onClick={()=>setReportModal(null)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",padding:"6px 0"}}>취소</button>
      </div></div>)}

      {/* 회원 탈퇴 — 1단계 */}
      {withdrawModal==="confirm1"&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setWithdrawModal(null)}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:17,fontWeight:700,color:"#1a1a1a",marginBottom:14}}>회원 탈퇴</div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.9,marginBottom:22}}>
          탈퇴하면 <strong>되돌릴 수 없습니다.</strong><br/>
          · 개인정보(이름·연락처 등)는 즉시 삭제됩니다<br/>
          · 게시글은 "탈퇴한 회원"으로 익명 처리됩니다<br/>
          · 채팅 내역은 상대방 보호를 위해 보존됩니다
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setWithdrawModal(null)} style={{flex:1,height:50,borderRadius:12,border:"1px solid #e0e0e0",background:"#fff",color:"#555",fontSize:14,cursor:"pointer"}}>취소</button>
          <button onClick={()=>{setWithdrawInput("");setWithdrawModal("confirm2");}} style={{flex:1,height:50,borderRadius:12,border:"none",background:"#e53935",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>계속</button>
        </div>
      </div></div>)}

      {/* 회원 탈퇴 — 2단계 */}
      {withdrawModal==="confirm2"&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",boxSizing:"border-box"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#1a1a1a",marginBottom:8}}>정말 탈퇴하시겠어요?</div>
        <div style={{fontSize:13,color:"#888",marginBottom:16}}>계속하려면 아래에 <strong style={{color:"#1a1a1a"}}>탈퇴</strong>를 입력하세요</div>
        <input value={withdrawInput} onChange={e=>setWithdrawInput(e.target.value)} placeholder="탈퇴" autoFocus style={{width:"100%",height:46,borderRadius:10,border:`1.5px solid ${withdrawInput==="탈퇴"?"#e53935":"#e0e0e0"}`,padding:"0 14px",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:16,fontFamily:"inherit"}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setWithdrawModal(null)} disabled={withdrawing} style={{flex:1,height:50,borderRadius:12,border:"1px solid #e0e0e0",background:"#fff",color:"#555",fontSize:14,cursor:"pointer"}}>취소</button>
          <button onClick={deleteCurrentUser} disabled={withdrawInput!=="탈퇴"||withdrawing} style={{flex:1,height:50,borderRadius:12,border:"none",background:withdrawInput==="탈퇴"&&!withdrawing?"#e53935":"#f5c6c6",color:"#fff",fontSize:14,fontWeight:600,cursor:withdrawInput==="탈퇴"&&!withdrawing?"pointer":"default"}}>
            {withdrawing?"처리 중...":"탈퇴하기"}
          </button>
        </div>
      </div></div>)}

      {/* 거래 후기 */}
      {reviewModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:200}}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",width:"100%",boxSizing:"border-box"}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>거래 후기 — 앙코르</div><div style={{fontSize:13,color:"#888",marginBottom:4}}>"{reviewModal.title}" 거래가 어떠셨나요?</div><div style={{fontSize:11,color:"#bbb",marginBottom:20}}>후기는 👏 앙코르 카운트에 반영됩니다</div><div style={{display:"flex",gap:12}}><button onClick={()=>submitReview(true)} style={{flex:1,height:52,borderRadius:14,border:"none",background:LIGHT,color:ACCENT,fontSize:15,fontWeight:600,cursor:"pointer"}}>👍 좋았어요<br/><span style={{fontSize:11,fontWeight:400}}>+1회</span></button><button onClick={()=>submitReview(false)} style={{flex:1,height:52,borderRadius:14,border:"none",background:"#fff0f2",color:"#c62828",fontSize:15,fontWeight:600,cursor:"pointer"}}>👎 별로였어요<br/><span style={{fontSize:11,fontWeight:400}}>-1회</span></button></div><button onClick={()=>setReviewModal(null)} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",padding:"8px 0"}}>건너뛰기</button></div></div>)}

      {/* 끌어올리기 토스트 */}
      {boostToast&&<div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.8)",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:500,zIndex:300,whiteSpace:"nowrap"}}>⬆ 끌어올리기 완료!</div>}
    </div>
  );
}
