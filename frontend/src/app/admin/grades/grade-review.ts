import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface PendingSubmission {
  id: number;
  offering: {
    id: number;
    subject: { name: string; code: string };
    teacher: { name: string };
  };
  submitted_at: string;
  student_count: number;
  workflow_instance_id: number;
}

@Component({
  selector: 'app-grade-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="review-container">
      <div class="header">
        <h1>Revisión de Notas</h1>
        <p class="subtitle">Aprobar o rechazar calificaciones enviadas por los docentes</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'pending'" (click)="switchTab('pending')">
          Pendientes
          @if (pendingCount > 0) {
            <span class="badge">{{ pendingCount }}</span>
          }
        </button>
        <button class="tab" [class.active]="activeTab === 'approved'" (click)="switchTab('approved')">
          Aprobadas
        </button>
        <button class="tab" [class.active]="activeTab === 'rejected'" (click)="switchTab('rejected')">
          Rechazadas
        </button>
        <button class="tab" [class.active]="activeTab === 'published'" (click)="switchTab('published')">
          Publicadas
        </button>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Cargando...</span>
        </div>
      } @else if (submissions.length === 0) {
        <div class="empty-state">
          <span class="icon">📋</span>
          <h3>Sin registros</h3>
          <p>No hay envíos de notas en esta categoría</p>
        </div>
      } @else {
        <div class="submissions-list">
          @for (sub of submissions; track sub.id) {
            <div class="submission-card">
              <div class="card-main">
                <div class="subject-info">
                  <span class="code">{{ sub.offering.subject.code }}</span>
                  <h3>{{ sub.offering.subject.name }}</h3>
                  <p class="teacher">Docente: {{ sub.offering.teacher.name }}</p>
                </div>
                <div class="meta">
                  <div class="meta-item">
                    <span class="label">Estudiantes</span>
                    <span class="value">{{ sub.student_count }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">Enviado</span>
                    <span class="value">{{ sub.submitted_at | date:'short' }}</span>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/admin/grades/review', sub.id]" class="btn-review">
                  {{ activeTab === 'pending' ? 'Revisar' : 'Ver Detalle' }}
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .review-container {
      padding: 2rem;
      max-width: 1200px;
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
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.5rem;
    }
    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .tab:hover {
      background: #334155;
      color: #f1f5f9;
    }
    .tab.active {
      background: #3b82f6;
      color: white;
    }
    .badge {
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
    }
    .tab.active .badge {
      background: white;
      color: #3b82f6;
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
    @keyframes spin { to { transform: rotate(360deg); } }
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
    .submissions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .submission-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.25rem 1.5rem;
      transition: border-color 0.2s;
    }
    .submission-card:hover {
      border-color: #3b82f6;
    }
    .card-main {
      display: flex;
      align-items: center;
      gap: 3rem;
    }
    .subject-info .code {
      font-size: 0.7rem;
      font-weight: 600;
      color: #3b82f6;
      background: #3b82f620;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .subject-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0.5rem 0 0.25rem 0;
    }
    .subject-info .teacher {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
    .meta {
      display: flex;
      gap: 2rem;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .meta-item .label {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
    }
    .meta-item .value {
      font-size: 0.875rem;
      color: #cbd5e1;
      font-weight: 500;
    }
    .btn-review {
      padding: 0.625rem 1.25rem;
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
    .btn-review:hover {
      background: #2563eb;
    }
  `]
})
export class GradeReviewComponent implements OnInit {
  private http = inject(HttpClient);

  submissions: PendingSubmission[] = [];
  activeTab = 'pending';
  pendingCount = 0;
  loading = true;

  ngOnInit() {
    this.loadSubmissions();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.loading = true;
    this.http.get<any>(`/api/v1/grades/pending?status=${this.activeTab}`).subscribe({
      next: (res) => {
        this.submissions = res.data || [];
        if (this.activeTab === 'pending') {
          this.pendingCount = this.submissions.length;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
