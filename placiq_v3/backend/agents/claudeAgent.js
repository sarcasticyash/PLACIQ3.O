// Claude AI Agent - Anthropic API Integration
const callClaude = async (prompt, system = '', messages = null) => {
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
