// netlify/functions/youdao-proxy.js
exports.handler = async (event, context) => {
  // 定义CORS头部，方便统一管理
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // 生产环境建议替换为具体域名
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 1. 处理CORS预检请求 (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // 2. 确保只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // 3. 解析前端传来的请求体
    // 注意：event.body 可能是字符串化的JSON，需要解析
    const requestBody = JSON.parse(event.body);
    
    // 4. 根据有道OCR API的要求，构建发送过去的请求体
    // 这里需要你根据有道云OCR API的实际文档来调整参数
    const requestData = new URLSearchParams();
    requestData.append('img', requestBody.img); // 假设前端上传的图片Base64字符串在img字段
    requestData.append('langType', requestBody.langType || 'zh-CHS');
    requestData.append('detectType', '10012');
    requestData.append('imageType', '1');
    requestData.append('appKey', process.env.YOUDAO_APP_KEY || '你的AppKey'); // 建议使用环境变量
    // ... 其他必要参数，如 salt, sign, curtime 等，请根据有道API文档添加
    // 注意：签名(sign)的生成可能需要在服务器端完成

    // 5. 发送请求到有道OCR API
    const youdaoResponse = await fetch('https://openapi.youdao.com/ocrapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestData.toString()
    });

    if (!youdaoResponse.ok) {
      throw new Error(`有道API请求失败: ${youdaoResponse.status}`);
    }

    const responseData = await youdaoResponse.json();

    // 6. 返回结果给前端
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('Proxy function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      })
    };
  }
};