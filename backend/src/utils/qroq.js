import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function extractSkills(resumeText) {
  if (!isValidResume(resumeText)) {
    return [];
  }
  const prompt = buildPrompt(resumeText);
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    response_format: { type: 'json_object' },
  });
  return response.choices[0].message.content;
}

export function parseSkills(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON from Groq:', raw);
    return null;
  }
}

function isValidResume(text) {
  return text && text.length > 30;
}

function buildPrompt(resumeText) {
  return `
    You are a strict resume parser.

    Your task is to extract ONLY technical skills explicitly present in the resume text.

    VERY IMPORTANT RULES:
    - If the resume text does NOT contain clear technical skills, return EMPTY list
    - DO NOT guess or assume skills
    - DO NOT add common developer skills
    - ONLY extract skills that are explicitly written
    - If input is meaningless, empty, or unrelated → return empty array
    - Do NOT add explanation
    - Do NOT add any text before or after JSON
    - Do NOT use markdown (no \`\`\`)
    - Return ONLY raw JSON

    Output:
    Return ONLY valid JSON.

    Format:
    {
    "technical_skills": []
    }

    Resume Text:
    ${resumeText}
    `;
}
