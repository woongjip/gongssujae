import { useState, useMemo, useRef, useEffect } from "react";

const ACCENT = "#2D6A4F", LIGHT = "#f0f7f4", MID = "#52b788";
const ITEM_CATS = ["전체","세트","소품","장비","기타"];
const JOB_FIELDS = ["전체","조명","무대","음향","분장","영상","기타"];
const REGIONS = ["서울 종로구","서울 중구","서울 용산구","서울 성동구","서울 광진구","서울 동대문구","서울 중랑구","서울 성북구","서울 강북구","서울 도봉구","서울 노원구","서울 은평구","서울 서대문구","서울 마포구","서울 양천구","서울 강서구","서울 구로구","서울 금천구","서울 영등포구","서울 동작구","서울 관악구","서울 서초구","서울 강남구","서울 송파구","서울 강동구","부산 중구","부산 서구","부산 동구","부산 영도구","부산 부산진구","부산 동래구","부산 남구","부산 북구","부산 해운대구","부산 사하구","대구 중구","대구 동구","대구 서구","대구 남구","대구 북구","인천 중구","인천 동구","인천 미추홀구","인천 연수구","인천 남동구","광주 동구","광주 서구","광주 남구","광주 북구","광주 광산구","대전 동구","대전 중구","대전 서구","대전 유성구","대전 대덕구","울산 중구","울산 남구","울산 동구","울산 북구","경기 수원시","경기 성남시","경기 고양시","경기 용인시","경기 부천시","경기 안산시","경기 안양시","경기 남양주시","경기 화성시","경기 의정부시","경기 평택시"];

