// const router = require('express').Router();
// const authMiddleware = require('../middleware/auth');
// const { callGemini } = require('../agents/geminiAgent');
// const { callClaude } = require('../agents/claudeAgent');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = './uploads';
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) cb(null, true);
//     else cb(new Error('Only PDF, DOC, DOCX, TXT files allowed'));
//   }
// });

// const callAI = async (prompt, system = '', messages = null) => {
//   try { return await callClaude(prompt, system, messages); }
//   catch (e) { return await callGemini(prompt, system); }
// };

// // Analyze by agent type
// router.post('/analyze', authMiddleware, async (req, res) => {
//   const { agentType, data } = req.body;
//   const io = req.app.get('io');
//   try {
//     let result;
//     switch (agentType) {
//       case 'profile':   result = await profileAgent(data); break;
//       case 'market':    result = await marketAgent(data); break;
//       case 'strategy':  result = await strategyAgent(data); break;
//       case 'interview': result = await interviewAgent(data); break;
//       case 'resume':    result = await resumeAgent(data); break;
//       case 'full':      result = await fullOrchestration(data, io, req.user.id); break;
//       default: return res.status(400).json({ error: 'Invalid agent type' });
//     }
//     res.json({ success: true, agentType, result });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // Chat with Claude AI (multi-turn)
// router.post('/chat', authMiddleware, async (req, res) => {
//   const { message, context, history = [] } = req.body;
//   const system = `You are PlaCIQ AI, powered by Claude (Anthropic). You are an elite placement intelligence system for engineering students in India. You give precise, actionable advice on DSA, system design, resume building, interview prep, career strategy, and company targeting. Student context: ${JSON.stringify(context?.profile || {})}. Be concise, use bullet points, give specific examples with numbers and company names.`;
//   try {
//     const messages = [...history.slice(-12), { role: 'user', content: message }];
//     const response = await callClaude(null, system, messages);
//     res.json({ response, model: 'claude', timestamp: new Date() });
//   } catch (e) {
//     try {
//       const response = await callGemini(message, system);
//       res.json({ response, model: 'gemini', timestamp: new Date() });
//     } catch (e2) { res.status(500).json({ error: 'AI unavailable' }); }
//   }
// });

// // Mock interview
// router.post('/mock-interview', authMiddleware, async (req, res) => {
//   const { role, round, previousAnswer, question } = req.body;
//   const prompt = previousAnswer
//     ? `Evaluate this ${role} interview answer as a senior engineer interviewer. Question: "${question}". Answer: "${previousAnswer}". Return JSON: {"score": 1-10, "verdict": "Strong/Good/Average/Weak", "strengths": [], "improvements": [], "modelAnswer": "brief ideal answer", "followUp": "follow-up question"}`
//     : `Generate 5 ${round || 'technical'} interview questions for ${role || 'SWE'} at top tech companies. Return JSON: {"questions": [{"q": "...", "difficulty": "Easy/Medium/Hard", "topic": "...", "timeLimit": 10, "hint": "..."}], "roundOverview": "what this round tests", "tips": []}`;
//   try {
//     const response = await callAI(prompt, 'Expert technical interviewer. Return valid JSON only, no markdown.');
//     let parsed; try { parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw: response }; }
//     res.json({ success: true, data: parsed });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // Resume upload + analysis
// router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//     let resumeText = '';
//     const filePath = req.file.path;
//     const ext = path.extname(req.file.originalname).toLowerCase();
//     if (ext === '.txt') {
//       resumeText = fs.readFileSync(filePath, 'utf-8');
//     } else if (ext === '.pdf') {
//       try {
//         const pdfParse = require('pdf-parse');
//         resumeText = (await pdfParse(fs.readFileSync(filePath))).text;
//       } catch { resumeText = '[PDF parsed - text extraction may be limited]'; }
//     } else {
//       resumeText = `[${ext.toUpperCase()} file uploaded: ${req.file.originalname}]`;
//     }
//     fs.unlink(filePath, () => {});

//     const analysis = await resumeAgent({ resumeText, role: req.body.targetRole || 'Software Engineer' });

