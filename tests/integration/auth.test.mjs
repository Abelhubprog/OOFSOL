import assert from 'assert';
import { makeRequest, getAuthToken } from './api_helpers.mjs';

async function runTests() {
  console.log('Running Auth API integration tests...');
  let testsPassed = 0;
  let testsFailed = 0;
  let authToken;
  const testUserWallet = `testUser${Date.now()}`;
  const testUserEmail = `testuser${Date.now()}@example.com`;

  async function test(description, testFn) {
    try {
      await testFn();
      console.log(`✅ PASSED: ${description}`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ FAILED: ${description}`);
      console.error(error.message);
      if (error.responseBody) console.error("Response Body:", error.responseBody);
      testsFailed++;
    }
  }

  // --- Test POST /api/auth/dynamic-callback ---
  await test('POST /api/auth/dynamic-callback with mock data should return user and app token', async () => {
    const response = await makeRequest('/auth/dynamic-callback', {
      method: 'POST',
      body: {
        dynamicAuthToken: 'mockValidDynamicToken', // Service mocks verification of this
        walletAddress: testUserWallet,
        email: testUserEmail,
      },
    });
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
    assert(response.body.user, 'Response should contain user profile');
    assert(response.body.token, 'Response should contain an app token');
    assert.strictEqual(response.body.user.walletAddress, testUserWallet, 'User profile wallet address should match');
    authToken = response.body.token; // Save for subsequent tests
  });

  await test('POST /api/auth/dynamic-callback without dynamicAuthToken should fail', async () => {
    const response = await makeRequest('/auth/dynamic-callback', {
      method: 'POST',
      body: { walletAddress: 'anotherWallet', email: 'another@example.com' },
    });
    assert.strictEqual(response.statusCode, 400, `Expected 400, got ${response.statusCode}`);
  });

  // Ensure authToken was obtained before proceeding
  if (!authToken) {
    console.error('❌ Critical setup failure for auth tests: Could not obtain auth token via dynamic-callback. Halting further auth tests.');
    testsFailed++; // Count this as a failed test
    logSummary();
    process.exit(1);
  }


  // --- Test GET /api/auth/user ---
  await test('GET /api/auth/user without token should fail', async () => {
    const response = await makeRequest('/auth/user');
    assert.strictEqual(response.statusCode, 401, `Expected 401, got ${response.statusCode}`);
  });

  await test('GET /api/auth/user with invalid token should fail', async () => {
    const response = await makeRequest('/auth/user', {
      headers: { Authorization: 'Bearer invalidtoken123' },
    });
    assert.strictEqual(response.statusCode, 401, `Expected 401, got ${response.statusCode}`);
  });

  await test('GET /api/auth/user with valid token should return user profile', async () => {
    const response = await makeRequest('/auth/user', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
    assert(response.body.id, 'User profile should have an id');
    assert.strictEqual(response.body.walletAddress, testUserWallet, 'User profile wallet address should match the one used for token generation');
    assert.strictEqual(response.body.email, testUserEmail, 'User profile email should match');
  });

  function logSummary() {
    console.log(`\n--- Test Summary for Auth API ---`);
    console.log(`Total tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
  }

  logSummary();

  if (testsFailed > 0) {
    process.exit(1); // Indicate failure
  }
}

runTests().catch(err => {
  console.error("Error during auth test execution:", err);
  process.exit(1);
});
