import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface SubjectGrade {
  subject: { name: string; code: string };
  teacher: string;
  components: { name: string; score: number; max_score: number; weight: number }[];
  final_grade: number;
  status: string;
  published_at: string;
}

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grades-container">
      <div class="header">
        <h1>Mis Calificaciones</h1>
        <p class="subtitle">Consulta tus notas del periodo académico actual</p>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Cargando calificaciones...</span>
        </div>
      } @else if (grades.length === 0) {
        <div class="empty-state">
          <span class="icon">📊</span>
          <h3>Sin calificaciones</h3>
          <p>Aún no hay calificaciones publicadas para este periodo</p>
        </div>
      } @else {
        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-icon">📚</span>
            <div class="summary-content">
              <span class="summary-value">{{ grades.length }}</span>
              <span class="summary-label">Materias</span>
            </div>
          </div>
          <div class="summary-card">
            <span class="summary-icon success">✓</span>
            <div class="summary-content">
              <span class="summary-value success">{{ getApprovedCount() }}</span>
              <span class="summary-label">Aprobadas</span>
            </div>
          </div>
          <div class="summary-card">
            <span class="summary-icon danger">✗</span>
            <div class="summary-content">
              <span class="summary-value danger">{{ getFailedCount() }}</span>
              <span class="summary-label">Reprobadas</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-content">
              <span class="summary-value">{{ getAverage() | number:'1.1-1' }}</span>
              <span class="summary-label">Promedio General</span>
            </div>
          </div>
        </div>

        <div class="grades-list">
          @for (grade of grades; track grade.subject.code) {
            <div class="grade-card" [class.approved]="grade.status === 'APROBADO'" [class.failed]="grade.status === 'REPROBADO'">
              <div class="card-header">
                <div class="subject-info">
                  <span class="code">{{ grade.subject.code }}</span>
                  <h3>{{ grade.subject.name }}</h3>
                  <p class="teacher">Docente: {{ grade.teacher }}</p>
                </div>
                <div class="final-grade">
                  <span class="grade-value">{{ grade.final_grade | number:'1.1-1' }}</span>
                  <span class="grade-status" [class]="grade.status.toLowerCase()">
                    {{ grade.status === 'APROBADO' ? 'Aprobado' : 'Reprobado' }}
                  </span>
                </div>
              </div>
              
              <div class="components-grid">
                @for (comp of grade.components; track comp.name) {
                  <div class="component-item">
                    <span class="comp-name">{{ comp.name }}</span>
                    <div class="comp-score">
                      <span class="score">{{ comp.score }}/{{ comp.max_score }}</span>
                      <span class="weight">({{ comp.weight }}%)</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        [style.width.%]="(comp.score / comp.max_score) * 100"
                        [class.low]="(comp.score / comp.max_score) < 0.51"></div>
                    </div>
                  </div>
                }
              </div>

              <div class="card-footer">
                <span class="published-date">
                  Publicado: {{ grade.published_at | date:'medium' }}
                </span>
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
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      padding: 1.25rem;
    }
    .summary-icon {
      font-size: 1.5rem;
    }
    .summary-icon.success { color: #22c55e; }
    .summary-icon.danger { color: #ef4444; }
    .summary-content {
      display: flex;
      flex-direction: column;
    }
    .summary-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .summary-value.success { color: #22c55e; }
    .summary-value.danger { color: #ef4444; }
    .summary-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }
    .grades-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .grade-card {
      background: #1e293b;
      border-radius: 12px;
      border: 1px solid #334155;
      overflow: hidden;
      transition: transform 0.2s;
    }
    .grade-card:hover {
      transform: translateY(-2px);
    }
    .grade-card.approved {
      border-left: 4px solid #22c55e;
    }
    .grade-card.failed {
      border-left: 4px solid #ef4444;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #334155;
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
      font-size: 1.125rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0.5rem 0 0.25rem 0;
    }
    .subject-info .teacher {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
    .final-grade {
      text-align: right;
    }
    .grade-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #f1f5f9;
      line-height: 1;
    }
    .grade-status {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      margin-top: 0.5rem;
      display: inline-block;
    }
    .grade-status.aprobado {
      background: #22c55e20;
      color: #22c55e;
    }
    .grade-status.reprobado {
      background: #ef444420;
      color: #ef4444;
    }
    .components-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }
    .component-item {
      background: #0f172a;
      border-radius: 8px;
      padding: 1rem;
    }
    .comp-name {
      font-size: 0.8rem;
      color: #94a3b8;
      display: block;
      margin-bottom: 0.5rem;
    }
    .comp-score {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5rem;
    }
    .score {
      font-size: 1.125rem;
      font-weight: 600;
      color: #f1f5f9;
    }
    .weight {
      font-size: 0.7rem;
      color: #64748b;
    }
    .progress-bar {
      height: 4px;
      background: #334155;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #22c55e;
      border-radius: 2px;
      transition: width 0.3s;
    }
    .progress-fill.low {
      background: #ef4444;
    }
    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #334155;
      background: #0f172a40;
    }
    .published-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
      .card-header {
        flex-direction: column;
        gap: 1rem;
      }
      .final-grade {
        text-align: left;
      }
    }
  `]
})
export class StudentGradesComponent implements OnInit {
  private http = inject(HttpClient);

  grades: SubjectGrade[] = [];
  loading = true;

  ngOnInit() {
    this.loadGrades();
  }

  loadGrades() {
    this.http.get<any>('/api/v1/student/grades').subscribe({
      next: (res) => {
        this.grades = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getApprovedCount(): number {
    return this.grades.filter(g => g.status === 'APROBADO').length;
  }

  getFailedCount(): number {
    return this.grades.filter(g => g.status === 'REPROBADO').length;
  }

  getAverage(): number {
    if (this.grades.length === 0) return 0;
    const sum = this.grades.reduce((acc, g) => acc + g.final_grade, 0);
    return sum / this.grades.length;
  }
}
