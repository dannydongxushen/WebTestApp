// netlify/functions/siliconflow-proxy.js
exports.handler = async (event, context) => {
  // 处理跨域请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { model, messages, temperature, max_tokens } = requestBody;

    // 调用硅基流动 API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer sk-doalnvcirrhpmoyikztmmiqtlscsdrujftznfwynfctntbst`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'deepseek-ai/DeepSeek-R1',
        messages,
        temperature: temperature || 0.1,
        max_tokens: max_tokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`硅基流动 API 错误: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};