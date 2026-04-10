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

// import React, { useState, useRef, useCallback } from 'react';
// import { useAuth, api } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// // --- Gauge Component ---
// function ScoreGauge({ score }) {
//   const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
//   const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
//   return (
//     <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center' }}>
//       <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
//         <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface3)" strokeWidth="10" />
//         <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
//           strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s' }} />
//       </svg>
//       <div style={{ textAlign:'center' }}>
//         <div style={{ fontSize:32, fontWeight:800, color }}>{score}</div>
//         <div style={{ fontSize:11, color:'var(--text3)' }}>ATS Score</div>
//       </div>
//     </div>
//   );
// }

// export default function Resume() {
//   const { user } = useAuth();
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
//   const fileRef = useRef();

//   const analyze = async () => {
//     if (!file) return toast.error('Please upload a file');
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append('resume', file);
//       fd.append('targetRole', targetRole);

//       // Hits /api/agent/resume-upload via our Global API instance
//       const res = await api.post('/agent/resume-upload', fd);
//       setResult(res.data.analysis);
//       toast.success('Analysis Deep Dive Complete!');
//     } catch (e) {
//       toast.error('AI Analysis Failed');
//     } finally { setLoading(false); }
//   };

//   return (
//     <div style={{ padding:'32px', maxWidth:1100, margin:'0 auto' }}>
//       <h1 style={{ fontFamily:'Outfit', fontSize:32, marginBottom:8 }}>AI Resume Intelligence</h1>
//       <p style={{ color:'var(--text3)', marginBottom:32 }}>Get a personalized roadmap and weakness analysis from Claude AI.</p>

//       {/* Upload Zone */}
//       <div onClick={() => fileRef.current.click()} style={{ border:'2px dashed var(--border)', borderRadius:20, padding:40, textAlign:'center', cursor:'pointer', background:'var(--surface)', marginBottom:24 }}>
//         <input ref={fileRef} type="file" hidden onChange={e => setFile(e.target.files[0])} />
//         <div style={{ fontSize:40 }}>{file ? '📄' : '☁️'}</div>
//         <div style={{ fontWeight:600, marginTop:10 }}>{file ? file.name : 'Click to upload Resume (PDF/DOCX)'}</div>
//       </div>

//       <div style={{ display:'flex', gap:12, marginBottom:40 }}>
//         <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target Job Role..." style={{ flex:1, padding:'12px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--border)', color:'white' }} />
//         <button onClick={analyze} disabled={loading} className="btn btn-primary">
//           {loading ? 'AI is thinking...' : 'Generate Full Roadmap'}
//         </button>
//       </div>

//       {result && (
//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
//           {/* Analysis Card */}
//           <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)', display:'flex', gap:30, alignItems:'center' }}>
//             <ScoreGauge score={result.atsScore} />
//             <div>
//               <h2 style={{ fontSize:22, marginBottom:10 }}>{result.overallVerdict}</h2>
//               <p style={{ color:'var(--text2)', fontSize:14 }}>{result.optimizedSummary}</p>
//             </div>
//           </div>

//           {/* ROADMAP SECTION */}
//           <div style={{ background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>🗺️ Career Roadmap</h3>
//             {result.roadmap?.map((step, i) => (
//               <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:12, marginBottom:10, borderLeft:'4px solid var(--accent2)' }}>
//                 <div style={{ fontSize:11, color:'var(--accent2)', fontWeight:800 }}>STEP {i+1}</div>
//                 <div style={{ fontSize:14 }}>{step}</div>
//               </div>
//             ))}
//           </div>

//           {/* WEAKNESSES SECTION */}
//           <div style={{ background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>⚠️ Skill Gaps & Weaknesses</h3>
//             {result.weaknesses?.map((w, i) => (
//               <div key={i} style={{ padding:'12px', background:'rgba(255,100,100,0.05)', borderRadius:12, marginBottom:10, color:'var(--red)', fontSize:14, border:'1px solid rgba(255,100,100,0.1)' }}>
//                 • {w}
//               </div>
//             ))}
//           </div>

