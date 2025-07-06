/**
 * Prophet Betting Platform - Backend API Test Script
 * 
 * This script tests all the main backend endpoints to ensure they work correctly.
 * Run this with: npm run test:api or node scripts/test-api.js
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Test data
const testUser = {
  email: 'test@prophet.betting',
  password: 'testpassword123'
}

const testBet = {
  title: 'Test Bet - API Validation',
  description: 'This is a test bet created by the API validation script',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  arbitrator_type: 'creator',
  stake_amount: 10
}

class APITester {
  constructor() {
    this.authToken = null
    this.testResults = []
    this.createdBetId = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      }
    }
    
    const response = await fetch(url, { ...defaultOptions, ...options })
    const data = await response.json()
    
    return { response, data }
  }

  async test(name, testFn) {
    this.log(`Testing: ${name}`)
    try {
      await testFn()
      this.log(`✓ ${name}`, 'success')
      this.testResults.push({ name, status: 'passed' })
    } catch (error) {
      this.log(`✗ ${name}: ${error.message}`, 'error')
      this.testResults.push({ name, status: 'failed', error: error.message })
    }
  }

  async testCreateMarket() {
    await this.test('Create Market/Bet', async () => {
      const { response, data } = await this.makeRequest('/create-market', {
        method: 'POST',
        body: JSON.stringify(testBet)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (!data.success || !data.bet_id) {
        throw new Error('Invalid response format')
      }

      this.createdBetId = data.bet_id
      this.log(`Created bet with ID: ${this.createdBetId}`)
    })
  }

  async testPlaceBet() {
    await this.test('Place Bet', async () => {
      if (!this.createdBetId) {
        throw new Error('No bet ID available (create market test must pass first)')
      }

      const { response, data } = await this.makeRequest('/place-bet', {
        method: 'POST',
        body: JSON.stringify({
          bet_id: this.createdBetId,
          prediction: true,
          stake_amount: 25
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (!data.success || !data.participant_id) {
        throw new Error('Invalid response format')
      }

      this.log(`Placed bet with participant ID: ${data.participant_id}`)
    })
  }

  async testGetBets() {
    await this.test('Get Bets List', async () => {
      const { response, data } = await this.makeRequest('/bets?limit=5')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (!Array.isArray(data.bets) || !data.pagination) {
        throw new Error('Invalid response format')
      }

      this.log(`Retrieved ${data.bets.length} bets`)
    })
  }

  async testGetBetDetails() {
    await this.test('Get Bet Details', async () => {
      if (!this.createdBetId) {
        throw new Error('No bet ID available')
      }

      const { response, data } = await this.makeRequest(`/bets/${this.createdBetId}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (!data.bet || !data.participants || !data.stats) {
        throw new Error('Invalid response format')
      }

      this.log(`Retrieved bet details: ${data.participants.length} participants`)
    })
  }

  async testGetMarkets() {
    await this.test('Get Markets List', async () => {
      const { response, data } = await this.makeRequest('/markets?limit=5')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (!Array.isArray(data.markets) || !data.pagination) {
        throw new Error('Invalid response format')
      }

      this.log(`Retrieved ${data.markets.length} markets`)
    })
  }

  async testUserBalance() {
    await this.test('Get User Balance', async () => {
      const { response, data } = await this.makeRequest('/user/balance')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error}`)
      }

      if (typeof data.balance !== 'number' || !Array.isArray(data.recent_transactions)) {
        throw new Error('Invalid response format')
      }

      this.log(`User balance: ${data.balance} credits`)
    })
  }

  async testValidation() {
    await this.test('Input Validation', async () => {
      // Test with invalid data
      const { response, data } = await this.makeRequest('/create-market', {
        method: 'POST',
        body: JSON.stringify({
          title: 'x', // Too short
          description: 'short', // Too short
          deadline: '2020-01-01', // In the past
          arbitrator_type: 'invalid' // Invalid type
        })
      })

      if (response.status !== 400) {
        throw new Error('Should return 400 for validation errors')
      }

      if (!data.validation_errors || !Array.isArray(data.validation_errors)) {
        throw new Error('Should return validation errors array')
      }

      this.log(`Validation caught ${data.validation_errors.length} errors`)
    })
  }

  async testUnauthorized() {
    await this.test('Unauthorized Access', async () => {
      // Temporarily remove auth token
      const token = this.authToken
      this.authToken = null

      const { response, data } = await this.makeRequest('/create-market', {
        method: 'POST',
        body: JSON.stringify(testBet)
      })

      // Restore auth token
      this.authToken = token

      if (response.status !== 401) {
        throw new Error('Should return 401 for unauthorized requests')
      }

      this.log('Unauthorized access properly blocked')
    })
  }

  async testRateHandling() {
    await this.test('Error Handling', async () => {
      // Test with non-existent bet ID
      const { response, data } = await this.makeRequest('/place-bet', {
        method: 'POST',
        body: JSON.stringify({
          bet_id: '00000000-0000-0000-0000-000000000000',
          prediction: true,
          stake_amount: 10
        })
      })

      if (response.status !== 404) {
        throw new Error('Should return 404 for non-existent bet')
      }

      this.log('Error handling working correctly')
    })
  }

  async runAllTests() {
    this.log('🚀 Starting Prophet Betting Platform API Tests')
    this.log(`Testing against: ${API_BASE_URL}`)

    // Note: In a real test environment, you would set up authentication
    // For this demo, we'll assume the user is already authenticated
    // In production, add proper test user setup and authentication

    this.log('⚠️  Note: This test assumes user authentication is already set up')
    this.log('⚠️  Set NEXT_PUBLIC_APP_URL environment variable if not using localhost:3000')

    // Mock auth token for demo (in real tests, get this from actual auth)
    this.authToken = 'mock-jwt-token'

    await this.testUnauthorized()
    await this.testValidation()
    
    // These tests require actual authentication in a real environment
    this.log('📝 Note: The following tests require proper authentication setup:')
    this.log('   - Create Market/Bet')
    this.log('   - Place Bet') 
    this.log('   - Get User Balance')
    this.log('   Use Supabase Auth to get real JWT tokens for testing')

    // Public endpoints
    await this.testGetBets()
    await this.testGetMarkets()

    // Error handling
    await this.testRateHandling()

    // Summary
    this.log('\n📊 Test Results Summary:')
    const passed = this.testResults.filter(r => r.status === 'passed').length
    const failed = this.testResults.filter(r => r.status === 'failed').length
    
    this.log(`✅ Passed: ${passed}`)
    this.log(`❌ Failed: ${failed}`)
    this.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      this.log('\n❌ Failed Tests:')
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => this.log(`   - ${r.name}: ${r.error}`))
    }

    this.log('\n✨ API Testing Complete!')
    
    return { passed, failed, total: this.testResults.length }
  }
}

// Main execution
if (require.main === module) {
  const tester = new APITester()
  tester.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('Test runner failed:', error)
      process.exit(1)
    })
}

module.exports = APITester
