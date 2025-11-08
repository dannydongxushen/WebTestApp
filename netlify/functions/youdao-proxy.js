// netlify/functions/youdao-proxy.js
exports.handler = async (event, context) => {
  // 处理CORS预检请求 (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // 确保只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // 这里根据有道OCR API的要求，从 event.body 中提取并构造请求参数
    // 例如，你可能需要解析 event.body（如果是URL编码格式或JSON），然后重新组装
    const requestBody = new URLSearchParams();
    // ... 根据有道OCR API文档，填充必要的参数，如 img, appKey, salt, sign, curtime 等
    // 假设 event.body 已经是 x-www-form-urlencoded 格式的字符串，或者你需要手动构造
    // requestBody.append('key', value);

    // 发送请求到有道OCR API
    const youdaoResponse = await fetch('https://openapi.youdao.com/ocrapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // ... 其他可能有道API要求的头部
      },
      body: event.body // 如果格式完全匹配，可以直接转发；否则需要重新构造
    });

    const data = await youdaoResponse.json();

    // 返回结果给前端
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};