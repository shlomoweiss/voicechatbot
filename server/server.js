const express = require('express');
const path = require('path');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist/voice-chat-app/browser')));

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

// Store conversation history (in production, use a database)
const conversations = new Map();

// Function to check if response contains valid pizza order JSON
function checkForOrderJSON(responseText) {
  try {
    let jsonString = '';
    
    // First, look for JSON block marked with ```json
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    } else {
      // If no markdown code block found, try to parse the entire response as JSON
      jsonString = responseText.trim();
    }
    
    const parsedOrder = JSON.parse(jsonString);
    
    // Validate the order schema
    if (parsedOrder && 
        typeof parsedOrder.type === 'string' &&
        typeof parsedOrder.size === 'string' &&
        Array.isArray(parsedOrder.toppings) &&
        typeof parsedOrder.specialInstructions === 'string' &&
        typeof parsedOrder.orderconfirm === 'boolean' &&
        parsedOrder.orderconfirm === true) {
      
      // Create formatted response
      let formattedResponse = `I got your order for pizza ${parsedOrder.type} size ${parsedOrder.size} with toppings: ${parsedOrder.toppings.join(', ')}`;
      
      if (parsedOrder.specialInstructions && parsedOrder.specialInstructions.trim() !== '') {
        formattedResponse += ` with special instructions: ${parsedOrder.specialInstructions}`;
      }
      
      return { found: true, formattedResponse };
    }
    
    return { found: false, originalResponse: responseText };
  } catch (error) {
    // If JSON parsing fails, return original response
    return { found: false, originalResponse: responseText };
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    let history = conversations.get(conversationId) || [
      {
        role: 'system',
       // content: `You are a helpful, friendly AI assistant in a voice chat application. 
        //Keep your responses conversational and engaging but concise (under 150 words when possible).
       // You can discuss various topics and help with questions. Be personable and natural in your responses.`
       content: `You are a helpful, friendly pizza ordering assistant,you need to get pizza orders from users.
                 the user must specify the type of pizza, size, and any toppings they want.
                 KEEP the conversation on pizza ordering topic ask clarifying questions if needed.
                 your final response should include a summary of the order details and a confirmation prompt.
                 the order should accommodate  the following json structure:
                 {
                   "type": "string",
                   "size": "string",
                   "toppings": ["string"],
                   "specialInstructions": "string",
                   "orderconfirm": "boolean"
                 }
                if it is a valid order, confirm the order with the user and return json response as described.
                return a json response as described only after you got confirmation from the user.
                your answer should not include emoji or special characters nor asterisks
                VERY IMPORTANT: YOU CAN GIVE ANSWER ONLY ON PIZZA ORDER RELATED QUESTIONS
                type of pizza can be one of the following: margherita, pepperoni, hawaiian, veggie
                the size can be one of the following: small, medium, large
                the toppings can be any combination of the following: mushrooms, onions, olives, peppers, extra cheese
                the special instructions should be ONLY related to pizza preparation (e.g., "light on cheese", "well done")
                YOU ARE NOT ALLOWED GIVE INFORMATION OUTSIDE OF PIZZA ORDERING `

      }
    ];

    // Add user message to history 
    history.push({ role: 'user', content: message });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: history,
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Check if response contains valid order JSON and format accordingly
    const orderCheck = checkForOrderJSON(response);
    const finalResponse = orderCheck.found ? orderCheck.formattedResponse : orderCheck.originalResponse;

    // Add assistant response to history
    history.push({ role: 'assistant', content: finalResponse });

    // Keep only last 10 messages to prevent token limit issues
    if (history.length > 21) { // 20 messages + system message
      history = [history[0], ...history.slice(-20)];
    }

    // Store updated history
    conversations.set(conversationId, history);

    res.json({
      response: finalResponse,
      conversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your billing.',
        fallback: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again later.'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({ 
        error: 'Invalid OpenAI API key.',
        fallback: 'I\'m sorry, but I\'m having trouble connecting to my AI service right now.'
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        fallback: 'I encountered an error while processing your request. Let me try a different approach.'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  });
});

// Clear conversation endpoint
app.delete('/api/conversation/:id', (req, res) => {
  const { id } = req.params;
  conversations.delete(id);
  res.json({ message: 'Conversation cleared', conversationId: id });
});

// Serve Angular app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/voice-chat-app/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`Voice Chat Server running on port ${PORT}`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY environment variable not set. Chat functionality will be limited.');
  } else {
    console.log('✅ OpenAI API key configured');
    console.log(`📡 OpenAI Base URL: ${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}`);
    console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
  }
});

module.exports = app;
