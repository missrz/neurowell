// Attempts to extract the first JSON object from a text blob.
// Supports fenced code blocks (```json ... ``` or ``` ... ```), or finds the first balanced `{...}` block.
function tryParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  // Normalize line endings and trim
  const normalized = text.replace(/\r/g, '').trim();

  // 1) Try to find ```json ... ``` fenced block (permissive)
  const fencedJson = /```\s*json\s*\n?([\s\S]*?)```/i.exec(normalized);
  if (fencedJson && fencedJson[1]) {
    const candidate = fencedJson[1].trim();
    try { return JSON.parse(candidate); } catch (e) { /* fallthrough */ }
  }

  // 2) Try to find any fenced block ``` ... ``` and parse inner content
  const fencedAny = /```[^\n]*\n?([\s\S]*?)```/.exec(normalized);
  if (fencedAny && fencedAny[1]) {
    const candidate = fencedAny[1].trim();
    try { return JSON.parse(candidate); } catch (e) { /* fallthrough */ }
  }

  // 3) As a fallback, try to remove stray backticks and markdown and then find the first balanced JSON object
  const noBackticks = normalized.replace(/`+/g, '');
  let start = noBackticks.indexOf('{');
  while (start !== -1) {
    let depth = 0;
    for (let i = start; i < noBackticks.length; i++) {
      if (noBackticks[i] === '{') depth++;
      else if (noBackticks[i] === '}') depth--;
      if (depth === 0) {
        const candidate = noBackticks.slice(start, i + 1);
        try { return JSON.parse(candidate); } catch (e) { break; }
      }
    }
    start = noBackticks.indexOf('{', start + 1);
  }

  return null;
}

module.exports = { tryParseJson };
