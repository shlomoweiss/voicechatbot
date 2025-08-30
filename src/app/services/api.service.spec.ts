import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, ChatRequest, ChatResponse } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send chat message', () => {
    const mockResponse: ChatResponse = {
      response: 'Hello there!',
      conversationId: 'test-123',
      timestamp: '2024-01-01T00:00:00Z'
    };

    service.sendChatMessage('Hello').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/chat');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      message: 'Hello',
      conversationId: 'default'
    });
    req.flush(mockResponse);
  });

  it('should check health', () => {
    const mockHealth = {
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      hasOpenAIKey: true
    };

    service.checkHealth().subscribe(health => {
      expect(health).toEqual(mockHealth);
    });

    const req = httpMock.expectOne('/api/health');
    expect(req.request.method).toBe('GET');
    req.flush(mockHealth);
  });

  it('should clear conversation', () => {
    const mockResponse = { message: 'Conversation cleared', conversationId: 'test-123' };

    service.clearConversation('test-123').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/conversation/test-123');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
