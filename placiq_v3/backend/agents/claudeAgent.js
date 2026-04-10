// Claude AI Agent - Anthropic API Integration
/*const callClaude = async (prompt, system = '', messages = null) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const requestMessages = messages || [{ role: 'user', content: prompt }];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: system || 'You are PlaCIQ AI, an expert placement coach for engineering students in India.',
      messages: requestMessages
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
};

module.exports = { callClaude };
*/
/*const fetch = require('node-fetch');

const callClaude = async (prompt, system = '', messages = null) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // ⏱️ Timeout setup (15 sec)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const requestMessages = messages || [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // ✅ correct model
        max_tokens: 2048,
        temperature: 0.3, // 🔥 stable JSON output
        system: system || 'You are an ATS resume analyzer. Return ONLY valid JSON.',
        messages: requestMessages
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Claude API Error:", errText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    // 🧠 Safe extraction (handles multiple blocks)
    const text = data?.content
      ?.map(block => block?.text || '')
      .join('\n')
      .trim();

    if (!text) {
      throw new Error("Empty response from Claude");
    }

    console.log("✅ Claude Response Received");

    return text;

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error("⏱️ Claude request timed out");
      throw new Error("Claude request timeout");
    }

    console.error("🔥 Claude Agent Error:", err.message);
    throw err;

  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { callClaude };*/
const callClaude = async (prompt, system = '', messages = null) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // ⏱️ Timeout setup
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const requestMessages = messages || [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // ✅ correct model
        max_tokens: 2048,
        temperature: 0.3,
        system: system || 'You are an ATS resume analyzer. Return ONLY valid JSON.',
        messages: requestMessages
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Claude API Error:", errText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    // 🧠 Safe text extraction
    const text = data?.content
      ?.map(block => block?.text || '')
      .join('\n')
      .trim();

    if (!text) {
      throw new Error("Empty response from Claude");
    }

    console.log("✅ Claude Response Received");

    return text;

  } catch (err) {
    if (err.name === 'AbortError') {
      console.error("⏱️ Claude request timed out");
      throw new Error("Claude request timeout");
    }

    console.error("🔥 Claude Agent Error:", err.message);
    throw err;

  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { callClaude };