const initItems = [
  { id:1, title:"빨간 드레스 (2벌)", category:"소품", show:"더 헬리콥터쇼 2024", price:0, image:"🎭", desc:"공연 종료 후 남은 빨간 드레스 2벌. 사이즈 S/M. 세탁 완료.", seller:"극단 파도", si:"파", likes:12, region:"서울 종로구", contact:"010-****-1234", safeNum:false, tradePlace:"대학로 마로니에공원 앞" },
  { id:2, title:"소형 스팟 조명 x3", category:"장비", show:"달빛 소나타 전시", price:15000, image:"💡", desc:"전시 철수 후 남은 LED 스팟 조명 3개. 상태 양호.", seller:"아트스페이스 을지", si:"을", likes:8, region:"서울 중구", contact:"안심번호", safeNum:true, tradePlace:"을지로 3가역 2번 출구" },
  { id:3, title:"나무 의자 세트 (6개)", category:"세트", show:"시간의 방 연극제", price:0, image:"🪑", desc:"무대 소품용 나무 의자 6개. 픽업 가능.", seller:"극단 숲", si:"숲", likes:21, region:"서울 종로구", contact:"010-****-9012", safeNum:false, tradePlace:"대학로 소극장 앞" },
  { id:4, title:"한복 치마 (연두색)", category:"소품", show:"춘향 리믹스", price:8000, image:"👗", desc:"한복 작업 후 남은 치마 1점. 허리 60cm.", seller:"무용단 봄", si:"봄", likes:5, region:"서울 마포구", contact:"안심번호", safeNum:true, tradePlace:"홍대입구역 9번 출구" },
  { id:5, title:"대형 현수막 천 (3m×5m)", category:"기타", show:"인디뮤직위크 2024", price:0, image:"🏮", desc:"행사 후 남은 대형 현수막 천.", seller:"문화공간 노들", si:"노", likes:3, region:"서울 동작구", contact:"010-****-7890", safeNum:false, tradePlace:"노들섬 내부" },
  { id:6, title:"무대 음향 장비 세트", category:"장비", show:"할로윈 퍼포먼스", price:50000, image:"🎧", desc:"믹서, 스피커, 마이크 포함. 중소형 공연장용.", seller:"극단 파도", si:"파", likes:17, region:"서울 중구", contact:"010-****-2345", safeNum:false, tradePlace:"을지로 입구역 근처" },
];
const initJobs = [
  { id:101, title:"조명 디자이너 구합니다", field:"조명", type:"단기", org:"극단 파도", pay:"협의", date:"2025.06.14~06.28", desc:"소극장 연극 조명 설계 및 현장 운영. 경력 2년 이상 우대.", location:"대학로", icon:"💡" },
  { id:102, title:"무대 세트 제작 스태프", field:"무대", type:"단기", org:"아트스페이스 을지", pay:"일 80,000원", date:"2025.06.10~06.13", desc:"전시 오픈 전 세트 설치 및 철수 보조.", location:"을지로", icon:"🏗️" },
  { id:103, title:"음향 엔지니어 (상주)", field:"음향", type:"장기", org:"문화공간 노들", pay:"월 230만원~", date:"2025.07.01~", desc:"공연장 상주 음향 엔지니어. 콘솔 운용 경험 필수.", location:"노들섬", icon:"🎧" },
  { id:104, title:"분장 아티스트 섭외", field:"분장", type:"단기", org:"무용단 봄", pay:"회당 150,000원", date:"2025.06.20~06.22", desc:"현대무용 공연 분장. 퍼포머 8명.", location:"마포구", icon:"💄" },
];
const initChats = {
  1:[{from:"other",text:"안녕하세요! 드레스 아직 남아있나요?"},{from:"me",text:"네, 아직 있어요!"}],
  101:[{from:"other",text:"조명 디자이너 공고 관련해서 문의드려요."}],
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState("splash");
  const [authMode, setAuthMode] = useState("phone");
  const [authInput, setAuthInput] = useState("");
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState({all:false,service:false,privacy:false,age:false});

  const [screen, setScreen] = useState("home");
  const [mainTab, setMainTab] = useState("items");
  const [btab, setBtab] = useState("home");
  const [selItem, setSelItem] = useState(null);
  const [selJob, setSelJob] = useState(null);
  const [cat, setCat] = useState("전체");
  const [field, setField] = useState("전체");
  const [q, setQ] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [chats, setChats] = useState(initChats);
  const [activeChat, setActiveChat] = useState(null);
  const [chatLabel, setChatLabel] = useState("");
  const [items, setItems] = useState(initItems);
  const [jobs, setJobs] = useState(initJobs);
  const [likes, setLikes] = useState({});
  const [chatList, setChatList] = useState([{id:1,label:"빨간 드레스"},{id:101,label:"조명 디자이너 공고"}]);
  const [postMode, setPostMode] = useState("item");
  const [posted, setPosted] = useState(false);
  const [notify, setNotify] = useState({comment:true,keyword:true,newItem:false,job:true});
  const [kwds, setKwds] = useState(["조명","드레스"]);
  const [newKwd, setNewKwd] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [showRegion, setShowRegion] = useState(false);
  const [form, setForm] = useState({title:"",category:"세트",show:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:""});
  const [jform, setJform] = useState({title:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:""});
  const chatEnd = useRef(null);

  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[chats,screen]);

  const filtItems = useMemo(()=>{
    let l = cat==="전체"?items:items.filter(i=>i.category===cat);
    if(q) l=l.filter(i=>i.title.includes(q)||i.show?.includes(q)||i.region?.includes(q));
    return l;
  },[items,cat,q]);

  const filtJobs = useMemo(()=>{
    let l = field==="전체"?jobs:jobs.filter(j=>j.field===field);
    if(q) l=l.filter(j=>j.title.includes(q)||j.org.includes(q));
    return l;
  },[jobs,field,q]);

  const filtRegions = useMemo(()=>REGIONS.filter(r=>r.includes(regionSearch)),[regionSearch]);

  const go = (s,b)=>{ setScreen(s); if(b!==undefined) setBtab(b); };

  function openChat(id,label) {
    setActiveChat(id); setChatLabel(label); go("chat","chatlist");
    if(!chatList.find(c=>c.id===id)) setChatList(p=>[...p,{id,label}]);
    if(!chats[id]) setChats(p=>({...p,[id]:[]}));
  }

  function sendMsg() {
    if(!chatMsg.trim()) return;
    setChats(p=>({...p,[activeChat]:[...(p[activeChat]||[]),{from:"me",text:chatMsg}]}));
    setChatMsg("");
  }

  function allTerms(v) { setTerms({all:v,service:v,privacy:v,age:v}); }

  function submitItem() {
    if(!form.title) return;
    setItems(p=>[{id:Date.now(),...form,price:form.price?parseInt(form.price):0,image:"📦",seller:"나",si:"나",likes:0},,...p]);
    setForm({title:"",category:"세트",show:"",price:"",desc:"",region:"",contact:"",safeNum:false,tradePlace:""});
    setPosted(true); setTimeout(()=>{setPosted(false);go("home","home");},1200);
  }

  function submitJob() {
    if(!jform.title) return;
    setJobs(p=>[{id:Date.now(),...jform,org:"나",icon:"📋"},...p]);
    setJform({title:"",field:"조명",type:"단기",pay:"",date:"",desc:"",location:""});
    setPosted(true); setTimeout(()=>{setPosted(false);setMainTab("jobs");go("home","home");},1200);
  }

  const inp = {width:"100%",borderRadius:10,border:"0.5px solid #e0e0e0",padding:"10px 12px",fontSize:14,boxSizing:"border-box",outline:"none"};
  const chip = (label,active,fn)=>(
    <button key={label} onClick={fn} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:active?ACCENT:"#e0e0e0",background:active?ACCENT:"#fff",color:active?"#fff":"#555",fontSize:12,cursor:"pointer",fontWeight:active?500:400}}>{label}</button>
  );
  const badge = (t)=>(<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:t==="장기"?"#e8f4fd":"#fff3e0",color:t==="장기"?"#1565c0":"#e65100",fontWeight:500}}>{t}</span>);
  const tb = (t)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 0",cursor:"pointer",fontSize:11,color:btab===t?ACCENT:"#aaa",fontWeight:btab===t?500:400,border:"none",background:"none"});
  const tic = (t)=>({fontSize:22,color:btab===t?ACCENT:"#bbb"});

  // ── AUTH ──
  if(!loggedIn) {
    if(authStep==="splash") return (
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,boxSizing:"border-box"}}>
        <div style={{fontSize:64,marginBottom:16}}>🎭</div>
        <div style={{fontSize:28,fontWeight:600,color:ACCENT,marginBottom:8}}>공쓰재</div>
        <div style={{fontSize:13,color:"#999",textAlign:"center",lineHeight:1.7,marginBottom:48}}>공연에 쓰고 남은 물건과 일자리를<br/>나누는 공연인들의 플랫폼</div>
        <button onClick={()=>setAuthStep("login")} style={{width:"100%",height:50,borderRadius:14,border:"none",background:ACCENT,color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:12}}>시작하기</button>
        <button onClick={()=>setAuthStep("login")} style={{width:"100%",height:50,borderRadius:14,border:`1px solid ${ACCENT}`,background:"#fff",color:ACCENT,fontSize:15,fontWeight:500,cursor:"pointer"}}>이미 계정이 있어요</button>
      </div>
    );

    if(authStep==="login") return (
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",marginBottom:24,alignSelf:"flex-start"}}><i className="ti ti-arrow-left"/></button>
        <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>안녕하세요!</div>
        <div style={{fontSize:13,color:"#999",marginBottom:28}}>전화번호 또는 이메일로 시작하세요</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["phone","📱 전화번호"],["email","✉️ 이메일"]].map(([t,l])=>(
            <button key={t} onClick={()=>{setAuthMode(t);setAuthInput("");}} style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${authMode===t?ACCENT:"#e0e0e0"}`,background:authMode===t?LIGHT:"#fff",color:authMode===t?ACCENT:"#888",fontSize:13,cursor:"pointer",fontWeight:authMode===t?500:400}}>{l}</button>
          ))}
        </div>
        <input value={authInput} onChange={e=>setAuthInput(e.target.value)} placeholder={authMode==="phone"?"010-0000-0000":"이메일 주소"} type={authMode==="phone"?"tel":"email"} style={{...inp,marginBottom:12}}/>
        <button onClick={()=>{if(authInput.length>=6)setAuthStep("verify");}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:authInput.length>=6?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer"}}>인증번호 받기</button>
        <div style={{textAlign:"center",fontSize:11,color:"#ccc",marginTop:16}}>계속하면 공쓰재의 이용약관에 동의하게 됩니다</div>
      </div>
    );

    if(authStep==="verify") return (
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
        <button onClick={()=>setAuthStep("login")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555",marginBottom:24,alignSelf:"flex-start"}}><i className="ti ti-arrow-left"/></button>
        <div style={{fontSize:22,fontWeight:600,marginBottom:6}}>인증번호 입력</div>
        <div style={{fontSize:13,color:"#999",marginBottom:32}}>{authInput}로 발송된 인증번호 4자리를 입력하세요</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:24}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:60,height:60,borderRadius:14,border:`2px solid ${code.length>i?ACCENT:"#e0e0e0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:600,color:ACCENT,background:code.length>i?LIGHT:"#fff"}}>
              {code[i]||""}
            </div>
          ))}
        </div>
        <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="인증번호 4자리" type="tel" style={{...inp,textAlign:"center",fontSize:20,letterSpacing:12,marginBottom:12}}/>
        <button onClick={()=>setAuthStep("terms")} style={{width:"100%",height:48,borderRadius:12,border:"none",background:code.length===4?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:12}}>확인</button>
        <button style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer"}}>인증번호 재발송</button>
      </div>
    );

    if(authStep==="terms") return (
      <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,padding:24,boxSizing:"border-box",display:"flex",flexDirection:"column"}}>
        <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>약관 동의</div>
        <div style={{fontSize:13,color:"#999",marginBottom:20}}>서비스 이용을 위해 약관에 동의해주세요</div>
        <div onClick={()=>allTerms(!terms.all)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:LIGHT,borderRadius:12,marginBottom:14,cursor:"pointer"}}>
          <div style={{width:22,height:22,borderRadius:22,background:terms.all?ACCENT:"#fff",border:`1.5px solid ${terms.all?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {terms.all&&<i className="ti ti-check" style={{fontSize:13,color:"#fff"}}/>}
          </div>
          <span style={{fontSize:14,fontWeight:500,color:ACCENT}}>전체 동의</span>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {[
            {k:"service",l:"[필수] 중고물품 거래 이용약관",d:"공쓰재 플랫폼 내 중고물품 거래 기본 약관입니다. 거래 당사자 간 책임, 분쟁 해결, 금지 품목 등을 규정합니다."},
            {k:"privacy",l:"[필수] 개인정보 수집 및 이용 동의",d:"성명, 연락처, 거래 이력 등 개인정보를 공쓰재 서비스 제공 목적으로 수집·이용합니다. 제3자 제공 없음."},
            {k:"age",l:"[필수] 만 14세 이상 확인",d:"본 서비스는 만 14세 이상만 이용 가능합니다."},
          ].map(({k,l,d})=>(
            <div key={k} style={{marginBottom:10}}>
              <div onClick={()=>setTerms(p=>({...p,[k]:!p[k],all:false}))} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 0"}}>
                <div style={{width:20,height:20,borderRadius:20,background:terms[k]?ACCENT:"#fff",border:`1.5px solid ${terms[k]?ACCENT:"#ccc"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {terms[k]&&<i className="ti ti-check" style={{fontSize:12,color:"#fff"}}/>}
                </div>
                <span style={{fontSize:13,color:"#333"}}>{l}</span>
              </div>
              <div style={{fontSize:11,color:"#aaa",padding:"0 0 4px 30px",lineHeight:1.6}}>{d}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>{if(terms.service&&terms.privacy&&terms.age)setLoggedIn(true);}} style={{width:"100%",height:48,borderRadius:12,border:"none",background:(terms.service&&terms.privacy&&terms.age)?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginTop:14}}>동의하고 시작하기</button>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div style={{maxWidth:390,margin:"0 auto",fontFamily:"sans-serif",position:"relative",border:"1px solid #e5e5e5",borderRadius:24,overflow:"hidden",background:"#fff",height:700,display:"flex",flexDirection:"column"}}>

      {/* HOME */}
      {screen==="home"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"18px 16px 0",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:20,fontWeight:500,color:ACCENT}}>공쓰재</div>
                <div style={{fontSize:11,color:"#999",marginTop:1}}>공연에 쓰고 남은 물건과 일자리를 나눕니다</div>
              </div>
              <button onClick={()=>go("notify","")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}}><i className="ti ti-bell"/></button>
            </div>
            <div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:12,padding:"9px 12px",marginBottom:12,gap:8}}>
              <i className="ti ti-search" style={{fontSize:16,color:"#aaa"}}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder={mainTab==="items"?"물건, 공연명, 지역 검색":"공고, 분야, 단체 검색"} style={{flex:1,border:"none",background:"none",fontSize:13,outline:"none"}}/>
              {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:16,padding:0}}><i className="ti ti-x"/></button>}
            </div>
            <div style={{display:"flex"}}>
              {[["items","중고 물건"],["jobs","일자리"]].map(([t,l])=>(
                <button key={t} onClick={()=>{setMainTab(t);setQ("");setCat("전체");setField("전체");}} style={{flex:1,padding:"8px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:mainTab===t?500:400,color:mainTab===t?ACCENT:"#aaa",borderBottom:mainTab===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{padding:"8px 16px",borderBottom:"0.5px solid #f5f5f5",overflowX:"auto",display:"flex",gap:6,flexShrink:0}}>
            {mainTab==="items"?ITEM_CATS.map(c=>chip(c,cat===c,()=>setCat(c))):JOB_FIELDS.map(f=>chip(f,field===f,()=>setField(f)))}
          </div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            {mainTab==="items"&&filtItems.map(item=>(
              <div key={item.id} onClick={()=>{setSelItem(item);go("detail");}} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}>
                <div style={{width:78,height:78,borderRadius:12,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{item.image}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a",lineHeight:1.3}}>{item.title}</div>
                    <button onClick={e=>{e.stopPropagation();setLikes(p=>({...p,[item.id]:!p[item.id]}));}} style={{background:"none",border:"none",cursor:"pointer",padding:0,marginLeft:6}}>
                      <i className="ti ti-heart" style={{fontSize:18,color:likes[item.id]?"#e25":"#ddd"}}/>
                    </button>
                  </div>
                  <div style={{fontSize:11,color:"#bbb",marginTop:2}}>
                    <i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{item.region}
                  </div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:1}}>{item.show}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
                    <span style={{fontSize:13,fontWeight:500,color:item.price===0?ACCENT:"#1a1a1a"}}>{item.price===0?"무료 나눔":`${item.price.toLocaleString()}원`}</span>
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
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>{badge(job.type)}<span style={{fontSize:11,color:"#bbb"}}>{job.field}</span></div>
                    <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a",marginBottom:2}}>{job.title}</div>
                    <div style={{fontSize:12,color:"#888"}}>{job.org} · {job.location}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                      <span style={{fontSize:12,color:ACCENT,fontWeight:500}}>{job.pay}</span>
                      <span style={{fontSize:11,color:"#bbb"}}>{job.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {((mainTab==="items"&&filtItems.length===0)||(mainTab==="jobs"&&filtJobs.length===0))&&(
              <div style={{textAlign:"center",color:"#ccc",marginTop:60,fontSize:14}}>검색 결과가 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* ITEM DETAIL */}
      {screen==="detail"&&selItem&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("home","home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
            <span style={{fontWeight:500,fontSize:15}}>물건 상세</span>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{height:200,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72}}>{selItem.image}</div>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:500}}>{selItem.title}</div>
                  <div style={{fontSize:11,color:"#bbb",marginTop:3}}><i className="ti ti-map-pin" style={{fontSize:10,marginRight:2}}/>{selItem.region} · {selItem.category}</div>
                </div>
                <span style={{fontSize:16,fontWeight:500,color:selItem.price===0?ACCENT:"#1a1a1a",marginLeft:8,whiteSpace:"nowrap"}}>{selItem.price===0?"무료 나눔":`${selItem.price.toLocaleString()}원`}</span>
              </div>
              <div style={{fontSize:11,color:"#aaa",marginBottom:12}}>{selItem.show}</div>
              <div style={{padding:14,background:"#fafafa",borderRadius:12,marginBottom:12}}>
                <p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selItem.desc}</p>
              </div>
              <div style={{padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12,marginBottom:12}}>
                <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>연락처</div>
                <div style={{fontSize:14,fontWeight:500,color:"#1a1a1a",display:"flex",alignItems:"center",gap:8}}>
                  <i className="ti ti-phone" style={{fontSize:15,color:ACCENT}}/>
                  {selItem.contact}
                  {selItem.safeNum&&<span style={{fontSize:10,background:LIGHT,color:ACCENT,padding:"2px 8px",borderRadius:10,fontWeight:500}}>안심번호</span>}
                </div>
              </div>
              <div style={{border:"0.5px solid #f0f0f0",borderRadius:12,overflow:"hidden",marginBottom:12}}>
                <div style={{padding:"12px 14px 8px"}}>
                  <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>거래 희망 장소</div>
                  <div style={{fontSize:14,color:"#1a1a1a",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-map-pin" style={{fontSize:15,color:ACCENT}}/>{selItem.tradePlace}</div>
                </div>
                <div style={{height:110,background:LIGHT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                  <div style={{fontSize:28}}>🗺️</div>
                  <a href={`https://map.naver.com/v5/search/${encodeURIComponent(selItem.tradePlace)}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:ACCENT,textDecoration:"none",border:`1px solid ${ACCENT}`,padding:"4px 14px",borderRadius:12}}>지도에서 보기</a>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"0.5px solid #f0f0f0",borderRadius:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:500,fontSize:14}}>{selItem.si}</div>
                <div><div style={{fontSize:13,fontWeight:500}}>{selItem.seller}</div><div style={{fontSize:11,color:"#aaa"}}>판매자</div></div>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 16px",borderTop:"0.5px solid #f0f0f0",display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>setLikes(p=>({...p,[selItem.id]:!p[selItem.id]}))} style={{width:44,height:44,borderRadius:12,border:`1px solid ${likes[selItem.id]?"#e25":"#e0e0e0"}`,background:likes[selItem.id]?"#fff0f2":"#fff",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="ti ti-heart" style={{color:likes[selItem.id]?"#e25":"#bbb"}}/>
            </button>
            <button onClick={()=>openChat(selItem.id,selItem.title)} style={{flex:1,height:44,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer"}}>채팅으로 문의하기</button>
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
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:16}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}>
                <div style={{width:52,height:52,borderRadius:14,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{selJob.icon}</div>
                <div><div style={{display:"flex",gap:6,marginBottom:4}}>{badge(selJob.type)}</div><div style={{fontSize:17,fontWeight:500}}>{selJob.title}</div></div>
              </div>
              {[["단체",selJob.org],["지역",selJob.location],["기간",selJob.date],["보수",selJob.pay]].map(([k,v])=>(
                <div key={k} style={{display:"flex",padding:"10px 0",borderBottom:"0.5px solid #f5f5f5"}}>
                  <span style={{fontSize:13,color:"#aaa",width:48}}>{k}</span>
                  <span style={{fontSize:13,fontWeight:k==="보수"?500:400,color:k==="보수"?ACCENT:"#1a1a1a"}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:16,padding:14,background:"#fafafa",borderRadius:12}}>
                <p style={{margin:0,fontSize:14,lineHeight:1.7,color:"#333"}}>{selJob.desc}</p>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 16px",borderTop:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>openChat(selJob.id,selJob.title)} style={{width:"100%",height:44,borderRadius:12,border:"none",background:ACCENT,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer"}}>지원 / 문의 채팅</button>
          </div>
        </div>
      )}

      {/* POST */}
      {screen==="post"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("home","home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-x"/></button>
            <span style={{fontWeight:500,fontSize:15}}>올리기</span>
          </div>
          <div style={{display:"flex",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            {[["item","중고 물건"],["job","일자리 공고"]].map(([t,l])=>(
              <button key={t} onClick={()=>setPostMode(t)} style={{flex:1,padding:"10px 0",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:postMode===t?500:400,color:postMode===t?ACCENT:"#aaa",borderBottom:postMode===t?`2px solid ${ACCENT}`:"2px solid transparent"}}>{l}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16}}>
            {postMode==="item"?(
              <>
                <div style={{height:90,background:LIGHT,borderRadius:12,border:`1.5px dashed ${MID}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:14,color:ACCENT}}>
                  <i className="ti ti-camera" style={{fontSize:24}}/><div style={{fontSize:12,marginTop:4}}>사진 추가</div>
                </div>
                {[{l:"제목",k:"title",ph:"예: 나무 의자 세트"},{l:"공연/전시명",k:"show",ph:"예: 달빛 소나타 2024"},{l:"가격 (0이면 무료 나눔)",k:"price",ph:"0",t:"number"}].map(f=>(
                  <div key={f.k} style={{marginBottom:12}}>
                    <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div>
                    <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} type={f.t||"text"} style={inp}/>
                  </div>
                ))}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>지역 (기초단위)</div>
                  <div style={{position:"relative"}}>
                    <input value={form.region} readOnly onClick={()=>setShowRegion(true)} placeholder="지역 선택" style={{...inp,cursor:"pointer",background:showRegion?"#fafafa":"#fff"}}/>
                    {showRegion&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e0e0e0",borderRadius:10,zIndex:100,maxHeight:160,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
                        <div style={{padding:"8px 12px",borderBottom:"0.5px solid #f0f0f0",position:"sticky",top:0,background:"#fff"}}>
                          <input value={regionSearch} onChange={e=>setRegionSearch(e.target.value)} placeholder="지역 검색" style={{width:"100%",border:"none",outline:"none",fontSize:13}} autoFocus/>
                        </div>
                        {filtRegions.slice(0,20).map(r=>(
                          <div key={r} onClick={()=>{setForm(p=>({...p,region:r}));setShowRegion(false);setRegionSearch("");}} style={{padding:"10px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid #f9f9f9",color:"#333"}}>{r}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>연락처</div>
                  <input value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="010-0000-0000" style={{...inp,marginBottom:6}}/>
                  <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"#666"}}>
                    <input type="checkbox" checked={form.safeNum} onChange={e=>setForm(p=>({...p,safeNum:e.target.checked}))}/>
                    안심번호로 표시하기 (실제 번호 숨김)
                  </label>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>거래 희망 장소</div>
                  <input value={form.tradePlace} onChange={e=>setForm(p=>({...p,tradePlace:e.target.value}))} placeholder="예: 대학로 마로니에공원 앞" style={inp}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>설명</div>
                  <textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="물건 상태, 주의사항 등" rows={3} style={{...inp,resize:"none"}}/>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>카테고리</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {["세트","소품","장비","기타"].map(c=>(
                      <button key={c} onClick={()=>setForm(p=>({...p,category:c}))} style={{padding:"5px 14px",borderRadius:20,border:"0.5px solid",borderColor:form.category===c?ACCENT:"#e0e0e0",background:form.category===c?ACCENT:"#fff",color:form.category===c?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{c}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitItem} style={{width:"100%",height:46,borderRadius:12,border:"none",background:form.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:16}}>올리기</button>
              </>
            ):(
              <>
                {[{l:"공고 제목",k:"title",ph:"예: 조명 디자이너 구합니다"},{l:"단체/기관명",k:"org",ph:"예: 극단 파도"},{l:"지역",k:"location",ph:"예: 대학로"},{l:"기간",k:"date",ph:"예: 2025.07.01~07.10"},{l:"보수",k:"pay",ph:"예: 협의 / 일 80,000원"}].map(f=>(
                  <div key={f.k} style={{marginBottom:12}}>
                    <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>{f.l}</div>
                    <input value={jform[f.k]||""} onChange={e=>setJform(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/>
                  </div>
                ))}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>공고 내용</div>
                  <textarea value={jform.desc} onChange={e=>setJform(p=>({...p,desc:e.target.value}))} placeholder="모집 조건, 담당 업무 등" rows={3} style={{...inp,resize:"none"}}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>분야</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {["조명","무대","음향","분장","영상","기타"].map(f=>(
                      <button key={f} onClick={()=>setJform(p=>({...p,field:f}))} style={{padding:"5px 12px",borderRadius:20,border:"0.5px solid",borderColor:jform.field===f?ACCENT:"#e0e0e0",background:jform.field===f?ACCENT:"#fff",color:jform.field===f?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:"#666",marginBottom:4,fontWeight:500}}>고용 형태</div>
                  <div style={{display:"flex",gap:6}}>
                    {["단기","장기"].map(t=>(
                      <button key={t} onClick={()=>setJform(p=>({...p,type:t}))} style={{padding:"5px 16px",borderRadius:20,border:"0.5px solid",borderColor:jform.type===t?ACCENT:"#e0e0e0",background:jform.type===t?ACCENT:"#fff",color:jform.type===t?"#fff":"#555",fontSize:12,cursor:"pointer"}}>{t}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitJob} style={{width:"100%",height:46,borderRadius:12,border:"none",background:jform.title?ACCENT:"#ddd",color:"#fff",fontSize:15,fontWeight:500,cursor:"pointer",marginBottom:16}}>공고 올리기</button>
              </>
            )}
            {posted&&<div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(45,106,79,0.95)",color:"#fff",padding:"12px 24px",borderRadius:14,fontSize:14,fontWeight:500,zIndex:200}}>✓ 등록 완료!</div>}
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      {screen==="chatlist"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"20px 16px 14px",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:500}}>채팅</div>
          </div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            {chatList.map(({id,label})=>{
              const msgs=chats[id]||[]; const last=msgs[msgs.length-1];
              return(
                <div key={id} onClick={()=>openChat(id,label)} style={{display:"flex",gap:12,padding:"14px 16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer",alignItems:"center"}}>
                  <div style={{width:46,height:46,borderRadius:12,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{id>=100?"💼":"📦"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div style={{fontSize:13,fontWeight:500}}>{label}</div>
                      <div style={{fontSize:11,color:"#bbb"}}>방금 전</div>
                    </div>
                    <div style={{fontSize:12,color:"#999",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{last?last.text:"새 채팅"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHAT */}
      {screen==="chat"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <button onClick={()=>go("chatlist","chatlist")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#555"}}><i className="ti ti-arrow-left"/></button>
            <div><div style={{fontSize:13,fontWeight:500}}>{chatLabel}</div><div style={{fontSize:11,color:"#aaa"}}>채팅</div></div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {(chats[activeChat]||[]).map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.from==="me"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"72%",padding:"9px 13px",borderRadius:msg.from==="me"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:msg.from==="me"?ACCENT:"#f3f3f3",color:msg.from==="me"?"#fff":"#1a1a1a",fontSize:13,lineHeight:1.5}}>{msg.text}</div>
              </div>
            ))}
            {!(chats[activeChat]||[]).length&&<div style={{textAlign:"center",color:"#ccc",fontSize:13,marginTop:40}}>메시지를 보내보세요</div>}
            <div ref={chatEnd}/>
          </div>
          {/* ── 채팅 입력창 (고정) ── */}
          <div style={{flexShrink:0,padding:"10px 12px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,alignItems:"center",background:"#fff"}}>
            <input
              value={chatMsg}
              onChange={e=>setChatMsg(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendMsg()}
              placeholder="메시지를 입력하세요"
              style={{flex:1,borderRadius:22,border:"1px solid #e0e0e0",padding:"10px 16px",fontSize:13,outline:"none",background:"#fafafa"}}
            />
            <button onClick={sendMsg} style={{width:42,height:42,borderRadius:"50%",border:"none",background:chatMsg.trim()?ACCENT:"#ddd",color:"#fff",fontSize:19,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <i className="ti ti-send"/>
            </button>
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
            <div style={{fontSize:12,color:"#aaa",fontWeight:500,marginBottom:10}}>푸시 알림</div>
            {[{k:"comment",l:"내 게시글에 댓글",d:"내 글에 댓글이 달리면 알림"},{k:"keyword",l:"키워드 알림",d:"등록한 키워드 물건이 올라오면 알림"},{k:"newItem",l:"새 물건 등록",d:"관심 카테고리 새 물건 알림"},{k:"job",l:"일자리 공고",d:"새 일자리 공고 알림"}].map(({k,l,d})=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"0.5px solid #f5f5f5"}}>
                <div><div style={{fontSize:14,color:"#1a1a1a"}}>{l}</div><div style={{fontSize:11,color:"#aaa",marginTop:2}}>{d}</div></div>
                <div onClick={()=>setNotify(p=>({...p,[k]:!p[k]}))} style={{width:46,height:27,borderRadius:14,background:notify[k]?ACCENT:"#ddd",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,left:notify[k]?21:3,width:21,height:21,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/>
                </div>
              </div>
            ))}
            <div style={{fontSize:12,color:"#aaa",fontWeight:500,marginTop:22,marginBottom:10}}>키워드 관리</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {kwds.map(kw=>(
                <div key={kw} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:LIGHT,borderRadius:20}}>
                  <span style={{fontSize:13,color:ACCENT}}>{kw}</span>
                  <button onClick={()=>setKwds(p=>p.filter(k=>k!==kw))} style={{background:"none",border:"none",cursor:"pointer",color:ACCENT,padding:0,fontSize:15,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={newKwd} onChange={e=>setNewKwd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} placeholder="키워드 추가 (예: 조명, 의상)" style={{flex:1,borderRadius:10,border:"0.5px solid #e0e0e0",padding:"9px 12px",fontSize:13,outline:"none"}}/>
              <button onClick={()=>{if(newKwd.trim()){setKwds(p=>[...p,newKwd.trim()]);setNewKwd("");}}} style={{padding:"9px 16px",borderRadius:10,border:"none",background:ACCENT,color:"#fff",fontSize:13,cursor:"pointer"}}>추가</button>
            </div>
            <div style={{marginTop:18,padding:14,background:"#fff8e1",borderRadius:12}}>
              <div style={{fontSize:12,color:"#f57c00",fontWeight:500,marginBottom:4}}>📱 실제 푸시 알림 안내</div>
              <div style={{fontSize:11,color:"#999",lineHeight:1.6}}>앱을 홈 화면에 설치하고 알림 권한을 허용하면 작동합니다. 실제 발송은 백엔드 서버 연동 후 활성화됩니다.</div>
            </div>
          </div>
        </div>
      )}

      {/* MY */}
      {screen==="mypage"&&(
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{padding:"20px 16px 14px",borderBottom:"0.5px solid #f0f0f0",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:500}}>마이페이지</div>
          </div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:64}}>
            <div style={{padding:16,display:"flex",alignItems:"center",gap:14,borderBottom:"0.5px solid #f5f5f5"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:22,fontWeight:600}}>나</div>
              <div><div style={{fontSize:16,fontWeight:500}}>공쓰재 사용자</div><div style={{fontSize:12,color:"#aaa",marginTop:2}}>{authInput||"010-****-****"}</div></div>
            </div>
            {[["나의 게시글","ti-file-text"],["찜한 물건","ti-heart"],["거래 내역","ti-repeat"],["알림 설정","ti-bell"]].map(([l,ic])=>(
              <div key={l} onClick={()=>{if(l==="알림 설정")go("notify","");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",borderBottom:"0.5px solid #f5f5f5",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><i className={`ti ${ic}`} style={{fontSize:18,color:"#555"}}/><span style={{fontSize:14,color:"#1a1a1a"}}>{l}</span></div>
                <i className="ti ti-chevron-right" style={{fontSize:16,color:"#ccc"}}/>
              </div>
            ))}
            <div onClick={()=>{setLoggedIn(false);setAuthStep("splash");}} style={{display:"flex",alignItems:"center",gap:10,padding:"16px",cursor:"pointer"}}>
              <i className="ti ti-logout" style={{fontSize:18,color:"#e25"}}/><span style={{fontSize:14,color:"#e25"}}>로그아웃</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:64,background:"#fff",borderTop:"0.5px solid #f0f0f0",display:"flex",alignItems:"center",zIndex:50}}>
        <button style={tb("home")} onClick={()=>go("home","home")}><i className="ti ti-home" style={tic("home")}/>홈</button>
        <button style={tb("post")} onClick={()=>go("post","post")}>
          <div style={{width:44,height:44,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-24}}>
            <i className="ti ti-plus" style={{fontSize:22,color:"#fff"}}/>
          </div>
          <span style={{marginTop:2}}>올리기</span>
        </button>
        <button style={tb("chatlist")} onClick={()=>go("chatlist","chatlist")}><i className="ti ti-message-circle" style={tic("chatlist")}/>채팅</button>
        <button style={tb("mypage")} onClick={()=>go("mypage","mypage")}><i className="ti ti-user" style={tic("mypage")}/>MY</button>
      </div>
    </div>
  );
}