//     try {
//       const User = require('../models/User');
//       if (req.user.id !== 'demo123')
//         await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.resumeText': resumeText.substring(0, 5000) } });
//     } catch {}

//     res.json({ success: true, filename: req.file.originalname, textLength: resumeText.length, resumePreview: resumeText.substring(0, 500), analysis });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// // Agent functions
// async function profileAgent(data) {
//   const prompt = `Analyze this engineering student profile for campus placement readiness:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON only:\n{"strengths": [], "weaknesses": [], "readinessScore": 0-100, "readinessLevel": "Beginner|Intermediate|Advanced|Ready", "summary": "2-3 sentences", "priorityActions": [], "estimatedTimeToPlacement": "X weeks", "skillGaps": [], "placementChance": 0-100, "targetTier": "tier1|tier2|tier3"}`;
//   const resp = await callAI(prompt, 'Expert placement analyst. Return valid JSON only, no markdown.');
//   try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp, readinessScore: 65, placementChance: 60 }; }
// }

// async function marketAgent(data) {
//   const prompt = `Current 2024-2025 Indian tech campus placement market for ${data.role || 'SWE'} with skills: ${(data.skills || []).join(', ')}.\n\nReturn JSON only:\n{"topRoles": [], "hotSkills": [{"skill": "name", "demand": 0-100}], "topHiringCompanies": [], "averageSalary": {"entry": "X LPA"}, "trend": "insight", "campusSeasonPeak": "month", "emergingRoles": [], "interviewTrends": []}`;
//   const resp = await callAI(prompt, 'Tech market analyst. Return valid JSON only.');
//   try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
// }

// async function strategyAgent(data) {
//   const prompt = `Create a placement roadmap for:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON only:\n{"timeline": "X weeks", "phases": [{"week": "1-4", "focus": "topic", "tasks": [], "resources": [], "milestone": "..."}], "dailyTarget": "X hours", "weeklyGoal": "...", "topTip": "...", "warningAreas": []}`;
//   const resp = await callAI(prompt, 'Strategic career coach. Return valid JSON only.');
//   try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
// }

// async function interviewAgent(data) {
//   const prompt = `Interview prep for ${data.role || 'SWE'} at ${(data.companies || ['top tech']).join(', ')}. Skills: ${(data.skills||[]).join(', ')}.\n\nReturn JSON only:\n{"questions": [{"q": "...", "difficulty": "Easy/Medium/Hard", "topic": "...", "hint": "...", "timeLimit": 15}], "commonMistakes": [], "tipsToStandOut": [], "mustPracticeTopics": []}`;
//   const resp = await callAI(prompt, 'Expert FAANG interviewer. Return valid JSON only.');
//   try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
// }

// async function resumeAgent(data) {
//   const hasText = data.resumeText && data.resumeText.length > 50;
//   const prompt = hasText
//     ? `Analyze resume for ATS optimization. Target: ${data.role}.\n\nRESUME:\n${data.resumeText.substring(0, 3000)}\n\nReturn ONLY this JSON format:\n{\n  "atsScore": 75,\n  "overallVerdict": "Good - needs minor improvements",\n  "improvements": [{"issue": "description", "fix": "solution", "priority": "high"}],\n  "optimizedSummary": "Better version of summary",\n  "keywordsToAdd": ["keyword1"],\n  "keywordsFound": ["keyword2"],\n  "sectionScores": {"experience": 75, "skills": 80, "projects": 65, "education": 85},\n  "quickWins": ["tip1"]\n}`
//     : `Generate resume advice for ${data.role}. Return same JSON structure.`;
//   const resp = await callAI(prompt, 'You are an expert ATS optimizer. Always return valid JSON with atsScore as a number 0-100. No markdown, no explanation, just JSON.');
//   try { 
//     const parsed = JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim());
//     return {
//       atsScore: Math.min(100, Math.max(0, parseInt(parsed.atsScore) || 65)),
//       overallVerdict: parsed.overallVerdict || 'Resume analyzed',
//       improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
//       optimizedSummary: parsed.optimizedSummary || '',
//       keywordsToAdd: Array.isArray(parsed.keywordsToAdd) ? parsed.keywordsToAdd : [],
//       keywordsFound: Array.isArray(parsed.keywordsFound) ? parsed.keywordsFound : [],
//       sectionScores: parsed.sectionScores || { experience: 70, skills: 70, projects: 70, education: 70 },
//       quickWins: Array.isArray(parsed.quickWins) ? parsed.quickWins : []
//     };
//   } catch (e) { 
//     console.error('Resume parse error:', e, 'Response:', resp.substring(0, 200));
//     return { atsScore: 0, overallVerdict: 'Error analyzing', improvements: [], keywordsToAdd: [], keywordsFound: [] }; 
//   }
// }

