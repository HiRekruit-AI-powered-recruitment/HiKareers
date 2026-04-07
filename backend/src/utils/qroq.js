import Groq from 'groq-sdk';
import PRESET_SKILLS from '../utils/skills.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function extractSkills(resumeText) {
  if (!isValidResume(resumeText)) return [];

  const prompt = buildPrompt(resumeText);

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;

  return parseSkills(raw);
}

export function parseSkills(raw) {
  try {
    if (Array.isArray(raw)) {
      return normalizeArray(raw);
    }

    if (!raw) return [];

    const text = raw.trim();

    if (text.startsWith('{')) {
      const parsed = JSON.parse(text);
      return normalizeArray(parsed.technical_skills || []);
    }

    if (text.startsWith('[')) {
      try {
        return normalizeArray(JSON.parse(text));
      } catch {
        const jsonified = text.replace(/'/g, '"');
        try {
          return normalizeArray(JSON.parse(jsonified));
        } catch {
          const matches = [...text.matchAll(/['"]([^'"]+)['"]/g)];
          return normalizeArray(matches.map((m) => m[1]));
        }
      }
    }

    return [];
  } catch (err) {
    console.error('Parsing failed:', raw);
    return [];
  }
}

function normalizeArray(skills) {
  return [...new Set(skills.map((s) => normalizeSkill(s)).filter(Boolean))];
}

const SORTED_PRESETS = [...PRESET_SKILLS].sort((a, b) => b.length - a.length);

function normalizeSkill(inputSkill) {
  if (!inputSkill) return null;

  const cleaned = cleanSkill(inputSkill);
  const skillClean = cleaned.replace(/\.|-/g, '');

  for (let preset of SORTED_PRESETS) {
    const presetClean = preset.toLowerCase().replace(/\.|-/g, '').trim();

    if (skillClean === presetClean) return preset;
    if (skillClean.includes(presetClean) || presetClean.includes(skillClean))
      return preset;
  }

  const withoutJs = cleaned.replace(/\.js$/, '').trim();
  if (withoutJs !== cleaned) {
    for (let preset of SORTED_PRESETS) {
      const presetClean = preset.toLowerCase().replace(/\.|-/g, '').trim();
      const skillClean2 = withoutJs.replace(/\.|-/g, '');

      if (skillClean2 === presetClean) return preset;
      if (
        skillClean2.includes(presetClean) ||
        presetClean.includes(skillClean2)
      )
        return preset;
    }
  }

  return null;
}

function cleanSkill(skill) {
  return skill
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\brest\s+apis?\b/g, 'rest api')
    .replace(/\s+js$/i, '.js')
    .replace(/^js$/i, 'javascript')
    .replace(/[^a-z0-9\s\.\+\#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function isValidResume(text) {
  return text && text.length > 30;
}

function buildPrompt(resumeText) {
  return `
      You are a skill extractor. Output ONLY a JSON object. No explanation. No markdown. No arrays at top level.

      REQUIRED FORMAT (exactly):
      {"technical_skills": ["Skill1", "Skill2"]}

      If no skills found: {"technical_skills": []}

      Rules:
      - Must start with { and end with }
      - Double quotes only
      - No single quotes
      - No top-level array

      Resume:
      ${resumeText}
    `;
}
