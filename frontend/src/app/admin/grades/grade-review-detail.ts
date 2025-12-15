import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GradeComponent {
  id: number;
  name: string;
  max_score: number;
  weight: number;
}

interface StudentGrade {
  enrollment_id: number;
  student_id: string;
  name: string;
  grades: Record<number, number>;
  final_grade: number;
  status: string;
}

@Component({
  selector: 'app-grade-review-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="review-detail-container">
      <div class="header">
        <div class="header-left">
          <a routerLink="/admin/grades" class="back-btn">← Volver</a>
          <div>
            <h1>{{ subject?.name || 'Cargando...' }}</h1>
            <p class="subtitle">
              {{ subject?.code }} · Docente: {{ teacher }}
            </p>
          </div>
        </div>
        <div class="header-right">
          <span class="status-badge" [class]="status">{{ getStatusLabel(status) }}</span>
        </div>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Cargando...</span>
        </div>
      } @else {
        <div class="info-cards">
          <div class="info-card">
            <span class="info-icon">👥</span>
            <div class="info-content">
              <span class="info-value">{{ students.length }}</span>
              <span class="info-label">Estudiantes</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-content">
              <span class="info-value success">{{ getApprovedCount() }}</span>
              <span class="info-label">Aprobados</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-content">
              <span class="info-value danger">{{ getFailedCount() }}</span>
              <span class="info-label">Reprobados</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-content">
              <span class="info-value">{{ getAverageGrade() | number:'1.1-1' }}</span>
              <span class="info-label">Promedio</span>
            </div>
          </div>
        </div>

        <div class="structure-summary">
          <h3>Estructura de Evaluación</h3>
          <div class="components-row">
            @for (comp of components; track comp.id) {
              <div class="component-chip">
                <span class="comp-name">{{ comp.name }}</span>
                <span class="comp-weight">{{ comp.weight }}%</span>
              </div>
            }
          </div>
        </div>

        <div class="grades-table-container">
          <table class="grades-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Estudiante</th>
                @for (comp of components; track comp.id) {
                  <th class="grade-col">{{ comp.name }}</th>
                }
                <th class="total-col">Final</th>
                <th class="status-col">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (student of students; track student.enrollment_id) {
                <tr>
                  <td>{{ student.student_id }}</td>
                  <td>{{ student.name }}</td>
                  @for (comp of components; track comp.id) {
                    <td class="grade-cell">
                      {{ student.grades[comp.id] ?? '-' }}
                    </td>
                  }
                  <td class="total-cell">{{ student.final_grade | number:'1.1-1' }}</td>
                  <td class="status-cell">
                    <span class="grade-status" [class]="student.status">
                      {{ student.status === 'APROBADO' ? 'Aprobado' : 'Reprobado' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (status === 'submitted') {
          <div class="review-actions">
            <div class="reject-section">
              <textarea 
                [(ngModel)]="rejectionReason" 
                placeholder="Motivo del rechazo (requerido si rechaza)"
                class="rejection-textarea"
                rows="3"></textarea>
            </div>
            <div class="action-buttons">
              <button 
                class="btn-reject" 
                (click)="rejectSubmission()"
                [disabled]="processing">
                {{ processing ? 'Procesando...' : 'Rechazar' }}
              </button>
              <button 
                class="btn-approve" 
                (click)="approveSubmission()"
                [disabled]="processing">
                {{ processing ? 'Procesando...' : 'Aprobar' }}
              </button>
            </div>
          </div>
        }

        @if (status === 'approved') {
          <div class="publish-section">
            <p class="publish-hint">Las notas están aprobadas. Publíquelas para que los estudiantes puedan verlas.</p>
            <button 
              class="btn-publish" 
              (click)="publishGrades()"
              [disabled]="processing">
              {{ processing ? 'Publicando...' : 'Publicar Notas' }}
            </button>
          </div>
        }

        @if (status === 'published') {
          <div class="published-notice">
            <span class="icon">✓</span>
            <p>Las notas han sido publicadas y son visibles para los estudiantes.</p>
          </div>
        }

        <div class="workflow-timeline">
          <h3>Historial del Workflow</h3>
          <div class="timeline">
            @for (log of workflowLogs; track log.id) {
              <div class="timeline-item">
                <div class="timeline-dot" [class]="log.action"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-action">{{ getActionLabel(log.action) }}</span>
                    <span class="timeline-date">{{ log.created_at | date:'medium' }}</span>
                  </div>
                  <p class="timeline-actor">{{ log.actor_name }}</p>
                  @if (log.notes) {
                    <p class="timeline-notes">{{ log.notes }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (message) {
        <div class="toast" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
          {{ message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .review-detail-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .back-btn {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .back-btn:hover {
      color: #3b82f6;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }
    .subtitle {
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .status-badge.submitted { background: #f59e0b20; color: #f59e0b; }
    .status-badge.approved { background: #22c55e20; color: #22c55e; }
    .status-badge.rejected { background: #ef444420; color: #ef4444; }
    .status-badge.published { background: #8b5cf620; color: #8b5cf6; }
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
    .info-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .info-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.25rem;
    }
    .info-icon {
      font-size: 2rem;
    }
    .info-content {
      display: flex;
      flex-direction: column;
    }
    .info-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .info-value.success { color: #22c55e; }
    .info-value.danger { color: #ef4444; }
    .info-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }
    .structure-summary {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .structure-summary h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #94a3b8;
      margin: 0 0 1rem 0;
    }
    .components-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .component-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #334155;
      padding: 0.5rem 0.875rem;
      border-radius: 6px;
    }
    .comp-name {
      color: #f1f5f9;
      font-size: 0.875rem;
    }
    .comp-weight {
      color: #3b82f6;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .grades-table-container {
      overflow-x: auto;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      margin-bottom: 1.5rem;
    }
    .grades-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 700px;
    }
    .grades-table th, .grades-table td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid #334155;
    }
    .grades-table th {
      background: #0f172a;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .grades-table td {
      color: #f1f5f9;
      font-size: 0.875rem;
    }
    .grade-col, .grade-cell { text-align: center; }
    .total-col, .total-cell { 
      text-align: center;
      font-weight: 600;
    }
    .total-cell { color: #3b82f6; }
    .status-col, .status-cell { text-align: center; }
    .grade-status {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .grade-status.APROBADO { background: #22c55e20; color: #22c55e; }
    .grade-status.REPROBADO { background: #ef444420; color: #ef4444; }
    .review-actions {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .rejection-textarea {
      width: 100%;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.875rem;
      color: #f1f5f9;
      font-size: 0.875rem;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 1rem;
    }
    .rejection-textarea:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-reject, .btn-approve, .btn-publish {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-reject {
      background: #ef4444;
      color: white;
    }
    .btn-reject:hover:not(:disabled) {
      background: #dc2626;
    }
    .btn-approve {
      background: #22c55e;
      color: white;
    }
    .btn-approve:hover:not(:disabled) {
      background: #16a34a;
    }
    .btn-reject:disabled, .btn-approve:disabled, .btn-publish:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .publish-section {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .publish-hint {
      color: #94a3b8;
      margin: 0;
      font-size: 0.875rem;
    }
    .btn-publish {
      background: #8b5cf6;
      color: white;
    }
    .btn-publish:hover:not(:disabled) {
      background: #7c3aed;
    }
    .published-notice {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #22c55e20;
      border: 1px solid #22c55e;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
    }
    .published-notice .icon {
      font-size: 1.5rem;
      color: #22c55e;
    }
    .published-notice p {
      color: #86efac;
      margin: 0;
      font-size: 0.875rem;
    }
    .workflow-timeline {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.5rem;
    }
    .workflow-timeline h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #94a3b8;
      margin: 0 0 1.25rem 0;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .timeline-item {
      display: flex;
      gap: 1rem;
      padding-bottom: 1.25rem;
      position: relative;
    }
    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 7px;
      top: 20px;
      bottom: 0;
      width: 2px;
      background: #334155;
    }
    .timeline-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #475569;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .timeline-dot.submit { background: #f59e0b; }
    .timeline-dot.approve { background: #22c55e; }
    .timeline-dot.reject { background: #ef4444; }
    .timeline-dot.publish { background: #8b5cf6; }
    .timeline-dot.start { background: #3b82f6; }
    .timeline-content {
      flex: 1;
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .timeline-action {
      font-size: 0.875rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    .timeline-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .timeline-actor {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0 0 0.25rem 0;
    }
    .timeline-notes {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
      font-style: italic;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      z-index: 1000;
    }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @media (max-width: 768px) {
      .info-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class GradeReviewDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  submissionId!: number;
  subject: { name: string; code: string } | null = null;
  teacher = '';
  status = '';
  components: GradeComponent[] = [];
  students: StudentGrade[] = [];
  workflowLogs: any[] = [];
  
  rejectionReason = '';
  loading = true;
  processing = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.submissionId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.http.get<any>(`/api/v1/grades/submissions/${this.submissionId}`).subscribe({
      next: (res) => {
        const data = res.data;
        this.subject = data.subject;
        this.teacher = data.teacher;
        this.status = data.status;
        this.components = data.components;
        this.students = data.students;
        this.workflowLogs = data.workflow_logs || [];
        this.loading = false;
      },
      error: () => {
        this.showMessage('Error al cargar los datos', 'error');
        this.loading = false;
      }
    });
  }

  getApprovedCount(): number {
    return this.students.filter(s => s.final_grade >= 51).length;
  }

  getFailedCount(): number {
    return this.students.filter(s => s.final_grade < 51).length;
  }

  getAverageGrade(): number {
    if (this.students.length === 0) return 0;
    const sum = this.students.reduce((acc, s) => acc + s.final_grade, 0);
    return sum / this.students.length;
  }

  approveSubmission() {
    if (!confirm('¿Está seguro de aprobar estas calificaciones?')) return;
    
    this.processing = true;
    this.http.post<any>(`/api/v1/grades/submissions/${this.submissionId}/approve`, {}).subscribe({
      next: () => {
        this.showMessage('Calificaciones aprobadas correctamente', 'success');
        this.processing = false;
        this.loadData();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al aprobar', 'error');
        this.processing = false;
      }
    });
  }

  rejectSubmission() {
    if (!this.rejectionReason.trim()) {
      this.showMessage('Debe indicar el motivo del rechazo', 'error');
      return;
    }

    if (!confirm('¿Está seguro de rechazar estas calificaciones?')) return;
    
    this.processing = true;
    this.http.post<any>(`/api/v1/grades/submissions/${this.submissionId}/reject`, {
      reason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.showMessage('Calificaciones rechazadas', 'success');
        this.processing = false;
        setTimeout(() => this.router.navigate(['/admin/grades']), 1500);
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al rechazar', 'error');
        this.processing = false;
      }
    });
  }

  publishGrades() {
    if (!confirm('¿Está seguro de publicar estas calificaciones? Los estudiantes podrán verlas.')) return;
    
    this.processing = true;
    this.http.post<any>(`/api/v1/grades/submissions/${this.submissionId}/publish`, {}).subscribe({
      next: () => {
        this.showMessage('Calificaciones publicadas correctamente', 'success');
        this.processing = false;
        this.loadData();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al publicar', 'error');
        this.processing = false;
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

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'start': 'Workflow Iniciado',
      'submit': 'Enviado a Revisión',
      'approve': 'Aprobado',
      'reject': 'Rechazado',
      'publish': 'Publicado',
      'resubmit': 'Re-enviado'
    };
    return labels[action] || action;
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }
}