//           {/* KEYWORDS */}
//           <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:24, borderRadius:20, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:16 }}>🏷️ Keywords to Add for ATS</h3>
//             <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
//               {result.keywordsToAdd?.map((kw, i) => (
//                 <span key={i} style={{ background:'var(--bg2)', padding:'6px 16px', borderRadius:20, fontSize:13, border:'1px solid var(--border)' }}>+ {kw}</span>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useRef } from 'react';
// import { useAuth, api } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// // --- Gauge Component ---
// function ScoreGauge({ score }) {
//   const color = score >= 80 ? '#00e87a' : score >= 60 ? '#ffb547' : '#ff4d4d';
//   const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
//   return (
//     <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center' }}>
//       <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
//         <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface3)" strokeWidth="10" />
//         <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
//           strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s ease-out' }} />
//       </svg>
//       <div style={{ textAlign:'center' }}>
//         <div style={{ fontSize:32, fontWeight:800, color, fontFamily: 'Outfit' }}>{score}</div>
//         <div style={{ fontSize:10, color:'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>ATS Score</div>
//       </div>
//     </div>
//   );
// }

// export default function Resume() {
//   const { user } = useAuth();
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
//   const fileRef = useRef();

//   const analyze = async () => {
//     if (!file) return toast.error('Please upload a resume file');
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append('resume', file);
//       fd.append('targetRole', targetRole);

//       //const res = await api.post('/agent/resume-upload', fd);
//       //setResult(res.data.analysis);
//       //toast.success('Career Blueprint Generated!');
//       const res = await api.post('/agent/resume-upload', fd, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     setResult(res.data.analysis);
//     toast.success('Career Blueprint Generated!');
//     } catch (e) {
//       toast.error(e.response?.data?.error || 'AI Analysis Failed');
//     } finally { setLoading(false); }
//   };

//   return (
//     <div style={{ padding:'40px 20px', maxWidth:1100, margin:'0 auto' }}>
//       <header style={{ marginBottom: 40 }}>
//         <h1 style={{ fontFamily:'Outfit', fontSize:36, fontWeight: 800, marginBottom:8 }}>Resume Intelligence</h1>
//         <p style={{ color:'var(--text3)', fontSize: 16 }}>Detailed gap analysis, roadmap, and ATS optimization.</p>
//       </header>

//       {/* Upload Zone */}
//       <div 
//         onClick={() => fileRef.current.click()} 
//         style={{ 
//           border:'2px dashed var(--border)', 
//           borderRadius:24, 
//           padding:'60px 40px', 
//           textAlign:'center', 
//           cursor:'pointer', 
//           background:'var(--surface)', 
//           transition: 'all 0.2s',
//           marginBottom:24 
//         }}
//         onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
//         onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
//       >
//         <input ref={fileRef} type="file" hidden onChange={e => setFile(e.target.files[0])} accept=".pdf,.docx,.txt" />
//         <div style={{ fontSize:48, marginBottom: 16 }}>{file ? '📄' : '📤'}</div>
//         <div style={{ fontWeight:700, fontSize: 18 }}>{file ? file.name : 'Drop your resume here'}</div>
//         <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 8 }}>Supports PDF, DOCX, TXT (Max 5MB)</p>
//       </div>

//       <div style={{ display:'flex', gap:12, marginBottom:40 }}>
//         <input 
//           value={targetRole} 
//           onChange={e => setTargetRole(e.target.value)} 
//           placeholder="e.g. Full Stack Developer, Data Scientist..." 
//           style={{ flex:1, padding:'14px 20px', borderRadius:14, background:'var(--surface)', border:'1px solid var(--border)', color:'white', fontSize: 15 }} 
//         />
//         <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ padding: '0 30px', borderRadius: 14 }}>
//           {loading ? 'Analyzing...' : 'Generate Analysis'}
//         </button>
//       </div>

//       {result && (
//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, animation: 'fadeInUp 0.5s ease' }}>
          
