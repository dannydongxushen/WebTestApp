// netlify/functions/youdao-proxy.js
export default async function handler(request) {
  // 1. 处理CORS预检请求 (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      },
    });
  }

  // 2. 获取原始请求的URL和Body
  const url = new URL(request.url);
  // 这里假设你将所有到 /api/youdao 的请求都代理到有道API
  const targetUrl = 'https://openapi.youdao.com/ocrapi'; 
  
  // 3. 准备转发到有道API的请求参数
  let body;
  if (request.method === 'POST') {
    body = await request.text(); // 以文本形式获取body
  }

  // 4. 向有道API发起请求
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        // 可以在这里添加有道API需要的任何Header，例如Content-Type
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      body: body, // 转发原始请求体
    });

    // 5. 获取有道API的响应
    const data = await response.text();

    // 6. 返回响应给前端，并添加CORS头，允许所有域名访问
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*', // 允许所有来源，生产环境可设置为具体域名
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  } catch (error) {
    // 7. 错误处理
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}