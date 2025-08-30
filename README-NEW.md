# Voice Chat App

A modern Angular voice chat application with AI integration. Features real-time voice recording, text-to-speech, and AI-powered conversations using OpenAI's GPT models.

## Features

- 🎤 **Voice Recording**: Real-time speech-to-text using Web Speech API
- 🔊 **Text-to-Speech**: AI responses spoken aloud with configurable voices
- 🤖 **AI Integration**: Powered by OpenAI GPT models for intelligent conversations
- 💬 **Real-time Chat**: Instant messaging interface with typing indicators
- ⚙️ **Voice Settings**: Customizable voice, rate, and pitch settings
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🗑️ **Conversation Management**: Clear conversation history

## Tech Stack

### Frontend
- **Angular 19**: Modern Angular framework with standalone components
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming for real-time updates
- **CSS3**: Modern styling with animations and gradients

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **OpenAI API**: GPT-powered AI conversations
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- OpenAI API key OR local OpenAI-compatible server (like LM Studio, Ollama, etc.)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   **For Official OpenAI API:**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env for OpenAI API
   OPENAI_API_KEY=your-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_BASE_URL=https://api.openai.com/v1
   PORT=4001
   ```

   **For Local OpenAI-Compatible Server:**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env for local server (example configuration)
   OPENAI_API_KEY=i-dont-care
   OPENAI_MODEL=openai/gpt-oss-20b
   OPENAI_BASE_URL=http://192.168.1.191:1234/v1
   PORT=4001
   ```

4. **Build the Angular application**
   ```bash
   npm run build:prod
   ```

## Running the Application

### Development Mode (Frontend Only)
```bash
npm start
```
This runs only the Angular frontend at `http://localhost:4200` with mock AI responses.

### Production Mode (Full Stack)
```bash
npm run server
```
This serves the built Angular app and API server at `http://localhost:4001`.

### Development with Auto-rebuild
```bash
npm run start:dev
```
This runs both the Angular build watcher and the server, rebuilding automatically on changes.

## API Endpoints

### Chat API
- **POST** `/api/chat` - Send a message to the AI
  ```json
  {
    "message": "Hello, how are you?",
    "conversationId": "optional-conversation-id"
  }
  ```

### Health Check
- **GET** `/api/health` - Check server and API status

### Conversation Management
- **DELETE** `/api/conversation/:id` - Clear conversation history

## Configuration

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key or any value for local server | Required | `sk-...` or `i-dont-care` |
| `OPENAI_MODEL` | GPT model to use | `gpt-3.5-turbo` | `openai/gpt-oss-20b` |
| `OPENAI_BASE_URL` | OpenAI API base URL | `https://api.openai.com/v1` | `http://192.168.1.191:1234/v1` |
| `PORT` | Server port | `4001` | `4001` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Voice Settings

The app automatically saves voice preferences to localStorage:
- **Voice**: Choose from available system voices
- **Rate**: Speech rate (0.1 - 2.0)
- **Pitch**: Voice pitch (0.1 - 2.0)

## Browser Support

### Speech Recognition
- Chrome/Chromium-based browsers (recommended)
- Edge
- Safari (limited support)

### Text-to-Speech
- All modern browsers
- Multiple voice options depending on OS

## Development

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── chat/           # Main chat interface
│   │   └── settings/       # Voice settings panel
│   ├── services/
│   │   ├── voice-chat.service.ts    # Core voice/chat logic
│   │   └── api.service.ts           # HTTP API service
│   └── app.component.ts    # Main app component
server/
└── server.js              # Express.js backend server
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run Angular dev server |
| `npm run server` | Run production server |
| `npm run start:dev` | Run development with auto-rebuild |
| `npm run build` | Build for development |
| `npm run build:prod` | Build for production |
| `npm test` | Run unit tests |

## Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Ensure you're using Chrome or Chromium-based browser
   - Check microphone permissions
   - Verify HTTPS is used (required for speech API)

2. **AI Not Responding**
   - Check your OpenAI API key in `.env`
   - Verify API key has sufficient credits (for official OpenAI)
   - For local servers: Ensure the server is running and accessible
   - Check the base URL is correct in `.env`
   - Check browser console for error messages

3. **Server Won't Start**
   - Ensure port 4001 is available
   - Check if all dependencies are installed
   - Verify Node.js version (v18+)

### Error Messages

- **"API key not configured"**: Add your OpenAI API key to `.env`
- **"Speech recognition not supported"**: Use a compatible browser
- **"Server connection failed"**: Check if the server is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This application requires an active internet connection and a valid OpenAI API key to function fully. The voice features require a modern browser with microphone access.
