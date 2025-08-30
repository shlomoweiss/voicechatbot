const fetch = require('node-fetch');

async function testLocalAPI() {
  console.log('🧪 Testing local OpenAI API connection...\n');
  
  const testMessage = 'Hello, can you respond with just "API connection working"?';
  
  try {
    const response = await fetch('http://localhost:4001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: testMessage,
        conversationId: 'test'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received:');
    console.log('📝 Message:', testMessage);
    console.log('🤖 AI Response:', data.response);
    console.log('🆔 Conversation ID:', data.conversationId);
    console.log('⏰ Timestamp:', data.timestamp);
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    
    // Test health endpoint
    try {
      const healthResponse = await fetch('http://localhost:4001/api/health');
      const healthData = await healthResponse.json();
      
      console.log('\n🏥 Health Check:');
      console.log('Status:', healthData.status);
      console.log('Has API Key:', healthData.hasOpenAIKey);
      console.log('Base URL:', healthData.openaiBaseUrl);
      console.log('Model:', healthData.openaiModel);
      
    } catch (healthError) {
      console.error('❌ Health check also failed:', healthError.message);
      console.log('💡 Make sure the server is running: npm run server');
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testLocalAPI();
}

module.exports = { testLocalAPI };
