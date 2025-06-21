import assert from 'assert';
import { makeRequest, getAuthToken } from './api_helpers.mjs';

async function runTests() {
  console.log('Running OOF Moments API integration tests...');
  let testsPassed = 0;
  let testsFailed = 0;
  let authToken;

  async function test(description, testFn) {
    try {
      await testFn();
      console.log(`✅ PASSED: ${description}`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ FAILED: ${description}`);
      console.error(error);
      testsFailed++;
    }
  }

  // Setup: Get auth token
  await test('Setup: Obtain authentication token', async () => {
    authToken = await getAuthToken();
    assert(authToken, 'Auth token should not be null');
  });

  if (!authToken) {
    console.error('❌ Critical setup failure: Could not obtain auth token. Halting tests.');
    testsFailed++; // Count this as a failed test
    // Log summary before exiting
    console.log(`\n--- Test Summary ---`);
    console.log(`Total tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    process.exit(1); // Exit if auth token cannot be obtained
  }

  // --- Test GET /api/oof-moments/public ---
  await test('GET /api/oof-moments/public should return public OOF moments', async () => {
    const response = await makeRequest('/oof-moments/public');
    assert.strictEqual(response.statusCode, 200, `Expected status 200, got ${response.statusCode}`);
    assert(Array.isArray(response.body), 'Response body should be an array');
    // Further checks: response.body items should have expected structure if not empty
  });

  await test('GET /api/oof-moments/public with pagination should be accepted', async () => {
    const response = await makeRequest('/oof-moments/public?limit=5&offset=0&sortBy=popular');
    assert.strictEqual(response.statusCode, 200, `Expected status 200, got ${response.statusCode}`);
    assert(Array.isArray(response.body), 'Response body should be an array');
    if (response.body.length > 0) {
        assert(response.body.length <= 5, 'Should return max 5 items with limit=5');
    }
  });

  // --- Test POST /api/oof-moments/ai-analyze ---
  await test('POST /api/oof-moments/ai-analyze without token should fail', async () => {
    const response = await makeRequest('/oof-moments/ai-analyze', { method: 'POST', body: { walletAddress: 'someWallet' } });
    assert.strictEqual(response.statusCode, 401, `Expected status 401, got ${response.statusCode}`);
  });

  await test('POST /api/oof-moments/ai-analyze with token and valid body should succeed (testing service integration, actual AI/Solana may be mocked by services if keys absent)', async () => {
    const testWallet = `testWallet${Date.now()}`; // Unique wallet for testing
    const response = await makeRequest('/oof-moments/ai-analyze', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { walletAddress: testWallet, momentType: 'PAPER_HANDS', customPrompt: "Make it dramatic", isPublic: true },
    });

    // console.log("AI Analyze Response:", JSON.stringify(response.body, null, 2)); // For debugging

    assert.strictEqual(response.statusCode, 200, `Expected status 200, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
    assert(response.body.success, 'Response success should be true');
    assert(response.body.moment, 'Response should contain a moment object');
    assert(response.body.moment.id, 'Moment object should have an ID');
    assert.strictEqual(response.body.moment.type, 'PAPER_HANDS', 'Moment type should match request or derived type');
    assert(response.body.moment.title, 'Moment should have a title from (simplified) AI');
    assert(response.body.moment.description, 'Moment should have a description from (simplified) AI');
    assert(response.body.moment.narrative, 'Moment should have a narrative from (simplified) AI');
    assert(response.body.moment.rarity, 'Moment should have a rarity from (simplified) AI');
    assert(Array.isArray(response.body.moment.hashtags), 'Moment hashtags should be an array');
    assert(response.body.analysisData, 'Response should include analysisData');
    // If productionSolanaService.analyzeWallet falls back to mock due to no API keys,
    // analysisData might contain mock wallet analysis structure.
    // If it made a real call (or more developed mock), we could check analysisData.sourcePrecursor or fullWalletAnalysisSummary.
    // For example:
    // if (response.body.analysisData.fullWalletAnalysisSummary) {
    //   assert.strictEqual(response.body.analysisData.fullWalletAnalysisSummary.oofScore > 0, true, "OOF Score should be present");
    // }
  });

  await test('POST /api/oof-moments/ai-analyze with token and invalid body (Zod validation) should fail', async () => {
    const response = await makeRequest('/oof-moments/ai-analyze', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { walletAddress: 'short' }, // Invalid wallet address
    });
    assert.strictEqual(response.statusCode, 400, `Expected status 400, got ${response.statusCode}`);
  });


  // --- Test GET /api/oof-moments/my-moments ---
  await test('GET /api/oof-moments/my-moments without token should fail', async () => {
    const response = await makeRequest('/oof-moments/my-moments');
    assert.strictEqual(response.statusCode, 401, `Expected status 401, got ${response.statusCode}`);
  });

  await test('GET /api/oof-moments/my-moments with token should return user\'s moments', async () => {
    const response = await makeRequest('/oof-moments/my-moments', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(response.statusCode, 200, `Expected status 200, got ${response.statusCode}`);
    assert(Array.isArray(response.body), 'Response body should be an array');
  });

  // --- Test GET /api/oof-moments/:id ---
  // This requires a moment to be created first. We'll use the one from ai-analyze for now.
  // This test is more complex as it depends on the previous test's side effect.
  // In a full test suite, you'd create a moment, get its ID, then fetch it.

  // Placeholder for GET /api/oof-moments/:id - needs a valid ID from a created moment
  // This also implies that /api/oof-moments/user/:userId is harder to test without knowing a userId that has moments.

  console.log(`\n--- Test Summary for OOF Moments ---`);
  console.log(`Total tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);

  if (testsFailed > 0) {
    process.exit(1); // Indicate failure
  }
}

runTests().catch(err => {
  console.error("Error during test execution:", err);
  process.exit(1);
});
