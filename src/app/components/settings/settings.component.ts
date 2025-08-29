import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceChatService, VoiceSettings } from '../../services/voice-chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit, OnDestroy {
  voices: SpeechSynthesisVoice[] = [];
  settings: VoiceSettings = { voice: null, rate: 1, pitch: 1 };
  selectedVoiceIndex: number = -1;
  isVisible: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private voiceChatService: VoiceChatService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.voiceChatService.voices$.subscribe(voices => {
        this.voices = voices;
        this.updateSelectedVoiceIndex();
      })
    );

    // Load current settings
    this.settings = this.voiceChatService.getSettings();
    this.updateSelectedVoiceIndex();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSettings(): void {
    this.isVisible = !this.isVisible;
  }

  onVoiceChange(): void {
    const selectedVoice = this.selectedVoiceIndex >= 0 ? this.voices[this.selectedVoiceIndex] : null;
    this.voiceChatService.updateSettings({ voice: selectedVoice });
  }

  onRateChange(): void {
    this.voiceChatService.updateSettings({ rate: this.settings.rate });
  }

  onPitchChange(): void {
    this.voiceChatService.updateSettings({ pitch: this.settings.pitch });
  }

  private updateSelectedVoiceIndex(): void {
    if (this.settings.voice && this.voices.length > 0) {
      this.selectedVoiceIndex = this.voices.findIndex(v => v === this.settings.voice);
    }
  }
}
