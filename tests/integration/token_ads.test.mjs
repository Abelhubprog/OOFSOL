import assert from 'assert';
import { makeRequest, getAuthToken } from './api_helpers.mjs';

async function runTests() {
  console.log('Running Token Ads API integration tests...');
  let testsPassed = 0;
  let testsFailed = 0;
  let authToken;
  let createdAdCampaignId;

  async function test(description, testFn) {
    try {
      await testFn();
      console.log(`✅ PASSED: ${description}`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ FAILED: ${description}`);
      console.error(error.message); // Log only message for brevity, full error if needed
      if (error.responseBody) console.error("Response Body:", error.responseBody);
      testsFailed++;
    }
  }

  // Setup: Get auth token
  await test('Setup: Obtain authentication token for Token Ads', async () => {
    authToken = await getAuthToken('adCreatorWallet@example.com', 'adCreatorWallet');
    assert(authToken, 'Auth token should not be null for ad tests');
  });

  if (!authToken) {
    console.error('❌ Critical setup failure: Could not obtain auth token for ad tests. Halting.');
    testsFailed++;
    logSummary();
    process.exit(1);
  }

  // --- Test GET /api/token-ads/current ---
  await test('GET /api/token-ads/current should return current ads', async () => {
    const response = await makeRequest('/token-ads/current');
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
    assert(Array.isArray(response.body), 'Response body should be an array');
  });

  // --- Test POST /api/token-ads/submit ---
  const validAdData = {
    tokenAddress: "So11111111111111111111111111111111111111112", // Example Solana address
    tokenName: "Test Token",
    tokenSymbol: "TST",
    buyLink: "https://test.com/buy",
    description: "This is a test ad description for our awesome new token.",
    logoUrl: "https://test.com/logo.png",
    slotDuration: 30, // minutes
    paymentAmount: 10, // USDC
    // creatorWallet is added by the backend
  };

  await test('POST /api/token-ads/submit without token should fail', async () => {
    const response = await makeRequest('/token-ads/submit', { method: 'POST', body: validAdData });
    assert.strictEqual(response.statusCode, 401, `Expected 401, got ${response.statusCode}`);
  });

  await test('POST /api/token-ads/submit with token and valid data should succeed', async () => {
    const response = await makeRequest('/token-ads/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: validAdData,
    });
    assert.strictEqual(response.statusCode, 201, `Expected 201, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
    assert(response.body.campaignId, 'Response should contain a campaignId');
    createdAdCampaignId = response.body.campaignId; // Save for later tests
  });

  await test('POST /api/token-ads/submit with token and invalid data should fail', async () => {
    const invalidAdData = { ...validAdData, tokenName: "" }; // Missing tokenName
    const response = await makeRequest('/token-ads/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: invalidAdData,
    });
    assert.strictEqual(response.statusCode, 400, `Expected 400, got ${response.statusCode}`);
  });

  // --- Test POST /api/token-ads/:adId/track ---
  // This test assumes an ad (createdAdCampaignId) exists from the previous test.
  await test('POST /api/token-ads/:adId/track with valid data should succeed', async () => {
    if (!createdAdCampaignId) {
      throw new Error("Skipping track test: no createdAdCampaignId available.");
    }
    const response = await makeRequest(`/token-ads/${createdAdCampaignId}/track`, {
      method: 'POST',
      // No auth token needed for tracking impressions by default, but clicks might be different
      // For now, testing without token to cover public tracking endpoint.
      // headers: { Authorization: `Bearer ${authToken}` }, // Add if optionalAuth is used and want to test with user
      body: { interactionType: 'impression' },
    });
    assert.strictEqual(response.statusCode, 202, `Expected 202, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
  });

  await test('POST /api/token-ads/:adId/track with invalid interactionType should fail', async () => {
    if (!createdAdCampaignId) {
      throw new Error("Skipping track test: no createdAdCampaignId available.");
    }
    const response = await makeRequest(`/token-ads/${createdAdCampaignId}/track`, {
      method: 'POST',
      body: { interactionType: 'invalid_type' },
    });
    assert.strictEqual(response.statusCode, 400, `Expected 400, got ${response.statusCode}`);
  });


  // --- Test GET /api/token-ads/:campaignId/stats ---
  await test('GET /api/token-ads/:campaignId/stats without token should fail', async () => {
     if (!createdAdCampaignId) {
      throw new Error("Skipping stats test: no createdAdCampaignId available.");
    }
    const response = await makeRequest(`/token-ads/${createdAdCampaignId}/stats`);
    assert.strictEqual(response.statusCode, 401, `Expected 401, got ${response.statusCode}`);
  });

  await test('GET /api/token-ads/:campaignId/stats with token should succeed', async () => {
    if (!createdAdCampaignId) {
      throw new Error("Skipping stats test: no createdAdCampaignId available.");
    }
    const response = await makeRequest(`/token-ads/${createdAdCampaignId}/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}. Body: ${JSON.stringify(response.body)}`);
    assert(typeof response.body.totalImpressions === 'number', 'Stats should include totalImpressions');
  });

  // Placeholder for POST /api/token-ads/confirm-payment - This requires a mock Stripe setup or more involved flow.

  function logSummary() {
    console.log(`\n--- Test Summary for Token Ads ---`);
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
  console.error("Error during test execution:", err);
  process.exit(1);
});
