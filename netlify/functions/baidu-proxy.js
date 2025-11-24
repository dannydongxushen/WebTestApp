// netlify/functions/baidu-proxy.js

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
      
      targetUrl = `https://vop.baidu.com/server_api?dev_pid=1537&cuid=netlify-app&token=${accessToken}`;
      requestOptions.method = 'POST';
      
      if (event.body) {
        requestOptions.body = event.body;
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