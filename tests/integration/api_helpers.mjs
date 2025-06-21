import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

export async function makeRequest(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const reqOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(`${BASE_URL}${path}`, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: jsonData });
        } catch (e) {
          // If not JSON, return raw data, could be HTML or plain text for some errors
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

export async function getAuthToken(walletAddress = 'testWallet123', email = 'test@example.com') {
  try {
    // Use the dynamic-callback endpoint to get an app token
    // This currently uses mock verification of the dynamic token
    const response = await makeRequest('/auth/dynamic-callback', {
      method: 'POST',
      body: {
        dynamicAuthToken: 'mockDynamicToken', // This part is mocked in the authService for now
        walletAddress: walletAddress, // Provide wallet address for user creation
        email: email
      }
    });
    if (response.statusCode === 200 && response.body.token) {
      return response.body.token;
    }
    console.error('Failed to get auth token:', response.body);
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}
