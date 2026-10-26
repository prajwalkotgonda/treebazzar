/**
 * Fuzzy Search & Typo Tolerance Utility for TreeBazzar
 * Handles spelling mistakes, transpositions, missing letters, and phonetic typos
 * for both English and Marathi texts.
 */

/**
 * Compute Levenshtein distance between two strings
 */
export function levenshteinDistance(s1 = '', s2 = '') {
  const str1 = String(s1).toLowerCase().trim();
  const str2 = String(s2).toLowerCase().trim();

  if (str1 === str2) return 0;
  if (!str1.length) return str2.length;
  if (!str2.length) return str1.length;

  const row = new Array(str2.length + 1);
  for (let j = 0; j <= str2.length; j++) {
    row[j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= str2.length; j++) {
      const temp = row[j];
      if (str1[i - 1] === str2[j - 1]) {
        row[j] = prev;
      } else {
        row[j] = Math.min(prev + 1, Math.min(row[j] + 1, row[j - 1] + 1));
      }
      prev = temp;
    }
  }

  return row[str2.length];
}

/**
 * Check if a sub-sequence of characters exists in order (e.g., "ksr" in "kesar")
 */
function isSubsequence(sub, str) {
  let subIndex = 0;
  let strIndex = 0;
  while (subIndex < sub.length && strIndex < str.length) {
    if (sub[subIndex] === str[strIndex]) {
      subIndex++;
    }
    strIndex++;
  }
  return subIndex === sub.length;
}

/**
 * Normalized token comparison between a single query word and a candidate target word
 */
export function matchWordWithTypo(queryWord = '', targetWord = '') {
  const q = queryWord.toLowerCase().trim();
  const t = targetWord.toLowerCase().trim();

  if (!q || !t) return { match: false, score: 0 };

  // 1. Exact match
  if (q === t) return { match: true, score: 1.0 };

  // 2. Starts with / prefix match
  if (t.startsWith(q)) return { match: true, score: 0.95 };

  // 3. Substring match
  if (t.includes(q)) return { match: true, score: 0.9 };

  // 4. Reverse substring (query contains full target word)
  if (q.includes(t) && t.length >= 3) return { match: true, score: 0.85 };

  // 5. Acronym / Subsequence match for words >= 3 chars
  if (q.length >= 3 && isSubsequence(q, t)) {
    return { match: true, score: 0.8 };
  }

  // 6. Typo Tolerance via Levenshtein Distance
  const dist = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);

  // Maximum allowed typos based on word length
  let maxAllowedTypos = 0;
  if (q.length <= 2) {
    maxAllowedTypos = 0; // Strict for 1-2 letters
  } else if (q.length <= 4) {
    maxAllowedTypos = 1; // 1 typo allowed for 3-4 chars (e.g. "kesr" -> "kesar", "roze" -> "rose")
  } else if (q.length <= 7) {
    maxAllowedTypos = 2; // 2 typos allowed for 5-7 chars (e.g. "mongera" -> "monstera", "tomto" -> "tomato")
  } else {
    maxAllowedTypos = 3; // 3 typos allowed for 8+ chars (e.g. "pomgranate" -> "pomegranate")
  }

  if (dist <= maxAllowedTypos) {
    const score = 1 - dist / maxLen;
    return { match: true, score: Math.max(0.65, score) };
  }

  // Check prefix similarity (e.g. first 3 chars match and distance is small)
  if (q.length >= 4 && t.length >= 4) {
    const qPrefix = q.slice(0, 3);
    const tPrefix = t.slice(0, 3);
    if (qPrefix === tPrefix && dist <= maxAllowedTypos + 1) {
      return { match: true, score: 0.7 };
    }
  }

  return { match: false, score: 0 };
}

/**
 * Fuzzy match a full search query against one or more target strings
 * @param {string} query - user input search query
 * @param {string|string[]} targets - text or array of texts (e.g. [nameEn, nameMr, botanicalName, category])
 * @returns {{ isMatch: boolean, score: number, matchedField?: string }}
 */
export function fuzzyMatch(query = '', targets = []) {
  const qClean = String(query).toLowerCase().trim();
  if (!qClean) return { isMatch: true, score: 1.0 };

  const targetList = Array.isArray(targets) 
    ? targets.filter(Boolean).map(t => String(t)) 
    : [String(targets || '')];

  if (!targetList.length) return { isMatch: false, score: 0 };

  const queryWords = qClean.split(/\s+/).filter(Boolean);

  let bestScore = 0;
  let bestMatchedField = '';

  for (const targetText of targetList) {
    const tClean = targetText.toLowerCase();

    // Direct whole-phrase substring check gives immediate high score
    if (tClean.includes(qClean)) {
      const score = qClean.length === tClean.length ? 1.0 : 0.96;
      if (score > bestScore) {
        bestScore = score;
        bestMatchedField = targetText;
      }
      continue;
    }

    const targetWords = tClean
      .split(/[\s,./()\-–—_]+/)
      .filter(w => w.length > 0);

    // Every query token should match at least one target word (with typos allowed)
    let matchedAllTokens = true;
    let tokenScoreSum = 0;

    for (const qWord of queryWords) {
      let bestWordScore = 0;

      for (const tWord of targetWords) {
        const { match, score } = matchWordWithTypo(qWord, tWord);
        if (match && score > bestWordScore) {
          bestWordScore = score;
        }
      }

      if (bestWordScore > 0) {
        tokenScoreSum += bestWordScore;
      } else {
        matchedAllTokens = false;
        break;
      }
    }

    if (matchedAllTokens && queryWords.length > 0) {
      const avgScore = tokenScoreSum / queryWords.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestMatchedField = targetText;
      }
    }
  }

  return {
    isMatch: bestScore >= 0.65,
    score: bestScore,
    matchedField: bestMatchedField
  };
}

/**
 * Filter an array of objects using fuzzy matching with typo tolerance
 * Returns filtered and sorted list by relevance score.
 *
 * @param {Array} items - array of objects
 * @param {string} query - search query
 * @param {Function} getFields - function(item) returning array of string fields to search in
 */
export function fuzzyFilter(items = [], query = '', getFields = (item) => [item.name || '']) {
  if (!query || !query.trim()) {
    return { results: items, closestSuggestion: null, totalMatches: items.length };
  }

  const scoredResults = [];
  let closestSuggestion = null;
  let highestNonMatchScore = 0;

  for (const item of items) {
    const fields = getFields(item);
    const { isMatch, score, matchedField } = fuzzyMatch(query, fields);

    if (isMatch) {
      scoredResults.push({ item, score, matchedField });
    } else if (score > highestNonMatchScore && matchedField) {
      highestNonMatchScore = score;
      closestSuggestion = matchedField;
    }
  }

  // Sort by highest score first (exact & prefix matches rank top)
  scoredResults.sort((a, b) => b.score - a.score);

  return {
    results: scoredResults.map(r => r.item),
    closestSuggestion: scoredResults.length === 0 ? closestSuggestion : null,
    totalMatches: scoredResults.length
  };
}
