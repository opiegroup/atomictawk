// Profanity filter for comments
// Blocks or flags comments containing inappropriate language

// Common profanity list (can be expanded)
const PROFANITY_LIST = [
  // Explicit terms
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks', 'fck', 'f*ck', 'f**k',
  'shit', 'shitting', 'shitty', 'sh*t', 's**t',
  'ass', 'asshole', 'arse', 'arsehole',
  'bitch', 'bitches', 'b*tch',
  'cunt', 'c*nt', 'c**t',
  'dick', 'dicks', 'd*ck',
  'cock', 'cocks', 'c*ck',
  'pussy', 'pussies', 'p*ssy',
  'whore', 'wh*re',
  'slut', 'sl*t',
  'bastard', 'b*stard',
  'damn', 'dammit', 'goddamn',
  'piss', 'pissed', 'pissing',
  'crap', 'crappy',
  'bollocks', 'b*llocks',
  'wanker', 'w*nker',
  'twat', 'tw*t',
  
  // Slurs and hate speech
  'nigger', 'n*gger', 'nigga', 'n*gga',
  'faggot', 'fag', 'f*ggot', 'f*g',
  'retard', 'retarded', 'r*tard',
  'spastic', 'spaz',
  'tranny', 'tr*nny',
  'chink', 'ch*nk',
  'kike', 'k*ke',
  'wetback',
  'beaner',
  'gook',
  'dyke', 'd*ke',
  
  // Sexual terms
  'porn', 'porno', 'pornography',
  'xxx',
  'blowjob', 'blow job',
  'handjob', 'hand job',
  'dildo',
  'vibrator',
  'orgasm',
  'masturbate', 'masturbating', 'masturbation',
  'ejaculate', 'ejaculation',
  'cum', 'cumming', 'cumshot',
  'jizz',
  'tits', 'titties', 'boobs', 'boobies',
  'nipple', 'nipples',
  'penis', 'vagina', 'genitals',
  
  // Violence
  'kill yourself', 'kys',
  'murder',
  'suicide',
  'rape', 'raping', 'rapist',
  
  // Spam patterns
  'buy now', 'click here', 'free money',
  'make money fast', 'work from home',
  'nigerian prince',
];

// Leetspeak and character substitution patterns
const LEET_SUBSTITUTIONS: Record<string, string[]> = {
  'a': ['4', '@', 'α', 'а'],
  'b': ['8', '|3', 'ß'],
  'c': ['(', '<', '¢'],
  'e': ['3', '€', 'ε', 'е'],
  'g': ['6', '9'],
  'h': ['#', '|-|'],
  'i': ['1', '!', '|', 'ι', 'і'],
  'l': ['1', '|', '£'],
  'o': ['0', 'ο', 'о'],
  's': ['5', '$', '§'],
  't': ['7', '+', '†'],
  'u': ['μ', 'υ'],
};

// Normalize text by removing leetspeak and special characters
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace leetspeak characters
  for (const [letter, substitutions] of Object.entries(LEET_SUBSTITUTIONS)) {
    for (const sub of substitutions) {
      normalized = normalized.split(sub).join(letter);
    }
  }
  
  // Remove common separators used to bypass filters
  normalized = normalized.replace(/[\s\-_\.•·\*\+]+/g, '');
  
  return normalized;
}

// Check if text contains profanity
export function containsProfanity(text: string): { 
  hasProfanity: boolean; 
  matches: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const normalizedText = normalizeText(text);
  const originalLower = text.toLowerCase();
  const matches: string[] = [];
  
  for (const word of PROFANITY_LIST) {
    const normalizedWord = normalizeText(word);
    
    // Check in normalized text (catches leetspeak)
    if (normalizedText.includes(normalizedWord)) {
      matches.push(word);
    }
    // Also check original for multi-word phrases
    else if (word.includes(' ') && originalLower.includes(word)) {
      matches.push(word);
    }
  }
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  
  // High severity: slurs, hate speech, violence
  const highSeverityTerms = [
    'nigger', 'faggot', 'retard', 'kike', 'chink', 'tranny',
    'kill yourself', 'kys', 'rape', 'suicide'
  ];
  
  // Medium severity: explicit sexual content
  const mediumSeverityTerms = [
    'fuck', 'cunt', 'cock', 'pussy', 'porn', 'cum', 'dick'
  ];
  
  for (const match of matches) {
    const normalized = normalizeText(match);
    if (highSeverityTerms.some(term => normalizeText(term) === normalized)) {
      severity = 'high';
      break;
    }
    if (mediumSeverityTerms.some(term => normalizeText(term) === normalized)) {
      severity = 'medium';
    }
  }
  
  return {
    hasProfanity: matches.length > 0,
    matches: [...new Set(matches)], // Remove duplicates
    severity,
  };
}

// Censor profanity in text (replace with asterisks)
export function censorProfanity(text: string): string {
  let censored = text;
  
  for (const word of PROFANITY_LIST) {
    if (!word.includes(' ')) {
      // Single word - use word boundary regex
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      censored = censored.replace(regex, (match) => {
        if (match.length <= 2) return '*'.repeat(match.length);
        return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
      });
    } else {
      // Multi-word phrase
      const regex = new RegExp(escapeRegex(word), 'gi');
      censored = censored.replace(regex, (match) => {
        return match.split(' ').map(w => {
          if (w.length <= 2) return '*'.repeat(w.length);
          return w[0] + '*'.repeat(w.length - 2) + w[w.length - 1];
        }).join(' ');
      });
    }
  }
  
  return censored;
}

// Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validate comment before submission
export function validateComment(text: string): {
  isValid: boolean;
  reason?: string;
  censoredText?: string;
  severity?: 'low' | 'medium' | 'high';
} {
  // Check for empty
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Comment cannot be empty' };
  }
  
  // Check minimum length
  if (text.trim().length < 2) {
    return { isValid: false, reason: 'Comment is too short' };
  }
  
  // Check maximum length
  if (text.length > 2000) {
    return { isValid: false, reason: 'Comment is too long (max 2000 characters)' };
  }
  
  // Check for profanity
  const profanityCheck = containsProfanity(text);
  
  if (profanityCheck.hasProfanity) {
    // High severity - block completely
    if (profanityCheck.severity === 'high') {
      return {
        isValid: false,
        reason: 'Your comment contains inappropriate language that is not allowed.',
        severity: 'high',
      };
    }
    
    // Medium/Low severity - censor and allow, or block based on settings
    // For now, we'll censor medium severity and block completely
    if (profanityCheck.severity === 'medium') {
      return {
        isValid: false,
        reason: 'Your comment contains inappropriate language. Please rephrase.',
        severity: 'medium',
      };
    }
    
    // Low severity - censor and allow
    return {
      isValid: true,
      censoredText: censorProfanity(text),
      severity: 'low',
    };
  }
  
  return { isValid: true };
}

// Export for testing
export { PROFANITY_LIST, normalizeText };
