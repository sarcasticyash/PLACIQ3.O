// import React, { useState, useRef, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const API = import.meta.env.VITE_API_URL || '/api';

// function ScoreGauge({ score }) {
//   const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
//   const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
//   return (
//     <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
//       <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
//         <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface3)" strokeWidth="10" />
//         <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
//           strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
//       </svg>
//       <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
//         <div style={{ fontSize:32, fontWeight:800, fontFamily:'Outfit', color, lineHeight:1 }}>{score}</div>
//         <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>ATS Score</div>
//       </div>
//     </div>
//   );
// }

// export default function Resume() {
//   const { user } = useAuth();
//   const [file, setFile] = useState(null);
//   const [dragging, setDragging] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
//   const [pasteText, setPasteText] = useState('');
//   const [tab, setTab] = useState('upload');
//   const fileRef = useRef();

//   const onDrop = useCallback(e => {
//     e.preventDefault(); setDragging(false);
//     const dropped = e.dataTransfer.files[0];
//     if (dropped) setFile(dropped);
//   }, []);

//   const analyze = async () => {
//     if (tab === 'upload' && !file) return toast.error('Please upload a resume file');
//     if (tab === 'paste' && !pasteText.trim()) return toast.error('Please paste your resume text');
//     setLoading(true);
//     try {
//       let res;
//       if (tab === 'upload') {
//         const fd = new FormData();
//         fd.append('resume', file);
//         fd.append('targetRole', targetRole);
//         res = await axios.post(`${API}/agent/resume-upload`, fd, { headers: { 'Content-Type':'multipart/form-data' } });
//         const analysis = res.data.analysis || {};
//         setResult(analysis);
//         const score = analysis.atsScore || 0;
//         toast.success(`Resume analyzed! ATS: ${score}/100`);
//       } else {
//         const { data } = await axios.post(`${API}/agent/analyze`, {
//           agentType: 'resume', data: { resumeText: pasteText, role: targetRole }
//         });
//         const result = data.result || {};
//         setResult(result);
//         const score = result.atsScore || 0;
//         toast.success(`Resume analyzed! ATS: ${score}/100`);
//       }
//     } catch (e) {
//       console.error('Analysis error:', e);
//       toast.error(e.response?.data?.error || 'Analysis failed');
//     } finally { setLoading(false); }
//   };

//   const priorityColor = p => p === 'high' ? 'var(--red)' : p === 'medium' ? 'var(--amber)' : 'var(--cyan)';

//   return (
//     <div style={{ padding:'28px 32px', maxWidth:1000 }}>
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Resume AI Analyzer</h1>
//           <p className="page-subtitle">Upload your resume — Claude AI scores ATS compatibility, finds gaps, and rewrites your bullets.</p>
//         </div>
//         {result && <span className="badge badge-green" style={{ alignSelf:'flex-start' }}>✓ Analysis Complete</span>}
//       </div>

//       {/* Upload Section */}
//       <div style={{ marginBottom:24 }}>
//         <div style={{ marginBottom:16 }}>
//           <div className="tab-bar">
//             {['upload', 'paste'].map(t => (
//               <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
//                 {t === 'upload' ? '📎 Upload File' : '📝 Paste Text'}
//               </button>
//             ))}
//           </div>
//         </div>

//         {tab === 'upload' ? (
//           <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
//             onDragOver={e => { e.preventDefault(); setDragging(true); }}
//             onDragLeave={() => setDragging(false)}
//             onDrop={onDrop}
//             onClick={() => fileRef.current?.click()}>
//             <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
//             {file ? (
//               <div>
//                 <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
//                 <div style={{ fontWeight:600, marginBottom:4 }}>{file.name}</div>
//                 <div style={{ fontSize:13, color:'var(--text3)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
//               </div>
//             ) : (
//               <div>
//                 <div style={{ fontSize:40, marginBottom:12 }}>📤</div>
//                 <div style={{ fontFamily:'Outfit', fontSize:17, fontWeight:600, marginBottom:6 }}>Drop your resume here</div>
//                 <div style={{ fontSize:13, color:'var(--text3)', marginBottom:4 }}>PDF, DOC, DOCX, or TXT · Max 5MB</div>
//                 <div style={{ fontSize:12, color:'var(--accent2)' }}>or click to browse</div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
//             placeholder="Paste your resume text here... Include your experience, skills, education, and projects."
//             style={{ height:200, resize:'vertical', fontFamily:'JetBrains Mono', fontSize:12, lineHeight:1.6, borderRadius:14 }} />
//         )}