// async function fullOrchestration(data, io, userId) {
//   const steps = ['profile', 'market', 'strategy', 'interview', 'resume'];
//   const results = {};
//   for (const step of steps) {
//     if (io) io.emit(`agent_progress_${userId}`, { step, status: 'running' });
//     try {
//       switch(step) {
//         case 'profile':   results.profile = await profileAgent(data); break;
//         case 'market':    results.market = await marketAgent(data); break;
//         case 'strategy':  results.strategy = await strategyAgent({...data, profileAnalysis: results.profile}); break;
//         case 'interview': results.interview = await interviewAgent(data); break;
//         case 'resume':    results.resume = await resumeAgent(data); break;
//       }
//       if (io) io.emit(`agent_progress_${userId}`, { step, status: 'done', data: results[step] });
//     } catch (e) {
//       results[step] = { error: e.message };
//       if (io) io.emit(`agent_progress_${userId}`, { step, status: 'error' });
//     }
//     await new Promise(r => setTimeout(r, 400));
//   }
//   return results;
// }

// module.exports = router;

// const router = require('express').Router();
// const authMiddleware = require('../middleware/auth');
// const { callGemini } = require('../agents/geminiAgent');
// const { callClaude } = require('../agents/claudeAgent');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const pdfParse = require('pdf-parse');

// // FIX: Use Memory Storage for Render (more reliable than disk storage)
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage, 
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// const callAI = async (prompt, system = '', messages = null) => {
//   try { return await callClaude(prompt, system, messages); }
//   catch (e) { return await callGemini(prompt, system); }
// };

// // --- AGENT FUNCTIONS ---

// async function resumeAgent(data) {
//   const hasText = data.resumeText && data.resumeText.length > 50;
  
//   const prompt = hasText
//     ? `Analyze this resume for the role of: ${data.role}. 
//        Evaluate ATS compatibility, identify skill gaps, and provide a career roadmap.
       
//        RESUME TEXT:
//        ${data.resumeText.substring(0, 3500)}

//        RETURN ONLY A VALID JSON OBJECT (No markdown, no backticks):
//        {
//          "atsScore": 0-100,
//          "overallVerdict": "Short summary",
//          "improvements": [{"priority": "high|medium|low", "issue": "str", "fix": "str"}],
//          "weaknesses": ["list specific missing skills or red flags"],
//          "roadmap": ["Step 1 for next 7 days", "Step 2 for next 14 days", "Step 3 for next 30 days"],
//          "optimizedSummary": "AI-written executive summary",
//          "keywordsToAdd": ["list"],
//          "keywordsFound": ["list"],
//          "sectionScores": {"experience": 0-100, "skills": 0-100, "projects": 0-100, "education": 0-100}
//        }`
//     : `Generate general resume advice for ${data.role}. Return the same JSON structure.`;

//   const resp = await callAI(prompt, 'Expert Career Coach & ATS Optimizer. Return raw JSON only.');
  
//   try {
//     const cleaned = resp.replace(/```json\n?|\n?```/g, '').trim();
//     const parsed = JSON.parse(cleaned);
//     return {
//       ...parsed,
//       weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ["General improvements needed"],
//       roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : ["Update skills", "Practice LeetCode", "Apply"]
//     };
//   } catch (e) {
//     console.error("Parse Error:", e);
//     return { atsScore: 60, overallVerdict: "Check formatting", weaknesses: ["Parsing error"], roadmap: ["Try again"] };
//   }
// }

