import { useState, useMemo } from "react";

const ACCENT = "#2D6A4F";
const ACCENT_LIGHT = "#f0f7f4";
const ACCENT_MID = "#52b788";

const sampleItems = [
  { id: 1, title: "빨간 드레스 (2벌)", category: "의상", show: "더 헬리콥터쇼 2024", price: 0, image: "🎭", desc: "공연 종료 후 남은 빨간 드레스 2벌. 사이즈 S/M. 세탁 완료.", seller: "극단 파도", sellerInitial: "파", likes: 12 },
  { id: 2, title: "소형 스팟 조명 x3", category: "조명", show: "달빛 소나타 전시", price: 15000, image: "💡", desc: "전시 철수 후 남은 LED 스팟 조명 3개. 상태 양호.", seller: "아트스페이스 을지", sellerInitial: "을", likes: 8 },
  { id: 3, title: "나무 의자 세트 (6개)", category: "세트", show: "시간의 방 연극제", price: 0, image: "🪑", desc: "무대 소품용 나무 의자 6개. 픽업 가능 지역: 대학로.", seller: "극단 숲", sellerInitial: "숲", likes: 21 },
  { id: 4, title: "한복 치마 (연두색)", category: "의상", show: "춘향 리믹스", price: 8000, image: "👗", desc: "한복 작업 후 남은 치마 1점. 허리 60cm. 상태 최상.", seller: "무용단 봄", sellerInitial: "봄", likes: 5 },
  { id: 5, title: "대형 현수막 천 (3m×5m)", category: "기타", show: "인디뮤직위크 2024", price: 0, image: "🏮", desc: "행사 후 남은 대형 천 소재 현수막. DIY 배경으로 좋아요.", seller: "문화공간 노들", sellerInitial: "노", likes: 3 },
  { id: 6, title: "분장 소품 세트", category: "소품", show: "할로윈 퍼포먼스", price: 5000, image: "🎨", desc: "분장용 왁스, 크레용, 가발 포함. 대부분 미개봉.", seller: "극단 파도", sellerInitial: "파", likes: 17 },
];

const sampleJobs = [
  { id: 101, title: "조명 디자이너 구합니다", field: "조명", type: "단기", org: "극단 파도", pay: "협의", date: "2025.06.14~06.28", desc: "소극장 연극 조명 설계 및 현장 운영. 경력 2년 이상 우대.", location: "대학로", icon: "💡" },
  { id: 102, title: "무대 세트 제작 스태프", field: "무대", type: "단기", org: "아트스페이스 을지", pay: "일 80,000원", date: "2025.06.10~06.13", desc: "전시 오픈 전 세트 설치 및 철수 보조 스태프를 모집합니다.", location: "을지로", icon: "🏗️" },
  { id: 103, title: "음향 엔지니어 (상주)", field: "음향", type: "장기", org: "문화공간 노들", pay: "월 230만원~", date: "2025.07.01~", desc: "공연장 상주 음향 엔지니어. 콘솔 운용 경험 필수.", location: "노들섬", icon: "🎧" },
  { id: 104, title: "분장 아티스트 섭외", field: "분장", type: "단기", org: "무용단 봄", pay: "회당 150,000원", date: "2025.06.20~06.22", desc: "현대무용 공연 분장. 퍼포머 8명. 경력자 우대.", location: "마포구", icon: "💄" },
  { id: 105, title: "무대 감독 어시스턴트", field: "무대", type: "단기", org: "극단 숲", pay: "협의", date: "2025.07.05~07.20", desc: "연극 공연 무대 감독 어시스턴트. 전반적인 공연 운영 보조.", location: "대학로", icon: "🎬" },
  { id: 106, title: "영상 VJ (라이브)", field: "영상", type: "단기", org: "인디뮤직위크", pay: "일 100,000원", date: "2025.08.01~08.03", desc: "야외 음악 페스티벌 실시간 영상 송출 및 믹싱 담당.", location: "한강공원", icon: "📹" },
];

