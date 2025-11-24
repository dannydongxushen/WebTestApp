// netlify/functions/baidu-proxy.js

exports.handler = async function(event) {
  const path = event.path;
  const queryString = event.queryStringParameters ? `?${new URLSearchParams(event.queryStringParameters).toString()}` : '';
  const requestBody = event.body;

  let targetUrl;
  let requestOptions = {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // 根据路径判断要代理到哪个百度API
  if (path.includes('baidu-token')) {
    targetUrl = 'https://openapi.baidu.com/oauth/2.0/token';
    
    // 为获取令牌的请求添加必要的参数
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.BAIDU_API_KEY || 'aFlSHz5qGHV2ZID4daou3Gqq',
      client_secret: process.env.BAIDU_SECRET_KEY || 'Jva3tSRyrH3fLHW98cxGhlDKQfCQ6RsJ'
    });
    
    targetUrl = `${targetUrl}?${tokenParams}`;
    requestOptions.method = 'POST';
    
  } else if (path.includes('baidu-speech')) {
    targetUrl = 'https://vop.baidu.com/server_api';
    requestOptions.body = requestBody;
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not Found' })
    };
  }

  try {
    const response = await fetch(targetUrl, requestOptions);
    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: `Proxy Error: ${error.message}` })
    };
  }
};