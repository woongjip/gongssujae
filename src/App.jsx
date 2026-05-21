import { useState, useMemo, useRef, useEffect } from "react";
import {
  db, auth, registerFCMToken,
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "./firebase";

const ACCENT="#2D6A4F",LIGHT="#f0f7f4",MID="#52b788",ADMIN_C="#1a237e";
const ITEM_CATS_ALL=["세트","소품","의상","장비","기타"];
const ITEM_CATS=["전체",...ITEM_CATS_ALL];
const JOB_FIELDS=["전체","조명","무대","음향","분장","영상","기타"];
const INTERESTS=["조명","무대","음향","분장","의상","소품","연출","기획","배우","스태프"];
const REGIONS=["서울 종로구","서울 중구","서울 용산구","서울 성동구","서울 마포구","서울 강남구","서울 서초구","서울 송파구","서울 강동구","서울 관악구","서울 동작구","서울 영등포구","서울 강서구","서울 은평구","서울 서대문구","서울 성북구","서울 노원구","서울 도봉구","서울 강북구","서울 양천구","서울 구로구","서울 금천구","서울 중랑구","서울 광진구","서울 동대문구","부산 중구","부산 서구","부산 동구","부산 영도구","부산 부산진구","부산 동래구","부산 남구","부산 북구","부산 해운대구","대구 중구","대구 동구","대구 서구","인천 중구","인천 동구","인천 미추홀구","인천 연수구","광주 동구","광주 서구","광주 남구","광주 북구","대전 동구","대전 중구","대전 서구","대전 유성구","경기 수원시","경기 성남시","경기 고양시","경기 용인시","경기 부천시","경기 안양시","경기 남양주시"];
const ADMIN_PW="admin1234";
const emptyForm={title:"",category:[],itemName:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:"",photos:[],status:"selling",postType:"nanumi",showTag:"",showEndDate:""};
const emptyJform={title:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:"",jobType:"guin",jobStatus:"active"};

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

export default function App(){
  // Firebase Auth
  const [currentUser,setCurrentUser]=useState(null);
  const [userProfile,setUserProfile]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [authStep,setAuthStep]=useState("splash");
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
  const [notify,setNotify]=useState({comment:true,keyword:true,newItem:false,job:true});
  const [kwds,setKwds]=useState([]);
  const [newKwd,setNewKwd]=useState("");
  const [rSearch,setRSearch]=useState("");
  const [showR,setShowR]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [editJob,setEditJob]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [jform,setJform]=useState(emptyJform);
  const [showTagFilter,setShowTagFilter]=useState("");
  const [localFirst,setLocalFirst]=useState(false);
  const [reviewModal,setReviewModal]=useState(null);
  const [mypageTab,setMypageTab]=useState("info");
  const [boostToast,setBoostToast]=useState(false);
  const [showPrefR,setShowPrefR]=useState(false);
  const [prefRSearch,setPrefRSearch]=useState("");
  const [isAdmin,setIsAdmin]=useState(false);
  const [adminTab,setAdminTab]=useState("dashboard");
  const [showAdminLogin,setShowAdminLogin]=useState(false);
  const [adminPw,setAdminPw]=useState("");
  const [logoTaps,setLogoTaps]=useState(0);
  const [allUsers,setAllUsers]=useState([]);
  const [adminUserQ,setAdminUserQ]=useState("");
  const [reports,setReports]=useState([]);

  const listRef=useRef(null);
  const scrollPos=useRef(0);
  const chatEnd=useRef(null);
  const logoTimer=useRef(null);

  // ── Firebase Auth listener ──
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async user=>{
      if(user){
        setCurrentUser(user);
        try{
          const snap=await getDoc(doc(db,"users",user.uid));
          if(snap.exists()) setUserProfile(snap.data());
          registerFCMToken(user.uid);
        }catch(e){console.log("profile load:",e);}
      }else{
        setCurrentUser(null);setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return()=>unsub();
  },[]);

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

  // ── Admin: users + reports ──
  useEffect(()=>{
    if(!isAdmin||!currentUser)return;
    const u1=onSnapshot(collection(db,"users"),snap=>setAllUsers(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"reports"),snap=>setReports(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[isAdmin,currentUser]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{if(screen==="home"&&listRef.current)setTimeout(()=>{listRef.current.scrollTop=scrollPos.current;},30);},[screen]);

  // ── Auth functions ──
  async function handleLogin(){
    setAuthError("");setAuthBusy(true);
    try{await signInWithEmailAndPassword(auth,email,password);}
    catch(e){setAuthError("이메일 또는 비밀번호를 확인해주세요");}
    setAuthBusy(false);
  }

  async function completeRegistration(){
    setAuthError("");setAuthBusy(true);
    try{
      const cred=await createUserWithEmailAndPassword(auth,email,password);
      const profileData={...regProf,email,temp:36.5,isAdmin:false,status:"active",createdAt:serverTimestamp()};
      setUserProfile(profileData); // optimistic
      await setDoc(doc(db,"users",cred.user.uid),profileData);
    }catch(e){
      if(e.code==="auth/email-already-in-use")setAuthError("이미 사용 중인 이메일입니다");
      else setAuthError("회원가입 실패: 다시 시도해주세요");
      setUserProfile(null);
    }
    setAuthBusy(false);
  }

  async function handleLogout(){await signOut(auth);setIsAdmin(false);setAuthStep("splash");}

  function allTerms(v){setTerms({all:v,service:v,privacy:v,age:v});}

  // ── App functions ──
  const go=(s,b)=>{setScreen(s);if(b!==undefined)setBtab(b);};
  const goHome=()=>go("home","home");

  function goDetail(item){scrollPos.current=listRef.current?.scrollTop||0;setSelItem(item);go("detail");}

  async function openChat(itemId,itemTitle,sellerId){
    if(!currentUser)return;
    if(sellerId===currentUser.uid){alert("본인 게시글에는 채팅할 수 없습니다");return;}
    const chatId=[currentUser.uid,sellerId].sort().join("_")+"_"+itemId;
    setActiveChat(chatId);setChatLabel(itemTitle);go("chat","chatlist");
    const chatRef=doc(db,"chats",chatId);
    const snap=await getDoc(chatRef);
    if(!snap.exists()){
      await setDoc(chatRef,{participants:[currentUser.uid,sellerId],itemId,itemTitle,lastMessage:"",updatedAt:serverTimestamp()});
    }
  }

  async function sendMsg(){
    if(!chatMsg.trim()||!activeChat||!currentUser)return;
    const text=chatMsg;setChatMsg("");
    await addDoc(collection(db,"chats",activeChat,"messages"),{text,from:currentUser.uid,fromName:userProfile?.name||userProfile?.affiliation||"사용자",createdAt:serverTimestamp()});
    await updateDoc(doc(db,"chats",activeChat),{lastMessage:text,updatedAt:serverTimestamp()});
  }

  async function toggleLike(itemId,e){
    e?.stopPropagation();
    if(!currentUser)return;
    const item=items.find(i=>i.id===itemId);if(!item)return;
    const likedBy=item.likedBy||[];
    const isLiked=likedBy.includes(currentUser.uid);
    await updateDoc(doc(db,"items",itemId),{likedBy:isLiked?likedBy.filter(u=>u!==currentUser.uid):[...likedBy,currentUser.uid]});
  }

  async function submitItem(){
    if(!form.title||!currentUser)return;
    const data={...form,price:form.price?parseInt(form.price):0,seller:userProfile?.affiliation||userProfile?.name||"익명",sellerId:currentUser.uid,si:(userProfile?.name||userProfile?.affiliation||"나")[0],likedBy:editItem?.likedBy||[]};
    if(editItem){await updateDoc(doc(db,"items",editItem.id),{...data,createdAt:editItem.createdAt});setSelItem({...data,id:editItem.id});}
    else{await addDoc(collection(db,"items"),{...data,createdAt:serverTimestamp()});}
    setEditItem(null);setForm(emptyForm);setPosted(true);
    setTimeout(()=>{setPosted(false);go(editItem?"detail":"home",editItem?undefined:"home");},1200);
  }

  function startEdit(item){
    setForm({title:item.title,category:item.category||[],itemName:item.itemName||"",price:item.price?.toString()||"",desc:item.desc||"",region:item.region||"",contact:item.contact||"",safeNum:item.safeNum||false,tradePlace:item.tradePlace||"",photos:item.photos||[],status:item.status||"selling",postType:item.postType||"nanumi",showTag:item.showTag||"",showEndDate:item.showEndDate||""});
    setEditItem(item);setPostMode("item");go("post","post");
  }

  async function changeStatus(itemId,status){
    await updateDoc(doc(db,"items",itemId),{status});
    setSelItem(p=>p?{...p,status}:p);
    if(status==="done"){const item=items.find(i=>i.id===itemId);if(item)setTimeout(()=>setReviewModal(item),400);}
  }

  async function boostItem(id){
    await updateDoc(doc(db,"items",id),{createdAt:serverTimestamp()});
    setBoostToast(true);setTimeout(()=>setBoostToast(false),2000);
  }

  async function submitReview(positive){
    const delta=positive?0.3:-0.3;
    const newTemp=Math.max(30,Math.min(50,+((userProfile?.temp||36.5)+delta).toFixed(1)));
    await updateDoc(doc(db,"users",currentUser.uid),{temp:newTemp});
    setUserProfile(p=>({...p,temp:newTemp}));setReviewModal(null);
  }

  async function submitJob(){
    if(!jform.title||!currentUser)return;
    const data={...jform,org:editJob?.org||userProfile?.affiliation||userProfile?.name||"나",icon:editJob?.icon||"📋",sellerId:currentUser.uid};
    if(editJob){await updateDoc(doc(db,"jobs",editJob.id),{...data,createdAt:editJob.createdAt});}
    else{await addDoc(collection(db,"jobs"),{...data,createdAt:serverTimestamp()});}
    setEditJob(null);setJform(emptyJform);setPosted(true);
    setTimeout(()=>{setPosted(false);setMainTab("jobs");goHome();},1200);
  }

  function startEditJob(job){setJform({title:job.title,field:job.field,type:job.type,pay:job.pay,date:job.date,desc:job.desc,location:job.location,jobType:job.jobType||"guin",jobStatus:job.jobStatus||"active"});setEditJob(job);setPostMode("job");go("post","post");}
  async function changeJobStatus(id,s){await updateDoc(doc(db,"jobs",id),{jobStatus:s});setSelJob(p=>p?{...p,jobStatus:s}:p);}
  async function toggleCat(c){setForm(p=>({...p,category:p.category.includes(c)?p.category.filter(x=>x!==c):[...p.category,c]}));}
  async function handlePhotos(e){for(const file of Array.from(e.target.files)){const r=await resizeImage(file);setForm(p=>({...p,photos:[...p.photos,r]}));}}

  function handleLogoTap(){const n=logoTaps+1;if(logoTimer.current)clearTimeout(logoTimer.current);logoTimer.current=setTimeout(()=>setLogoTaps(0),2000);if(n>=5){setLogoTaps(0);setShowAdminLogin(true);return;}setLogoTaps(n);}
  async function toggleUserStatus(uid){const u=allUsers.find(x=>x.id===uid);if(u)await updateDoc(doc(db,"users",uid),{status:u.status==="active"?"suspended":"active"});}
  async function deleteItem(id){await deleteDoc(doc(db,"items",id));}
  async function deleteJob(id){await deleteDoc(doc(db,"jobs",id));}
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

  async function updateMyProfile(updates){
    await updateDoc(doc(db,"users",currentUser.uid),updates);
    setUserProfile(p=>({...p,...updates}));
  }

  // ── Computed ──
  const filtItems=useMemo(()=>{
    let l=cat==="전체"?items:items.filter(i=>i.category?.includes(cat));
    if(showTagFilter)l=l.filter(i=>i.showTag===showTagFilter);
    if(q)l=l.filter(i=>i.title?.includes(q)||i.itemName?.includes(q)||i.region?.includes(q)||i.showTag?.includes(q));
    if(localFirst&&userProfile?.preferredRegion){const city=userProfile.preferredRegion.split(" ")[0];l=[...l.filter(i=>i.region?.startsWith(city)),...l.filter(i=>!i.region?.startsWith(city))];}
    return l;
  },[items,cat,q,showTagFilter,localFirst,userProfile?.preferredRegion]);

  const filtJobs=useMemo(()=>{let l=fld==="전체"?jobs:jobs.filter(j=>j.field===fld);if(q)l=l.filter(j=>j.title?.includes(q)||j.org?.includes(q));return l;},[jobs,fld,q]);
  const filtR=useMemo(()=>REGIONS.filter(r=>r.includes(rSearch)),[rSearch]);
  const filtPrefR=useMemo(()=>REGIONS.filter(r=>r.includes(prefRSearch)),[prefRSearch]);
  const likedItems=useMemo(()=>items.filter(i=>i.likedBy?.includes(currentUser?.uid)),[items,currentUser]);
  const myItems=useMemo(()=>items.filter(i=>i.sellerId===currentUser?.uid),[items,currentUser]);
  const upcomingEnds=useMemo(()=>items.filter(i=>i.showEndDate&&new Date(i.showEndDate)>=new Date()),[items]);
  const filtAdminUsers=useMemo(()=>adminUserQ?allUsers.filter(u=>u.name?.includes(adminUserQ)||u.affiliation?.includes(adminUserQ)):allUsers,[allUsers,adminUserQ]);
  const catStats=useMemo(()=>ITEM_CATS_ALL.map(c=>({label:c,value:items.filter(i=>i.category?.includes(c)).length})),[items]);
  const regionStats=useMemo(()=>{const m={};items.forEach(i=>{const c=i.region?.split(" ")[0]||"기타";m[c]=(m[c]||0)+1;});return Object.entries(m).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);},[items]);
  const adminStats=useMemo(()=>({totalUsers:allUsers.length,activeUsers:allUsers.filter(u=>u.status!=="suspended").length,totalItems:items.length,doneItems:items.filter(i=>i.status==="done").length,totalJobs:jobs.length,reports:reports.filter(r=>r.status==="검토중").length}),[allUsers,items,jobs,reports]);

  // ── UI Helpers ──
  const inp={width:"100%",borderRadius:10,border:"0.5px solid #e0e0e0",padding:"10px 12px",fontSize:14,boxSizing:"border-box",outline:"none"};
  const chip=(label,active,fn)=>(<button key={label} onClick={fn} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:active?ACCENT:"#e0e0e0",background:active?ACCENT:"#fff",color:active?"#fff":"#555",fontSize:12,cursor:"pointer",fontWeight:active?500:400}}>{label}</button>);
  const tb=(t)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 0",cursor:"pointer",fontSize:11,color:btab===t?ACCENT:"#aaa",fontWeight:btab===t?500:400,border:"none",background:"none"});
  const tic=(t)=>({fontSize:22,color:btab===t?ACCENT:"#bbb"});
  const mkBadge=(label,bg,color)=>(<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:bg,color,fontWeight:500}}>{label}</span>);
  const itemBadges=(item)=>[item.postType==="guhami"&&mkBadge("구하미","#fce4ec","#c62828"),item.status==="reserved"&&mkBadge("예약중","#fff3e0","#e65100"),item.status==="done"&&mkBadge("거래완료","#f5f5f5","#9e9e9e")].filter(Boolean);
  const jobBadges=(job)=>[job.jobType==="gujik"&&mkBadge("구직","#f3e5f5","#6a1b9a"),job.jobStatus==="done"&&mkBadge("완료","#f5f5f5","#9e9e9e")].filter(Boolean);
  const jbadge=(t)=>mkBadge(t,t==="장기"?"#e8f4fd":"#fff3e0",t==="장기"?"#1565c0":"#e65100");
  const tempColor=(t)=>t>=40?"#e65100":t>=38?"#2e7d32":"#1565c0";
  const tempBadge=(temp)=>{const t=temp||36.5;return <span style={{fontSize:11,color:tempColor(t),fontWeight:600}}>🌡️ {t.toFixed(1)}°C</span>;};
  const showTagPill=(tag,clickable)=>tag?<button onClick={clickable?()=>{setShowTagFilter(tag);goHome();}:undefined} style={{fontSize:10,padding:"2px 10px",borderRadius:10,background:"#e8eaf6",color:"#3949ab",fontWeight:500,border:"none",cursor:clickable?"pointer":"default"}}>🎭 {tag}</button>:null;
  const StatCard=({label,value,color="#1a1a1a"})=>(<div style={{flex:"1 1 calc(33% - 8px)",background:"#f9f9f9",borderRadius:12,padding:"12px 10px",minWidth:80}}><div style={{fontSize:22,fontWeight:700,color}}>{value}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{label}</div></div>);
  const BarChart=({data,color=ACCENT})=>{const max=Math.max(...data.map(d=>d.value),1);return data.map(d=>(<div key={d.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:44,fontSize:11,color:"#888",textAlign:"right",flexShrink:0}}>{d.label}</div><div style={{flex:1,height:18,background:"#f0f0f0",borderRadius:9,overflow:"hidden"}}><div style={{height:"100%",width:`${(d.value/max)*100}%`,background:color,borderRadius:9}}/></div><div style={{width:16,fontSize:11,color:"#555",fontWeight:500,textAlign:"right"}}>{d.value}</div></div>));};

  // ── Loading ──
  if(authLoading)return(
    <div style={{maxWidth:390,margin:"0 auto",height:700,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #e5e5e5",borderRadius:24,background:"#fff",fontFamily:"sans-serif"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:12}}>🎭</div><div style={{fontSize:14,color:ACCENT,fontWeight:500}}>공쓰재</div><div style={{fontSize:12,color:"#ccc",marginTop:6}}>로딩 중...</div></div>
    </div>
  );

  // ── Auth Screens ──
  if(!currentUser||!userProfile){
    const wrap=ch=>(<div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>{ch}</div>);
    const backBtn=to=>(<button onClick={()=>{setAuthStep(to);setAuthError("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",marginBottom:20,alignSelf:"flex-start"}}><i className="ti ti-arrow-left"/></button>);
    const ErrBox=()=>authError?<div style={{fontSize:12,color:"#c62828",marginBottom:12,padding:"8px 12px",background:"#ffebee",borderRadius:8}}>{authError}</div>:null;

    if(authStep==="splash")return(
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,boxSizing:"border-box"}}>
        <div style={{fontSize:64,marginBottom:16}}>🎭</div>
        <div style={{fontSize:28,fontWeight:600,color:ACCENT,marginBottom:8}}>공쓰재</div>
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
      <button onClick={handleLogin} disabled={authBusy} style={{width:"100%",height:48,borderRadius:12,border:"none",background:email&&password?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:16}}>{authBusy?"로그인 중...":"로그인"}</button>
      <button onClick={()=>{setAuthStep("register");setAuthError("");}} style={{background:"none",border:"none",color:ACCENT,fontSize:13,cursor:"pointer"}}>계정이 없으신가요? 회원가입 →</button>
    </>);

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
      <div style={{flex:1,overflowY:"auto"}}>{[{k:"service",l:"[필수] 중고물품 거래 이용약관",d:"거래 당사자 간 책임, 분쟁 해결, 금지 품목을 규정합니다."},{k:"privacy",l:"[필수] 개인정보 수집 및 이용 동의",d:"연락처 등 개인정보를 서비스 제공 목적으로 수집·이용합니다."},{k:"age",l:"[필수] 만 14세 이상 확인",d:"본 서비스는 만 14세 이상만 이용 가능합니다."}].map(({k,l,d})=>(<div key={k} style={{marginBottom:10}}><div onClick={()=>setTerms(p=>({...p,[k]:!p[k],all:false}))} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 0"}}><div style={{width:20,height:20,borderRadius:20,background:terms[k]?ACCENT:"#fff",border:`1.5px solid ${terms[k]?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{terms[k]&&<i className="ti ti-check" style={{fontSize:12,color:"#fff"}}/>}</div><span style={{fontSize:13,color:"#333"}}>{l}</span></div><div style={{fontSize:11,color:"#aaa",padding:"0 0 4px 30px",lineHeight:1.6}}>{d}</div></div>))}</div>
      <button onClick={()=>{if(terms.service&&terms.privacy&&terms.age)setAuthStep("profile");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:(terms.service&&terms.privacy&&terms.age)?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginTop:12}}>다음</button>
    </>);

    if(authStep==="profile")return wrap(<>
      <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>프로필 등록</div>
      <div style={{fontSize:13,color:"#999",marginBottom:18}}>더 나은 서비스를 위해 입력해주세요 (선택)</div>
      <div style={{flex:1,overflowY:"auto"}}>
        {[{l:"이름",k:"name",ph:"예: 김민준"},{l:"전화번호",k:"phone",ph:"010-0000-0000",t:"tel"},{l:"주소",k:"address",ph:"예: 서울 마포구"},{l:"소속",k:"affiliation",ph:"예: 극단 파도"}].map(f=>(<div key={f.k} style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:5,fontWeight:500}}>{f.l}</div><input value={regProf[f.k]} onChange={e=>setRegProf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} type={f.t||"text"} style={inp}/></div>))}
        <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>계정 유형</div><div style={{display:"flex",gap:8}}>{[["개인","👤"],["단체","🏢"]].map(([t,icon])=>(<button key={t} onClick={()=>setRegProf(p=>({...p,accountType:t}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${regProf.accountType===t?ACCENT:"#e0e0e0"}`,background:regProf.accountType===t?LIGHT:"#fff",color:regProf.accountType===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:regProf.accountType===t?600:400}}>{icon} {t}</button>))}</div></div>
        <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:8,fontWeight:500}}>관심 분야</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{INTERESTS.map(i=>{const a=regProf.interests.includes(i);return(<button key={i} onClick={()=>setRegProf(p=>({...p,interests:a?p.interests.filter(x=>x!==i):[...p.interests,i]}))} style={{padding:"6px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:13,cursor:"pointer"}}>{i}</button>);})}</div></div>
        <ErrBox/>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={completeRegistration} disabled={authBusy} style={{flex:1,height:48,borderRadius:12,border:"none",background:LIGHT,color:ACCENT,fontSize:14,cursor:"pointer"}}>건너뛰기</button>
        <button onClick={completeRegistration} disabled={authBusy} style={{flex:2,height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>{authBusy?"처리 중...":"완료"}</button>
      </div>
    </>);

    return null;
  }

  // ── Main App ──
  return(
    <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",position:"relative",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column"}}>

      {/* 홈 */}
      {screen==="home"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{padding:"18px 16px 0",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div onClick={handleLogoTap} style={{cursor:"pointer",userSelect:"none"}}>
              <div style={{fontSize:20,fontWeight:500,color:ACCENT}}>공쓰재{logoTaps>0&&<span style={{fontSize:10,color:"#ccc",marginLeft:4}}>{logoTaps}/5</span>}</div>
              <div style={{fontSize:11,color:"#999",marginTop:1}}>공연에 쓰고 남은 물건과 일자리를 나눕니다</div>
            </div>
            <button onClick={()=>go("notify","")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}}><i className="ti ti-bell"/></button>
          </div>
          <div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:12,padding:"9px 12px",marginBottom:10,gap:8}}>
            <i className="ti ti-search" style={{fontSize:16,color:"#aaa"}}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="물건, 지역, 공연명 검색" style={{flex:1,border:"none",background:"none",fontSize:13,outline:"none"}}/>
            {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:16,padding:0}}><i className="ti ti-x"/></button>}
          </div>
          {showTagFilter&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",background:"#e8eaf6",borderRadius:10,marginBottom:10}}><span style={{fontSize:12,color:"#3949ab",fontWeight:500}}>🎭 {showTagFilter} 필터 중</span><button onClick={()=>setShowTagFilter("")} style={{background:"none",border:"none",cursor:"pointer",color:"#3949ab",fontSize:14}}>✕</button></div>}
          <div style={{display:"flex"}}>{[["items","중고 물건"],["jobs","일자리"]].map(([t,l])=>(<button key={t} onClick={()=>{setMainTab(t);setQ("");setCat("전체");setFld("전체");}} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:mainTab===t?500:400,color:mainTab===t?ACCENT:"#aaa",borderBottom:mainTab===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>
        </div>
        <div style={{padding:"8px 16px",borderBottom:"0.5px solid #f5f5f5",overflowX:"auto",display:"flex",gap:6,flexShrink:0}}>
          {mainTab==="items"?<>{ITEM_CATS.map(c=>chip(c,cat===c,()=>setCat(c)))}{userProfile?.preferredRegion&&chip(localFirst?"📍 내 지역 ON":"📍 내 지역 먼저",localFirst,()=>setLocalFirst(l=>!l))}</>:JOB_FIELDS.map(f=>chip(f,fld===f,()=>setFld(f)))}
        </div>
        <div ref={listRef} style={{flex:1,overflowY:"auto",paddingBottom:64}}>
          {items.length===0&&mainTab==="items"&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>아직 등록된 물건이 없어요<br/><span style={{fontSize:12}}>첫 번째 물건을 올려보세요!</span></div>}
          {mainTab==="items"&&filtItems.map(item=>{
            const badges=itemBadges(item);const isLiked=item.likedBy?.includes(currentUser?.uid);
            const isLocal=localFirst&&userProfile?.preferredRegion&&item.region?.startsWith(userProfile.preferredRegion.split(" ")[0]);
            return(<div key={item.id} onClick={()=>goDetail(item)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",opacity:item.status==="done"?0.55:1,background:isLocal?"#fafffe":"#fff"}}>
              <div style={{width:80,height:80,borderRadius:12,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:30}}>{item.emoji||"📦"}</span>}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a",lineHeight:1.3,marginBottom:4}}>{item.title}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center",marginBottom:3}}>{badges.map((b,i)=><span key={i}>{b}</span>)}{item.showTag&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:"#e8eaf6",color:"#3949ab",fontWeight:500}}>🎭 {item.showTag}</span>}</div>
                  </div>
                  <button onClick={e=>toggleLike(item.id,e)} style={{background:"none",border:"none",cursor:"pointer",padding:0,marginLeft:6,flexShrink:0}}><i className="ti ti-heart" style={{fontSize:18,color:isLiked?"#e25":"#ddd"}}/></button>
                </div>
                <div style={{fontSize:11,color:"#bbb",marginBottom:3}}><i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{item.region}{isLocal&&<span style={{color:ACCENT,marginLeft:4}}>· 내 지역</span>}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:500,color:item.price===0&&item.postType!=="guhami"?ACCENT:"#1a1a1a"}}>{item.postType==="guhami"?(item.price===0?"가격 협의":`예산 ${item.price?.toLocaleString()}원`):(item.price===0?"무료 나눔":`${item.price?.toLocaleString()}원`)}</span><span style={{fontSize:10,color:"#ccc"}}><i className="ti ti-heart" style={{fontSize:11,verticalAlign:-1,marginRight:2}}/>{item.likedBy?.length||0}</span></div>
              </div>
            </div>);
          })}
          {mainTab==="jobs"&&jobs.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>아직 등록된 공고가 없어요</div>}
          {mainTab==="jobs"&&filtJobs.map(job=>(<div key={job.id} onClick={()=>{setSelJob(job);go("jobdetail");}} style={{padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",opacity:job.jobStatus==="done"?0.55:1}}><div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:44,height:44,borderRadius:10,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{job.icon}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>{jbadge(job.type)}{jobBadges(job).map((b,i)=><span key={i}>{b}</span>)}<span style={{fontSize:11,color:"#bbb"}}>{job.field}</span></div><div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{job.title}</div><div style={{fontSize:12,color:"#888"}}>{job.org} · {job.location}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:12,color:ACCENT,fontWeight:500}}>{job.pay}</span><span style={{fontSize:11,color:"#bbb"}}>{job.date}</span></div></div></div></div>))}
        </div>
      </div>)}

      {/* 물건 상세 */}
      {screen==="detail"&&selItem&&(()=>{const badges=itemBadges(selItem);const isLiked=selItem.likedBy?.includes(currentUser?.uid);const isOwner=selItem.sellerId===currentUser?.uid;return(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><span style={{fontWeight:500,fontSize:15}}>물건 상세</span></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>{isOwner&&<button onClick={()=>boostItem(selItem.id)} style={{background:LIGHT,border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,color:ACCENT,cursor:"pointer",fontWeight:500}}>⬆ 끌어올리기</button>}{isOwner&&<button onClick={()=>startEdit(selItem)} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",color:ACCENT,fontWeight:600}}>수정</button>}</div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{height:220,background:LIGHT,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>{selItem.photos?.length>0?<div style={{display:"flex",height:"100%",width:"100%",overflowX:"auto"}}>{selItem.photos.map((ph,i)=><img key={i} src={ph} style={{height:"100%",minWidth:"100%",objectFit:"cover",flexShrink:0}} alt=""/>)}</div>:<span style={{fontSize:72}}>{selItem.emoji||"📦"}</span>}</div>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1}}><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5,alignItems:"center"}}>{badges.map((b,i)=><span key={i}>{b}</span>)}{showTagPill(selItem.showTag,true)}</div><div style={{fontSize:18,fontWeight:500}}>{selItem.title}</div><div style={{fontSize:11,color:"#bbb",marginTop:3}}><i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{selItem.region} · {selItem.category?.join(", ")}</div></div>
                <span style={{fontSize:16,fontWeight:500,color:selItem.price===0&&selItem.postType!=="guhami"?ACCENT:"#1a1a1a",marginLeft:8,whiteSpace:"nowrap"}}>{selItem.postType==="guhami"?(selItem.price===0?"가격 협의":`예산 ${selItem.price?.toLocaleString()}원`):(selItem.price===0?"무료 나눔":`${selItem.price?.toLocaleString()}원`)}</span>
              </div>
              {isOwner&&<div style={{display:"flex",gap:6,marginBottom:14}}>{[["selling","판매중","#e8f5e9","#2e7d32"],["reserved","예약중","#fff3e0","#e65100"],["done","거래완료","#f5f5f5","#9e9e9e"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>changeStatus(selItem.id,k)} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${selItem.status===k?color:"#e0e0e0"}`,background:selItem.status===k?bg:"#fff",color:selItem.status===k?color:"#aaa",fontSize:11,cursor:"pointer",fontWeight:selItem.status===k?500:400}}>{l}</button>))}</div>}
              <div style={{padding:14,background:"#fafafa",borderRadius:12,marginBottom:12}}><p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selItem.desc}</p></div>
              <div style={{padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12,marginBottom:12}}><div style={{fontSize:11,color:"#aaa",marginBottom:4}}>연락처</div><div style={{fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-phone" style={{fontSize:15,color:ACCENT}}/>{selItem.contact}{selItem.safeNum&&<span style={{fontSize:10,background:LIGHT,color:ACCENT,padding:"2px 8px",borderRadius:10,fontWeight:500}}>안심번호</span>}</div></div>
              {selItem.tradePlace&&<div style={{border:"0.5px solid #f0f0f0",borderRadius:12,overflow:"hidden",marginBottom:12}}><div style={{padding:"12px 14px 8px"}}><div style={{fontSize:11,color:"#aaa",marginBottom:4}}>거래 희망 장소</div><div style={{fontSize:14,display:"flex",alignItems:"center",gap:6}}><i className="ti ti-map-pin" style={{fontSize:15,color:ACCENT}}/>{selItem.tradePlace}</div></div><div onClick={()=>openKakaoMap(selItem.tradePlace)} style={{height:90,background:"#FEE500",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer"}}><div style={{fontSize:24}}>🗺️</div><div style={{fontSize:12,color:"#3C1E1E",fontWeight:700}}>카카오맵으로 보기</div><div style={{fontSize:10,color:"#7a5c5c"}}>탭하면 지도 앱이 열립니다</div></div></div>}
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:500,fontSize:14}}>{selItem.si}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{selItem.seller}</div><div style={{fontSize:11,color:"#aaa"}}>판매자</div></div>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 16px 80px",borderTop:"0.5px solid #f0f0f0",flexShrink:0,display:"flex",gap:8}}>
            <button onClick={()=>toggleLike(selItem.id)} style={{width:48,height:54,borderRadius:12,border:`1px solid ${isLiked?"#e25":"#e0e0e0"}`,background:isLiked?"#fff0f2":"#fff",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-heart" style={{color:isLiked?"#e25":"#bbb"}}/></button>
            {!isOwner&&<button onClick={()=>openChat(selItem.id,selItem.title,selItem.sellerId)} style={{flex:1,height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><i className="ti ti-message-circle" style={{fontSize:22}}/>판매자와 채팅하기</button>}
            {isOwner&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#aaa"}}>내 게시글입니다</div>}
          </div>
        </div>
      );})()}

      {/* 공고 상세 */}
      {screen==="jobdetail"&&selJob&&(()=>{const badges=jobBadges(selJob);const isOwner=selJob.sellerId===currentUser?.uid;return(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><span style={{fontWeight:500,fontSize:15}}>공고 상세</span></div>{isOwner&&<button onClick={()=>startEditJob(selJob)} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",color:ACCENT,fontWeight:600}}>수정</button>}</div>
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}><div style={{width:52,height:52,borderRadius:14,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{selJob.icon}</div><div><div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap"}}>{jbadge(selJob.type)}{badges.map((b,i)=><span key={i}>{b}</span>)}</div><div style={{fontSize:17,fontWeight:500}}>{selJob.title}</div></div></div>
            {isOwner&&<div style={{display:"flex",gap:8,marginBottom:14}}>{[["active","진행중","#e8f5e9","#2e7d32"],["done","완료","#f5f5f5","#9e9e9e"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>changeJobStatus(selJob.id,k)} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${selJob.jobStatus===k?color:"#e0e0e0"}`,background:selJob.jobStatus===k?bg:"#fff",color:selJob.jobStatus===k?color:"#aaa",fontSize:12,cursor:"pointer",fontWeight:selJob.jobStatus===k?500:400}}>{l}</button>))}</div>}
            {[["단체",selJob.org],["지역",selJob.location],["기간",selJob.date],["보수",selJob.pay]].map(([k,v])=>(<div key={k} style={{display:"flex",padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><span style={{fontSize:13,color:"#aaa",width:48}}>{k}</span><span style={{fontSize:13,fontWeight:k==="보수"?500:400,color:k==="보수"?ACCENT:"#1a1a1a"}}>{v}</span></div>))}
            <div style={{marginTop:16,padding:14,background:"#fafafa",borderRadius:12}}><p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selJob.desc}</p></div>
          </div>
          <div style={{padding:"12px 16px 80px",borderTop:"0.5px solid #f0f0f0",flexShrink:0}}>
            {!isOwner?<button onClick={()=>openChat(selJob.id,selJob.title,selJob.sellerId)} style={{width:"100%",height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><i className="ti ti-message-circle" style={{fontSize:22}}/>지원 / 문의 채팅</button>:<div style={{textAlign:"center",fontSize:13,color:"#aaa",paddingTop:8}}>내 공고입니다</div>}
          </div>
        </div>
      );})()}

      {/* 올리기 */}
      {screen==="post"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={()=>{setEditItem(null);setEditJob(null);setForm(emptyForm);setJform(emptyJform);goHome();}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-x"/></button><span style={{fontWeight:500,fontSize:15}}>{editItem||editJob?"수정":"올리기"}</span></div>
        {!editItem&&!editJob&&<div style={{display:"flex",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>{[["item","중고 물건"],["job","일자리 공고"]].map(([t,l])=>(<button key={t} onClick={()=>setPostMode(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:postMode===t?500:400,color:postMode===t?ACCENT:"#aaa",borderBottom:postMode===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>}
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          {(postMode==="item"||editItem)?(
            <>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>나누미 / 구하미</div><div style={{display:"flex",gap:8}}>{[["nanumi","나누미","#e8f4fd","#1565c0"],["guhami","구하미","#fce4ec","#c62828"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>setForm(p=>({...p,postType:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${form.postType===k?color:"#e0e0e0"}`,background:form.postType===k?bg:"#fff",color:form.postType===k?color:"#aaa",fontSize:13,fontWeight:form.postType===k?600:400,cursor:"pointer"}}>{l}</button>))}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>사진 ({form.photos.length}/5)</div><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}><label style={{width:72,height:72,borderRadius:12,border:`1.5px dashed ${MID}`,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><i className="ti ti-camera" style={{fontSize:22,color:ACCENT}}/><span style={{fontSize:10,color:ACCENT,marginTop:2}}>추가</span><input type="file" accept="image/*" multiple onChange={handlePhotos} style={{display:"none"}}/></label>{form.photos.map((ph,i)=>(<div key={i} style={{position:"relative",flexShrink:0}}><img src={ph} style={{width:72,height:72,borderRadius:12,objectFit:"cover"}} alt=""/><button onClick={()=>setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#333",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>))}</div></div>
              {[{l:"제목",k:"title",ph:"예: 나무 의자 세트"},{l:"물품명",k:"itemName",ph:"예: 나무 의자"},{l:"🎭 공연/전시명 태그",k:"showTag",ph:"예: 더 헬리콥터쇼 2024"}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>))}
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{form.postType==="guhami"?"희망 예산":"가격 (0이면 무료 나눔)"}</div><input value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" type="number" style={inp}/></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>📅 공연 종료일</div><input value={form.showEndDate} onChange={e=>setForm(p=>({...p,showEndDate:e.target.value}))} type="date" style={inp}/></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>카테고리 (복수 선택)</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ITEM_CATS_ALL.map(c=>{const a=form.category.includes(c);return(<button key={c} onClick={()=>toggleCat(c)} style={{padding:"5px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{c}</button>);})}</div></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>지역</div><div style={{position:"relative"}}><input value={form.region} readOnly onClick={()=>setShowR(true)} placeholder="지역 선택" style={{...inp,cursor:"pointer"}}/>{showR&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:140,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}><div style={{padding:"8px 12px",borderBottom:"0.5px solid #f0f0f0",position:"sticky",top:0,background:"#fff"}}><input value={rSearch} onChange={e=>setRSearch(e.target.value)} placeholder="지역 검색" style={{width:"100%",border:"none",outline:"none",fontSize:13}} autoFocus/></div>{filtR.slice(0,20).map(r=>(<div key={r} onClick={()=>{setForm(p=>({...p,region:r}));setShowR(false);setRSearch("");}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f9f9f9"}}>{r}</div>))}</div>)}</div></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>연락처</div><input value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="010-0000-0000" style={{...inp,marginBottom:6}}/><label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#666"}}><input type="checkbox" checked={form.safeNum} onChange={e=>setForm(p=>({...p,safeNum:e.target.checked}))}/>안심번호로 표시하기</label></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>거래 희망 장소</div><input value={form.tradePlace} onChange={e=>setForm(p=>({...p,tradePlace:e.target.value}))} placeholder="예: 대학로 마로니에공원 앞" style={inp}/></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>설명</div><textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="물건 상태, 주의사항 등" rows={3} style={{...inp,resize:"none"}}/></div>
              <button onClick={submitItem} style={{width:"100%",height:46,borderRadius:12,border:"none",background:form.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>{editItem?"수정 완료":"올리기"}</button>
            </>
          ):(
            <>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>구인 / 구직</div><div style={{display:"flex",gap:8}}>{[["guin","구인","#e8f4fd","#1565c0"],["gujik","구직","#f3e5f5","#6a1b9a"]].map(([k,l,bg,color])=>(<button key={k} onClick={()=>setJform(p=>({...p,jobType:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${jform.jobType===k?color:"#e0e0e0"}`,background:jform.jobType===k?bg:"#fff",color:jform.jobType===k?color:"#aaa",fontSize:13,fontWeight:jform.jobType===k?600:400,cursor:"pointer"}}>{l}</button>))}</div></div>
              {[{l:"공고 제목",k:"title",ph:"예: 조명 디자이너 구합니다"},{l:"단체/기관명",k:"org",ph:"예: 극단 파도"},{l:"지역",k:"location",ph:"예: 대학로"},{l:"기간",k:"date",ph:"예: 2025.07.01~07.10"},{l:"보수",k:"pay",ph:"예: 협의 / 일 80,000원"}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={jform[f.k]||""} onChange={e=>setJform(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>))}
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>공고 내용</div><textarea value={jform.desc} onChange={e=>setJform(p=>({...p,desc:e.target.value}))} placeholder="모집 조건, 담당 업무 등" rows={3} style={{...inp,resize:"none"}}/></div>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>분야</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["조명","무대","음향","분장","영상","기타"].map(f=>(<button key={f} onClick={()=>setJform(p=>({...p,field:f}))} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:jform.field===f?ACCENT:"#e0e0e0",background:jform.field===f?ACCENT:"#fff",color:jform.field===f?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{f}</button>))}</div></div>
              <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>고용 형태</div><div style={{display:"flex",gap:6}}>{["단기","장기"].map(t=>(<button key={t} onClick={()=>setJform(p=>({...p,type:t}))} style={{padding:"5px 16px",borderRadius:20,border:"0.5px solid",borderColor:jform.type===t?ACCENT:"#e0e0e0",background:jform.type===t?ACCENT:"#fff",color:jform.type===t?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{t}</button>))}</div></div>
              <button onClick={submitJob} style={{width:"100%",height:46,borderRadius:12,border:"none",background:jform.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>{editJob?"수정 완료":"공고 올리기"}</button>
            </>
          )}
          {posted&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(45,106,79,0.95)",color:"#fff",padding:"12px 24px",borderRadius:14,fontSize:14,fontWeight:500,zIndex:200}}>✓ 완료!</div>}
        </div>
      </div>)}

      {/* 채팅 목록 */}
      {screen==="chatlist"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><div style={{padding:"20px 16px 14px",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><div style={{fontSize:18,fontWeight:500}}>채팅</div></div><div style={{flex:1,overflowY:"auto",paddingBottom:64}}>{chatRooms.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>채팅이 없습니다<br/><span style={{fontSize:12}}>물건 상세에서 채팅을 시작하세요</span></div>}{chatRooms.map(room=>(<div key={room.id} onClick={()=>{setActiveChat(room.id);setChatLabel(room.itemTitle||"채팅");go("chat","chatlist");}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",alignItems:"center"}}><div style={{width:46,height:46,borderRadius:12,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💬</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:500}}>{room.itemTitle||"채팅"}</div><div style={{fontSize:11,color:"#bbb"}}>{room.updatedAt?.toDate?.()?.toLocaleDateString("ko-KR",{month:"numeric",day:"numeric"})||""}</div></div><div style={{fontSize:12,color:"#999",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{room.lastMessage||"새 채팅"}</div></div></div>))}</div></div>)}

      {/* 채팅 */}
      {screen==="chat"&&(<div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:64}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={()=>go("chatlist","chatlist")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><div><div style={{fontSize:13,fontWeight:500}}>{chatLabel}</div><div style={{fontSize:11,color:"#aaa"}}>채팅</div></div></div><div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>{messages.map((msg,i)=>(<div key={msg.id||i} style={{display:"flex",justifyContent:msg.from==="me"?"flex-end":"flex-start"}}><div style={{maxWidth:"75%"}}>{msg.from!=="me"&&<div style={{fontSize:10,color:"#aaa",marginBottom:2}}>{msg.fromName}</div>}<div style={{padding:"10px 14px",borderRadius:msg.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.from==="me"?ACCENT:"#f3f3f3",color:msg.from==="me"?"#fff":"#1a1a1a",fontSize:14,lineHeight:1.5}}>{msg.text}</div></div></div>))}{messages.length===0&&<div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:40}}>메시지를 보내보세요</div>}<div ref={chatEnd}/></div><div style={{flexShrink:0,padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,alignItems:"center",background:"#fff"}}><input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="메시지를 입력하세요" style={{flex:1,borderRadius:22,border:"1px solid #e0e0e0",padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa"}}/><button onClick={sendMsg} style={{width:44,height:44,borderRadius:"50%",border:"none",background:chatMsg.trim()?ACCENT:"#ddd",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-send"/></button></div></div>)}

      {/* 알림 */}
      {screen==="notify"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><button onClick={goHome} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button><span style={{fontWeight:500,fontSize:15}}>알림 설정</span></div><div style={{flex:1,overflowY:"auto",padding:16,paddingBottom:80}}>{upcomingEnds.length>0&&<div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>📅 공연 종료 예정</div>{upcomingEnds.map(item=>(<div key={item.id} style={{padding:"12px 14px",background:"#fff8e1",borderRadius:12,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:500}}>{item.showTag||item.title}</div><div style={{fontSize:11,color:"#f57c00",marginTop:2}}>종료일 {item.showEndDate}</div></div><button onClick={()=>{setShowTagFilter(item.showTag||"");goHome();}} style={{background:"none",border:"1px solid #f57c00",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#f57c00",cursor:"pointer"}}>보기</button></div>))}</div>}{[{k:"comment",l:"내 게시글에 댓글",d:"댓글이 달리면 알림"},{k:"keyword",l:"키워드 알림",d:"등록 키워드 물건 올라오면 알림"},{k:"newItem",l:"새 물건 등록",d:"관심 카테고리 새 물건 알림"},{k:"job",l:"일자리 공고",d:"새 일자리 공고 알림"}].map(({k,l,d})=>(<div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"0.5px solid #f5f5f5"}}><div><div style={{fontSize:14}}>{l}</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>{d}</div></div><div onClick={()=>setNotify(p=>({...p,[k]:!p[k]}))} style={{width:46,height:27,borderRadius:14,background:notify[k]?ACCENT:"#ddd",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,left:notify[k]?21:3,width:21,height:21,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/></div></div>))}<div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:20,marginBottom:10}}>키워드 관리</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{kwds.map(kw=>(<div key={kw} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:LIGHT,borderRadius:20}}><span style={{fontSize:13,color:ACCENT}}>{kw}</span><button onClick={()=>setKwds(p=>p.filter(k=>k!==kw))} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,padding:0,fontSize:15,lineHeight:1}}>×</button></div>))}</div><div style={{display:"flex",gap:8}}><input value={newKwd} onChange={e=>setNewKwd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} placeholder="키워드 추가" style={{flex:1,borderRadius:10,border:"0.5px solid #e0e0e0",padding:"9px 12px",fontSize:13,outline:"none"}}/><button onClick={()=>{if(newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} style={{padding:"9px 16px",borderRadius:10,border:"none",background:ACCENT,color:"#fff",fontSize:13,cursor:"pointer"}}>추가</button></div></div></div>)}

      {/* 마이페이지 */}
      {screen==="mypage"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{padding:"18px 16px 0",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{position:"relative"}}><div style={{width:56,height:56,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:600}}>{(userProfile?.name||userProfile?.affiliation||"나")[0]}</div>{userProfile?.accountType==="단체"&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:14}}>🏢</span>}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:500}}>{userProfile?.name||userProfile?.affiliation||"공쓰재 사용자"}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:1}}>{userProfile?.email||currentUser?.email}</div>
              <div style={{marginTop:5}}>{tempBadge(userProfile?.temp)}<span style={{fontSize:10,color:"#aaa",marginLeft:6}}>공연온도</span></div>
            </div>
          </div>
          <div style={{display:"flex"}}>{[["info","정보"],["liked","찜 목록"],["myitems","내 게시글"]].map(([t,l])=>(<button key={t} onClick={()=>setMypageTab(t)} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:mypageTab===t?500:400,color:mypageTab===t?ACCENT:"#aaa",borderBottom:mypageTab===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>
        </div>
        <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
          {mypageTab==="info"&&(<>
            <div style={{padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5"}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:8}}>계정 유형</div>
              <div style={{display:"flex",gap:8}}>{[["개인","👤"],["단체","🏢"]].map(([t,icon])=>(<button key={t} onClick={()=>updateMyProfile({accountType:t})} style={{flex:1,padding:"8px 0",borderRadius:10,border:`1.5px solid ${userProfile?.accountType===t?ACCENT:"#e0e0e0"}`,background:userProfile?.accountType===t?LIGHT:"#fff",color:userProfile?.accountType===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:userProfile?.accountType===t?600:400}}>{icon} {t}</button>))}</div>
            </div>
            <div style={{padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5"}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:6}}>📍 선호 지역</div>
              <div style={{position:"relative"}}><input value={userProfile?.preferredRegion||""} readOnly onClick={()=>setShowPrefR(true)} placeholder="지역 선택" style={{...inp,cursor:"pointer",fontSize:13,color:userProfile?.preferredRegion?"#1a1a1a":"#aaa"}}/>{showPrefR&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:160,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}><div style={{padding:"8px 12px",borderBottom:"0.5px solid #f0f0f0",position:"sticky",top:0,background:"#fff"}}><input value={prefRSearch} onChange={e=>setPrefRSearch(e.target.value)} placeholder="지역 검색" style={{width:"100%",border:"none",outline:"none",fontSize:13}} autoFocus/></div><div onClick={()=>{updateMyProfile({preferredRegion:""});setShowPrefR(false);}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",color:"#aaa",borderBottom:"0.5px solid #f9f9f9"}}>선택 안함</div>{filtPrefR.slice(0,20).map(r=>(<div key={r} onClick={()=>{updateMyProfile({preferredRegion:r});setShowPrefR(false);setPrefRSearch("");}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f9f9f9",background:userProfile?.preferredRegion===r?LIGHT:"#fff",color:userProfile?.preferredRegion===r?ACCENT:"#333"}}>{r}</div>))}</div>)}</div>
            </div>
            {[["알림 설정","ti-bell"],["거래 내역","ti-repeat"]].map(([l,ic])=>(<div key={l} onClick={()=>{if(l==="알림 설정")go("notify","");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10}}><i className={`ti ${ic}`} style={{fontSize:18,color:"#555"}}/><span style={{fontSize:14}}>{l}</span></div><i className="ti ti-chevron-right" style={{fontSize:16,color:"#ccc"}}/></div>))}
            <div onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:10,padding:"16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}><i className="ti ti-logout" style={{fontSize:18,color:"#e25"}}/><span style={{fontSize:14,color:"#e25"}}>로그아웃</span></div>
            <div onClick={()=>setShowAdminLogin(true)} style={{padding:"12px 16px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:11,color:"#e0e0e0"}}>관리자</span></div>
          </>)}
          {mypageTab==="liked"&&(likedItems.length===0?<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>찜한 물건이 없어요</div>:likedItems.map(item=>(<div key={item.id} onClick={()=>goDetail(item)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}><div style={{width:64,height:64,borderRadius:10,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:24}}>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{item.title}</div><div style={{fontSize:11,color:"#bbb"}}>{item.region}</div><div style={{fontSize:13,fontWeight:500,color:item.price===0?ACCENT:"#1a1a1a",marginTop:4}}>{item.price===0?"무료 나눔":`${item.price?.toLocaleString()}원`}</div></div><button onClick={e=>{e.stopPropagation();toggleLike(item.id,e);}} style={{background:"none",border:"none",cursor:"pointer",color:"#e25",fontSize:18,alignSelf:"center",flexShrink:0}}><i className="ti ti-heart-filled"/></button></div>)))}
          {mypageTab==="myitems"&&(myItems.length===0?<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>등록한 물건이 없어요</div>:myItems.map(item=>(<div key={item.id} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",alignItems:"center"}}><div onClick={()=>goDetail(item)} style={{width:56,height:56,borderRadius:10,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:22}}>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>goDetail(item)}><div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{item.title}</div><div style={{fontSize:11,color:item.status==="done"?"#9e9e9e":item.status==="reserved"?"#e65100":ACCENT,fontWeight:500}}>{item.status==="done"?"거래완료":item.status==="reserved"?"예약중":"판매중"}</div></div><div style={{display:"flex",gap:6}}><button onClick={()=>boostItem(item.id)} style={{background:LIGHT,border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:ACCENT,cursor:"pointer",fontWeight:500}}>⬆</button><button onClick={()=>startEdit(item)} style={{background:"#f5f5f5",border:"none",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#666",cursor:"pointer"}}>수정</button></div></div>)))}
        </div>
      </div>)}

      {/* 관리자 */}
      {screen==="admin"&&(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{padding:"14px 16px",background:ADMIN_C,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}><div><div style={{fontSize:15,fontWeight:600,color:"#fff"}}>🔐 관리자 모드</div><div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:1}}>공쓰재 Admin</div></div><button onClick={()=>{setIsAdmin(false);goHome();}} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,cursor:"pointer"}}>나가기</button></div>
        <div style={{display:"flex",background:"#f8f9ff",borderBottom:"0.5px solid #e0e0e0",flexShrink:0}}>{[["dashboard","대시보드"],["users","회원"],["posts","게시글"],["stats","통계"],["reports","신고"]].map(([t,l])=>(<button key={t} onClick={()=>setAdminTab(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:adminTab===t?600:400,color:adminTab===t?ADMIN_C:"#888",borderBottom:adminTab===t?`2px solid ${ADMIN_C}`:"2px solid transparent"}}>{l}{t==="reports"&&reports.filter(r=>r.status==="검토중").length>0&&<span style={{marginLeft:3,fontSize:9,background:"#e25",color:"#fff",borderRadius:8,padding:"1px 4px"}}>{reports.filter(r=>r.status==="검토중").length}</span>}</button>))}</div>
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          {adminTab==="dashboard"&&(<>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}><StatCard label="총 회원" value={adminStats.totalUsers} color={ADMIN_C}/><StatCard label="활성 회원" value={adminStats.activeUsers} color="#2e7d32"/><StatCard label="총 게시글" value={adminStats.totalItems}/><StatCard label="거래완료" value={adminStats.doneItems} color="#e65100"/><StatCard label="일자리" value={adminStats.totalJobs}/><StatCard label="신고" value={adminStats.reports} color={adminStats.reports>0?"#c62828":"#9e9e9e"}/></div>
            <div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>최근 가입 회원</div>
            {[...allUsers].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,5).map(u=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:32,height:32,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||u.email}</div><div style={{fontSize:11,color:"#aaa"}}>{u.email}</div></div><span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:u.status==="suspended"?"#ffebee":"#e8f5e9",color:u.status==="suspended"?"#c62828":"#2e7d32",fontWeight:500}}>{u.status==="suspended"?"정지":"활성"}</span></div>))}
          </>)}
          {adminTab==="users"&&(<><input value={adminUserQ} onChange={e=>setAdminUserQ(e.target.value)} placeholder="이름 또는 소속 검색" style={{...inp,marginBottom:14}}/><div style={{fontSize:12,color:"#aaa",marginBottom:8}}>총 {filtAdminUsers.length}명</div>{filtAdminUsers.map(u=>(<div key={u.id} style={{padding:"12px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{u.accountType==="단체"?"🏢":"👤"}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500}}>{u.name||u.affiliation||"미입력"}<span style={{fontSize:10,color:"#aaa",marginLeft:6}}>{u.accountType}</span></div><div style={{fontSize:11,color:"#888"}}>{u.email}</div><div style={{display:"flex",gap:8,marginTop:3}}><span style={{fontSize:10,color:u.temp>=38?"#2e7d32":"#1565c0",fontWeight:600}}>🌡️ {(u.temp||36.5).toFixed(1)}°C</span><span style={{fontSize:10,color:"#aaa"}}>{u.affiliation||"소속 미입력"}</span></div></div>{u.id!==currentUser?.uid&&<button onClick={()=>toggleUserStatus(u.id)} style={{background:u.status==="suspended"?"#e8f5e9":"#ffebee",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,color:u.status==="suspended"?"#2e7d32":"#c62828",cursor:"pointer",fontWeight:500,flexShrink:0}}>{u.status==="suspended"?"활성화":"정지"}</button>}</div></div>))}</>)}
          {adminTab==="posts"&&(<><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>중고 물건 ({items.length})</div>{items.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.photos?.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}} alt=""/>:<span>{item.emoji||"📦"}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{item.title}</div><div style={{fontSize:11,color:"#aaa"}}>{item.seller} · {item.region}</div></div><button onClick={()=>deleteItem(item.id)} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}<div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:16,marginBottom:10}}>일자리 공고 ({jobs.length})</div>{jobs.map(job=>(<div key={job.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{width:36,height:36,borderRadius:8,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{job.icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,marginBottom:1}}>{job.title}</div><div style={{fontSize:11,color:"#aaa"}}>{job.org} · {job.location}</div></div><button onClick={()=>deleteJob(job.id)} style={{background:"#ffebee",border:"none",borderRadius:8,padding:"5px 8px",fontSize:11,color:"#c62828",cursor:"pointer",flexShrink:0}}>삭제</button></div>))}</>)}
          {adminTab==="stats"&&(<><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>📦 카테고리별</div><BarChart data={catStats}/></div><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>📍 지역별</div><BarChart data={regionStats} color={ADMIN_C}/></div><div style={{marginBottom:20}}><div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:12}}>🏷 나누미 / 구하미</div>{(()=>{const nan=items.filter(i=>i.postType==="nanumi").length;const gu=items.filter(i=>i.postType==="guhami").length;const tot=nan+gu||1;return(<div><div style={{display:"flex",height:20,borderRadius:10,overflow:"hidden",marginBottom:8}}><div style={{width:`${(nan/tot)*100}%`,background:ACCENT}}/><div style={{width:`${(gu/tot)*100}%`,background:"#c62828"}}/></div><div style={{display:"flex",gap:16,fontSize:12}}><span style={{color:ACCENT}}>■ 나누미 {nan}개</span><span style={{color:"#c62828"}}>■ 구하미 {gu}개</span></div></div>);})()}</div></>)}
          {adminTab==="reports"&&(<><div style={{fontSize:12,color:"#aaa",marginBottom:12}}>신고 목록 ({reports.length})</div>{reports.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:40,fontSize:14}}>신고 접수 없음</div>}{reports.map(r=>(<div key={r.id} style={{padding:"14px 0",borderBottom:"0.5px solid #f5f5f5"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:r.status==="검토중"?"#ffebee":"#f5f5f5",color:r.status==="검토중"?"#c62828":"#9e9e9e",fontWeight:500}}>{r.status}</span><span style={{fontSize:11,color:"#bbb"}}>{r.date||""}</span></div><div style={{fontSize:13,fontWeight:500,marginBottom:2}}>"{r.target}"</div><div style={{fontSize:12,color:"#888",marginBottom:8}}>사유: {r.reason}</div>{r.status==="검토중"&&<div style={{display:"flex",gap:8}}><button onClick={()=>updateReport(r.id,"처리완료")} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",background:"#e8f5e9",color:"#2e7d32",fontSize:12,cursor:"pointer",fontWeight:500}}>처리 완료</button><button onClick={()=>updateReport(r.id,"반려")} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",background:"#f5f5f5",color:"#888",fontSize:12,cursor:"pointer"}}>반려</button></div>}</div>))}</>)}
        </div>
      </div>)}

      {/* 하단 네비게이션 */}
      {screen!=="admin"&&(<div style={{position:"absolute",bottom:0,left:0,right:0,height:64,background:"#fff",borderTop:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",zIndex:50}}>
        <button style={tb("home")} onClick={goHome}><i className="ti ti-home" style={tic("home")}/>홈</button>
        <button style={tb("post")} onClick={()=>{setEditItem(null);setEditJob(null);setForm(emptyForm);setJform(emptyJform);setPostMode("item");go("post","post");}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-24}}><i className="ti ti-plus" style={{fontSize:22,color:"#fff"}}/></div>
          <span style={{marginTop:2}}>올리기</span>
        </button>
        <button style={tb("chatlist")} onClick={()=>go("chatlist","chatlist")}><i className="ti ti-message-circle" style={tic("chatlist")}/>채팅</button>
        <button style={tb("mypage")} onClick={()=>go("mypage","mypage")}><i className="ti ti-user" style={tic("mypage")}/>MY</button>
      </div>)}

      {/* 관리자 로그인 모달 */}
      {showAdminLogin&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}><div style={{background:"#fff",borderRadius:20,padding:"28px 24px",width:280,boxSizing:"border-box"}}><div style={{fontSize:16,fontWeight:600,color:ADMIN_C,marginBottom:4}}>🔐 관리자 로그인</div><div style={{fontSize:12,color:"#aaa",marginBottom:16}}>비밀번호를 입력하세요</div><input value={adminPw} onChange={e=>setAdminPw(e.target.value)} type="password" placeholder="비밀번호" onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PW){setIsAdmin(true);setScreen("admin");setShowAdminLogin(false);setAdminPw("");}else{alert("비밀번호가 틀렸습니다.");}}} } style={{...inp,marginBottom:12}}/><button onClick={()=>{if(adminPw===ADMIN_PW){setIsAdmin(true);setScreen("admin");setShowAdminLogin(false);setAdminPw("");}else{alert("비밀번호가 틀렸습니다.");}}} style={{width:"100%",height:44,borderRadius:12,border:"none",background:ADMIN_C,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",marginBottom:8}}>확인</button><button onClick={()=>{setShowAdminLogin(false);setAdminPw("");}} style={{width:"100%",background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",padding:"8px 0"}}>취소</button></div></div>)}

      {/* 거래 후기 */}
      {reviewModal&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",zIndex:200}}><div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",width:"100%",boxSizing:"border-box"}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>거래 후기 — 공연온도</div><div style={{fontSize:13,color:"#888",marginBottom:4}}>"{reviewModal.title}" 거래가 어떠셨나요?</div><div style={{fontSize:11,color:"#bbb",marginBottom:20}}>후기는 🌡️ 공연온도에 반영됩니다</div><div style={{display:"flex",gap:12}}><button onClick={()=>submitReview(true)} style={{flex:1,height:52,borderRadius:14,border:"none",background:LIGHT,color:ACCENT,fontSize:15,fontWeight:600,cursor:"pointer"}}>👍 좋았어요<br/><span style={{fontSize:11,fontWeight:400}}>+0.3°C</span></button><button onClick={()=>submitReview(false)} style={{flex:1,height:52,borderRadius:14,border:"none",background:"#fff0f2",color:"#c62828",fontSize:15,fontWeight:600,cursor:"pointer"}}>👎 별로였어요<br/><span style={{fontSize:11,fontWeight:400}}>-0.3°C</span></button></div><button onClick={()=>setReviewModal(null)} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",padding:"8px 0"}}>건너뛰기</button></div></div>)}

      {/* 끌어올리기 토스트 */}
      {boostToast&&<div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.8)",color:"#fff",padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:500,zIndex:300,whiteSpace:"nowrap"}}>⬆ 끌어올리기 완료!</div>}
    </div>
  );
}
