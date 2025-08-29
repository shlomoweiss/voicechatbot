import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Message {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface VoiceSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

export interface VoiceStatus {
  message: string;
  type: 'listening' | 'error' | 'speaking' | '';
}

@Injectable({
  providedIn: 'root'
})
export class VoiceChatService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  // Subjects for reactive updates
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private isRecordingSubject = new BehaviorSubject<boolean>(false);
  private voiceStatusSubject = new BehaviorSubject<VoiceStatus>({ message: '', type: '' });
  private voicesSubject = new BehaviorSubject<SpeechSynthesisVoice[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public messages$ = this.messagesSubject.asObservable();
  public isRecording$ = this.isRecordingSubject.asObservable();
  public voiceStatus$ = this.voiceStatusSubject.asObservable();
  public voices$ = this.voicesSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  private settings: VoiceSettings = {
    voice: null,
    rate: 1,
    pitch: 1
  };

  constructor(private ngZone: NgZone) {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.initializeTextToSpeech();
    this.loadSettings();
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: Message = {
      content: "Hello! I'm your voice assistant. You can type or use the microphone to talk to me. I'll respond with both text and voice.",
      sender: 'assistant',
      timestamp: new Date()
    };
    this.messagesSubject.next([welcomeMessage]);
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.ngZone.run(() => {
          this.isRecordingSubject.next(true);
          this.updateVoiceStatus('Listening...', 'listening');
        });
      };

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            this.sendMessage(finalTranscript);
          } else if (interimTranscript) {
            this.updateVoiceStatus(`Hearing: "${interimTranscript}"`, 'listening');
          }
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isRecordingSubject.next(false);
          this.updateVoiceStatus('', '');
        });
      };

      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          this.isRecordingSubject.next(false);
          this.updateVoiceStatus(`Speech recognition error: ${event.error}`, 'error');
        });
      };
    } else {
      this.updateVoiceStatus('Speech recognition not supported in this browser', 'error');
    }
  }

  private initializeTextToSpeech(): void {
    if ('speechSynthesis' in window) {
      // Wait for voices to be loaded
      if (this.synthesis.getVoices().length === 0) {
        this.synthesis.addEventListener('voiceschanged', () => {
          this.ngZone.run(() => {
            this.loadVoices();
          });
        });
      } else {
        this.loadVoices();
      }
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  }

  private loadVoices(): void {
    this.ngZone.run(() => {
      this.voices = this.synthesis.getVoices();
      this.voicesSubject.next(this.voices);
    });
  }

  public toggleVoiceRecording(): void {
    if (!this.recognition) {
      this.updateVoiceStatus('Speech recognition not available', 'error');
      return;
    }

    if (this.isRecordingSubject.value) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  public sendMessage(content: string): void {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // Show loading
    this.isLoadingSubject.next(true);

    // Generate AI response
    setTimeout(() => {
      this.generateAIResponse(content);
    }, 1000);
  }

  private generateAIResponse(userMessage: string): void {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.isLoadingSubject.next(false);

        const response = this.getAIResponse(userMessage);
        const assistantMessage: Message = {
          content: response,
          sender: 'assistant',
          timestamp: new Date()
        };

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, assistantMessage]);
        
        // Speak the response
        this.speakText(response);
      });
    }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
  }

  private getAIResponse(message: string): string {
    const responses = {
      greeting: [
        "Hello! How can I assist you today?",
        "Hi there! What would you like to talk about?",
        "Greetings! I'm here to help with any questions you have.",
        "Hello! Nice to meet you. What's on your mind?"
      ],
      question: [
        "That's an interesting question! Let me think about that...",
        "Great question! Based on what I know...",
        "I'd be happy to help with that. Here's what I think...",
        "That's a thoughtful question. From my perspective..."
      ],
      weather: [
        "I don't have access to current weather data, but you can check your local weather app or website for the most up-to-date information.",
        "For accurate weather information, I'd recommend checking a reliable weather service like Weather.com or your local weather app."
      ],
      help: [
        "I'm here to help! You can ask me questions, have a conversation, or just chat. I can respond with both text and voice.",
        "I'm a voice-enabled AI assistant. Feel free to type or speak to me, and I'll respond accordingly. What would you like to know?"
      ],
      default: [
        "That's interesting! Tell me more about that.",
        "I understand. Can you elaborate on that?",
        "That's a good point. What made you think about that?",
        "Interesting perspective! I'd love to hear more of your thoughts on this.",
        "I see what you mean. What else would you like to discuss?"
      ]
    };

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.getRandomResponse(responses.greeting);
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
      return this.getRandomResponse(responses.weather);
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return this.getRandomResponse(responses.help);
    } else if (lowerMessage.includes('?')) {
      return this.getRandomResponse(responses.question);
    } else {
      return this.getRandomResponse(responses.default);
    }
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public speakText(text: string): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    if (this.settings.voice) {
      utterance.voice = this.settings.voice;
    }
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;

    // Event listeners
    utterance.onstart = () => {
      this.ngZone.run(() => {
        this.updateVoiceStatus('Speaking...', 'speaking');
      });
    };

    utterance.onend = () => {
      this.ngZone.run(() => {
        this.updateVoiceStatus('', '');
      });
    };

    utterance.onerror = (event) => {
      this.ngZone.run(() => {
        console.error('Speech synthesis error:', event);
        this.updateVoiceStatus('Speech error', 'error');
      });
    };

    this.synthesis.speak(utterance);
  }

  private updateVoiceStatus(message: string, type: 'listening' | 'error' | 'speaking' | ''): void {
    this.voiceStatusSubject.next({ message, type });
  }

  public updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  private saveSettings(): void {
    localStorage.setItem('voiceChatSettings', JSON.stringify({
      voiceIndex: this.voices.findIndex(v => v === this.settings.voice),
      rate: this.settings.rate,
      pitch: this.settings.pitch
    }));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('voiceChatSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings.rate = parsed.rate || 1;
        this.settings.pitch = parsed.pitch || 1;
        
        // Set voice after voices are loaded
        setTimeout(() => {
          if (parsed.voiceIndex >= 0 && this.voices[parsed.voiceIndex]) {
            this.settings.voice = this.voices[parsed.voiceIndex];
          }
        }, 1000);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }
}
