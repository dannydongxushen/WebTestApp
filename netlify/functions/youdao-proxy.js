// netlify/functions/youdao-proxy.js
exports.handler = async (event, context) => {
  // 1. 处理CORS预检请求 (OPTIONS) [citation:3]
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS' // 明确允许POST和OPTIONS
      },
      body: ''
    };
  }

  // 2. 确保只处理POST请求 [citation:8]
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Method Not Allowed. This endpoint requires POST.' 
      })
    };
  }

  try {
    // 3. 准备请求数据（根据有道OCR API要求调整）
    // 注意：这里需要根据有道API的文档，正确构造请求体（body）和请求头（headers）
    const requestBody = new URLSearchParams();
    // ... 填充必要的参数，如 img, appKey, salt, sign, curtime 等
    // 例如：requestBody.append('img', event.body); 或其他方式处理event.body

    // 4. 发送请求到有道OCR API
    const youdaoResponse = await fetch('https://openapi.youdao.com/ocrapi', {
      method: 'POST', // 确保方法正确
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // 根据有道API要求设置
        // ... 其他可能的头部
      },
      body: requestBody.toString() // 或根据有道API要求处理请求体
    });

    // 5. 处理有道API的响应
    const data = await youdaoResponse.json();

    // 6. 返回结果给前端
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    // 7. 错误处理
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message })
    };
  }
};