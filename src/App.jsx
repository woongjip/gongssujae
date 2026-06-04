import { useState, useMemo, useRef, useEffect, Fragment, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  db, auth, storage, storageRef, uploadBytes, getDownloadURL,
  registerFCMToken, unregisterFCMToken, requestAndRegisterFCM,
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where, increment, arrayUnion, arrayRemove,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, sendPasswordResetEmail, sendEmailVerification,
  deleteField
} from "./firebase";

const ACCENT="#228BB5",LIGHT="#E3F3F9",MID="#3DA1B2",ADMIN_C="#1a237e";
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
const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const shellStyle=isMobile
  ?{width:"100%",height:"100dvh",fontFamily:"sans-serif",background:BG,position:"relative",overflow:"hidden"}
  :isStandalone
    ?{width:"100%",maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",overflow:"hidden",background:BG,height:"100vh",position:"relative"}
    :{width:"100%",maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:`1px solid ${DIVIDER}`,borderRadius:24,overflow:"hidden",background:BG,height:700,position:"relative"};
const emptyForm={title:"",category:[],itemName:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:"",tradeLat:null,tradeLng:null,photos:[],status:"selling",postType:"nanumi",showTag:"",showEndDate:"",listingMode:"nanumi"};
const emptyJform={title:"",org:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:"",jobType:"guin",jobStatus:"active"};

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

export default function App(){
  // Firebase Auth
  const [currentUser,setCurrentUser]=useState(null);
  const [userProfile,setUserProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [authStep,setAuthStep]=useState(localStorage.getItem("welcomed")?"splash":"welcome");
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
  const [postMode,setPostMode]=useState("item");
  const [posted,setPosted]=useState(false);
  const [formError,setFormError]=useState("");
  const [fullscreenMapData,setFullscreenMapData]=useState(null);
  const [addrToast,setAddrToast]=useState(false);
  const [showPWABanner,setShowPWABanner]=useState(false);
  const [showPWAModal,setShowPWAModal]=useState(false);
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [showPushModal,setShowPushModal]=useState(false);
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
  const hashNavRef=useRef(null);

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
            // phone은 userPrivate에서 로드 (또는 users 문서에서 마이그레이션)
            try{
              const privSnap=await getDoc(doc(db,"userPrivate",user.uid));
              if(privSnap.exists()){
                userData.phone=privSnap.data().phone||"";
              }else if(userData.phone){
                // 기존 계정 마이그레이션: users → userPrivate
                await setDoc(doc(db,"userPrivate",user.uid),{phone:userData.phone});
                await updateDoc(doc(db,"users",user.uid),{phone:deleteField()});
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

  // ── Firestore items ──
  useEffect(()=>{
    if(!currentUser||!userProfile)return;
    const unsub=onSnapshot(query(collection(db,"items"),orderBy("createdAt","desc")),snap=>{
      setItems(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[currentUser,userProfile]);

  // ── Firestore jobs ──
  useEffect(()=>{
    if(!currentUser||!userProfile)return;
    const unsub=onSnapshot(query(collection(db,"jobs"),orderBy("createdAt","desc")),snap=>{
      setJobs(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[currentUser,userProfile]);

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
    try{await signInWithEmailAndPassword(auth,email,password);}
    catch(e){setAuthError("이메일 또는 비밀번호를 확인해주세요");}
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
      const{phone,...publicProf}=regProf;
      const profileData={...publicProf,email,temp:36.5,isAdmin:false,status:"active",createdAt:serverTimestamp()};
      setUserProfile({...profileData,phone}); // optimistic
      await setDoc(doc(db,"users",cred.user.uid),profileData);
      await setDoc(doc(db,"userPrivate",cred.user.uid),{phone});
      try{await sendEmailVerification(cred.user);}catch(e){console.log("email verif:",e);}
      if(typeof Notification!=="undefined"&&Notification.permission==="default"&&!localStorage.getItem('pushDismissed')){
        setShowPushModal(true);
      }
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

  function goDetail(item){scrollPos.current=listRef.current?.scrollTop||0;setSelItem(item);go("detail");window.location.hash=`#/item/${item.id}`;}

  async function handleHashNav(hash){
    const p=parseHash(hash);if(!p)return;
    const showNotFound=()=>{window.location.hash="";setNotFoundToast(true);setTimeout(()=>setNotFoundToast(false),2500);go("home");};
    if(p.type==="item"){
      let item=items.find(i=>i.id===p.id);
      if(!item){try{const s=await getDoc(doc(db,"items",p.id));if(s.exists())item={id:s.id,...s.data()};}catch(e){}}
      if(!item||item.hidden===true){showNotFound();return;}
      setSelItem(item);go("detail");
    }else if(p.type==="job"){
      let job=jobs.find(j=>j.id===p.id);
      if(!job){try{const s=await getDoc(doc(db,"jobs",p.id));if(s.exists())job={id:s.id,...s.data()};}catch(e){}}
      if(!job||job.hidden===true){showNotFound();return;}
      setSelJob(job);go("jobdetail");
    }
  }
  // hashNavRef는 매 렌더마다 최신 클로저(items/jobs 포함)를 유지
  hashNavRef.current=handleHashNav;
  // screenRef도 항상 최신 screen 유지
  screenRef.current=screen;

  async function openChat(itemId,itemTitle,sellerId){
    if(!currentUser)return;
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

  async function toggleLike(itemId,e){
    e?.stopPropagation();
    if(!currentUser)return;
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
  async function uploadPhotosToStorage(photos,docId){
    if(!photos?.length)return[];
    return Promise.all(photos.map(async(photo,i)=>{
      if(photo.startsWith("https://"))return photo;
      const blob=await(await fetch(photo)).blob();
      const sRef=storageRef(storage,`items/${docId}/${i}_${Date.now()}.jpg`);
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
    const {listingMode,...formData}=form;
    const data={...formData,postType:derivedPostType,price:derivedPrice,showTag:formData.showTag?.trim()||"",seller:userProfile?.affiliation||userProfile?.name||"익명",sellerId:currentUser.uid,si:(userProfile?.name||userProfile?.affiliation||"나")[0],likedBy:editItem?.likedBy||[]};
    if(editItem){
      const photos=await uploadPhotosToStorage(data.photos,editItem.id);
      const updated={...data,photos};
      await updateDoc(doc(db,"items",editItem.id),{...updated,createdAt:editItem.createdAt});
      setSelItem({...updated,id:editItem.id});
    }else{
      const newRef=doc(collection(db,"items"));
      const photos=await uploadPhotosToStorage(data.photos,newRef.id);
      await setDoc(newRef,{...data,photos,createdAt:serverTimestamp()});
    }
    setEditItem(null);setForm(emptyForm);setPosted(true);
    setTimeout(()=>{setPosted(false);go(editItem?"detail":"home",editItem?undefined:"home");},1200);
  }

  function startEdit(item){
    const listingMode=item.postType==="guhami"?"guhami":(item.price>0?"sale":"nanumi");
    setForm({title:item.title,category:item.category||[],itemName:item.itemName||"",price:item.price?.toString()||"",desc:item.desc||"",region:item.region||"",contact:item.contact||"",safeNum:item.safeNum||false,tradePlace:item.tradePlace||"",tradeLat:item.tradeLat||null,tradeLng:item.tradeLng||null,photos:item.photos||[],status:item.status||"selling",postType:item.postType||"nanumi",showTag:item.showTag||"",showEndDate:item.showEndDate||"",listingMode});
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
    const data={...jform,org:jform.org||userProfile?.affiliation||userProfile?.name||"나",icon:editJob?.icon||"📋",sellerId:currentUser.uid};
    if(editJob){await updateDoc(doc(db,"jobs",editJob.id),{...data,createdAt:editJob.createdAt});setSelJob({...data,id:editJob.id});}
    else{await addDoc(collection(db,"jobs"),{...data,createdAt:serverTimestamp()});}
    setEditJob(null);setJform(emptyJform);setPosted(true);
    setTimeout(()=>{setPosted(false);if(wasEditing){go("jobdetail");}else{setMainTab("jobs");goHome();}},1200);
  }

  function startEditJob(job){setJform({title:job.title,org:job.org||"",field:job.field,type:job.type,pay:job.pay,date:job.date,desc:job.desc,location:job.location,jobType:job.jobType||"guin",jobStatus:job.jobStatus||"active"});setEditJob(job);setPostMode("job");go("post","post");}
  async function changeJobStatus(id,s){await updateDoc(doc(db,"jobs",id),{jobStatus:s});setSelJob(p=>p?{...p,jobStatus:s}:p);}
  async function toggleCat(c){setForm(p=>({...p,category:p.category.includes(c)?p.category.filter(x=>x!==c):[...p.category,c]}));}
  function handlePhotos(e){
    const files=Array.from(e.target.files);
    if(!files.length)return;
    e.target.value="";
    const readers=files.map(f=>new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.readAsDataURL(f);}));
    Promise.all(readers).then(srcs=>{
      setCropQueue(srcs);
      setCropSrc(srcs[0]);
      setCropZoom(1);setCropPos({x:0,y:0});setCropRotation(0);
    });
  }
  async function handleCropConfirm(){
    try{
      const dataUrl=await getCroppedImg(cropSrc,cropPx,cropRotation);
      setForm(p=>({...p,photos:[...p.photos,dataUrl]}));
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
  async function deleteItem(id){await deleteDoc(doc(db,"items",id));}
  async function deleteJob(id){await deleteDoc(doc(db,"jobs",id));}
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
    const{phone,...publicUpdates}=updates;
    if(Object.keys(publicUpdates).length>0)await updateDoc(doc(db,"users",currentUser.uid),publicUpdates);
    if(phone!==undefined)await setDoc(doc(db,"userPrivate",currentUser.uid),{phone},{merge:true});
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
    return chatRooms.reduce((sum,r)=>{
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
  // 초기 URL hash 처리: currentUser 확인 후 1회 실행 (getDoc 폴백으로 데이터 로드 전에도 동작)
  useEffect(()=>{
    if(initialHashDone.current)return;
    if(!currentUser)return;
    initialHashDone.current=true;
    const hash=window.location.hash;
    if(hash)hashNavRef.current(hash);
  },[currentUser]);

  // hashchange: 브라우저 뒤로가기 or 앞으로가기
  useEffect(()=>{
    const onHashChange=()=>{
      const hash=window.location.hash;
      const parsed=parseHash(hash);
      if(!parsed){
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
  const [notFoundToast,setNotFoundToast]=useState(false);
  const [moreMenu,setMoreMenu]=useState(null); // "item"|"job"|null
  const sharePost=(title,text,shareUrl)=>{const url=shareUrl||"https://twr.or.kr";if(navigator.share){navigator.share({title,text,url}).catch(()=>{});}else{navigator.clipboard?.writeText(url).then(()=>{setShareToast(true);setTimeout(()=>setShareToast(false),2000);});}};
  const shareKakao=(type,post)=>{
    if(!window.Kakao?.Share)return;
    const url=`https://twr.or.kr/#/${type}/${post.id}`;
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

    if(authStep==="welcome"){
      const doStart=()=>{localStorage.setItem("welcomed","1");setAuthStep("register");setAuthError("");};
      const doLogin=()=>{localStorage.setItem("welcomed","1");setAuthStep("login");setAuthError("");};
      return(
        <div className="app-shell" style={{...shellStyle,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"0 32px",boxSizing:"border-box",background:BG}}>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",gap:0}}>
            <img src="/gongssujae_logo_full.png" alt="공쓰재" style={{width:"100%",maxWidth:200,marginBottom:40}}/>
            <div style={{fontSize:19,fontWeight:700,color:"#1a1a1a",textAlign:"center",lineHeight:1.55,marginBottom:10,letterSpacing:"-0.3px"}}>
              공연 쓰고 남은 거, 재활용
            </div>
            <div style={{fontSize:14,color:"#777",textAlign:"center",lineHeight:1.8,letterSpacing:"-0.1px"}}>
              나누고, 이어주고, 다음 무대로
            </div>
          </div>
          <div style={{width:"100%",paddingBottom:"max(40px,env(safe-area-inset-bottom,40px))"}}>
            <button onClick={doStart} style={{width:"100%",height:54,borderRadius:16,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",marginBottom:12,boxShadow:`0 4px 20px ${ACCENT}55`}}>시작하기</button>
            <button onClick={doLogin} style={{width:"100%",height:44,borderRadius:16,border:"none",background:"transparent",color:"#999",fontSize:13,cursor:"pointer",fontWeight:400}}>이미 계정이 있어요</button>
          </div>
        </div>
      );
    }

    if(authStep==="splash")return(
      <div className="app-shell" style={{...shellStyle,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,boxSizing:"border-box"}}>
        <img src="/gongssujae_logo_full.png" alt="공쓰재" style={{width:"100%",maxWidth:260,marginBottom:32}}/>
        <div style={{fontSize:13,color:"#999",textAlign:"center",lineHeight:1.7,marginBottom:48}}>공연에 쓰고 남은 물건과 일자리를<br/>나누는 공연인들의 플랫폼</div>
        <button onClick={()=>{setAuthStep("register");setAuthError("");}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:12}}>시작하기</button>
        <button onClick={()=>{setAuthStep("login");setAuthError("");}} style={{width:"100%",height:50,borderRadius:14,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:15,fontWeight:500,cursor:"pointer"}}>이미 계정이 있어요</button>
      </div>
    );

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

    return null;
  }

  // ── Main App ──
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
            </div>
          </div>
          {showSearch&&<div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:12,padding:"9px 12px",marginBottom:10,gap:8}}>
            <i className="ti ti-search" style={{fontSize:16,color:"#aaa"}}/>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="물건, 지역, 공연명 검색" style={{flex:1,border:"none",background:"none",fontSize:13,outline:"none"}}/>
            {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:16,padding:0}}><i className="ti ti-x"/></button>}
          </div>}
          {showTagFilter&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",background:"#e8eaf6",borderRadius:10,marginBottom:10}}><span style={{fontSize:12,color:"#3949ab",fontWeight:500}}>🎭 {showTagFilter} 필터 중</span><button onClick={()=>setShowTagFilter("")} style={{background:"none",border:"none",cursor:"pointer",color:"#3949ab",fontSize:14}}>✕</button></div>}
          <div style={{display:"flex"}}>{[["items","물건",TAB_ITEM],["jobs","일자리",TAB_JOB],["spaces","공간",TAB_SPACE]].map(([t,l,c])=>(<button key={t} onClick={()=>{setMainTab(t);setQ("");setShowSearch(false);setCat("전체");setFld("전체");setTypeFilter("전체");}} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:mainTab===t?600:400,color:mainTab===t?c:"#bbb",borderBottom:mainTab===t?`2px solid ${c}`:"2px solid transparent"}}>{l}</button>))}</div>
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
          {items.length===0&&mainTab==="items"&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>아직 등록된 물건이 없어요<br/><span style={{fontSize:12}}>첫 번째 물건을 올려보세요!</span></div>}
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
          {mainTab==="jobs"&&filtJobs.map(job=>{const fs=jfs(job.field);const isGujik=job.jobType==="gujik";return(<div key={job.id} onClick={()=>{setSelJob(job);go("jobdetail");window.location.hash=`#/job/${job.id}`;}} style={{padding:"14px 16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",opacity:job.jobStatus==="done"?0.55:1,background:BG}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:96,height:96,borderRadius:16,background:fs.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,flexShrink:0}}>
                <i className={`ti ${fs.icon}`} style={{fontSize:26,color:"#fff"}}/>
                <span style={{fontSize:11,color:"#fff",fontWeight:600,letterSpacing:0.3}}>{job.field}</span>
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
              {window.Kakao?.Share&&<button onClick={()=>shareKakao("item",selItem)} style={{background:"#FEE500",border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#3C1E1E",letterSpacing:-0.3}}>카톡</button>}
              <button onClick={()=>sharePost(selItem.title,`${hasShowTag(selItem.showTag)?selItem.showTag+"에서 나온 ":""}${selItem.title} — 공쓰재에서 확인해보세요`,`https://twr.or.kr/#/item/${selItem.id}`)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-share"/></button>
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
            {!isOwner&&<button onClick={()=>openChat(selItem.id,selItem.title,selItem.sellerId)} style={{flex:1,height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
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
              {window.Kakao?.Share&&<button onClick={()=>shareKakao("job",selJob)} style={{background:"#FEE500",border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#3C1E1E",letterSpacing:-0.3}}>카톡</button>}
              <button onClick={()=>sharePost(selJob.title,`${selJob.field} ${selJob.jobType==="gujik"?"구직":"구인"} — ${selJob.title} | 공쓰재`,`https://twr.or.kr/#/job/${selJob.id}`)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"4px 6px"}}><i className="ti ti-share"/></button>
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
            {!isOwner
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
      {screen==="chatlist"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG}}><div style={{padding:"20px 16px 14px",borderBottom:`0.5px solid ${DIVIDER}`,flexShrink:0,background:"#fff"}}><div style={{fontSize:18,fontWeight:500}}>채팅</div></div><div style={{flex:1,minHeight:0,overflowY:"auto",paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))"}}>{chatRooms.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>채팅이 없습니다<br/><span style={{fontSize:12}}>물건 상세에서 채팅을 시작하세요</span></div>}{chatRooms.map(room=>{const linked=items.find(i=>i.id===room.itemId)||jobs.find(j=>j.id===room.itemId);const thumb=linked?.photos?.[0];const price=linked?.price!=null?(linked.price===0?(linked.postType==="guhami"?"가격 협의":"무료 나눔"):`${linked.price.toLocaleString()}원`):null;const uid=currentUser?.uid;const myLastRead=uid?room?.lastRead?.[uid]:null;const isUnread=room.lastMessage&&(myLastRead?(room.updatedAt?.seconds||0)>(myLastRead?.seconds||0):(room.updatedAt?.seconds||0)*1000>parseInt(localStorage.getItem(`chatRead_${room.id}`)||"0"));return(<div key={room.id} onClick={()=>{setActiveChat(room.id);setChatLabel(room.itemTitle||"채팅");go("chat","chatlist");}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",alignItems:"center",background:isUnread?"#EBF5FB":"#fff"}}><div style={{position:"relative",flexShrink:0}}><div style={{width:52,height:52,borderRadius:12,background:LIGHT,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{thumb?<img src={thumb} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(linked?.icon||"💬")}</div>{isUnread&&<div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:"50%",background:"#e25",border:"2px solid #fff"}}/>}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:isUnread?600:500,marginBottom:1}}>{room.itemTitle||"채팅"}</div>{price&&<div style={{fontSize:11,color:ACCENT,fontWeight:500,marginBottom:2}}>{price}</div>}</div><div style={{fontSize:11,color:"#bbb",flexShrink:0,marginLeft:6}}>{room.updatedAt?.toDate?.()?.toLocaleDateString("ko-KR",{month:"numeric",day:"numeric"})||""}</div></div><div style={{fontSize:12,color:isUnread?"#333":"#999",fontWeight:isUnread?500:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{room.lastMessage||"새 채팅"}</div></div></div>);})}</div></div>)}

      {/* 채팅 */}
      {screen==="chat"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,paddingBottom:"calc(64px + env(safe-area-inset-bottom, 0px))",boxSizing:"border-box",background:BG}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={()=>go("chatlist","chatlist")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{chatLabel}</div><div style={{fontSize:11,color:"#aaa"}}>채팅</div></div></div>{activeChatLinked&&<div onClick={()=>{if(items.find(i=>i.id===activeChatLinked.id))goDetail(activeChatLinked);else{setSelJob(activeChatLinked);go("jobdetail","chat");window.location.hash=`#/job/${activeChatLinked.id}`;}}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"0.5px solid #f0f0f0",background:"#fafafa",cursor:"pointer",flexShrink:0}}>{activeChatLinked.photos?.[0]?<img src={activeChatLinked.photos[0]} style={{width:40,height:40,borderRadius:8,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:40,height:40,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{activeChatLinked.icon||"📦"}</div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeChatLinked.title}</div>{activeChatLinked.price!=null&&<div style={{fontSize:11,color:ACCENT,fontWeight:500,marginTop:1}}>{activeChatLinked.price===0?(activeChatLinked.postType==="guhami"?"가격 협의":"무료 나눔"):`${activeChatLinked.price.toLocaleString()}원`}</div>}</div><i className="ti ti-chevron-right" style={{fontSize:14,color:"#ccc",flexShrink:0}}/></div>}<div style={{flex:1,minHeight:0,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>{messages.map((msg,i)=>{const isMe=msg.from==="me";const prev=messages[i-1];const next=messages[i+1];const d=msg.createdAt?.toDate?.();const pd=prev?.createdAt?.toDate?.();const nd=next?.createdAt?.toDate?.();const showDate=d&&(!pd||d.toDateString()!==pd.toDateString());const sameMinNext=nd&&d&&nd.getFullYear()===d.getFullYear()&&nd.getMonth()===d.getMonth()&&nd.getDate()===d.getDate()&&nd.getHours()===d.getHours()&&nd.getMinutes()===d.getMinutes()&&next.from===msg.from;const showTime=d&&!sameMinNext;return(<Fragment key={msg.id||i}>{showDate&&<div style={{textAlign:"center",margin:"8px 0"}}><span style={{fontSize:11,color:"#aaa",background:"#f0f0f0",borderRadius:10,padding:"3px 12px"}}>{fmtDateLabel(msg.createdAt)}</span></div>}<div style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}><div style={{maxWidth:"75%"}}>{!isMe&&<div style={{fontSize:10,color:"#aaa",marginBottom:2}}>{msg.fromName}</div>}<div style={{display:"flex",alignItems:"flex-end",gap:4,flexDirection:isMe?"row-reverse":"row"}}><div style={{padding:"10px 14px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isMe?ACCENT:"#f3f3f3",color:isMe?"#fff":"#1a1a1a",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{msg.text}</div>{showTime&&<div style={{fontSize:10,color:"#aaa",flexShrink:0,marginBottom:2}}>{fmtMsgTime(msg.createdAt)}</div>}</div></div></div></Fragment>);})}{messages.length===0&&<div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:40}}>메시지를 보내보세요</div>}<div ref={chatEnd}/></div><div style={{flexShrink:0,padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,alignItems:"center",background:"#fff"}}><textarea value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(isMobile)return;if(e.shiftKey)return;e.preventDefault();sendMsg();}}} placeholder="메시지를 입력하세요" rows={1} style={{flex:1,borderRadius:22,border:"1px solid #e0e0e0",padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa",resize:"none",overflow:"hidden",lineHeight:1.5,fontFamily:"inherit"}}/><button onClick={sendMsg} style={{width:44,height:44,borderRadius:"50%",border:"none",background:chatMsg.trim()?ACCENT:"#ddd",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-send"/></button></div></div>)}

      {/* 알림 */}
      {screen==="notify"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><span style={{fontWeight:500,fontSize:15}}>알림 설정</span></div><div style={{flex:1,minHeight:0,overflowY:"auto",padding:16,paddingBottom:"calc(80px + env(safe-area-inset-bottom, 0px))"}}>{(()=>{const perm=typeof Notification!=="undefined"?Notification.permission:"default";return perm==="granted"?(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#e8f5e9",borderRadius:12,marginBottom:14}}><span style={{fontSize:16}}>🔔</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#2e7d32"}}>알림이 켜져 있어요</div><div style={{fontSize:11,color:"#4caf50",marginTop:1}}>채팅 메시지 알림을 받을 수 있어요</div></div></div>):perm==="denied"?(<div style={{padding:"12px 14px",background:"#fff3e0",borderRadius:12,marginBottom:14}}><div style={{fontSize:13,fontWeight:600,color:"#e65100",marginBottom:3}}>🔕 알림이 차단되어 있어요</div><div style={{fontSize:11,color:"#888",lineHeight:1.6}}>브라우저 설정 → 사이트 권한에서<br/>twr.or.kr 알림을 허용해주세요</div></div>):(<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:LIGHT,borderRadius:12,marginBottom:14}}><span style={{fontSize:16}}>🔔</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:ACCENT}}>채팅 알림 받기</div><div style={{fontSize:11,color:"#888",marginTop:1}}>메시지를 놓치지 않으려면 알림을 켜주세요</div></div><button onClick={async()=>{const ok=await requestAndRegisterFCM(currentUser?.uid);if(!ok&&Notification.permission==="denied")alert("브라우저 설정에서 알림을 허용해주세요");}} style={{padding:"6px 12px",borderRadius:8,border:"none",background:ACCENT,color:"#fff",fontSize:12,cursor:"pointer",fontWeight:500,flexShrink:0}}>켜기</button></div>);})()}
<div style={{fontSize:12,color:"#aaa",marginTop:8,lineHeight:1.6}}>채팅 알림 외 키워드·공고 알림은 추후 지원 예정이에요.</div></div></div>)}

      {/* 마이페이지 */}
      {screen==="mypage"&&(<div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,background:BG}}>
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
            {[["알림 설정","ti-bell"],["거래 내역","ti-repeat"]].map(([l,ic])=>(<div key={l} onClick={()=>{if(l==="알림 설정")go("notify","");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",background:"#fff"}}><div style={{display:"flex",alignItems:"center",gap:10}}><i className={`ti ${ic}`} style={{fontSize:18,color:"#555"}}/><span style={{fontSize:14}}>{l}</span></div><i className="ti ti-chevron-right" style={{fontSize:16,color:"#ccc"}}/></div>))}
            <div onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:10,padding:"16px",borderBottom:`0.5px solid ${DIVIDER}`,cursor:"pointer",background:"#fff"}}><i className="ti ti-logout" style={{fontSize:18,color:"#e25"}}/><span style={{fontSize:14,color:"#e25"}}>로그아웃</span></div>
            {isAdmin&&<div onClick={()=>go("admin")} style={{padding:"12px 16px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:12,color:ADMIN_C,fontWeight:500}}>🔐 관리자 패널</span></div>}
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
            {[...allUsers].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5).map(u=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:32,height:32,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||u.email}</div><div style={{fontSize:11,color:"#aaa"}}>{u.email}</div></div><span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:u.status==="suspended"?"#ffebee":"#e8f5e9",color:u.status==="suspended"?"#c62828":"#2e7d32",fontWeight:500}}>{u.status==="suspended"?"정지":"활성"}</span></div>))}
          </>)}
          {adminTab==="users"&&(<><input value={adminUserQ} onChange={e=>setAdminUserQ(e.target.value)} placeholder="이름 또는 소속 검색" style={{...inp,marginBottom:14}}/><div style={{fontSize:12,color:"#aaa",marginBottom:8}}>총 {filtAdminUsers.length}명</div>{filtAdminUsers.map(u=>(<div key={u.id} style={{padding:"12px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||"미입력"}<span style={{fontSize:10,color:"#aaa",marginLeft:6}}>{u.accountType}</span></div><div style={{fontSize:11,color:"#888"}}>{u.email}</div>{allUserPrivate[u.id]?.phone&&<div style={{fontSize:11,color:"#555",marginTop:1}}>📞 {allUserPrivate[u.id].phone}</div>}<div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:10,color:ACCENT,fontWeight:600}}>👏 앙코르 {u.encoreCount||0}회</span>{u.isAdmin&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:"#fff3e0",color:"#e65100",fontWeight:600}}>👑 어드민</span>}<span style={{fontSize:10,color:"#aaa"}}>{u.affiliation||"소속 미입력"}</span></div></div><div style={{display:"flex",gap:5,flexShrink:0}}>{u.id!==currentUser?.uid&&<button onClick={()=>toggleAdminRole(u.id)} style={{background:u.isAdmin?"#fff3e0":"#f5f5f5",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:u.isAdmin?"#e65100":"#666",cursor:"pointer",fontWeight:500}}>{u.isAdmin?"어드민 해제":"👑 지정"}</button>}{u.id!==currentUser?.uid&&<button onClick={()=>{const msg=u.status==="suspended"?"이 회원을 활성화하시겠어요?":"이 회원을 정지하시겠어요?";if(window.confirm(msg))toggleUserStatus(u.id);}} style={{background:u.status==="suspended"?"#e8f5e9":"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:u.status==="suspended"?"#2e7d32":"#c62828",cursor:"pointer",fontWeight:500}}>{u.status==="suspended"?"활성화":"정지"}</button>}</div></div></div>))}</>)}
          {adminTab==="posts"&&(<><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>중고 물건 ({items.length})</div>{items.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}} alt=""/>:<span>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{item.title}</div><div style={{fontSize:11,color:"#aaa"}}>{item.seller} · {item.region}</div></div><button onClick={()=>{if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteItem(item.id);}} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}<div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:16,marginBottom:10}}>일자리 공고 ({jobs.length})</div>{jobs.map(job=>(<div key={job.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{job.icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{job.title}</div><div style={{fontSize:11,color:"#aaa"}}>{job.org} · {job.location}</div></div><button onClick={()=>{if(window.confirm("정말 삭제하시겠어요?\n되돌릴 수 없어요."))deleteJob(job.id);}} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}</>)}
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

      {/* 공유 복사 토스트 */}
      {shareToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:ACCENT,color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>🔗 링크가 복사됐어요</div>}
      {notFoundToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:"#555",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>이 게시글은 더 이상 볼 수 없어요</div>}
      {reportToast&&<div style={{position:"absolute",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:"#333",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,zIndex:200,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>🚩 신고가 접수됐어요. 검토 후 조치할게요</div>}

      {/* PWA 설치 안내 모달 */}
      {showPWAModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShowPWAModal(false)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>📲 홈 화면에 추가하기</div>
          <div style={{fontSize:13,color:"#888",marginBottom:20}}>앱 설치 없이 앱처럼 사용할 수 있어요</div>
          {isIOS?(<>
            <div style={{padding:"14px",background:LIGHT,borderRadius:14,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:ACCENT,marginBottom:6}}>iPhone / iPad (사파리)</div>
              <div style={{fontSize:13,color:"#444",lineHeight:1.9}}>
                1. 하단 공유 버튼 <strong>□↑</strong> 탭<br/>
                2. <strong>'홈 화면에 추가'</strong> 선택<br/>
                3. 오른쪽 위 <strong>'추가'</strong> 탭
              </div>
            </div>
            <div style={{fontSize:11,color:"#aaa",textAlign:"center"}}>사파리 앱에서만 홈 화면 추가가 가능해요</div>
          </>):deferredPrompt?(<>
            <div style={{fontSize:13,color:"#555",marginBottom:16,lineHeight:1.6}}>아래 버튼을 누르면 홈 화면에 바로 추가돼요.</div>
            <button onClick={async()=>{deferredPrompt.prompt();const r=await deferredPrompt.userChoice;if(r.outcome==="accepted"){localStorage.setItem('pwaInstallDismissed','1');setShowPWABanner(false);}setDeferredPrompt(null);setShowPWAModal(false);}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer"}}>홈 화면에 추가하기</button>
          </>):(<>
            <div style={{padding:"14px",background:LIGHT,borderRadius:14,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:ACCENT,marginBottom:6}}>Android (크롬)</div>
              <div style={{fontSize:13,color:"#444",lineHeight:1.9}}>
                1. 오른쪽 위 <strong>⋮ 메뉴</strong> 탭<br/>
                2. <strong>'홈 화면에 추가'</strong> 선택<br/>
                3. <strong>'추가'</strong> 탭
              </div>
            </div>
          </>)}
          <button onClick={()=>{localStorage.setItem('pwaInstallDismissed','1');setShowPWABanner(false);setShowPWAModal(false);}} style={{width:"100%",marginTop:16,padding:"12px 0",borderRadius:14,border:"none",background:"#f5f5f5",color:"#999",fontSize:13,cursor:"pointer"}}>다시 보지 않기</button>
        </div>
      </div>)}

      {/* 푸시 알림 권한 요청 모달 */}
      {showPushModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setShowPushModal(false)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 36px",width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:18,textAlign:"center",marginBottom:8}}>🔔</div>
          <div style={{fontSize:16,fontWeight:700,textAlign:"center",marginBottom:6}}>채팅 알림 받기</div>
          <div style={{fontSize:13,color:"#888",textAlign:"center",lineHeight:1.7,marginBottom:24}}>채팅 메시지를 놓치지 않으려면<br/>알림을 허용해주세요</div>
          <button onClick={async()=>{const ok=await requestAndRegisterFCM(currentUser?.uid);localStorage.setItem('pushDismissed','1');setShowPushModal(false);if(!ok&&typeof Notification!=="undefined"&&Notification.permission==="denied"){alert("브라우저 설정에서 알림을 허용해주세요");}}} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:10}}>알림 허용하기</button>
          <button onClick={()=>{localStorage.setItem('pushDismissed','1');setShowPushModal(false);}} style={{width:"100%",height:44,borderRadius:14,border:"none",background:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>나중에</button>
        </div>
      </div>)}

      {/* 하단 네비게이션 */}
      {screen!=="admin"&&(<div style={{position:"absolute",bottom:0,left:0,right:0,background:"#fff",borderTop:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",zIndex:50,paddingBottom:"env(safe-area-inset-bottom, 0px)",height:"calc(64px + env(safe-area-inset-bottom, 0px))"}}>
        <button style={tb("home")} onClick={goHome}><i className="ti ti-home" style={tic("home")}/>홈</button>
        <button style={tb("post")} onClick={()=>{setEditItem(null);setEditJob(null);setForm(emptyForm);setJform({...emptyJform,org:userProfile?.affiliation||""});setPostMode(mainTab==="jobs"?"job":"item");go("post","post");}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-24}}><i className="ti ti-plus" style={{fontSize:22,color:"#fff"}}/></div>
          <span style={{marginTop:2}}>올리기</span>
        </button>
        <button style={tb("chatlist")} onClick={()=>go("chatlist","chatlist")}>
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

      {/* 거래 후기 */}
      {reviewModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:200}}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",width:"100%",boxSizing:"border-box"}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>거래 후기 — 앙코르</div><div style={{fontSize:13,color:"#888",marginBottom:4}}>"{reviewModal.title}" 거래가 어떠셨나요?</div><div style={{fontSize:11,color:"#bbb",marginBottom:20}}>후기는 👏 앙코르 카운트에 반영됩니다</div><div style={{display:"flex",gap:12}}><button onClick={()=>submitReview(true)} style={{flex:1,height:52,borderRadius:14,border:"none",background:LIGHT,color:ACCENT,fontSize:15,fontWeight:600,cursor:"pointer"}}>👍 좋았어요<br/><span style={{fontSize:11,fontWeight:400}}>+1회</span></button><button onClick={()=>submitReview(false)} style={{flex:1,height:52,borderRadius:14,border:"none",background:"#fff0f2",color:"#c62828",fontSize:15,fontWeight:600,cursor:"pointer"}}>👎 별로였어요<br/><span style={{fontSize:11,fontWeight:400}}>-1회</span></button></div><button onClick={()=>setReviewModal(null)} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",padding:"8px 0"}}>건너뛰기</button></div></div>)}

      {/* 끌어올리기 토스트 */}
      {boostToast&&<div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.8)",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:500,zIndex:300,whiteSpace:"nowrap"}}>⬆ 끌어올리기 완료!</div>}
    </div>
  );
}
