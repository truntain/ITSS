const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: JSON.parse(body),
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function main() {
  try {
    console.log('Logging in admin...');
    const loginRes = await post('http://localhost:3001/auth/login', {
      email: 'admin@gympro.com',
      password: '123456',
    });

    console.log('Login Response:', loginRes);

    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.error('Failed to login. Please make sure credentials are correct.');
      return;
    }

    const token = loginRes.body.access_token;
    console.log('Token:', token);

    console.log('Calling GET /staffs...');
    const staffsRes = await get('http://localhost:3001/staffs', token);
    console.log('GET /staffs Response status:', staffsRes.status);
    console.log('GET /staffs Response body:', staffsRes.body);

  } catch (err) {
    console.error('Error during testing:', err);
  }
}

main();
