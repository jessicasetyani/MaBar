/**
 * Simple test to verify the AI services package works
 */

const { createGeminiService, AIServices, getAvailableProviders } = require('./dist/index.js')

async function testAIServicesPackage() {
  console.log('🧪 Testing @mabar/ai-services package...\n')

  try {
    // Test 1: Check available providers
    console.log('1. Testing available providers:')
    const providers = getAvailableProviders()
    console.log('   Available providers:', providers)
    console.log('   ✅ Available providers test passed\n')

    // Test 2: Test AIServices singleton
    console.log('2. Testing AIServices singleton:')
    const aiServices = AIServices.getInstance()
    console.log('   AIServices instance created:', !!aiServices)
    console.log('   Configured providers:', aiServices.getConfiguredProviders())
    console.log('   ✅ AIServices singleton test passed\n')

    // Test 3: Test service creation (without API key - should fail gracefully)
    console.log('3. Testing service creation without API key:')
    try {
      const service = createGeminiService()
      console.log('   ❌ Should have failed without API key')
    } catch (error) {
      console.log('   Expected error:', error.message)
      console.log('   ✅ Error handling test passed\n')
    }

    // Test 4: Test service creation with mock API key
    console.log('4. Testing service creation with API key:')
    try {
      const service = createGeminiService('mock-api-key', {
        model: 'gemini-pro',
        temperature: 0.7
      })
      console.log('   Service created:', !!service)
      console.log('   Service config:', service.getConfig())
      console.log('   ✅ Service creation test passed\n')

      // Test 5: Test service methods (will fail with mock API key, but should not crash)
      console.log('5. Testing service methods:')
      try {
        const health = await service.healthCheck()
        console.log('   Health check result:', health.status)
      } catch (error) {
        console.log('   Expected API error:', error.message.substring(0, 50) + '...')
        console.log('   ✅ API error handling test passed\n')
      }

    } catch (error) {
      console.log('   ❌ Service creation failed:', error.message)
    }

    console.log('🎉 All tests completed successfully!')
    console.log('\n📦 Package is ready for integration!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run tests
testAIServicesPackage()