//           {/* Main Verdict Card */}
//           <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:32, borderRadius:24, border:'1px solid var(--border)', display:'flex', gap:40, alignItems:'center', flexWrap: 'wrap' }}>
//             <ScoreGauge score={result.atsScore} />
//             <div style={{ flex: 1, minWidth: 300 }}>
//               <h2 style={{ fontSize:24, fontWeight: 800, marginBottom:12, fontFamily: 'Outfit' }}>{result.overallVerdict}</h2>
//               <p style={{ color:'var(--text2)', fontSize:15, lineHeight: 1.6 }}>{result.optimizedSummary}</p>
//             </div>
//           </div>

//           {/* WEAKNESSES / GAP ANALYSIS */}
//           <div style={{ background:'var(--surface)', padding:28, borderRadius:24, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:20, fontSize: 18, fontWeight: 700, display:'flex', alignItems:'center', gap:10 }}>
//               <span style={{ fontSize: 20 }}>⚠️</span> Critical Weaknesses
//             </h3>
//             {result.weaknesses?.map((w, i) => (
//               <div key={i} style={{ padding:'14px', background:'rgba(255,77,77,0.06)', borderRadius:16, marginBottom:12, color:'#ff6b6b', fontSize:14, border:'1px solid rgba(255,77,77,0.1)' }}>
//                 <strong>Issue:</strong> {w}
//               </div>
//             ))}
//           </div>

//           {/* ROADMAP / ACTION PLAN */}
//           <div style={{ background:'var(--surface)', padding:28, borderRadius:24, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:20, fontSize: 18, fontWeight: 700, display:'flex', alignItems:'center', gap:10 }}>
//               <span style={{ fontSize: 20 }}>🗺️</span> 30-Day Roadmap
//             </h3>
//             {result.roadmap?.map((step, i) => (
//               <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: 12 }}>{i+1}</div>
//                 <div style={{ fontSize:14, color: 'var(--text2)', lineHeight: 1.5, paddingTop: 4 }}>{step}</div>
//               </div>
//             ))}
//           </div>

//           {/* SKILLS TO LEARN */}
//           <div style={{ gridColumn:'1 / -1', background:'var(--surface)', padding:28, borderRadius:24, border:'1px solid var(--border)' }}>
//             <h3 style={{ marginBottom:20, fontSize: 18, fontWeight: 700 }}>📚 Skills & Technologies to Master</h3>
//             <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
//               {result.keywordsToAdd?.map((skill, i) => (
//                 <div key={i} style={{ background:'var(--bg2)', padding:'10px 20px', borderRadius:14, fontSize:14, border:'1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <span style={{ color: 'var(--accent2)', fontWeight: 800 }}>+</span> {skill}
//                 </div>
//               ))}
//             </div>
//             <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>* Incorporating these keywords can increase your ATS score by up to 30%.</p>
//           </div>

//         </div>
//       )}
//     </div>
//   );
// }
//again changed at 10:07

