// Attempts to extract the first JSON object from a text blob.
// Supports fenced code blocks (```json ... ``` or ``` ... ```), or finds the first balanced `{...}` block.
function tryParseJson(text) {
  if (!text || typeof text !== 'string') return null;

  // 1) Try to find ```json ... ``` fenced block
  const fencedJson = /```\s*json\s*([\s\S]*?)```/i.exec(text);
  if (fencedJson && fencedJson[1]) {
    const candidate = fencedJson[1].trim();
    try { return JSON.parse(candidate); } catch (e) { /* fallthrough */ }
  }

  // 2) Try to find any fenced block ``` ... ```
  const fencedAny = /```([\s\S]*?)```/.exec(text);
  if (fencedAny && fencedAny[1]) {
    const candidate = fencedAny[1].trim();
    try { return JSON.parse(candidate); } catch (e) { /* fallthrough */ }
  }

  // 3) Find first balanced JSON object by scanning for '{' and matching '}'
  let start = text.indexOf('{');
  while (start !== -1) {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        try { return JSON.parse(candidate); } catch (e) { break; }
      }
    }
    start = text.indexOf('{', start + 1);
  }

  return null;
}

module.exports = { tryParseJson };