// // ... (Existing profileAgent, marketAgent, strategyAgent, interviewAgent logic remains same)

// // --- ROUTES ---

// // Resume upload + analysis
// router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
//     let resumeText = '';
//     const ext = path.extname(req.file.originalname).toLowerCase();

//     if (ext === '.pdf') {
//       const data = await pdfParse(req.file.buffer);
//       resumeText = data.text;
//     } else {
//       resumeText = req.file.buffer.toString('utf-8');
//     }

//     const analysis = await resumeAgent({ 
//       resumeText, 
//       role: req.body.targetRole || 'Software Engineer' 
//     });

//     // Save to DB if not demo
//     try {
//       const User = require('../models/User');
//       if (req.user.id !== 'demo123') {
//         await User.findByIdAndUpdate(req.user.id, { 
//           $set: { 'profile.resumeText': resumeText.substring(0, 5000) } 
//         });
//       }
//     } catch (dbErr) { console.error("DB Save Error:", dbErr); }

//     res.json({ success: true, analysis });
//   } catch (e) {
//     console.error("Upload Error:", e);
//     res.status(500).json({ error: e.message });
//   }
// });

// // Standard Agent Analysis
// router.post('/analyze', authMiddleware, async (req, res) => {
//   const { agentType, data } = req.body;
//   try {
//     let result;
//     if (agentType === 'resume') result = await resumeAgent(data);
//     else if (agentType === 'profile') result = await profileAgent(data);
//     else if (agentType === 'market') result = await marketAgent(data);
//     // ... add other cases
//     res.json({ success: true, result });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// module.exports = router;


// const router = require('express').Router();
// const authMiddleware = require('../middleware/auth');
// const { callGemini } = require('../agents/geminiAgent');
// const { callClaude } = require('../agents/claudeAgent');
// const multer = require('multer');
// const path = require('path');
// const pdfParse = require('pdf-parse');

// // Memory storage is best for serverless/Render environments
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage, 
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// const callAI = async (prompt, system = '', messages = null) => {
//   try { return await callClaude(prompt, system, messages); }
//   catch (e) { return await callGemini(prompt, system); }
// };

// // --- HELPER: JSON Cleaner ---
// const parseAIResponse = (resp) => {
//   try {
//     const cleaned = resp.replace(/```json\n?|\n?```/g, '').trim();
//     return JSON.parse(cleaned);
//   } catch (e) {
//     console.error("Failed to parse AI JSON:", resp);
//     throw new Error("AI returned invalid data format");
//   }
// };

// // --- AGENT FUNCTIONS ---

// async function resumeAgent(data) {
//   const prompt = `Analyze resume for role: ${data.role}. 
//   RESUME TEXT: ${data.resumeText?.substring(0, 3500)}
  
//   Return JSON:
//   {
//     "atsScore": number,
//     "overallVerdict": "string",
//     "weaknesses": ["specific gaps"],
//     "roadmap": ["Step 1", "Step 2", "Step 3"],
//     "keywordsToAdd": ["skills to learn"],
//     "optimizedSummary": "string",
//     "sectionScores": {"experience": 80, "skills": 70, "projects": 60, "education": 90}
//   }`;
//   const resp = await callAI(prompt, 'Expert ATS Optimizer. Return raw JSON only.');
//   return parseAIResponse(resp);
// }

// async function profileAgent(data) {
//   const prompt = `Analyze student profile: ${JSON.stringify(data)}.
//   Return JSON:
//   {
//     "readinessScore": number,
//     "readinessLevel": "Beginner|Intermediate|Ready",
//     "summary": "string",
//     "weaknesses": ["skill gaps"],
//     "roadmap": ["Week 1 prep", "Week 2 prep"],
//     "priorityActions": ["action 1"]
//   }`;
//   const resp = await callAI(prompt, 'Placement Officer. Return JSON.');
//   return parseAIResponse(resp);
// }

