import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceChatService, Message, VoiceStatus } from '../../services/voice-chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  isRecording: boolean = false;
  voiceStatus: VoiceStatus = { message: '', type: '' };
  isLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private voiceChatService: VoiceChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Subscribe to service observables
    this.subscriptions.push(
      this.voiceChatService.messages$.subscribe(messages => {
        this.messages = messages;
        this.cdr.detectChanges();
        // Scroll to bottom after DOM update
        this.scrollToBottom();
      })
    );

    this.subscriptions.push(
      this.voiceChatService.isRecording$.subscribe(isRecording => {
        this.isRecording = isRecording;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.push(
      this.voiceChatService.voiceStatus$.subscribe(status => {
        this.voiceStatus = status;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.push(
      this.voiceChatService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewChecked(): void {
    // Only auto-scroll on initial load
    if (this.messages.length === 1) {
      this.forceScrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  sendMessage(): void {
    if (this.currentMessage.trim()) {
      this.voiceChatService.sendMessage(this.currentMessage);
      this.currentMessage = '';
      this.autoResizeTextarea();
      // Scroll to bottom after sending message
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  toggleVoiceRecording(): void {
    this.voiceChatService.toggleVoiceRecording();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onInputChange(): void {
    this.autoResizeTextarea();
  }

  private autoResizeTextarea(): void {
    const textarea = this.messageInput?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }

  private scrollToBottom(): void {
    if (this.chatMessages) {
      const element = this.chatMessages.nativeElement;
      // Simple, reliable scroll to bottom
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 50);
    }
  }

  private forceScrollToBottom(): void {
    if (this.chatMessages) {
      const element = this.chatMessages.nativeElement;
      // Force immediate scroll without animation
      element.scrollTop = element.scrollHeight;
    }
  }

  getStatusIcon(): string {
    if (this.isRecording) {
      return 'fas fa-microphone';
    } else if (this.voiceStatus.type === 'speaking') {
      return 'fas fa-volume-up';
    } else if (this.voiceStatus.type === 'error') {
      return 'fas fa-microphone-slash';
    } else {
      return 'fas fa-microphone-slash';
    }
  }

  getStatusText(): string {
    if (this.isRecording) {
      return 'Listening';
    } else if (this.voiceStatus.type === 'speaking') {
      return 'Speaking';
    } else if (this.voiceStatus.type === 'error') {
      return 'Speech Error';
    } else {
      return 'Speech Ready';
    }
  }
}
