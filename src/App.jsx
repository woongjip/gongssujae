import { useState, useMemo, useRef, useEffect } from "react";

const ACCENT = "#2D6A4F", LIGHT = "#f0f7f4", MID = "#52b788";
const ITEM_CATS_ALL = ["세트","소품","의상","장비","기타"];
const ITEM_CATS = ["전체",...ITEM_CATS_ALL];
const JOB_FIELDS = ["전체","조명","무대","음향","분장","영상","기타"];
const INTERESTS = ["조명","무대","음향","분장","의상","소품","연출","기획","배우","스태프"];
const REGIONS = ["서울 종로구","서울 중구","서울 용산구","서울 성동구","서울 광진구","서울 동대문구","서울 중랑구","서울 성북구","서울 강북구","서울 도봉구","서울 노원구","서울 은평구","서울 서대문구","서울 마포구","서울 양천구","서울 강서구","서울 구로구","서울 금천구","서울 영등포구","서울 동작구","서울 관악구","서울 서초구","서울 강남구","서울 송파구","서울 강동구","부산 중구","부산 서구","부산 동구","부산 영도구","부산 부산진구","부산 동래구","부산 남구","부산 북구","부산 해운대구","대구 중구","대구 동구","대구 서구","대구 남구","대구 북구","인천 중구","인천 동구","인천 미추홀구","인천 연수구","인천 남동구","광주 동구","광주 서구","광주 남구","광주 북구","대전 동구","대전 중구","대전 서구","대전 유성구","울산 중구","울산 남구","울산 동구","울산 북구","경기 수원시","경기 성남시","경기 고양시","경기 용인시","경기 부천시","경기 안산시","경기 안양시","경기 남양주시","경기 화성시","경기 의정부시"];
const ST = { selling:{label:"판매중",bg:"#e8f5e9",color:"#2e7d32"}, reserved:{label:"예약중",bg:"#fff3e0",color:"#e65100"}, done:{label:"거래완료",bg:"#f5f5f5",color:"#9e9e9e"} };
const PT = { nanuми:{label:"나누미",bg:"#e8f4fd",color:"#1565c0"}, guhami:{label:"구하미",bg:"#fce4ec",color:"#c62828"} };
const JT = { guin:{label:"구인",bg:"#e8f4fd",color:"#1565c0"}, gujik:{label:"구직",bg:"#f3e5f5",color:"#6a1b9a"} };
const MY_ID = "me";

const initItems = [
  {id:1,title:"빨간 드레스 (2벌)",category:["소품","의상"],itemName:"빨간 드레스",price:0,photos:[],emoji:"🎭",desc:"공연 종료 후 남은 빨간 드레스 2벌. 사이즈 S/M. 세탁 완료.",seller:"극단 파도",sellerId:"user1",si:"파",likes:12,region:"서울 종로구",contact:"010-****-1234",safeNum:false,tradePlace:"대학로 마로니에공원 앞",status:"selling",postType:"nanumi"},
  {id:2,title:"소형 스팟 조명 x3",category:["장비"],itemName:"스팟 조명",price:15000,photos:[],emoji:"💡",desc:"전시 철수 후 남은 LED 스팟 조명 3개. 상태 양호.",seller:"아트스페이스 을지",sellerId:"user2",si:"을",likes:8,region:"서울 중구",contact:"안심번호",safeNum:true,tradePlace:"을지로 3가역 2번 출구",status:"reserved",postType:"nanumi"},
  {id:3,title:"나무 의자 세트 (6개)",category:["세트"],itemName:"나무 의자",price:0,photos:[],emoji:"🪑",desc:"무대 소품용 나무 의자 6개. 픽업 가능.",seller:"극단 숲",sellerId:"user3",si:"숲",likes:21,region:"서울 종로구",contact:"010-****-9012",safeNum:false,tradePlace:"대학로 소극장 앞",status:"done",postType:"nanumi"},
  {id:4,title:"한복 치마 (연두색)",category:["의상"],itemName:"한복 치마",price:8000,photos:[],emoji:"👗",desc:"한복 작업 후 남은 치마 1점. 허리 60cm.",seller:"무용단 봄",sellerId:MY_ID,si:"나",likes:5,region:"서울 마포구",contact:"안심번호",safeNum:true,tradePlace:"홍대입구역 9번 출구",status:"selling",postType:"nanumi"},
  {id:5,title:"조명 장비 급구합니다",category:["장비"],itemName:"LED 조명",price:0,photos:[],emoji:"🔦",desc:"다음주 공연에 쓸 소형 LED 조명 2개 구합니다. 단기 대여도 가능.",seller:"문화공간 노들",sellerId:"user5",si:"노",likes:3,region:"서울 동작구",contact:"010-****-7890",safeNum:false,tradePlace:"노들섬 내부",status:"selling",postType:"guhami"},
  {id:6,title:"무대 음향 장비 세트",category:["장비"],itemName:"음향 장비",price:50000,photos:[],emoji:"🎧",desc:"믹서, 스피커, 마이크 포함.",seller:"극단 파도",sellerId:MY_ID,si:"나",likes:17,region:"서울 중구",contact:"010-****-2345",safeNum:false,tradePlace:"을지로 입구역 근처",status:"selling",postType:"nanumi"},
];
const initJobs = [
  {id:101,title:"조명 디자이너 구합니다",field:"조명",type:"단기",org:"극단 파도",pay:"협의",date:"2025.06.14~06.28",desc:"소극장 연극 조명 설계 및 현장 운영.",location:"대학로",icon:"💡",jobType:"guin"},
  {id:102,title:"무대 세트 제작 스태프",field:"무대",type:"단기",org:"아트스페이스 을지",pay:"일 80,000원",date:"2025.06.10~06.13",desc:"전시 오픈 전 세트 설치 및 철수 보조.",location:"을지로",icon:"🏗️",jobType:"guin"},
  {id:103,title:"음향 엔지니어 구직합니다",field:"음향",type:"장기",org:"홍길동",pay:"협의",date:"2025.07~",desc:"공연장 음향 엔지니어 경력 5년. 콘솔 운용 가능. 장기 포지션 희망.",location:"서울 전체",icon:"🎧",jobType:"gujik"},
  {id:104,title:"분장 아티스트 섭외",field:"분장",type:"단기",org:"무용단 봄",pay:"회당 150,000원",date:"2025.06.20~06.22",desc:"현대무용 공연 분장. 퍼포머 8명.",location:"마포구",icon:"💄",jobType:"guin"},
];
const initChats = {
  1:[{from:"other",text:"안녕하세요! 드레스 아직 남아있나요?"},{from:"me",text:"네, 아직 있어요!"}],
  101:[{from:"other",text:"조명 디자이너 공고 관련해서 문의드려요."}],
};
const emptyForm = {title:"",category:[],itemName:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:"",photos:[],status:"selling",postType:"nanumi"};

