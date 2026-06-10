const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// ── Extract raw text from file ───────────────────────────────
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.doc' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type for CV parsing.');
}

// ── Parse raw text into structured data ──────────────────────
function parseCV(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone
  const phoneMatch = rawText.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Full name — heuristic: first non-empty line that looks like a name
  const fullName = lines.find((l) => /^[A-Z][a-z]+ [A-Z][a-z]+/.test(l)) || lines[0] || '';

  // Skills — look for a skills section
  const skillKeywords = [
    'javascript','typescript','react','vue','angular','node','express','python',
    'django','flask','java','spring','php','laravel','ruby','rails','c++','c#',
    'mongodb','mysql','postgresql','redis','graphql','rest','docker','kubernetes',
    'aws','azure','gcp','git','linux','figma','sketch','photoshop','excel',
    'tableau','powerbi','sql','r','tensorflow','pytorch','machine learning','nlp',
    'agile','scrum','jira','roadmapping','html','css','sass','tailwind','webpack',
    'jenkins','ci/cd','terraform','ansible','hadoop','spark','data analysis',
  ];

  const textLower = rawText.toLowerCase();
  const skills = skillKeywords.filter((sk) => textLower.includes(sk));

  // Education — lines containing degree keywords
  const eduKeywords = /bachelor|master|phd|doctorate|degree|university|college|bsc|msc|mba|b\.tech|m\.tech/i;
  const education = lines.filter((l) => eduKeywords.test(l)).slice(0, 5);

  // Experience — lines containing year ranges or job title hints
  const expKeywords = /\d{4}\s*[-–]\s*(\d{4}|present)|engineer|developer|manager|analyst|designer|consultant|intern/i;
  const experience = lines.filter((l) => expKeywords.test(l)).slice(0, 8);

  return { fullName, email, phone, skills, education, experience, rawText };
}

// ── Score candidate against a job ────────────────────────────
function scoreCandidate(parsedData, job) {
  const qualMap = { Any: 1, Bachelor: 2, Master: 3, PhD: 4 };

  // Skills score (50%)
  const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
  const candidateSkillsLower = (parsedData.skills || []).map((s) => s.toLowerCase());
  const matchedSkills = job.skills.filter((s) => candidateSkillsLower.includes(s.toLowerCase()));
  const missingSkills = job.skills.filter((s) => !candidateSkillsLower.includes(s.toLowerCase()));
  const skillsScore = job.skills.length > 0 ? Math.round((matchedSkills.length / job.skills.length) * 100) : 100;

  // Experience score (30%) — rough parse from rawText
  const yearMatches = parsedData.rawText?.match(/\b(20\d{2}|19\d{2})\b/g) || [];
  const years = yearMatches.map(Number).filter((y) => y >= 2000 && y <= new Date().getFullYear());
  const estimatedExp = years.length >= 2 ? Math.max(0, Math.max(...years) - Math.min(...years)) : 0;
  const expScore = job.experience > 0 ? Math.min(100, Math.round((estimatedExp / job.experience) * 100)) : 100;

  // Qualification score (20%)
  const rawLower = (parsedData.rawText || '').toLowerCase();
  let candidateQual = 1;
  if (rawLower.includes('phd') || rawLower.includes('doctorate')) candidateQual = 4;
  else if (rawLower.includes('master') || rawLower.includes('msc') || rawLower.includes('mba')) candidateQual = 3;
  else if (rawLower.includes('bachelor') || rawLower.includes('bsc') || rawLower.includes('b.tech')) candidateQual = 2;
  const requiredQual = qualMap[job.qualification] || 1;
  const qualScore = Math.min(100, Math.round((candidateQual / requiredQual) * 100));

  const totalScore = Math.round(skillsScore * 0.5 + expScore * 0.3 + qualScore * 0.2);

  return {
    score: Math.min(100, totalScore),
    matchedSkills,
    missingSkills,
    scoreBreakdown: { skillsScore, expScore, qualScore },
  };
}

module.exports = { extractText, parseCV, scoreCandidate };