// async function marketAgent(data) {
//   const prompt = `Tech market trends 2025-2026 for ${data.role}. 
//   Return JSON:
//   {
//     "hotSkills": [{"skill": "name", "demand": 90}],
//     "topHiringCompanies": ["names"],
//     "averageSalary": "string",
//     "roadmap": ["Learning path for market readiness"]
//   }`;
//   const resp = await callAI(prompt, 'Market Analyst. Return JSON.');
//   return parseAIResponse(resp);
// }

// async function strategyAgent(data) {
//   const prompt = `Create placement strategy for ${data.role}.
//   Return JSON:
//   {
//     "phases": [{"week": "1", "focus": "topic", "tasks": []}],
//     "roadmap": ["Long term goals"],
//     "weaknesses": ["Potential strategy pitfalls"]
//   }`;
//   const resp = await callAI(prompt, 'Career Strategist. Return JSON.');
//   return parseAIResponse(resp);
// }

// async function interviewAgent(data) {
//   const prompt = `Interview prep for ${data.role}.
//   Return JSON:
//   {
//     "questions": [{"q": "text", "difficulty": "Hard"}],
//     "weaknesses": ["Common mistake areas"],
//     "roadmap": ["Mock interview schedule"]
//   }`;
//   const resp = await callAI(prompt, 'Technical Interviewer. Return JSON.');
//   return parseAIResponse(resp);
// }

// // --- ROUTES ---

// router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//     let resumeText = (path.extname(req.file.originalname).toLowerCase() === '.pdf') 
//       ? (await pdfParse(req.file.buffer)).text 
//       : req.file.buffer.toString('utf-8');

//     const analysis = await resumeAgent({ resumeText, role: req.body.targetRole || 'Software Engineer' });

//     // Optional: Update user record with resume text
//     const User = require('../models/User');
//     if (req.user.id !== 'demo123') {
//       await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.resumeText': resumeText.substring(0, 5000) } });
//     }

//     res.json({ success: true, analysis });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// router.post('/analyze', authMiddleware, async (req, res) => {
//   const { agentType, data } = req.body;
//   try {
//     let result;
//     switch (agentType) {
//       case 'resume':    result = await resumeAgent(data); break;
//       case 'profile':   result = await profileAgent(data); break;
//       case 'market':    result = await marketAgent(data); break;
//       case 'strategy':  result = await strategyAgent(data); break;
//       case 'interview': result = await interviewAgent(data); break;
//       default: return res.status(400).json({ error: 'Invalid agent' });
//     }
//     res.json({ success: true, result });
//   } catch (e) { res.status(500).json({ error: e.message }); }
// });

// module.exports = router;

// const router = require('express').Router();
// const authMiddleware = require('../middleware/auth');
// const { callGemini } = require('../agents/geminiAgent');
// const { callClaude } = require('../agents/claudeAgent');
// const multer = require('multer');
// const path = require('path');
// const pdfParse = require('pdf-parse');

// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage, 
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// const callAI = async (prompt, system = '', messages = null) => {
//   try { return await callClaude(prompt, system, messages); }
//   catch (e) { return await callGemini(prompt, system); }
// };

// // --- HELPER: Aggressive JSON Extractor ---
// const parseAIResponse = (resp) => {
//   try {
//     // This regex finds the first { and last } to extract JSON even if AI adds conversational text
//     const jsonMatch = resp.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in response");
    
//     const cleaned = jsonMatch[0].trim();
//     return JSON.parse(cleaned);
//   } catch (e) {
//     console.error("Failed to parse AI JSON. Raw response length:", resp.length);
//     throw new Error("AI returned unreadable data. Please try again.");
//   }
// };

// // --- AGENT FUNCTIONS ---

// async function resumeAgent(data) {
//   const prompt = `
//     Analyze this resume for the role: ${data.role}.
//     RESUME TEXT: 
//     ${data.resumeText?.substring(0, 4000)}

