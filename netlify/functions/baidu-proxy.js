// netlify/functions/baidu-proxy.js

// 生成有效的 CUID
function generateCuid() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `netlify-app-${timestamp}-${random}`.substring(0, 256);
}

exports.handler = async function(event) {
  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  const path = event.path;
  
  let targetUrl;
  let requestOptions = {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  try {
    // 根据路径判断要代理到哪个百度API
    if (path.includes('baidu-token')) {
      // 获取访问令牌 - 直接使用硬编码的密钥
      const apiKey = 'aFlSHz5qGHV2ZID4daou3Gqq';
      const secretKey = 'Jva3tSRyrH3fLHW98cxGhlDKQfCQ6RsJ';
      
      targetUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
      requestOptions.method = 'POST';
      
    } else if (path.includes('baidu-speech')) {
      // 语音识别
      const accessToken = event.queryStringParameters?.token;
      
      if (!accessToken) {
        throw new Error('缺少访问令牌参数');
      }
      
      // 生成有效的 cuid
      const cuid = generateCuid();
      
      // 修正：将 cuid 和 token 都放在 URL 参数中
      targetUrl = `https://vop.baidubce.com/server_api?cuid=${encodeURIComponent(cuid)}&token=${accessToken}`;
      requestOptions.method = 'POST';
      
      if (event.body) {
        try {
          const requestBody = JSON.parse(event.body);
          
          // 构建符合百度API要求的请求体
          const speechRequestBody = {
            format: requestBody.format || 'wav',
            rate: requestBody.rate || 16000,
            channel: requestBody.channel || 1,
            speech: requestBody.speech,
            len: requestBody.len
          };
          
          // 只有在请求体中明确提供了 dev_pid 时才包含
          if (requestBody.dev_pid) {
            speechRequestBody.dev_pid = requestBody.dev_pid;
          }
          
          console.log('语音识别请求参数:', {
            format: speechRequestBody.format,
            rate: speechRequestBody.rate,
            channel: speechRequestBody.channel,
            cuid: cuid,
            data_length: speechRequestBody.len
          });
          
          requestOptions.body = JSON.stringify(speechRequestBody);
          
        } catch (parseError) {
          console.error('解析请求体失败:', parseError);
          throw new Error('无效的请求格式');
        }
      }
    } else {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: '接口路径不存在' })
      };
    }

    console.log(`代理请求: ${targetUrl}`);
    
    const response = await fetch(targetUrl, requestOptions);
    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: data
    };
    
  } catch (error) {
    console.error('代理服务器错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: '代理服务器错误',
        message: error.message 
      })
    };
  }
};