const ITEM_CATS = ["전체", "의상", "조명", "세트", "소품", "기타"];
const JOB_FIELDS = ["전체", "조명", "무대", "음향", "분장", "영상", "기타"];
const JOB_TYPES = ["전체", "단기", "장기"];

const sampleChats = {
  1: [{ from: "other", text: "안녕하세요! 드레스 아직 남아있나요?" }, { from: "me", text: "네, 아직 있어요!" }],
  101: [{ from: "other", text: "조명 디자이너 공고 관련해서 문의드려도 될까요?" }],
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mainTab, setMainTab] = useState("items"); // items | jobs
  const [bottomTab, setBottomTab] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeCat, setActiveCat] = useState("전체");
  const [activeField, setActiveField] = useState("전체");
  const [activeType, setActiveType] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chats, setChats] = useState(sampleChats);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatLabel, setActiveChatLabel] = useState("");
  const [items, setItems] = useState(sampleItems);
  const [jobs, setJobs] = useState(sampleJobs);
  const [likes, setLikes] = useState({});
  const [form, setForm] = useState({ title: "", category: "의상", show: "", price: "", desc: "" });
  const [jobForm, setJobForm] = useState({ title: "", field: "조명", type: "단기", pay: "", date: "", desc: "", location: "" });
  const [showPosted, setShowPosted] = useState(false);
  const [chatList, setChatList] = useState([{ id: 1, label: "빨간 드레스" }, { id: 101, label: "조명 디자이너 공고" }]);
  const [postMode, setPostMode] = useState("item"); // item | job

  const filteredItems = useMemo(() => {
    let list = activeCat === "전체" ? items : items.filter(i => i.category === activeCat);
    if (searchQuery) list = list.filter(i => i.title.includes(searchQuery) || i.show.includes(searchQuery) || i.desc.includes(searchQuery));
    return list;
  }, [items, activeCat, searchQuery]);

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (activeField !== "전체") list = list.filter(j => j.field === activeField);
    if (activeType !== "전체") list = list.filter(j => j.type === activeType);
    if (searchQuery) list = list.filter(j => j.title.includes(searchQuery) || j.org.includes(searchQuery) || j.desc.includes(searchQuery) || j.field.includes(searchQuery));
    return list;
  }, [jobs, activeField, activeType, searchQuery]);

  const allResults = useMemo(() => {
    if (!searchQuery) return [];
    return [
      ...filteredItems.map(i => ({ ...i, _kind: "item" })),
      ...filteredJobs.map(j => ({ ...j, _kind: "job" })),
    ];
  }, [searchQuery, filteredItems, filteredJobs]);

  function openChat(id, label) {
    setActiveChat(id); setActiveChatLabel(label); setScreen("chat");
    if (!chatList.find(c => c.id === id)) setChatList(prev => [...prev, { id, label }]);
    if (!chats[id]) setChats(prev => ({ ...prev, [id]: [] }));
  }

  function sendMsg() {
    if (!chatInput.trim()) return;
    setChats(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), { from: "me", text: chatInput }] }));
    setChatInput("");
  }

  function toggleLike(id, e) { e && e.stopPropagation(); setLikes(prev => ({ ...prev, [id]: !prev[id] })); }

  function submitItem() {
    if (!form.title || !form.show) return;
    setItems(prev => [{ id: Date.now(), ...form, price: form.price ? parseInt(form.price) : 0, image: "📦", seller: "나", sellerInitial: "나", likes: 0 }, ...prev]);
    setForm({ title: "", category: "의상", show: "", price: "", desc: "" });
    setShowPosted(true); setTimeout(() => { setShowPosted(false); setBottomTab("home"); setScreen("home"); setMainTab("items"); }, 1200);
  }

  function submitJob() {
    if (!jobForm.title || !jobForm.field) return;
    setJobs(prev => [{ id: Date.now(), ...jobForm, org: "나", icon: "📋" }, ...prev]);
    setJobForm({ title: "", field: "조명", type: "단기", pay: "", date: "", desc: "", location: "" });
    setShowPosted(true); setTimeout(() => { setShowPosted(false); setBottomTab("home"); setScreen("home"); setMainTab("jobs"); }, 1200);
  }

  const tabBtn = (t) => ({
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    gap: 2, padding: "8px 0", cursor: "pointer", fontSize: 11,
    color: bottomTab === t ? ACCENT : "#aaa", fontWeight: bottomTab === t ? 500 : 400, border: "none", background: "none"
  });
  const tabIcon = (t) => ({ fontSize: 22, color: bottomTab === t ? ACCENT : "#bbb" });

  const filterChip = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "0.5px solid",
      borderColor: active ? ACCENT : "#e0e0e0", background: active ? ACCENT : "#fff",
      color: active ? "#fff" : "#555", fontSize: 12, cursor: "pointer", fontWeight: active ? 500 : 400
    }}>{label}</button>
  );

  const typeBadge = (type) => (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: type === "장기" ? "#e8f4fd" : "#fff3e0", color: type === "장기" ? "#1565c0" : "#e65100", fontWeight: 500 }}>{type}</span>
  );

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", fontFamily: "sans-serif", position: "relative", border: "1px solid #e5e5e5", borderRadius: 24, overflow: "hidden", background: "#fff", minHeight: 700 }}>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          {/* Header */}
          <div style={{ padding: "18px 16px 0", borderBottom: "0.5px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 500, color: ACCENT }}>공쓰재</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>공연에 쓰고 남은 물건과 일자리를 나눕니다</div>
              </div>
              <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}><i className="ti ti-bell" /></button>
            </div>

            {/* Search bar */}
            <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 12, padding: "9px 12px", marginBottom: 12, gap: 8 }}>
              <i className="ti ti-search" style={{ fontSize: 16, color: "#aaa" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)} onBlur={() => setTimeout(() => setSearchFocus(false), 100)}
                placeholder={mainTab === "items" ? "물건, 공연명 검색" : "공고, 분야, 단체 검색"}
                style={{ flex: 1, border: "none", background: "none", fontSize: 13, outline: "none", color: "#1a1a1a" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 16, padding: 0 }}><i className="ti ti-x" /></button>}
            </div>

            {/* Main tab */}
            <div style={{ display: "flex", gap: 0, borderBottom: "none", marginBottom: 0 }}>
              {[["items", "중고 물건"], ["jobs", "일자리"]].map(([t, l]) => (
                <button key={t} onClick={() => { setMainTab(t); setSearchQuery(""); setActiveCat("전체"); setActiveField("전체"); setActiveType("전체"); }}
                  style={{ flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: mainTab === t ? 500 : 400, color: mainTab === t ? ACCENT : "#aaa", borderBottom: mainTab === t ? `2px solid ${ACCENT}` : "2px solid transparent" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: "8px 16px 8px", borderBottom: "0.5px solid #f5f5f5", overflowX: "auto", display: "flex", gap: 6 }}>
            {mainTab === "items"
              ? ITEM_CATS.map(c => filterChip(c, activeCat === c, () => setActiveCat(c)))
              : <>
                  {JOB_FIELDS.map(f => filterChip(f, activeField === f, () => setActiveField(f)))}
                  <div style={{ width: 1, background: "#e0e0e0", flexShrink: 0, margin: "4px 4px" }} />
                  {JOB_TYPES.map(t => filterChip(t, activeType === t, () => setActiveType(t)))}
                </>
            }
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
            {searchQuery && (
              <div style={{ padding: "8px 16px 0", fontSize: 12, color: "#999" }}>
                검색 결과 {allResults.length}건
              </div>
            )}

            {mainTab === "items" && filteredItems.map(item => (
              <div key={item.id} onClick={() => { setSelectedItem(item); setScreen("detail"); }} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid #f5f5f5", cursor: "pointer" }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>{item.image}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.3 }}>{item.title}</div>
                    <button onClick={e => toggleLike(item.id, e)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 8 }}>
                      <i className={`ti ti-heart`} style={{ fontSize: 18, color: likes[item.id] ? "#e25" : "#ddd" }} />
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "#999", margin: "3px 0" }}>{item.show}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: item.price === 0 ? ACCENT : "#1a1a1a" }}>{item.price === 0 ? "무료 나눔" : `${item.price.toLocaleString()}원`}</span>
                    <span style={{ fontSize: 10, color: "#bbb" }}><i className="ti ti-heart" style={{ fontSize: 12, verticalAlign: -1, marginRight: 2 }} />{item.likes + (likes[item.id] ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
            ))}

            {mainTab === "jobs" && filteredJobs.map(job => (
              <div key={job.id} onClick={() => { setSelectedJob(job); setScreen("jobdetail"); }} style={{ padding: "14px 16px", borderBottom: "0.5px solid #f5f5f5", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{job.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      {typeBadge(job.type)}
                      <span style={{ fontSize: 11, color: "#bbb" }}>{job.field}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 2 }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{job.org} · {job.location}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: ACCENT, fontWeight: 500 }}>{job.pay}</span>
                      <span style={{ fontSize: 11, color: "#bbb" }}>{job.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {((mainTab === "items" && filteredItems.length === 0) || (mainTab === "jobs" && filteredJobs.length === 0)) && (
              <div style={{ textAlign: "center", color: "#ccc", marginTop: 60, fontSize: 14 }}>검색 결과가 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* ITEM DETAIL */}
      {screen === "detail" && selectedItem && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid #f0f0f0" }}>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" }}><i className="ti ti-arrow-left" /></button>
            <span style={{ fontWeight: 500, fontSize: 15 }}>물건 상세</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ height: 220, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>{selectedItem.image}</div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div><div style={{ fontSize: 18, fontWeight: 500 }}>{selectedItem.title}</div><div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>{selectedItem.category} · {selectedItem.show}</div></div>
                <span style={{ fontSize: 16, fontWeight: 500, color: selectedItem.price === 0 ? ACCENT : "#1a1a1a" }}>{selectedItem.price === 0 ? "무료 나눔" : `${selectedItem.price.toLocaleString()}원`}</span>
              </div>
              <div style={{ marginTop: 16, padding: 14, background: "#fafafa", borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#333" }}>{selectedItem.desc}</p>
              </div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "0.5px solid #f0f0f0", borderRadius: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 500, fontSize: 14 }}>{selectedItem.sellerInitial}</div>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{selectedItem.seller}</div><div style={{ fontSize: 11, color: "#aaa" }}>판매자</div></div>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid #f0f0f0", display: "flex", gap: 8 }}>
            <button onClick={() => toggleLike(selectedItem.id)} style={{ width: 44, height: 44, borderRadius: 12, border: `0.5px solid ${likes[selectedItem.id] ? "#e25" : "#e0e0e0"}`, background: likes[selectedItem.id] ? "#fff0f2" : "#fff", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-heart" style={{ color: likes[selectedItem.id] ? "#e25" : "#bbb" }} />
            </button>
            <button onClick={() => openChat(selectedItem.id, selectedItem.title)} style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>채팅으로 문의하기</button>
          </div>
        </div>
      )}

      {/* JOB DETAIL */}
      {screen === "jobdetail" && selectedJob && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid #f0f0f0" }}>
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" }}><i className="ti ti-arrow-left" /></button>
            <span style={{ fontWeight: 500, fontSize: 15 }}>공고 상세</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{selectedJob.icon}</div>
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>{typeBadge(selectedJob.type)}<span style={{ fontSize: 11, color: "#aaa", background: "#f5f5f5", padding: "2px 8px", borderRadius: 10 }}>{selectedJob.field}</span></div>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{selectedJob.title}</div>
                </div>
              </div>
              {[["단체", selectedJob.org], ["지역", selectedJob.location], ["기간", selectedJob.date], ["보수", selectedJob.pay]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", padding: "10px 0", borderBottom: "0.5px solid #f5f5f5" }}>
                  <span style={{ fontSize: 13, color: "#aaa", width: 48 }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: k === "보수" ? 500 : 400, color: k === "보수" ? ACCENT : "#1a1a1a" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: 14, background: "#fafafa", borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#333" }}>{selectedJob.desc}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid #f0f0f0" }}>
            <button onClick={() => openChat(selectedJob.id, selectedJob.title)} style={{ width: "100%", height: 44, borderRadius: 12, border: "none", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>지원 / 문의 채팅</button>
          </div>
        </div>
      )}

      {/* POST */}
      {screen === "post" && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid #f0f0f0" }}>
            <button onClick={() => { setScreen("home"); setBottomTab("home"); }} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" }}><i className="ti ti-x" /></button>
            <span style={{ fontWeight: 500, fontSize: 15 }}>올리기</span>
          </div>
          <div style={{ display: "flex", borderBottom: "0.5px solid #f0f0f0" }}>
            {[["item", "중고 물건"], ["job", "일자리 공고"]].map(([t, l]) => (
              <button key={t} onClick={() => setPostMode(t)} style={{ flex: 1, padding: "10px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: postMode === t ? 500 : 400, color: postMode === t ? ACCENT : "#aaa", borderBottom: postMode === t ? `2px solid ${ACCENT}` : "2px solid transparent" }}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {postMode === "item" ? (
              <>
                <div style={{ height: 100, background: ACCENT_LIGHT, borderRadius: 12, border: `1.5px dashed ${ACCENT_MID}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18, color: ACCENT }}>
                  <i className="ti ti-camera" style={{ fontSize: 26 }} />
                  <div style={{ fontSize: 13, marginTop: 4 }}>사진 추가</div>
                </div>
                {[{ label: "제목", key: "title", ph: "예: 빨간 드레스 2벌" }, { label: "공연/전시명", key: "show", ph: "예: 달빛 소나타 2024" }, { label: "가격 (0이면 무료 나눔)", key: "price", ph: "0", type: "number" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>{f.label}</div>
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} type={f.type || "text"} style={{ width: "100%", borderRadius: 10, border: "0.5px solid #e0e0e0", padding: "10px 12px", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>설명</div>
                  <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="상태, 픽업 방법 등" rows={3} style={{ width: "100%", borderRadius: 10, border: "0.5px solid #e0e0e0", padding: "10px 12px", fontSize: 14, resize: "none", boxSizing: "border-box", outline: "none" }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>카테고리</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["의상", "조명", "세트", "소품", "기타"].map(c => (
                      <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{ padding: "5px 12px", borderRadius: 20, border: "0.5px solid", borderColor: form.category === c ? ACCENT : "#e0e0e0", background: form.category === c ? ACCENT : "#fff", color: form.category === c ? "#fff" : "#555", fontSize: 12, cursor: "pointer" }}>{c}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitItem} style={{ width: "100%", height: 46, borderRadius: 12, border: "none", background: form.title && form.show ? ACCENT : "#ddd", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 80 }}>올리기</button>
              </>
            ) : (
              <>
                {[{ label: "공고 제목", key: "title", ph: "예: 조명 디자이너 구합니다" }, { label: "단체/기관명", key: "org", ph: "예: 극단 파도" }, { label: "지역", key: "location", ph: "예: 대학로" }, { label: "기간", key: "date", ph: "예: 2025.07.01~07.10" }, { label: "보수", key: "pay", ph: "예: 협의 / 일 80,000원" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>{f.label}</div>
                    <input value={jobForm[f.key] || ""} onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", borderRadius: 10, border: "0.5px solid #e0e0e0", padding: "10px 12px", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>공고 내용</div>
                  <textarea value={jobForm.desc} onChange={e => setJobForm(p => ({ ...p, desc: e.target.value }))} placeholder="모집 조건, 담당 업무 등" rows={3} style={{ width: "100%", borderRadius: 10, border: "0.5px solid #e0e0e0", padding: "10px 12px", fontSize: 14, resize: "none", boxSizing: "border-box", outline: "none" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>분야</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["조명", "무대", "음향", "분장", "영상", "기타"].map(f => (
                      <button key={f} onClick={() => setJobForm(p => ({ ...p, field: f }))} style={{ padding: "5px 12px", borderRadius: 20, border: "0.5px solid", borderColor: jobForm.field === f ? ACCENT : "#e0e0e0", background: jobForm.field === f ? ACCENT : "#fff", color: jobForm.field === f ? "#fff" : "#555", fontSize: 12, cursor: "pointer" }}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5, fontWeight: 500 }}>고용 형태</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["단기", "장기"].map(t => (
                      <button key={t} onClick={() => setJobForm(p => ({ ...p, type: t }))} style={{ padding: "5px 16px", borderRadius: 20, border: "0.5px solid", borderColor: jobForm.type === t ? ACCENT : "#e0e0e0", background: jobForm.type === t ? ACCENT : "#fff", color: jobForm.type === t ? "#fff" : "#555", fontSize: 12, cursor: "pointer" }}>{t}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitJob} style={{ width: "100%", height: 46, borderRadius: 12, border: "none", background: jobForm.title ? ACCENT : "#ddd", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 80 }}>공고 올리기</button>
              </>
            )}
            {showPosted && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(45,106,79,0.95)", color: "#fff", padding: "12px 24px", borderRadius: 14, fontSize: 14, fontWeight: 500, zIndex: 100 }}>✓ 등록 완료!</div>
            )}
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      {screen === "chatlist" && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: "0.5px solid #f0f0f0" }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>채팅</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
            {chatList.map(({ id, label }) => {
              const msgs = chats[id] || [];
              const last = msgs[msgs.length - 1];
              return (
                <div key={id} onClick={() => openChat(id, label)} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "0.5px solid #f5f5f5", cursor: "pointer", alignItems: "center" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {id >= 100 ? "💼" : "📦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>방금 전</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last ? last.text : "새 채팅"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHAT */}
      {screen === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", height: 700 }}>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid #f0f0f0" }}>
            <button onClick={() => setScreen("chatlist")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" }}><i className="ti ti-arrow-left" /></button>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{activeChatLabel}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>채팅</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {(chats[activeChat] || []).map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "70%", padding: "9px 13px", borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "me" ? ACCENT : "#f3f3f3", color: msg.from === "me" ? "#fff" : "#1a1a1a", fontSize: 13, lineHeight: 1.5 }}>{msg.text}</div>
              </div>
            ))}
            {(chats[activeChat] || []).length === 0 && (
              <div style={{ textAlign: "center", color: "#ccc", fontSize: 13, marginTop: 40 }}>메시지를 보내보세요</div>
            )}
          </div>
          <div style={{ padding: "10px 12px", borderTop: "0.5px solid #f0f0f0", display: "flex", gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="메시지를 입력하세요" style={{ flex: 1, borderRadius: 20, border: "0.5px solid #e0e0e0", padding: "10px 14px", fontSize: 13, outline: "none" }} />
            <button onClick={sendMsg} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: ACCENT, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-send" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 64, background: "#fff", borderTop: "0.5px solid #f0f0f0", display: "flex", alignItems: "center", zIndex: 50 }}>
        <button style={tabBtn("home")} onClick={() => { setBottomTab("home"); setScreen("home"); }}>
          <i className="ti ti-home" style={tabIcon("home")} aria-hidden />홈
        </button>
        <button style={tabBtn("post")} onClick={() => { setBottomTab("post"); setScreen("post"); }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -24 }}>
            <i className="ti ti-plus" style={{ fontSize: 22, color: "#fff" }} />
          </div>
          <span style={{ marginTop: 2 }}>올리기</span>
        </button>
        <button style={tabBtn("chatlist")} onClick={() => { setBottomTab("chatlist"); setScreen("chatlist"); }}>
          <i className="ti ti-message-circle" style={tabIcon("chatlist")} aria-hidden />채팅
        </button>
      </div>
    </div>
  );
}