//         <div style={{ display:'flex', gap:12, marginTop:14, alignItems:'flex-end' }}>
//           <div style={{ flex:1 }}>
//             <label>Target Role</label>
//             <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer, Data Analyst" />
//           </div>
//           <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ padding:'13px 28px', fontSize:14 }}>
//             {loading ? <><div className="spinner" /> Analyzing with Claude AI...</> : '🔍 Analyze Resume'}
//           </button>
//         </div>
//       </div>

//       {/* Results */}
//       {result && (
//         <div style={{ animation:'fadeInUp 0.4s ease' }}>
//           {/* Score header */}
//           <div style={{ display:'flex', gap:20, padding:'24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, marginBottom:20, flexWrap:'wrap' }}>
//             <ScoreGauge score={result.atsScore || 0} />
//             <div style={{ flex:1, minWidth:240 }}>
//               <div style={{ fontFamily:'Outfit', fontSize:20, fontWeight:700, marginBottom:6 }}>{result.overallVerdict || 'Analysis Complete'}</div>
//               {result.optimizedSummary && (
//                 <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, padding:'12px 16px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)', marginBottom:12 }}>
//                   <span style={{ fontSize:11, color:'var(--accent2)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:6 }}>✨ AI-Optimized Summary</span>
//                   {result.optimizedSummary}
//                 </div>
//               )}
//               {/* Section scores */}
//               {result.sectionScores && (
//                 <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
//                   {Object.entries(result.sectionScores).map(([k, v]) => (
//                     <div key={k} style={{ padding:'6px 12px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
//                       <div style={{ fontSize:10, color:'var(--text3)', textTransform:'capitalize', marginBottom:3 }}>{k}</div>
//                       <div style={{ fontSize:16, fontWeight:700, fontFamily:'Outfit', color: v>=75?'var(--green)':v>=55?'var(--amber)':'var(--red)' }}>{v}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
//             {/* Improvements */}
//             {result.improvements?.length > 0 && (
//               <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
//                 <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
//                   <span style={{ fontSize:16 }}>🔧</span>
//                   <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Improvements</div>
//                 </div>
//                 {result.improvements.map((imp, i) => (
//                   <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:`1px solid ${priorityColor(imp.priority)}20`, marginBottom:8 }}>
//                     <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}>
//                       <span className="badge" style={{ background:`${priorityColor(imp.priority)}15`, color:priorityColor(imp.priority), border:`1px solid ${priorityColor(imp.priority)}30`, flexShrink:0 }}>{imp.priority}</span>
//                       <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{imp.issue}</div>
//                     </div>
//                     <div style={{ fontSize:12, color:'var(--text2)', paddingLeft:4 }}>→ {imp.fix}</div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Keywords */}
//             <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
//               {result.keywordsToAdd?.length > 0 && (
//                 <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
//                   <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
//                     <span style={{ fontSize:16 }}>🏷️</span>
//                     <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Keywords to Add</div>
//                   </div>
//                   <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
//                     {result.keywordsToAdd.map((kw, i) => (
//                       <span key={i} style={{ padding:'5px 12px', background:'var(--red-dim)', border:'1px solid var(--red)30', borderRadius:20, fontSize:12, color:'var(--red)', fontWeight:500 }}>+ {kw}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {result.keywordsFound?.length > 0 && (
//                 <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
//                   <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
//                     <span style={{ fontSize:16 }}>✅</span>
//                     <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Keywords Found</div>
//                   </div>
//                   <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
//                     {result.keywordsFound.map((kw, i) => (
//                       <span key={i} style={{ padding:'5px 12px', background:'var(--green-dim)', border:'1px solid var(--green)30', borderRadius:20, fontSize:12, color:'var(--green)', fontWeight:500 }}>✓ {kw}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {result.quickWins?.length > 0 && (
//                 <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
//                   <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
//                     <span style={{ fontSize:16 }}>⚡</span>
//                     <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Quick Wins</div>
//                   </div>
//                   {result.quickWins.map((w, i) => (
//                     <div key={i} className="result-item">{w}</div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {!result && !loading && (
//         <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
//           <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
//           <div style={{ fontFamily:'Outfit', fontSize:18, fontWeight:600, marginBottom:8, color:'var(--text2)' }}>Upload your resume to get started</div>
//           <div style={{ fontSize:14 }}>Claude AI will score your resume, find ATS keyword gaps, and suggest rewritten bullet points.</div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef, useCallback } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Gauge Component ---
function ScoreGauge({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface3)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s' }} />
      </svg>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, fontWeight:800, color }}>{score}</div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>ATS Score</div>
      </div>
    </div>
  );
}