export default function App() {
  const [loggedIn,setLoggedIn]=useState(true); // TODO: 개발 완료 후 false 로 변경
  const [aStep,setAStep]=useState("splash");
  const [aMode,setAMode]=useState("phone");
  const [aInput,setAInput]=useState("");
  const [verCode,setVerCode]=useState("");
  const [terms,setTerms]=useState({all:false,service:false,privacy:false,age:false});
  const [prof,setProf]=useState({phone:"",address:"",affiliation:"",interests:[]});

  const [screen,setScreen]=useState("home");
  const [mainTab,setMainTab]=useState("items");
  const [btab,setBtab]=useState("home");
  const [selItem,setSelItem]=useState(null);
  const [selJob,setSelJob]=useState(null);
  const [cat,setCat]=useState("전체");
  const [fld,setFld]=useState("전체");
  const [q,setQ]=useState("");
  const [chatMsg,setChatMsg]=useState("");
  const [chats,setChats]=useState(initChats);
  const [activeChat,setActiveChat]=useState(null);
  const [chatLabel,setChatLabel]=useState("");
  const [items,setItems]=useState(initItems);
  const [jobs,setJobs]=useState(initJobs);
  const [likes,setLikes]=useState({});
  const [chatList,setChatList]=useState([{id:1,label:"빨간 드레스"},{id:101,label:"조명 디자이너 공고"}]);
  const [postMode,setPostMode]=useState("item");
  const [posted,setPosted]=useState(false);
  const [notify,setNotify]=useState({comment:true,keyword:true,newItem:false,job:true});
  const [kwds,setKwds]=useState(["조명","드레스"]);
  const [newKwd,setNewKwd]=useState("");
  const [rSearch,setRSearch]=useState("");
  const [showR,setShowR]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [jform,setJform]=useState({title:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:""});

  const listRef=useRef(null);
  const scrollPos=useRef(0);
  const chatEnd=useRef(null);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[chats,screen]);
  useEffect(()=>{
    if(screen==="home"&&listRef.current) setTimeout(()=>{listRef.current.scrollTop=scrollPos.current;},30);
  },[screen]);

  const filtItems=useMemo(()=>{
    let l=cat==="전체"?items:items.filter(i=>i.category.includes(cat));
    if(q) l=l.filter(i=>i.title.includes(q)||i.itemName?.includes(q)||i.region?.includes(q));
    return l;
  },[items,cat,q]);
  const filtJobs=useMemo(()=>{
    let l=fld==="전체"?jobs:jobs.filter(j=>j.field===fld);
    if(q) l=l.filter(j=>j.title.includes(q)||j.org.includes(q));
    return l;
  },[jobs,fld,q]);
  const filtR=useMemo(()=>REGIONS.filter(r=>r.includes(rSearch)),[rSearch]);

  const go=(s,b)=>{setScreen(s);if(b!==undefined)setBtab(b);};
  function goDetail(item){scrollPos.current=listRef.current?.scrollTop||0;setSelItem(item);go("detail");}
  function openChat(id,label){setActiveChat(id);setChatLabel(label);go("chat","chatlist");if(!chatList.find(c=>c.id===id))setChatList(p=>[...p,{id,label}]);if(!chats[id])setChats(p=>({...p,[id]:[]}));}
  function sendMsg(){if(!chatMsg.trim())return;setChats(p=>({...p,[activeChat]:[...(p[activeChat]||[]),{from:"me",text:chatMsg}]}));setChatMsg("");}
  function allTerms(v){setTerms({all:v,service:v,privacy:v,age:v});}
  function toggleCat(c){setForm(p=>({...p,category:p.category.includes(c)?p.category.filter(x=>x!==c):[...p.category,c]}));}
  function handlePhotos(e){Array.from(e.target.files).forEach(file=>{const r=new FileReader();r.onload=ev=>setForm(p=>({...p,photos:[...p.photos,ev.target.result]}));r.readAsDataURL(file);});}
  function submitItem(){
    if(!form.title)return;
    const ni={id:editItem?editItem.id:Date.now(),...form,price:form.price?parseInt(form.price):0,seller:prof.affiliation||"나",sellerId:MY_ID,si:"나",likes:editItem?editItem.likes:0,emoji:form.photos.length===0?"📦":null};
    if(editItem){setItems(p=>p.map(i=>i.id===editItem.id?ni:i));setSelItem(ni);}
    else setItems(p=>[ni,...p]);
    const dest=editItem?"detail":"home";
    setEditItem(null);setForm(emptyForm);setPosted(true);
    setTimeout(()=>{setPosted(false);go(dest,dest==="home"?"home":undefined);},1200);
  }
  function startEdit(item){setForm({title:item.title,category:item.category,itemName:item.itemName||"",price:item.price.toString(),desc:item.desc,region:item.region,contact:item.contact,safeNum:item.safeNum,tradePlace:item.tradePlace,photos:item.photos||[],status:item.status});setEditItem(item);setPostMode("item");go("post","post");}
  function changeStatus(id,s){setItems(p=>p.map(i=>i.id===id?{...i,status:s}:i));setSelItem(p=>p?{...p,status:s}:p);}
  function submitJob(){if(!jform.title)return;setJobs(p=>[{id:Date.now(),...jform,org:prof.affiliation||"나",icon:"📋"},...p]);setJform({title:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:""});setPosted(true);setTimeout(()=>{setPosted(false);setMainTab("jobs");go("home","home");},1200);}

  const inp={width:"100%",borderRadius:10,border:"0.5px solid #e0e0e0",padding:"10px 12px",fontSize:14,boxSizing:"border-box",outline:"none"};
  const chip=(label,active,fn)=>(<button key={label} onClick={fn} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:active?ACCENT:"#e0e0e0",background:active?ACCENT:"#fff",color:active?"#fff":"#555",fontSize:12,cursor:"pointer",fontWeight:active?500:400}}>{label}</button>);
  const jbadge=(t)=>(<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:t==="장기"?"#e8f4fd":"#fff3e0",color:t==="장기"?"#1565c0":"#e65100",fontWeight:500}}>{t}</span>);
  const stBadge=(s)=>{const v=ST[s]||ST.selling;return <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:v.bg,color:v.color,fontWeight:500}}>{v.label}</span>;};
  const ptBadge=(p)=>{const v=PT[p]||PT.nanumi;return <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:v.bg,color:v.color,fontWeight:500}}>{v.label}</span>;};
  const jtBadge=(j)=>{const v=JT[j]||JT.guin;return <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:v.bg,color:v.color,fontWeight:500}}>{v.label}</span>;};
  const tb=(t)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 0",cursor:"pointer",fontSize:11,color:btab===t?ACCENT:"#aaa",fontWeight:btab===t?500:400,border:"none",background:"none"});
  const tic=(t)=>({fontSize:22,color:btab===t?ACCENT:"#bbb"});

  // ── AUTH ──
  if(!loggedIn){
    const wrap=(children)=>(<div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>{children}</div>);
    const backBtn=(to)=>(<button onClick={()=>setAStep(to)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",marginBottom:20,alignSelf:"flex-start"}}><i className="ti ti-arrow-left"/></button>);

    if(aStep==="splash") return(
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,boxSizing:"border-box"}}>
        <div style={{fontSize:64,marginBottom:16}}>🎭</div>
        <div style={{fontSize:28,fontWeight:600,color:ACCENT,marginBottom:8}}>공쓰재</div>
        <div style={{fontSize:13,color:"#999",textAlign:"center",lineHeight:1.7,marginBottom:48}}>공연에 쓰고 남은 물건과 일자리를<br/>나누는 공연인들의 플랫폼</div>
        <button onClick={()=>setAStep("login")} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:12}}>시작하기</button>
        <button onClick={()=>setAStep("login")} style={{width:"100%",height:50,borderRadius:14,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:15,fontWeight:500,cursor:"pointer"}}>이미 계정이 있어요</button>
      </div>
    );

    if(aStep==="login") return wrap(<>
      {backBtn("splash")}
      <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>안녕하세요!</div>
      <div style={{fontSize:13,color:"#999",marginBottom:24}}>전화번호 또는 이메일로 시작하세요</div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["phone","📱 전화번호"],["email","✉️ 이메일"]].map(([t,l])=>(<button key={t} onClick={()=>{setAMode(t);setAInput("");}} style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${aMode===t?ACCENT:"#e0e0e0"}`,background:aMode===t?LIGHT:"#fff",color:aMode===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:aMode===t?500:400}}>{l}</button>))}
      </div>
      <input value={aInput} onChange={e=>setAInput(e.target.value)} placeholder={aMode==="phone"?"010-0000-0000":"이메일 주소"} type={aMode==="phone"?"tel":"email"} style={{...inp,marginBottom:12}}/>
      <button onClick={()=>{if(aInput.length>=6)setAStep("verify");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:aInput.length>=6?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>인증번호 받기</button>
    </>);

    if(aStep==="verify") return wrap(<>
      {backBtn("login")}
      <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>인증번호 입력</div>
      <div style={{fontSize:13,color:"#999",marginBottom:28}}>{aInput}로 발송된 인증번호 4자리</div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
        {[0,1,2,3].map(i=>(<div key={i} style={{width:60,height:60,borderRadius:14,border:`2px solid ${verCode.length>i?ACCENT:"#e0e0e0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:600,color:ACCENT,background:verCode.length>i?LIGHT:"#fff"}}>{verCode[i]||""}</div>))}
      </div>
      <input value={verCode} onChange={e=>setVerCode(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="인증번호 4자리" type="tel" style={{...inp,textAlign:"center",fontSize:20,letterSpacing:12,marginBottom:12}}/>
      <button onClick={()=>setAStep("terms")} style={{width:"100%",height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:10}}>확인</button>
      <button style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>인증번호 재발송</button>
    </>);

    if(aStep==="terms") return wrap(<>
      <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>약관 동의</div>
      <div style={{fontSize:13,color:"#999",marginBottom:18}}>서비스 이용을 위해 약관에 동의해주세요</div>
      <div onClick={()=>allTerms(!terms.all)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:LIGHT,borderRadius:12,marginBottom:12,cursor:"pointer"}}>
        <div style={{width:22,height:22,borderRadius:22,background:terms.all?ACCENT:"#fff",border:`1.5px solid ${terms.all?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{terms.all&&<i className="ti ti-check" style={{fontSize:13,color:"#fff"}}/>}</div>
        <span style={{fontSize:14,fontWeight:500,color:ACCENT}}>전체 동의</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {[{k:"service",l:"[필수] 중고물품 거래 이용약관",d:"거래 당사자 간 책임, 분쟁 해결, 금지 품목 등을 규정합니다."},{k:"privacy",l:"[필수] 개인정보 수집 및 이용 동의",d:"연락처 등 개인정보를 서비스 제공 목적으로 수집·이용합니다."},{k:"age",l:"[필수] 만 14세 이상 확인",d:"본 서비스는 만 14세 이상만 이용 가능합니다."}].map(({k,l,d})=>(
          <div key={k} style={{marginBottom:10}}>
            <div onClick={()=>setTerms(p=>({...p,[k]:!p[k],all:false}))} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 0"}}>
              <div style={{width:20,height:20,borderRadius:20,background:terms[k]?ACCENT:"#fff",border:`1.5px solid ${terms[k]?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{terms[k]&&<i className="ti ti-check" style={{fontSize:12,color:"#fff"}}/>}</div>
              <span style={{fontSize:13,color:"#333"}}>{l}</span>
            </div>
            <div style={{fontSize:11,color:"#aaa",padding:"0 0 4px 30px",lineHeight:1.6}}>{d}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>{if(terms.service&&terms.privacy&&terms.age)setAStep("profile");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:(terms.service&&terms.privacy&&terms.age)?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginTop:12}}>다음</button>
    </>);

    if(aStep==="profile") return wrap(<>
      <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>프로필 등록</div>
      <div style={{fontSize:13,color:"#999",marginBottom:18}}>더 나은 서비스를 위해 입력해주세요 (선택)</div>
      <div style={{flex:1,overflowY:"auto"}}>
        {[{l:"전화번호",k:"phone",ph:"010-0000-0000",t:"tel"},{l:"주소",k:"address",ph:"예: 서울 마포구"},{l:"소속",k:"affiliation",ph:"예: 극단 파도"}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}>
            <div style={{fontSize:12,color:"#666",marginBottom:5,fontWeight:500}}>{f.l}</div>
            <input value={prof[f.k]} onChange={e=>setProf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} type={f.t||"text"} style={inp}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:"#666",marginBottom:8,fontWeight:500}}>관심 분야 (복수 선택)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {INTERESTS.map(i=>{const a=prof.interests.includes(i);return(<button key={i} onClick={()=>setProf(p=>({...p,interests:a?p.interests.filter(x=>x!==i):[...p.interests,i]}))} style={{padding:"6px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:13,cursor:"pointer"}}>{i}</button>);})}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={()=>setLoggedIn(true)} style={{flex:1,height:48,borderRadius:12,border:"0.5px solid #e0e0e0",background:"#fff",color:"#888",fontSize:14,cursor:"pointer"}}>건너뛰기</button>
        <button onClick={()=>setLoggedIn(true)} style={{flex:2,height:48,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>완료</button>
      </div>
    </>);
  }

  // ── MAIN APP ──
  return(
    <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",position:"relative",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column"}}>

      {/* HOME */}
      {screen==="home"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"18px 16px 0",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:20,fontWeight:500,color:ACCENT}}>공쓰재</div><div style={{fontSize:11,color:"#999",marginTop:1}}>공연에 쓰고 남은 물건과 일자리를 나눕니다</div></div>
              <button onClick={()=>go("notify","")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}}><i className="ti ti-bell"/></button>
            </div>
            <div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:12,padding:"9px 12px",marginBottom:12,gap:8}}>
              <i className="ti ti-search" style={{fontSize:16,color:"#aaa"}}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="물건, 물품명, 지역 검색" style={{flex:1,border:"none",background:"none",fontSize:13,outline:"none"}}/>
              {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:16,padding:0}}><i className="ti ti-x"/></button>}
            </div>
            <div style={{display:"flex"}}>
              {[["items","중고 물건"],["jobs","일자리"]].map(([t,l])=>(<button key={t} onClick={()=>{setMainTab(t);setQ("");setCat("전체");setFld("전체");}} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:mainTab===t?500:400,color:mainTab===t?ACCENT:"#aaa",borderBottom:mainTab===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}
            </div>
          </div>
          <div style={{padding:"8px 16px",borderBottom:"0.5px solid #f5f5f5",overflowX:"auto",display:"flex",gap:6,flexShrink:0}}>
            {mainTab==="items"?ITEM_CATS.map(c=>chip(c,cat===c,()=>setCat(c))):JOB_FIELDS.map(f=>chip(f,fld===f,()=>setFld(f)))}
          </div>
          <div ref={listRef} style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            {mainTab==="items"&&filtItems.map(item=>(
              <div key={item.id} onClick={()=>goDetail(item)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",opacity:item.status==="done"?0.55:1}}>
                <div style={{width:80,height:80,borderRadius:12,flexShrink:0,overflow:"hidden",background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {item.photos&&item.photos.length>0?<img src={item.photos[0]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:30}}>{item.emoji||"📦"}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a",lineHeight:1.3,marginBottom:4}}>{item.title}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                        {stBadge(item.status)}
                        {item.category.map(c=><span key={c} style={{fontSize:10,padding:"1px 6px",borderRadius:8,background:"#f0f0f0",color:"#888"}}>{c}</span>)}
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setLikes(p=>({...p,[item.id]:!p[item.id]}));}} style={{background:"none",border:"none",cursor:"pointer",padding:0,marginLeft:6,flexShrink:0}}><i className="ti ti-heart" style={{fontSize:18,color:likes[item.id]?"#e25":"#ddd"}}/></button>
                  </div>
                  <div style={{fontSize:11,color:"#bbb",marginTop:4}}><i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{item.region}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
                    <span style={{fontSize:13,fontWeight:500,color:item.price===0&&item.postType!=="guhami"?ACCENT:"#1a1a1a"}}>{item.postType==="guhami"?(item.price===0?"가격 협의":`예산 ${item.price.toLocaleString()}원`):(item.price===0?"무료 나눔":`${item.price.toLocaleString()}원`)}</span>
                    <span style={{fontSize:10,color:"#ccc"}}><i className="ti ti-heart" style={{fontSize:11,verticalAlign:-1,marginRight:2}}/>{item.likes+(likes[item.id]?1:0)}</span>
                  </div>
                </div>
              </div>
            ))}
            {mainTab==="jobs"&&filtJobs.map(job=>(
              <div key={job.id} onClick={()=>{setSelJob(job);go("jobdetail");}} style={{padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:44,height:44,borderRadius:10,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{job.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>{jtBadge(job.jobType)}{jbadge(job.type)}<span style={{fontSize:11,color:"#bbb"}}>{job.field}</span></div>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{job.title}</div>
                    <div style={{fontSize:12,color:"#888"}}>{job.org} · {job.location}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:12,color:ACCENT,fontWeight:500}}>{job.pay}</span><span style={{fontSize:11,color:"#bbb"}}>{job.date}</span></div>
                  </div>
                </div>
              </div>
            ))}
            {((mainTab==="items"&&filtItems.length===0)||(mainTab==="jobs"&&filtJobs.length===0))&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>검색 결과가 없습니다</div>}
          </div>
        </div>
      )}

      {/* ITEM DETAIL */}
      {screen==="detail"&&selItem&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>go("home","home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
              <span style={{fontWeight:500,fontSize:15}}>물건 상세</span>
            </div>
            {selItem.sellerId===MY_ID&&<button onClick={()=>startEdit(selItem)} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",color:ACCENT,fontWeight:600}}>수정</button>}
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{height:220,background:LIGHT,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {selItem.photos&&selItem.photos.length>0?(
                <div style={{display:"flex",height:"100%",overflowX:"auto",width:"100%"}}>
                  {selItem.photos.map((ph,i)=><img key={i} src={ph} style={{height:"100%",minWidth:"100%",objectFit:"cover",flexShrink:0}} alt=""/>)}
                </div>
              ):<span style={{fontSize:72}}>{selItem.emoji||"📦"}</span>}
            </div>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>{ptBadge(selItem.postType)}{stBadge(selItem.status)}{selItem.category.map(c=><span key={c} style={{fontSize:10,padding:"1px 6px",borderRadius:8,background:"#f0f0f0",color:"#888"}}>{c}</span>)}</div>
                  <div style={{fontSize:18,fontWeight:500}}>{selItem.title}</div>
                  <div style={{fontSize:11,color:"#bbb",marginTop:3}}><i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{selItem.region}</div>
                </div>
                <span style={{fontSize:16,fontWeight:500,color:selItem.price===0&&selItem.postType!=="guhami"?ACCENT:"#1a1a1a",marginLeft:8,whiteSpace:"nowrap"}}>{selItem.postType==="guhami"?(selItem.price===0?"가격 협의":`예산 ${selItem.price.toLocaleString()}원`):(selItem.price===0?"무료 나눔":`${selItem.price.toLocaleString()}원`)}</span>
              </div>
              {selItem.sellerId===MY_ID&&(
                <div style={{display:"flex",gap:6,marginBottom:14}}>
                  {Object.entries(ST).map(([k,v])=>(<button key={k} onClick={()=>changeStatus(selItem.id,k)} style={{flex:1,padding:"7px 0",borderRadius:10,border:`1px solid ${selItem.status===k?v.color:"#e0e0e0"}`,background:selItem.status===k?v.bg:"#fff",color:selItem.status===k?v.color:"#aaa",fontSize:11,cursor:"pointer",fontWeight:selItem.status===k?500:400}}>{v.label}</button>))}
                </div>
              )}
              <div style={{padding:14,background:"#fafafa",borderRadius:12,marginBottom:12}}><p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selItem.desc}</p></div>
              <div style={{padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12,marginBottom:12}}>
                <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>연락처</div>
                <div style={{fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-phone" style={{fontSize:15,color:ACCENT}}/>{selItem.contact}{selItem.safeNum&&<span style={{fontSize:10,background:LIGHT,color:ACCENT,padding:"2px 8px",borderRadius:10,fontWeight:500}}>안심번호</span>}</div>
              </div>
              <div style={{border:"0.5px solid #f0f0f0",borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{padding:"12px 14px 8px"}}><div style={{fontSize:11,color:"#aaa",marginBottom:4}}>거래 희망 장소</div><div style={{fontSize:14,display:"flex",alignItems:"center",gap:6}}><i className="ti ti-map-pin" style={{fontSize:15,color:ACCENT}}/>{selItem.tradePlace}</div></div>
                <div style={{height:90,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}><div style={{fontSize:22}}>🗺️</div><a href={`https://map.naver.com/v5/search/${encodeURIComponent(selItem.tradePlace||"")}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:ACCENT,textDecoration:"none",border:`1px solid ${ACCENT}`,padding:"4px 14px",borderRadius:12}}>지도에서 보기</a></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:500,fontSize:14}}>{selItem.si}</div>
                <div><div style={{fontSize:13,fontWeight:500}}>{selItem.seller}</div><div style={{fontSize:11,color:"#aaa"}}>판매자</div></div>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 16px 80px",borderTop:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>openChat(selItem.id,selItem.title)} style={{width:"100%",height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:17,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <i className="ti ti-message-circle" style={{fontSize:24}}/>판매자와 채팅하기
            </button>
          </div>
        </div>
      )}

      {/* JOB DETAIL */}
      {screen==="jobdetail"&&selJob&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("home","home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
            <span style={{fontWeight:500,fontSize:15}}>공고 상세</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16,paddingBottom:80}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}><div style={{width:52,height:52,borderRadius:14,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{selJob.icon}</div><div><div style={{display:"flex",gap:6,marginBottom:4}}>{jbadge(selJob.type)}</div><div style={{fontSize:17,fontWeight:500}}>{selJob.title}</div></div></div>
            {[["단체",selJob.org],["지역",selJob.location],["기간",selJob.date],["보수",selJob.pay]].map(([k,v])=>(<div key={k} style={{display:"flex",padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}><span style={{fontSize:13,color:"#aaa",width:48}}>{k}</span><span style={{fontSize:13,fontWeight:k==="보수"?500:400,color:k==="보수"?ACCENT:"#1a1a1a"}}>{v}</span></div>))}
            <div style={{marginTop:16,padding:14,background:"#fafafa",borderRadius:12}}><p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selJob.desc}</p></div>
          </div>
          <div style={{padding:"12px 16px 80px",borderTop:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>openChat(selJob.id,selJob.title)} style={{width:"100%",height:54,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:17,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><i className="ti ti-message-circle" style={{fontSize:24}}/>지원 / 문의 채팅</button>
          </div>
        </div>
      )}

      {/* POST / EDIT */}
      {screen==="post"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>{setEditItem(null);setForm(emptyForm);go("home","home");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-x"/></button>
            <span style={{fontWeight:500,fontSize:15}}>{editItem?"게시글 수정":"올리기"}</span>
          </div>
          {!editItem&&<div style={{display:"flex",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>{[["item","중고 물건"],["job","일자리 공고"]].map(([t,l])=>(<button key={t} onClick={()=>setPostMode(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:postMode===t?500:400,color:postMode===t?ACCENT:"#aaa",borderBottom:postMode===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>))}</div>}
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            {(postMode==="item"||editItem)?(
              <>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>사진 ({form.photos.length}/10)</div>
                  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                    <label style={{width:72,height:72,borderRadius:12,border:`1.5px dashed ${MID}`,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                      <i className="ti ti-camera" style={{fontSize:22,color:ACCENT}}/><span style={{fontSize:10,color:ACCENT,marginTop:2}}>추가</span>
                      <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{display:"none"}}/>
                    </label>
                    {form.photos.map((ph,i)=>(<div key={i} style={{position:"relative",flexShrink:0}}><img src={ph} style={{width:72,height:72,borderRadius:12,objectFit:"cover"}} alt=""/><button onClick={()=>setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#333",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>))}
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>나누미 / 구하미</div>
                  <div style={{display:"flex",gap:8}}>
                    {[["nanumi","나누미","#e8f4fd","#1565c0"],["guhami","구하미","#fce4ec","#c62828"]].map(([k,l,bg,color])=>(
                      <button key={k} onClick={()=>setForm(p=>({...p,postType:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${form.postType===k?color:"#e0e0e0"}`,background:form.postType===k?bg:"#fff",color:form.postType===k?color:"#aaa",fontSize:13,fontWeight:form.postType===k?600:400,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                {[{l:"제목",k:"title",ph:"예: 나무 의자 세트"},{l:"물품명",k:"itemName",ph:"예: 나무 의자"}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>))}
                <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>가격 (0이면 무료 나눔)</div><input value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" type="number" style={inp}/></div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>카테고리 (복수 선택 가능)</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {ITEM_CATS_ALL.map(c=>{const a=form.category.includes(c);return(<button key={c} onClick={()=>toggleCat(c)} style={{padding:"5px 14px",borderRadius:20,border:"0.5px solid",borderColor:a?ACCENT:"#e0e0e0",background:a?ACCENT:"#fff",color:a?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{c}</button>);})}
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>지역</div>
                  <div style={{position:"relative"}}>
                    <input value={form.region} readOnly onClick={()=>setShowR(true)} placeholder="지역 선택" style={{...inp,cursor:"pointer"}}/>
                    {showR&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:140,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
                      <div style={{padding:"8px 12px",borderBottom:"0.5px solid #f0f0f0",position:"sticky",top:0,background:"#fff"}}><input value={rSearch} onChange={e=>setRSearch(e.target.value)} placeholder="지역 검색" style={{width:"100%",border:"none",outline:"none",fontSize:13}} autoFocus/></div>
                      {filtR.slice(0,20).map(r=>(<div key={r} onClick={()=>{setForm(p=>({...p,region:r}));setShowR(false);setRSearch("");}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f9f9f9"}}>{r}</div>))}
                    </div>)}
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>연락처</div>
                  <input value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="010-0000-0000" style={{...inp,marginBottom:6}}/>
                  <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#666"}}><input type="checkbox" checked={form.safeNum} onChange={e=>setForm(p=>({...p,safeNum:e.target.checked}))}/>안심번호로 표시하기</label>
                </div>
                <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>거래 희망 장소</div><input value={form.tradePlace} onChange={e=>setForm(p=>({...p,tradePlace:e.target.value}))} placeholder="예: 대학로 마로니에공원 앞" style={inp}/></div>
                <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>설명</div><textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="물건 상태, 주의사항 등" rows={3} style={{...inp,resize:"none"}}/></div>
                <button onClick={submitItem} style={{width:"100%",height:46,borderRadius:12,border:"none",background:form.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>{editItem?"수정 완료":"올리기"}</button>
              </>
            ):(
              <>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:6,fontWeight:500}}>구인 / 구직</div>
                  <div style={{display:"flex",gap:8}}>
                    {[["guin","구인","#e8f4fd","#1565c0"],["gujik","구직","#f3e5f5","#6a1b9a"]].map(([k,l,bg,color])=>(
                      <button key={k} onClick={()=>setJform(p=>({...p,jobType:k}))} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${jform.jobType===k?color:"#e0e0e0"}`,background:jform.jobType===k?bg:"#fff",color:jform.jobType===k?color:"#aaa",fontSize:13,fontWeight:jform.jobType===k?600:400,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
                {[{l:"공고 제목",k:"title",ph:"예: 조명 디자이너 구합니다"},{l:"단체/기관명",k:"org",ph:"예: 극단 파도"},{l:"지역",k:"location",ph:"예: 대학로"},{l:"기간",k:"date",ph:"예: 2025.07.01~07.10"},{l:"보수",k:"pay",ph:"예: 협의 / 일 80,000원"}].map(f=>(<div key={f.k} style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div><input value={jform[f.k]||""} onChange={e=>setJform(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>))}
                <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>공고 내용</div><textarea value={jform.desc} onChange={e=>setJform(p=>({...p,desc:e.target.value}))} placeholder="모집 조건, 담당 업무 등" rows={3} style={{...inp,resize:"none"}}/></div>
                <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>분야</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["조명","무대","음향","분장","영상","기타"].map(f=>(<button key={f} onClick={()=>setJform(p=>({...p,field:f}))} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:jform.field===f?ACCENT:"#e0e0e0",background:jform.field===f?ACCENT:"#fff",color:jform.field===f?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{f}</button>))}</div></div>
                <div style={{marginBottom:14}}><div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>고용 형태</div><div style={{display:"flex",gap:6}}>{["단기","장기"].map(t=>(<button key={t} onClick={()=>setJform(p=>({...p,type:t}))} style={{padding:"5px 16px",borderRadius:20,border:"0.5px solid",borderColor:jform.type===t?ACCENT:"#e0e0e0",background:jform.type===t?ACCENT:"#fff",color:jform.type===t?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{t}</button>))}</div></div>
                <button onClick={submitJob} style={{width:"100%",height:46,borderRadius:12,border:"none",background:jform.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:80}}>공고 올리기</button>
              </>
            )}
            {posted&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(45,106,79,0.95)",color:"#fff",padding:"12px 24px",borderRadius:14,fontSize:14,fontWeight:500,zIndex:200}}>✓ 완료!</div>}
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      {screen==="chatlist"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"20px 16px 14px",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><div style={{fontSize:18,fontWeight:500}}>채팅</div></div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            {chatList.map(({id,label})=>{const msgs=chats[id]||[];const last=msgs[msgs.length-1];return(
              <div key={id} onClick={()=>openChat(id,label)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",alignItems:"center"}}>
                <div style={{width:46,height:46,borderRadius:12,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{id>=100?"💼":"📦"}</div>
                <div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:500}}>{label}</div><div style={{fontSize:11,color:"#bbb"}}>방금 전</div></div><div style={{fontSize:12,color:"#999",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last?last.text:"새 채팅"}</div></div>
              </div>
            );})}
            {chatList.length===0&&<div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>채팅이 없습니다</div>}
          </div>
        </div>
      )}

      {/* CHAT */}
      {screen==="chat"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:64}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("chatlist","chatlist")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
            <div><div style={{fontSize:13,fontWeight:500}}>{chatLabel}</div><div style={{fontSize:11,color:"#aaa"}}>채팅</div></div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {(chats[activeChat]||[]).map((msg,i)=>(<div key={i} style={{display:"flex",justifyContent:msg.from==="me"?"flex-end":"flex-start"}}><div style={{maxWidth:"72%",padding:"10px 14px",borderRadius:msg.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.from==="me"?ACCENT:"#f3f3f3",color:msg.from==="me"?"#fff":"#1a1a1a",fontSize:14,lineHeight:1.5}}>{msg.text}</div></div>))}
            {!(chats[activeChat]||[]).length&&<div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:40}}>메시지를 보내보세요</div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{flexShrink:0,padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,alignItems:"center",background:"#fff"}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="메시지를 입력하세요" style={{flex:1,borderRadius:22,border:"1px solid #e0e0e0",padding:"11px 16px",fontSize:14,outline:"none",background:"#fafafa"}}/>
            <button onClick={sendMsg} style={{width:44,height:44,borderRadius:"50%",border:"none",background:chatMsg.trim()?ACCENT:"#ddd",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><i className="ti ti-send"/></button>
          </div>
        </div>
      )}

      {/* NOTIFY */}
      {screen==="notify"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("home","home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
            <span style={{fontWeight:500,fontSize:15}}>알림 설정</span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16,paddingBottom:80}}>
            {[{k:"comment",l:"내 게시글에 댓글",d:"댓글이 달리면 알림"},{k:"keyword",l:"키워드 알림",d:"등록 키워드 물건 올라오면 알림"},{k:"newItem",l:"새 물건 등록",d:"관심 카테고리 새 물건 알림"},{k:"job",l:"일자리 공고",d:"새 일자리 공고 알림"}].map(({k,l,d})=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"0.5px solid #f5f5f5"}}>
                <div><div style={{fontSize:14}}>{l}</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>{d}</div></div>
                <div onClick={()=>setNotify(p=>({...p,[k]:!p[k]}))} style={{width:46,height:27,borderRadius:14,background:notify[k]?ACCENT:"#ddd",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,left:notify[k]?21:3,width:21,height:21,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/></div>
              </div>
            ))}
            <div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:20,marginBottom:10}}>키워드 관리</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{kwds.map(kw=>(<div key={kw} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:LIGHT,borderRadius:20}}><span style={{fontSize:13,color:ACCENT}}>{kw}</span><button onClick={()=>setKwds(p=>p.filter(k=>k!==kw))} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,padding:0,fontSize:15,lineHeight:1}}>×</button></div>))}</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newKwd} onChange={e=>setNewKwd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} placeholder="키워드 추가" style={{flex:1,borderRadius:10,border:"0.5px solid #e0e0e0",padding:"9px 12px",fontSize:13,outline:"none"}}/>
              <button onClick={()=>{if(newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} style={{padding:"9px 16px",borderRadius:10,border:"none",background:ACCENT,color:"#fff",fontSize:13,cursor:"pointer"}}>추가</button>
            </div>
          </div>
        </div>
      )}

      {/* MY PAGE */}
      {screen==="mypage"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"20px 16px 14px",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}><div style={{fontSize:18,fontWeight:500}}>마이페이지</div></div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            <div style={{padding:16,borderBottom:"0.5px solid #f5f5f5"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:600}}>나</div>
                <div><div style={{fontSize:16,fontWeight:500}}>{prof.affiliation||"공쓰재 사용자"}</div><div style={{fontSize:12,color:"#aaa",marginTop:2}}>{prof.phone||aInput||"010-****-****"}</div></div>
              </div>
              {prof.address&&<div style={{fontSize:12,color:"#888",marginBottom:6}}><i className="ti ti-map-pin" style={{fontSize:11,marginRight:4}}/>{prof.address}</div>}
              {prof.interests.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{prof.interests.map(i=><span key={i} style={{fontSize:11,padding:"3px 10px",background:LIGHT,color:ACCENT,borderRadius:12}}>{i}</span>)}</div>}
            </div>
            {[["나의 게시글","ti-file-text"],["찜한 물건","ti-heart"],["거래 내역","ti-repeat"],["알림 설정","ti-bell"]].map(([l,ic])=>(<div key={l} onClick={()=>{if(l==="알림 설정")go("notify","");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:10}}><i className={`ti ${ic}`} style={{fontSize:18,color:"#555"}}/><span style={{fontSize:14}}>{l}</span></div><i className="ti ti-chevron-right" style={{fontSize:16,color:"#ccc"}}/></div>))}
            <div onClick={()=>{setLoggedIn(false);setAStep("splash");}} style={{display:"flex",alignItems:"center",gap:10,padding:"16px",cursor:"pointer"}}><i className="ti ti-logout" style={{fontSize:18,color:"#e25"}}/><span style={{fontSize:14,color:"#e25"}}>로그아웃</span></div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:64,background:"#fff",borderTop:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",zIndex:50}}>
        <button style={tb("home")} onClick={()=>go("home","home")}><i className="ti ti-home" style={tic("home")}/>홈</button>
        <button style={tb("post")} onClick={()=>{setEditItem(null);setForm(emptyForm);setPostMode("item");go("post","post");}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-24}}><i className="ti ti-plus" style={{fontSize:22,color:"#fff"}}/></div>
          <span style={{marginTop:2}}>올리기</span>
        </button>
        <button style={tb("chatlist")} onClick={()=>go("chatlist","chatlist")}><i className="ti ti-message-circle" style={tic("chatlist")}/>채팅</button>
        <button style={tb("mypage")} onClick={()=>go("mypage","mypage")}><i className="ti ti-user" style={tic("mypage")}/>MY</button>
      </div>
    </div>
  );
}
