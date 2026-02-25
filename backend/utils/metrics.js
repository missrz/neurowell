// Simple in-memory metrics collector for debug/ops
const counters = {};

function increment(name, value = 1, tags = {}) {
  const key = `${name}${Object.keys(tags).length ? '|' + JSON.stringify(tags) : ''}`;
  counters[key] = (counters[key] || 0) + value;
  // Lightweight console logging for visibility
  console.info(`[metrics] ${name} +${value} ${Object.keys(tags).length ? JSON.stringify(tags) : ''} total=${counters[key]}`);
}

function getMetrics() {
  return { ...counters };
}

module.exports = { increment, getMetrics };