//     Instructions:
//     1. Calculate an ATS score (0-100).
//     2. Identify specific skill gaps (Weaknesses).
//     3. Create a 3-step action roadmap.
//     4. Extract/Recommend 8-10 keywords.
//     5. Write a 3-sentence executive summary.

//     Return ONLY a raw JSON object with this exact structure:
//     {
//       "atsScore": number,
//       "overallVerdict": "string",
//       "weaknesses": ["string"],
//       "roadmap": ["string"],
//       "keywordsToAdd": ["string"],
//       "optimizedSummary": "string",
//       "sectionScores": {"experience": 80, "skills": 70, "projects": 60, "education": 90}
//     }
//   `;
//   const resp = await callAI(prompt, 'You are a Senior Technical Recruiter and ATS Expert. You only communicate in raw JSON.');
//   return parseAIResponse(resp);
// }

// // ... (Other agents: profileAgent, marketAgent, etc. remain similar but use parseAIResponse)

// // --- ROUTES ---

// router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

//     let resumeText = '';
//     const ext = path.extname(req.file.originalname).toLowerCase();

//     if (ext === '.pdf') {
//       try {
//         const pdfData = await pdfParse(req.file.buffer);
//         resumeText = pdfData.text;
//       } catch (pdfErr) {
//         return res.status(400).json({ error: 'Failed to read PDF. Ensure it is not password protected.' });
//       }
//     } else {
//       resumeText = req.file.buffer.toString('utf-8');
//     }

//     if (!resumeText || resumeText.length < 50) {
//       return res.status(400).json({ error: 'Resume text is too short or unreadable.' });
//     }

//     // Call Agent
//     const analysis = await resumeAgent({ 
//       resumeText, 
//       role: req.body.targetRole || 'Software Engineer' 
//     });

//     // Save Resume Text to User Profile (Async)
//     const User = require('../models/User');
//     if (req.user.id !== 'demo123') {
//       User.findByIdAndUpdate(req.user.id, { 
//         $set: { 'profile.resumeText': resumeText.substring(0, 5000) } 
//       }).catch(e => console.error("DB Update Error:", e));
//     }

//     res.json({ success: true, analysis });

//   } catch (e) {
//     console.error("Backend Agent Error:", e);
//     res.status(500).json({ error: e.message || 'Server-side analysis failed' });
//   }
// });

// // Generic Analyze route
// router.post('/analyze', authMiddleware, async (req, res) => {
//     const { agentType, data } = req.body;
//     try {
//       let result;
//       switch (agentType) {
//         case 'resume':    result = await resumeAgent(data); break;
//         // Ensure other agents are updated to use parseAIResponse
//         default: return res.status(400).json({ error: 'Invalid agent type' });
//       }
//       res.json({ success: true, result });
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
// });

