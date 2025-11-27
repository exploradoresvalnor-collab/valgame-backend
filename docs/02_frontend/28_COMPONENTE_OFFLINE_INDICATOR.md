/**
 * Componente: OfflineIndicator
 * 
 * Muestra un banner visual cuando no hay conexión a internet
 * Se integra globalmente en el layout principal de la aplicación
 * 
 * Uso en app.component.html:
 * <app-offline-indicator></app-offline-indicator>
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface OfflineState {
  isOffline: boolean;
  message: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-container" 
         [@slideInOut]="offlineState.isOffline"
         [class.show]="offlineState.isOffline">
      
      <div class="offline-banner">
        <!-- Icono de desconexión -->
        <div class="offline-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v4m0 4v.01"></path>
          </svg>
        </div>

        <!-- Contenido del mensaje -->
        <div class="offline-content">
          <h3 class="offline-title">
            {{ offlineState.isOffline ? '⚠️ Sin conexión' : '✅ Conexión restaurada' }}
          </h3>
          <p class="offline-message">{{ offlineState.message }}</p>

          <!-- Información de reintentos -->
          <div class="retry-info" *ngIf="offlineState.isOffline && offlineState.retryCount > 0">
            <small>Intento {{ offlineState.retryCount }} de {{ offlineState.maxRetries }}</small>
            <div class="progress-bar">
              <div class="progress-fill" 
                   [style.width.%]="(offlineState.retryCount / offlineState.maxRetries) * 100">
              </div>
            </div>
          </div>

          <!-- Detalles de error (desarrollo) -->
          <details class="error-details" *ngIf="offlineState.lastError && isDevelopment">
            <summary>Detalles técnicos</summary>
            <pre>{{ offlineState.lastError }}</pre>
          </details>
        </div>

        <!-- Acciones -->
        <div class="offline-actions">
          <button class="retry-btn" 
                  (click)="retryConnection()"
                  [disabled]="!offlineState.isOffline"
                  title="Reintentar conexión">
            🔄 Reintentar
          </button>
          <button class="dismiss-btn" 
                  (click)="dismissBanner()"
                  title="Cerrar mensaje"
                  aria-label="Cerrar">
            ✕
          </button>
        </div>
      </div>

      <!-- Indicador visual mínimo (esquina) -->
      <div class="offline-dot" *ngIf="offlineState.isOffline">
        <span class="pulse"></span>
      </div>
    </div>
  `,
  styles: [`
    .offline-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      width: 100%;
      pointer-events: none;
    }

    .offline-banner {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
      color: white;
      padding: 16px 20px;
      border-bottom: 3px solid #CC0000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 16px;
      pointer-events: auto;
      backdrop-filter: blur(8px);
    }

    .offline-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      animation: pulse-icon 2s ease-in-out infinite;
    }

    .offline-icon svg {
      width: 24px;
      height: 24px;
    }

    .offline-content {
      flex: 1;
      min-width: 0;
    }

    .offline-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .offline-message {
      margin: 4px 0 0 0;
      font-size: 13px;
      opacity: 0.95;
      line-height: 1.4;
    }

    .retry-info {
      margin-top: 8px;
      font-size: 12px;
      opacity: 0.85;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      margin-top: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      transition: width 0.3s ease;
    }

    .error-details {
      margin-top: 8px;
      font-size: 11px;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);
      padding: 8px;
      border-radius: 4px;
    }

    .error-details summary {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: underline;
      user-select: none;
    }

    .error-details pre {
      margin: 8px 0 0 0;
      background: rgba(0, 0, 0, 0.3);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 10px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .offline-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .retry-btn,
    .dismiss-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .retry-btn {
      background: rgba(255, 255, 255, 0.25);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .retry-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.35);
      border-color: white;
      transform: scale(1.05);
    }

    .retry-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dismiss-btn {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .dismiss-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .offline-dot {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 12px;
      height: 12px;
      background: #FF6B6B;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
      z-index: 10000;
    }

    .pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #FF6B6B;
      border-radius: 50%;
      animation: pulse-dot 1.5s ease-in-out infinite;
    }

    @keyframes pulse-icon {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    @keyframes pulse-dot {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .offline-banner {
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px 16px;
      }

      .offline-title {
        font-size: 13px;
      }

      .offline-message {
        font-size: 12px;
      }

      .offline-actions {
        order: 3;
        width: 100%;
        flex-wrap: wrap;
      }

      .retry-btn,
      .dismiss-btn {
        flex: 1;
      }

      .retry-btn {
        min-width: 100px;
      }

      .dismiss-btn {
        width: auto;
        flex: 0;
        min-width: 40px;
      }
    }

    @media (max-width: 480px) {
      .offline-icon {
        width: 32px;
        height: 32px;
      }

      .offline-icon svg {
        width: 20px;
        height: 20px;
      }

      .offline-title {
        font-size: 12px;
      }

      .offline-message {
        font-size: 11px;
      }
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  offlineState: OfflineState = {
    isOffline: false,
    message: 'Conexión a internet perdida. Algunos servicios no estarán disponibles.',
    retryCount: 0,
    maxRetries: 3,
    lastError: undefined
  };

  isDevelopment = !this.isProd();

  constructor(private connectionMonitor: ConnectionMonitorService) {}

  ngOnInit(): void {
    // Monitorear cambios en el estado de conexión
    this.connectionMonitor.getConnectionStatus$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.offlineState = {
          ...this.offlineState,
          ...status
        };

        // Log para debugging
        if (status.isOffline) {
          console.warn('[OfflineIndicator] Desconexión detectada', status);
        } else {
          console.log('[OfflineIndicator] Conexión restaurada');
        }
      });

    // Escuchar eventos de reintento
    this.connectionMonitor.getRetryEvents$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(retryEvent => {
        this.offlineState.retryCount = retryEvent.attempt;
        this.offlineState.maxRetries = retryEvent.maxAttempts;
        this.offlineState.lastError = retryEvent.error?.message;
      });

    // Monitoreo inicial
    this.checkConnection();
  }

  private checkConnection(): void {
    // Verificar conexión periódicamente (cada 5 segundos si está offline)
    setInterval(() => {
      if (this.offlineState.isOffline) {
        this.connectionMonitor.checkConnection()
          .then(isOnline => {
            if (isOnline && this.offlineState.isOffline) {
              console.log('[OfflineIndicator] Conexión restaurada automáticamente');
              this.offlineState.isOffline = false;
              this.offlineState.retryCount = 0;
            }
          })
          .catch(err => console.error('[OfflineIndicator] Error en health check:', err));
      }
    }, 5000);
  }

  retryConnection(): void {
    console.log('[OfflineIndicator] Usuario solicitó reintento');
    this.connectionMonitor.retryConnection();
  }

  dismissBanner(): void {
    if (!this.offlineState.isOffline) {
      this.offlineState.message = '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isProd(): boolean {
    return false; // Cambiar según environment
  }
}

/**
 * Servicio: ConnectionMonitorService
 * 
 * Monitorea el estado de conexión y emite eventos
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

interface ConnectionStatus {
  isOffline: boolean;
  message: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

interface RetryEvent {
  attempt: number;
  maxAttempts: number;
  error?: Error;
}

@Injectable({ providedIn: 'root' })
export class ConnectionMonitorService {
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
    isOffline: false,
    message: '',
    retryCount: 0,
    maxRetries: 3
  });

  private retryEvents$ = new Subject<RetryEvent>();

  constructor(private http: HttpClient) {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Detectar eventos online/offline del navegador
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Health check periódico
    setInterval(() => this.performHealthCheck(), 10000);
  }

  private handleOnline(): void {
    console.log('[ConnectionMonitor] Evento online detectado');
    this.checkConnection();
  }

  private handleOffline(): void {
    console.error('[ConnectionMonitor] Evento offline detectado');
    this.connectionStatus$.next({
      isOffline: true,
      message: 'Sin conexión a internet',
      retryCount: 0,
      maxRetries: 3
    });
  }

  private performHealthCheck(): void {
    // Health check silencioso para detectar desconexiones
    this.http.get('/api/health', { responseType: 'json' })
      .subscribe({
        next: () => {
          if (this.connectionStatus$.value.isOffline) {
            this.connectionStatus$.next({
              isOffline: false,
              message: 'Conexión restaurada',
              retryCount: 0,
              maxRetries: 3
            });
          }
        },
        error: () => {
          if (!this.connectionStatus$.value.isOffline) {
            this.connectionStatus$.next({
              isOffline: true,
              message: 'Conexión a internet perdida',
              retryCount: 0,
              maxRetries: 3
            });
          }
        }
      });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.http.get('/api/health', { responseType: 'json' }).toPromise();
      return !!response;
    } catch (error) {
      return false;
    }
  }

  retryConnection(): void {
    console.log('[ConnectionMonitor] Reintentando conexión...');
    this.checkConnection()
      .then(isOnline => {
        if (isOnline) {
          this.connectionStatus$.next({
            isOffline: false,
            message: 'Conexión restaurada',
            retryCount: 0,
            maxRetries: 3
          });
        }
      });
  }

  getConnectionStatus$(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  getRetryEvents$(): Observable<RetryEvent> {
    return this.retryEvents$.asObservable();
  }
}
  `,
  "filePath":"c:/Users/Haustman/Desktop/valgame-backend/FRONTEND_STARTER_KIT/28_COMPONENTE_OFFLINE_INDICATOR.md"
})
