import { useEffect, useMemo, useState } from "react";

// ---- helpers ----
const LS_KEY = "verseflow_v1";
const seedPacks = [
  { id: "evangelism-top10", name: "Top 10 Evangelism Verses", verses: [
    { ref: "John 3:16 (KJV)", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    { ref: "Romans 3:23 (KJV)", text: "For all have sinned, and come short of the glory of God." },
    { ref: "Romans 6:23 (KJV)", text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." },
    { ref: "Romans 5:8 (KJV)", text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." },
    { ref: "Ephesians 2:8-9 (KJV)", text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." },
    { ref: "1 John 5:11-12 (KJV)", text: "And this is the record, that God hath given to us eternal life, and this life is in his Son. He that hath the Son hath life; and he that hath not the Son of God hath not life." },
    { ref: "John 14:6 (KJV)", text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me." },
    { ref: "Acts 4:12 (KJV)", text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved." },
    { ref: "2 Corinthians 5:21 (KJV)", text: "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him." },
    { ref: "Revelation 3:20 (KJV)", text: "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me." },
  ]},
  { id: "stress-worry", name: "Verses for Stress & Worry", verses: [
    { ref: "Philippians 4:6-7 (KJV)", text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." },
    { ref: "Matthew 6:33-34 (KJV)", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you. Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself." },
    { ref: "1 Peter 5:7 (KJV)", text: "Casting all your care upon him; for he careth for you." },
  ]},
  { id: "relationships", name: "Verses for Relationships", verses: [
    { ref: "1 Corinthians 13:4-7 (KJV)", text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; rejoiceth not in iniquity, but rejoiceth in the truth; beareth all things, believeth all things, hopeth all things, endureth all things." },
    { ref: "Ephesians 4:32 (KJV)", text: "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you." },
  ]},
];
const w = (s)=>s.trim().replace(/\s+/g," ").split(" ");
const maskEveryNth=(t,n=3)=>w(t).map((x,i)=>((i+1)%n===0?"_".repeat(Math.min(4,x.length)):x)).join(" ");
const firstLetters=(t)=>w(t).map(x=>x[0]?.toUpperCase()||"").join(" ");
const normalize=(s)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"").trim();
const load=()=>{ try{return JSON.parse(localStorage.getItem(LS_KEY))||null}catch{return null}};
const save=(st)=>{ try{localStorage.setItem(LS_KEY,JSON.stringify(st))}catch{} };

// ---- app ----
export default function Home(){
  const [packs,setPacks]=useState(seedPacks);
  const [activePackId,setActivePackId]=useState(seedPacks[0].id);
  const [activeIdx,setActiveIdx]=useState(0);
  const [mode,setMode]=useState("flash"); // flash | fill | letters
  const [showRef,setShowRef]=useState(true);
  const [reveal,setReveal]=useState(false);
  const [answer,setAnswer]=useState("");
  const [xp,setXp]=useState(0);
  const [streak,setStreak]=useState(0);
  const [completed,setCompleted]=useState({});
  const [custom,setCustom]=useState({ref:"",text:""});

  useEffect(()=>{ const s=load(); if(!s) return;
    setPacks(s.packs??seedPacks); setActivePackId(s.activePackId??seedPacks[0].id);
    setActiveIdx(s.activeIdx??0); setMode(s.mode??"flash"); setShowRef(s.showRef??true);
    setXp(s.xp??0); setStreak(s.streak??0); setCompleted(s.completed??{});
  },[]);
  useEffect(()=>{ save({packs,activePackId,activeIdx,mode,showRef,xp,streak,completed}); },
    [packs,activePackId,activeIdx,mode,showRef,xp,streak,completed]);

  const activePack = useMemo(()=>packs.find(p=>p.id===activePackId)||packs[0],[packs,activePackId]);
  const item = activePack.verses[activeIdx] ?? {ref:"",text:""};
  const totalVerses = useMemo(()=>packs.reduce((s,p)=>s+p.verses.length,0),[packs]);
  const memorizedCount = useMemo(()=>Object.values(completed).filter(Boolean).length,[completed]);
  const level = Math.floor(xp/100)+1; const levelPct = xp%100;
  const isAnswerCorrect = useMemo(()=>normalize(answer)===normalize(item.text||""),[answer,item.text]);

  function nextCard(d=1){ setReveal(false); setAnswer(""); const len=activePack.verses.length||1;
    let n=activeIdx+d; if(n<0)n=len-1; if(n>=len)n=0; setActiveIdx(n); }
  function markCorrect(){ setXp(x=>x+10); setStreak(s=>s+1);
    setCompleted(c=>({...c,[`${activePackId}|${activeIdx}`]:true})); setReveal(true);}
  function markIncorrect(){ setStreak(0); setXp(x=>Math.max(0,x-2)); setReveal(true); }
  function addCustomVerse(){ if(!custom.ref.trim()||!custom.text.trim())return;
    const id="my-verses"; const clone=[...packs]; let pack=clone.find(p=>p.id===id);
    if(!pack){ pack={id,name:"My Verses",verses:[]}; clone.unshift(pack); }
    pack.verses.unshift({ref:custom.ref.trim(),text:custom.text.trim()});
    setPacks(clone); setActivePackId(id); setActiveIdx(0); setCustom({ref:"",text:""}); }
  function importPack(base){ if(!packs.some(p=>p.id===base.id)) setPacks([base,...packs]);
    setActivePackId(base.id); setActiveIdx(0); }

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-2xl bg-black" />
            <h1 className="text-2xl font-semibold tracking-tight">VerseFlow</h1>
            <span className="ml-2 rounded-full border px-2 py-[2px] text-xs">beta</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full border px-2 py-1">Lvl {level}</span>
            <div className="w-40">
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full bg-black" style={{width:`${levelPct}%`}} />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">{levelPct}/100 XP to next level</p>
            </div>
            <span className="rounded-full border px-2 py-1">{streak} day streak</span>
          </div>
        </header>

        <main className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* left */}
          <section className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60">
              <h2 className="mb-3 text-base font-medium">Categories</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {packs.map(p=>(
                  <button key={p.id}
                    onClick={()=>{setActivePackId(p.id); setActiveIdx(0);}}
                    className={`rounded-full border px-3 py-1 text-sm ${p.id===activePackId?"bg-black text-white":"bg-white"}`}>
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="my-3 h-px bg-neutral-200" />
              <div className="mb-2 text-xs text-neutral-500">Quick-add a recommended pack</div>
              <div className="flex flex-wrap gap-2">
                {seedPacks.map(sp=>(
                  <button key={sp.id} onClick={()=>importPack(sp)}
                          className="rounded-full border bg-neutral-50 px-3 py-1 text-sm">+ {sp.name}</button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60">
              <h2 className="mb-4 text-base font-medium">Add Your Own Verse</h2>
              <label className="text-sm">Reference</label>
              <input value={custom.ref} onChange={e=>setCustom(c=>({...c,ref:e.target.value}))}
                     className="mt-1 mb-3 w-full rounded-xl border px-3 py-2" placeholder="e.g., Psalm 23:1 (ESV)" />
              <label className="text-sm">Verse Text</label>
              <textarea rows={4} value={custom.text} onChange={e=>setCustom(c=>({...c,text:e.target.value}))}
                        className="mt-1 mb-3 w-full rounded-xl border px-3 py-2" placeholder="Paste the verse text here" />
              <div className="flex items-center justify-between">
                <div className="text-xs text-neutral-500">Tip: Any translation works.</div>
                <button onClick={addCustomVerse} className="rounded-xl bg-black px-4 py-2 text-white">Add</button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60">
              <h2 className="mb-3 text-base font-medium">Progress</h2>
              <div className="mb-1 flex items-center justify-between text-sm"><span>Total verses</span><strong>{totalVerses}</strong></div>
              <div className="mb-2 flex items-center justify-between text-sm"><span>Memorized</span><strong>{memorizedCount}</strong></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full bg-black" style={{width:`${totalVerses?(memorizedCount/totalVerses)*100:0}%`}} />
              </div>
              <div className="mt-2 text-xs text-neutral-500">You’ve memorized {Math.round(totalVerses?(memorizedCount/totalVerses)*100:0)}% of your library.</div>
            </div>
          </section>

          {/* right */}
          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Trainer</h2>
                  <p className="text-sm text-neutral-500">{activePack.name} — {activeIdx+1}/{activePack.verses.length||1}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-xl border px-3 py-2">
                    <option value="flash">Flashcards</option>
                    <option value="fill">Fill-in-the-blanks</option>
                    <option value="letters">First-letter mode</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-neutral-600">
                    <input type="checkbox" checked={showRef} onChange={e=>setShowRef(e.target.checked)} />
                    Show reference
                  </label>
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-6">
                {showRef && <div className="mb-3 text-sm text-neutral-500">{item.ref}</div>}
                {mode==="flash" && (
                  <div className="text-center">
                    <p className={`text-xl leading-8 ${reveal?"":"blur-sm select-none"}`}>{item.text}</p>
                    <div className="mt-4">
                      <button onClick={()=>setReveal(r=>!r)} className="rounded-xl bg-black px-4 py-2 text-white">
                        {reveal?"Hide":"Reveal"}
                      </button>
                    </div>
                  </div>
                )}
                {mode==="fill" && (
                  <div>
                    <p className="mb-3 text-lg leading-7 text-neutral-700">{maskEveryNth(item.text||"",3)}</p>
                    <label className="text-sm">Your attempt</label>
                    <textarea rows={4} value={answer} onChange={e=>setAnswer(e.target.value)}
                              className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Type the full verse from memory" />
                    <div className={`mt-1 text-sm ${isAnswerCorrect?"text-green-600":"text-neutral-500"}`}>
                      {isAnswerCorrect?"Perfect match!":"Tip: punctuation doesn’t matter here."}
                    </div>
                  </div>
                )}
                {mode==="letters" && (
                  <div>
                    <p className="mb-3 text-lg leading-7 tracking-wider text-neutral-700">{firstLetters(item.text||"")}</p>
                    <label className="text-sm">Your attempt</label>
                    <textarea rows={4} value={answer} onChange={e=>setAnswer(e.target.value)}
                              className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Type the full verse from memory" />
                    <div className={`mt-1 text-sm ${isAnswerCorrect?"text-green-600":"text-neutral-500"}`}>
                      {isAnswerCorrect?"Perfect match!":"Pro tip: try short phrases."}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  <span>XP: <strong>{xp}</strong></span><span>•</span><span>Streak: <strong>{streak}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {mode!=="flash" && <button onClick={()=>setReveal(r=>!r)} className="rounded-xl border px-4 py-2">{reveal?"Hide":"Reveal"}</button>}
                  <button onClick={()=>nextCard(-1)} className="rounded-xl border px-4 py-2">Prev</button>
                  <button onClick={()=>nextCard(1)} className="rounded-xl bg-black px-4 py-2 text-white">Next</button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button onClick={markCorrect} className="rounded-xl border px-4 py-2">I got it right</button>
                <button onClick={markIncorrect} className="rounded-xl px-4 py-2">Keep practicing</button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60">
              <h2 className="mb-3 text-base font-medium">Mini Leaderboard (just you)</h2>
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                <Stat label="Level" value={`Level ${level}`} />
                <Stat label="XP" value={`${xp}`} />
                <Stat label="Memorized" value={`${memorizedCount}/${totalVerses}`} />
                <Stat label="Best Streak" value={`${Math.max(streak, memorizedCount)}`} />
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 flex items-center justify-between border-t pt-6 text-xs text-neutral-500">
          <p>Built for focus. Zero clutter. 100% yours.</p>
          <p>Tip: Press ⌘/Ctrl + K to paste a verse fast.</p>
        </footer>
      </div>
    </div>
  );
}
function Stat({label,value}){ return (
  <div className="rounded-xl border p-4 text-center">
    <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
    <div className="mt-1 text-lg font-medium">{value}</div>
  </div>
);}
