import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  fallback?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  hasOpenAIKey: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the AI chat service
   */
  sendChatMessage(message: string, conversationId?: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      conversationId: conversationId || 'default'
    };

    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Check server health and API status
   */
  checkHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId: string = 'default'): Observable<any> {
    return this.http.delete(`${this.baseUrl}/conversation/${conversationId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred while communicating with the server.';
    let fallbackMessage = 'I encountered an error. Please try again later.';

    if (error.error && error.error.error) {
      errorMessage = error.error.error;
      fallbackMessage = error.error.fallback || fallbackMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Return both error message and fallback for the UI to use
    return throwError(() => ({
      message: errorMessage,
      fallback: fallbackMessage,
      status: error.status || 500
    }));
  };
}