/*import React, { useState, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Gauge Component ---
function ScoreGauge({ score }) {
  const color = score >= 80 ? '#00e87a' : score >= 60 ? '#ffb547' : '#ff4d4d';
  const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position:'relative', width:140, height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </svg>
      <div style={{ textAlign:'center', zIndex: 1 }}>
        <div style={{ fontSize:36, fontWeight:900, color, fontFamily: 'Outfit', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize:10, color:'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>ATS Score</div>
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
    if (!file) return toast.error('Please upload a resume file');
    setLoading(true);
    setResult(null); // Clear previous results to show loading state
    
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('targetRole', targetRole);

      const res = await api.post('/agent/resume-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(res.data.analysis);
      toast.success('Career Blueprint Generated!');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.error || 'AI Analysis Failed. Check server logs.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding:'40px 24px', maxWidth:1200, margin:'0 auto', color: 'white' }}>
      <header style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(32px, 5vw, 42px)', fontWeight: 900, marginBottom:12, background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Resume Intelligence
        </h1>
        <p style={{ color:'var(--text3)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Our AI audits your resume against industry standards to build your personalized 30-day success roadmap.
        </p>
      </header>

      
      <div 
        onClick={() => !loading && fileRef.current.click()} 
        style={{ 
          border:'2px dashed var(--border)', 
          borderRadius:28, 
          padding:'50px 20px', 
          textAlign:'center', 
          cursor: loading ? 'not-allowed' : 'pointer', 
          background: file ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--surface)', 
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom:32,
          position: 'relative',
          overflow: 'hidden'
        }}
        className="upload-card"
      >
        <input ref={fileRef} type="file" hidden onChange={e => setFile(e.target.files[0])} accept=".pdf,.docx,.txt" />
        <div style={{ fontSize:56, marginBottom: 16, filter: file ? 'drop-shadow(0 0 10px var(--accent))' : 'none' }}>
            {file ? '📄' : '📤'}
        </div>
        <div style={{ fontWeight:800, fontSize: 20, color: file ? 'var(--accent)' : 'white' }}>
            {file ? file.name : 'Select Resume File'}
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 10 }}>PDF, DOCX, or TXT (Max 5MB)</p>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:50, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <input 
              value={targetRole} 
              onChange={e => setTargetRole(e.target.value)} 
              placeholder="Target Role (e.g. Senior Frontend Developer)" 
              style={{ width: '100%', padding:'18px 24px', borderRadius:18, background:'var(--surface)', border:'1px solid var(--border)', color:'white', fontSize: 16, outline: 'none', transition: 'border 0.2s' }} 
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
        </div>
        <button 
            onClick={analyze} 
            disabled={loading} 
            className="btn btn-primary" 
            style={{ padding: '0 40px', borderRadius: 18, height: 60, fontSize: 16, fontWeight: 700, boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)' }}
        >
          {loading ? <span className="loader-dots">Analyzing...</span> : '🚀 Generate Analysis'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner" style={{ width: 50, height: 50, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 20px' }}></div>
            <p style={{ color: 'var(--text3)', fontFamily: 'Outfit' }}>Claude AI is auditing your professional profile...</p>
        </div>
      )}

      {result && !loading && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:24, animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
          
          <div style={{ gridColumn:'1 / span 12', background:'linear-gradient(145deg, var(--surface), var(--bg))', padding:'40px', borderRadius:32, border:'1px solid var(--border)', display:'flex', gap:40, alignItems:'center', flexWrap: 'wrap', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <ScoreGauge score={result.atsScore} />
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ padding: '4px 12px', borderRadius: 8, background: result.atsScore > 75 ? 'rgba(0,232,122,0.1)' : 'rgba(255,181,71,0.1)', color: result.atsScore > 75 ? '#00e87a' : '#ffb547', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
                    {result.atsScore > 75 ? 'Strong Match' : 'Optimization Needed'}
                </span>
              </div>
              <h2 style={{ fontSize:28, fontWeight: 900, marginBottom:16, fontFamily: 'Outfit' }}>{result.overallVerdict}</h2>
              <p style={{ color:'var(--text2)', fontSize:16, lineHeight: 1.7, opacity: 0.9 }}>{result.optimizedSummary}</p>
            </div>
          </div>

         
          <div style={{ gridColumn: '1 / span 7', background:'var(--surface)', padding:32, borderRadius:32, border:'1px solid var(--border)', minHeight: 400 }}>
            <h3 style={{ marginBottom:28, fontSize: 20, fontWeight: 800, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗺️</span>
              Execution Roadmap
            </h3>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 2, background: 'linear-gradient(to bottom, var(--accent), var(--border))' }}></div>
                {result.roadmap?.map((step, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 32 }}>
                    <div style={{ position: 'absolute', left: -25, top: 4, width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', border: '4px solid var(--bg)' }}></div>
                    <div style={{ padding: '20px', background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)', transition: 'transform 0.2s' }} className="hover-scale">
                        <div style={{ fontSize:12, color:'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 }}>Phase 0{i+1}</div>
                        <div style={{ fontSize:15, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>{step}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ gridColumn: '8 / span 5', background:'var(--surface)', padding:32, borderRadius:32, border:'1px solid var(--border)' }}>
            <h3 style={{ marginBottom:28, fontSize: 20, fontWeight: 800, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</span>
              Skill Gaps
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.weaknesses?.map((w, i) => (
                  <div key={i} style={{ padding:'18px', background:'rgba(255,77,77,0.03)', borderRadius:20, border:'1px solid rgba(255,77,77,0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#ff4d4d' }}></div>
                    <div style={{ fontSize:14, color:'#ff8080', fontWeight: 600, lineHeight: 1.5 }}>{w}</div>
                  </div>
                ))}
            </div>
          </div>

          
          <div style={{ gridColumn:'1 / span 12', background:'var(--surface)', padding:32, borderRadius:32, border:'1px solid var(--border)', background: 'linear-gradient(to right, var(--surface), transparent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 20 }}>
                <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🏷️ Recommended Keywords</h3>
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>Add these specific terms to your skills or experience sections to bypass ATS filters.</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', fontSize: 13, color: 'var(--accent2)', fontWeight: 600 }}>
                    Impact: +{Math.floor(Math.random() * 15) + 15}% Visibility
                </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              {result.keywordsToAdd?.map((skill, i) => (
                <div key={i} style={{ background:'rgba(var(--accent-rgb), 0.05)', padding:'12px 24px', borderRadius:16, fontSize:14, border:'1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: 'var(--text)' }}>
                  <span style={{ color: 'var(--accent)', fontSize: 18 }}>+</span> {skill}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

  
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .upload-card:hover {
          border-color: var(--accent) !important;
          background: rgba(var(--accent-rgb), 0.08) !important;
          transform: translateY(-2px);
        }
        .hover-scale:hover {
          transform: translateX(10px);
          border-color: var(--accent) !important;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loader-dots::after {
          content: '...';
          animation: dots 1.5s steps(5, end) infinite;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          80%, 100% { content: ''; }
        }
      `}} />
    </div>
  );
}*/
import React, { useState, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- Gauge Component ---
function ScoreGauge({ score }) {
  const color = score >= 80 ? '#00e87a' : score >= 60 ? '#ffb547' : '#ff4d4d';
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position:'relative', width:140, height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{ textAlign:'center', zIndex: 1 }}>
        <div style={{ fontSize:36, fontWeight:900, color }}>{score}</div>
        <div style={{ fontSize:10, color:'gray' }}>ATS Score</div>
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

  // 🔥 FIXED ANALYZE FUNCTION
  const analyze = async () => {
    if (!file) return toast.error('Please upload a resume file');

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('targetRole', targetRole);

      // ❌ DON'T set Content-Type manually
      const res = await api.post('/agent/resume-upload', fd);

      if (res.data?.analysis) {
        setResult(res.data.analysis);
        toast.success('Career Blueprint Generated!');
      } else {
        toast.error('Invalid response from server');
      }

    } catch (e) {
      console.error("FRONTEND ERROR:", e);
      toast.error(e.response?.data?.error || 'AI Analysis Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding:'40px', maxWidth:900, margin:'auto', color:'white' }}>
      <h1>Resume Analyzer</h1>

      {/* Upload */}
      <div onClick={() => !loading && fileRef.current.click()}
        style={{ border:'2px dashed gray', padding:'30px', textAlign:'center', cursor:'pointer', marginBottom:'20px' }}
      >
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            const selected = e.target.files[0];
            setFile(selected);
            e.target.value = null; // 🔥 FIX re-upload
          }}
        />
        <p>{file ? file.name : "Click to upload resume"}</p>
      </div>

      {/* Role Input */}
      <input
        value={targetRole}
        onChange={e => setTargetRole(e.target.value)}
        placeholder="Target Role"
        style={{ padding:'10px', width:'100%', marginBottom:'20px' }}
      />

      {/* Button */}
      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* Result */}
      {result && (
        <div style={{ marginTop:'30px' }}>
          <ScoreGauge score={result.atsScore} />

          <h2>{result.overallVerdict}</h2>
          <p>{result.optimizedSummary}</p>

          <h3>Weaknesses</h3>
          <ul>
            {result.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>

          <h3>Roadmap</h3>
          <ul>
            {result.roadmap?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>

          <h3>Keywords</h3>
          <ul>
            {result.keywordsToAdd?.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}