// moduleconst.exports = router;

 /*router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { callGemini } = require('../agents/geminiAgent');
const { callClaude } = require('../agents/claudeAgent');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }
});

const callAI = async (prompt, system = '', messages = null) => {
  try { return await callClaude(prompt, system, messages); }
  catch (e) { return await callGemini(prompt, system); }
};

// --- HELPER: Aggressive JSON Extractor ---
const parseAIResponse = (resp) => {
  try {
    // This regex finds the first { and last } to extract JSON even if AI adds conversational text
    const jsonMatch = resp.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const cleaned = jsonMatch[0].trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON. Raw response length:", resp.length);
    throw new Error("AI returned unreadable data. Please try again.");
  }
};

// --- AGENT FUNCTIONS ---

async function resumeAgent(data) {
  const prompt = `
    Analyze this resume for the role: ${data.role}.
    RESUME TEXT: 
    ${data.resumeText?.substring(0, 4000)}

    Instructions:
    1. Calculate an ATS score (0-100).
    2. Identify specific skill gaps (Weaknesses).
    3. Create a 3-step action roadmap.
    4. Extract/Recommend 8-10 keywords.
    5. Write a 3-sentence executive summary.

    Return ONLY a raw JSON object with this exact structure:
    {
      "atsScore": number,
      "overallVerdict": "string",
      "weaknesses": ["string"],
      "roadmap": ["string"],
      "keywordsToAdd": ["string"],
      "optimizedSummary": "string",
      "sectionScores": {"experience": 80, "skills": 70, "projects": 60, "education": 90}
    }
  `;
  const resp = await callAI(prompt, 'You are a Senior Technical Recruiter and ATS Expert. You only communicate in raw JSON.');
  return parseAIResponse(resp);
}

// ... (Other agents: profileAgent, marketAgent, etc. remain similar but use parseAIResponse)

// --- ROUTES ---

router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (pdfErr) {
        return res.status(400).json({ error: 'Failed to read PDF. Ensure it is not password protected.' });
      }
    } else {
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume text is too short or unreadable.' });
    }

    // Call Agent
    const analysis = await resumeAgent({ 
      resumeText, 
      role: req.body.targetRole || 'Software Engineer' 
    });

    // Save Resume Text to User Profile (Async)
    const User = require('../models/User');
    if (req.user.id !== 'demo123') {
      User.findByIdAndUpdate(req.user.id, { 
        $set: { 'profile.resumeText': resumeText.substring(0, 5000) } 
      }).catch(e => console.error("DB Update Error:", e));
    }

    res.json({ success: true, analysis });

  } catch (e) {
    console.error("Backend Agent Error:", e);
    res.status(500).json({ error: e.message || 'Server-side analysis failed' });
  }
});

// Generic Analyze route
router.post('/analyze', authMiddleware, async (req, res) => {
    const { agentType, data } = req.body;
    try {
      let result;
      switch (agentType) {
        case 'resume':    result = await resumeAgent(data); break;
        // Ensure other agents are updated to use parseAIResponse
        default: return res.status(400).json({ error: 'Invalid agent type' });
      }
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
});

module.exports = router;*/
//new change at 10.05
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');

const {
  resumeAgent,
  profileAgent,
  roadmapAgent,
  marketAgent
} = require('../agents/geminiAgent');

const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');

// 📂 Multer Setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 🚀 RESUME UPLOAD + ANALYSIS
router.post(
  '/resume-upload',
  authMiddleware,
  upload.single('resume'),
  async (req, res) => {
    try {
      console.log("📂 File received:", req.file?.originalname);

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let resumeText = '';
      const ext = path.extname(req.file.originalname).toLowerCase();

      // 📄 PDF handling
      if (ext === '.pdf') {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text;
        } catch (err) {
          return res.status(400).json({
            error: 'Failed to read PDF (maybe protected)'
          });
        }
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }

      console.log("📄 Extracted length:", resumeText.length);

      if (!resumeText || resumeText.length < 50) {
        return res.status(400).json({
          error: 'Resume text too short or unreadable'
        });
      }

      // 🤖 AI CALL
      const analysis = await resumeAgent({
        resumeText,
        role: req.body.targetRole || 'Software Engineer'
      });

      // 💾 Save to DB (async)
      const User = require('../models/User');
      if (req.user.id !== 'demo123') {
        User.findByIdAndUpdate(req.user.id, {
          $set: { 'profile.resumeText': resumeText.slice(0, 5000) }
        }).catch(err => console.error("DB Save Error:", err));
      }

      res.json({
        success: true,
        analysis
      });

    } catch (e) {
      console.error("🔥 Resume Route Error:", e);
      res.status(500).json({
        error: e.message || 'Server error'
      });
    }
  }
);

// 🧠 GENERIC MULTI-AI ROUTE
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { agentType, data } = req.body;

    let result;

    switch (agentType) {
      case 'resume':
        result = await resumeAgent(data);
        break;

      case 'profile':
        result = await profileAgent(data);
        break;

      case 'roadmap':
        result = await roadmapAgent(data);
        break;

      case 'market':
        result = await marketAgent();
        break;

      default:
        return res.status(400).json({
          error: 'Invalid agent type'
        });
    }

    res.json({ success: true, result });

  } catch (e) {
    console.error("🔥 Analyze Route Error:", e);
    res.status(500).json({
      error: e.message
    });
  }
});

module.exports = router;