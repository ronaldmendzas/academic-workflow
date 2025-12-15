import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Offering {
  id: number;
  subject: { name: string; code: string };
  classroom: { name: string };
  schedule: any[];
  enrollment_count: number;
  has_structure: boolean;
  submission_status: string | null;
}

@Component({
  selector: 'app-teacher-grades',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="grades-container">
      <div class="header">
        <h1>Gestión de Notas</h1>
        <p class="subtitle">Seleccione una materia para gestionar las calificaciones</p>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Cargando materias...</span>
        </div>
      } @else if (offerings.length === 0) {
        <div class="empty-state">
          <span class="icon">📚</span>
          <h3>Sin materias asignadas</h3>
          <p>No tiene materias asignadas en el periodo actual</p>
        </div>
      } @else {
        <div class="offerings-grid">
          @for (offering of offerings; track offering.id) {
            <div class="offering-card">
              <div class="card-header">
                <span class="code">{{ offering.subject.code }}</span>
                @if (offering.submission_status) {
                  <span class="status-badge" [class]="offering.submission_status">
                    {{ getStatusLabel(offering.submission_status) }}
                  </span>
                }
              </div>
              <h3>{{ offering.subject.name }}</h3>
              <div class="card-info">
                <div class="info-item">
                  <span class="label">Aula:</span>
                  <span class="value">{{ offering.classroom?.name || 'Sin asignar' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Estudiantes:</span>
                  <span class="value">{{ offering.enrollment_count }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Estructura:</span>
                  <span class="value" [class.configured]="offering.has_structure">
                    {{ offering.has_structure ? 'Configurada' : 'Pendiente' }}
                  </span>
                </div>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/teacher/grades', offering.id]" class="btn-primary">
                  {{ offering.has_structure ? 'Gestionar Notas' : 'Configurar Estructura' }}
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .grades-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 0.5rem 0;
    }
    .subtitle {
      color: #94a3b8;
      margin: 0;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem;
      color: #94a3b8;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #334155;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .empty-state .icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      color: #f1f5f9;
      margin: 0 0 0.5rem 0;
    }
    .empty-state p {
      color: #94a3b8;
      margin: 0;
    }
    .offerings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .offering-card {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.5rem;
      transition: all 0.2s;
    }
    .offering-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .code {
      font-size: 0.75rem;
      font-weight: 600;
      color: #3b82f6;
      background: #3b82f620;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }
    .status-badge {
      font-size: 0.7rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-badge.draft {
      background: #475569;
      color: #94a3b8;
    }
    .status-badge.submitted {
      background: #f59e0b20;
      color: #f59e0b;
    }
    .status-badge.approved {
      background: #22c55e20;
      color: #22c55e;
    }
    .status-badge.rejected {
      background: #ef444420;
      color: #ef4444;
    }
    .status-badge.published {
      background: #8b5cf620;
      color: #8b5cf6;
    }
    .offering-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 1rem 0;
    }
    .card-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }
    .info-item .label {
      color: #64748b;
    }
    .info-item .value {
      color: #cbd5e1;
    }
    .info-item .value.configured {
      color: #22c55e;
    }
    .card-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-primary {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.625rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
  `]
})
export class TeacherGradesComponent implements OnInit {
  private http = inject(HttpClient);
  
  offerings: Offering[] = [];
  loading = true;

  ngOnInit() {
    this.loadOfferings();
  }

  loadOfferings() {
    this.http.get<any>('/api/v1/teacher/grades/submissions').subscribe({
      next: (res) => {
        this.offerings = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'draft': 'Borrador',
      'submitted': 'En revisión',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'published': 'Publicado'
    };
    return labels[status] || status;
  }
}
