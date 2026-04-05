import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extractTextFromBuffer(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str);
      fullText += strings.join(' ') + '\n';
    }

    return cleanResumeContent(fullText);
  } catch (err) {
    console.error('Extraction failed:', err.message);
    return '';
  }
}

//cleaning text and taking only usefull info
export function cleanResumeContent(text) {
  if (!text) return '';

  // Normalize
  text = text.normalize('NFKC').replace(/\r\n/g, '\n').replace(/\t/g, ' ');

  //  Remove emails
  text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, ' ');

  // Remove phone numbers
  text = text.replace(/\+?\d[\d\s-]{8,}\d/g, ' ');

  //  Remove URLs (http, https, www)
  text = text.replace(/https?:\/\/\S+|www\.\S+/gi, ' ');

  //  Remove social mentions (github, linkedin etc.)
  text = text.replace(/\b(github|linkedin|portfolio)\S*/gi, ' ');

  //  Split into lines/chunks
  const lines = text.split(/\n|\./);

  const filtered = lines.filter((line) => {
    const l = line.trim().toLowerCase();

    if (!l) return false;

    // Remove very short meaningless lines
    if (l.length < 4) return false;

    //  Remove lines with no letters (only numbers/symbols)
    if (!/[a-zA-Z]/.test(l)) return false;

    //  Remove contact-heavy lines
    if (/\S+@\S+/.test(l)) return false;
    if (/^\+?\d[\d\s-]+$/.test(l)) return false;

    //  Remove education-related lines
    const educationKeywords = [
      'education',
      'bachelor',
      'master',
      'degree',
      'university',
      'college',
      'institute',
      'school',
      'gpa',
      'cgpa',
      'graduation',
      'class x',
      'class xii',
    ];

    if (educationKeywords.some((k) => l.includes(k))) return false;

    //  Remove project section indicators (but not useful lines blindly)
    if (l.startsWith('project') || l.includes('github') || l.includes('live')) {
      return false;
    }

    //  Remove lines that are mostly digits
    const digitRatio = (l.match(/\d/g) || []).length / l.length;
    if (digitRatio > 0.5) return false;

    return true;
  });

  let cleaned = filtered.join(' ');

  //  Remove leftover names (basic heuristic)
  cleaned = cleaned.replace(/^\s*[A-Z][a-z]+\s[A-Z][a-z]+\s*$/gm, ' ');

  //  Remove separators
  cleaned = cleaned.replace(/\|/g, ' ');

  //  Fix spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  //  Limit size (AI-friendly)
  cleaned = cleaned.split(' ').slice(0, 500).join(' ');

  return cleaned;
}