export default function Resume() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const fileRef = useRef();

  const analyze = async () => {
    if (!file) return toast.error('Please upload a file');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('targetRole', targetRole);

      // Hits /api/agent/resume-upload via our Global API instance
      const res = await api.post('/agent/resume-upload', fd);
      setResult(res.data.analysis);
      toast.success('Analysis Deep Dive Complete!');
    } catch (e) {
      toast.error('AI Analysis Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding:'32px', maxWidth:1100, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Outfit', fontSize:32, marginBottom:8 }}>AI Resume Intelligence</h1>
      <p style={{ color:'var(--text3)', marginBottom:32 }}>Get a personalized roadmap and weakness analysis from Claude AI.</p>

      {/* Upload Zone */}
      <div onClick={() => fileRef.current.click()} style={{ border:'2px dashed var(--border)', borderRadius:20, padding:40, textAlign:'center', cursor:'pointer', background:'var(--surface)', marginBottom:24 }}>
        <input ref={fileRef} type="file" hidden onChange={e => setFile(e.target.files[0])} />
        <div style={{ fontSize:40 }}>{file ? '📄' : '☁️'}</div>
        <div style={{ fontWeight:600, marginTop:10 }}>{file ? file.name : 'Click to upload Resume (PDF/DOCX)'}</div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:40 }}>
        <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target Job Role..." style={{ flex:1, padding:'12px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--border)', color:'white' }} />
        <button onClick={analyze} disabled={loading} className="btn btn-primary">
          {loading ? 'AI is thinking...' : 'Generate Full Roadmap'}
        </button>
      </div>

      {result && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          {/* Analysis Card */}
          <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)', display:'flex', gap:30, alignItems:'center' }}>
            <ScoreGauge score={result.atsScore} />
            <div>
              <h2 style={{ fontSize:22, marginBottom:10 }}>{result.overallVerdict}</h2>
              <p style={{ color:'var(--text2)', fontSize:14 }}>{result.optimizedSummary}</p>
            </div>
          </div>

          {/* ROADMAP SECTION */}
          <div style={{ background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
            <h3 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>🗺️ Career Roadmap</h3>
            {result.roadmap?.map((step, i) => (
              <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:12, marginBottom:10, borderLeft:'4px solid var(--accent2)' }}>
                <div style={{ fontSize:11, color:'var(--accent2)', fontWeight:800 }}>STEP {i+1}</div>
                <div style={{ fontSize:14 }}>{step}</div>
              </div>
            ))}
          </div>

          {/* WEAKNESSES SECTION */}
          <div style={{ background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
            <h3 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>⚠️ Skill Gaps & Weaknesses</h3>
            {result.weaknesses?.map((w, i) => (
              <div key={i} style={{ padding:'12px', background:'rgba(255,100,100,0.05)', borderRadius:12, marginBottom:10, color:'var(--red)', fontSize:14, border:'1px solid rgba(255,100,100,0.1)' }}>
                • {w}
              </div>
            ))}
          </div>

          {/* KEYWORDS */}
          <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
            <h3 style={{ marginBottom:16 }}>🏷️ Keywords to Add for ATS</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {result.keywordsToAdd?.map((kw, i) => (
                <span key={i} style={{ background:'var(--bg2)', padding:'6px 16px', borderRadius:20, fontSize:13, border:'1px solid var(--border)' }}>+ {kw}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}