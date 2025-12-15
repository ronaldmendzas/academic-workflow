import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GradeComponent {
  id?: number;
  name: string;
  max_score: number;
  weight: number;
  order: number;
}

interface Student {
  id: number;
  enrollment_id: number;
  student_id: string;
  name: string;
  grades: Record<number, number>;
}

interface GradeStructure {
  components: GradeComponent[];
  total_weight: number;
}

@Component({
  selector: 'app-grade-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="grade-detail-container">
      <div class="header">
        <div class="header-left">
          <a routerLink="/teacher/grades" class="back-btn">← Volver</a>
          <div>
            <h1>{{ subject?.name || 'Cargando...' }}</h1>
            <p class="subtitle">{{ subject?.code }} - {{ classroom }}</p>
          </div>
        </div>
        @if (submission) {
          <div class="submission-status">
            <span class="status-badge" [class]="submission.status">
              {{ getStatusLabel(submission.status) }}
            </span>
          </div>
        }
      </div>

      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'structure'" 
          (click)="activeTab = 'structure'"
          [disabled]="submission?.status === 'submitted' || submission?.status === 'approved'">
          Estructura de Notas
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'grades'" 
          (click)="activeTab = 'grades'"
          [disabled]="!hasValidStructure()">
          Calificaciones
        </button>
      </div>

      @if (loading) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Cargando...</span>
        </div>
      } @else {
        @if (activeTab === 'structure') {
          <div class="structure-section">
            <div class="section-header">
              <h2>Componentes de Evaluación</h2>
              <p class="hint">Defina los componentes que sumarán 100%</p>
            </div>

            <div class="components-list">
              @for (comp of structure.components; track comp.order; let i = $index) {
                <div class="component-row">
                  <div class="component-order">{{ i + 1 }}</div>
                  <div class="component-fields">
                    <input 
                      type="text" 
                      [(ngModel)]="comp.name" 
                      placeholder="Nombre del componente"
                      class="input-field name-field"
                      [disabled]="isStructureLocked()">
                    <input 
                      type="number" 
                      [(ngModel)]="comp.max_score" 
                      placeholder="Pts"
                      class="input-field score-field"
                      min="1"
                      max="100"
                      [disabled]="isStructureLocked()">
                    <input 
                      type="number" 
                      [(ngModel)]="comp.weight" 
                      placeholder="%"
                      class="input-field weight-field"
                      min="1"
                      max="100"
                      [disabled]="isStructureLocked()">
                    <span class="weight-label">%</span>
                  </div>
                  @if (!isStructureLocked()) {
                    <button class="btn-remove" (click)="removeComponent(i)">×</button>
                  }
                </div>
              }
            </div>

            <div class="structure-footer">
              @if (!isStructureLocked()) {
                <button class="btn-add" (click)="addComponent()">
                  + Agregar Componente
                </button>
              }
              <div class="total-weight" [class.valid]="getTotalWeight() === 100" [class.invalid]="getTotalWeight() !== 100">
                Total: {{ getTotalWeight() }}%
                @if (getTotalWeight() !== 100) {
                  <span class="warning">(debe ser 100%)</span>
                }
              </div>
            </div>

            @if (!isStructureLocked()) {
              <div class="actions">
                <button 
                  class="btn-save" 
                  (click)="saveStructure()"
                  [disabled]="saving || getTotalWeight() !== 100">
                  {{ saving ? 'Guardando...' : 'Guardar Estructura' }}
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="grades-section">
            @if (rejection) {
              <div class="rejection-banner">
                <div class="rejection-icon">⚠️</div>
                <div class="rejection-content">
                  <strong>Notas rechazadas</strong>
                  <p>{{ rejection.reason }}</p>
                  <span class="rejection-date">{{ rejection.date | date:'medium' }}</span>
                </div>
              </div>
            }

            <div class="grades-table-container">
              <table class="grades-table">
                <thead>
                  <tr>
                    <th class="sticky-col">Código</th>
                    <th class="sticky-col-2">Estudiante</th>
                    @for (comp of structure.components; track comp.order) {
                      <th class="grade-col">
                        {{ comp.name }}
                        <span class="max-score">({{ comp.max_score }}pts)</span>
                      </th>
                    }
                    <th class="total-col">Final</th>
                    <th class="status-col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (student of students; track student.id) {
                    <tr>
                      <td class="sticky-col">{{ student.student_id }}</td>
                      <td class="sticky-col-2">{{ student.name }}</td>
                      @for (comp of structure.components; track comp.order) {
                        <td class="grade-cell">
                          <input 
                            type="number" 
                            [ngModel]="student.grades[comp.id!]"
                            (ngModelChange)="updateGrade(student, comp.id!, $event)"
                            class="grade-input"
                            [min]="0"
                            [max]="comp.max_score"
                            [disabled]="isGradesLocked()">
                        </td>
                      }
                      <td class="total-cell">{{ calculateFinal(student) | number:'1.1-1' }}</td>
                      <td class="status-cell">
                        <span 
                          class="grade-status" 
                          [class.approved]="calculateFinal(student) >= 51"
                          [class.failed]="calculateFinal(student) < 51 && hasAllGrades(student)">
                          @if (calculateFinal(student) >= 51) {
                            Aprobado
                          } @else if (hasAllGrades(student)) {
                            Reprobado
                          } @else {
                            -
                          }
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (students.length === 0) {
              <div class="no-students">
                <span class="icon">👥</span>
                <p>No hay estudiantes inscritos en esta materia</p>
              </div>
            }

            @if (!isGradesLocked() && students.length > 0) {
              <div class="grades-actions">
                <button 
                  class="btn-save" 
                  (click)="saveGrades()"
                  [disabled]="saving">
                  {{ saving ? 'Guardando...' : 'Guardar Borrador' }}
                </button>
                <button 
                  class="btn-submit" 
                  (click)="submitForReview()"
                  [disabled]="saving || !canSubmit()">
                  Enviar a Revisión
                </button>
              </div>
            }

            @if (submission?.status === 'approved') {
              <div class="approved-notice">
                <span class="icon">✓</span>
                <p>Las notas han sido aprobadas y están pendientes de publicación por el administrador.</p>
              </div>
            }
          </div>
        }
      }

      @if (message) {
        <div class="toast" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
          {{ message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .grade-detail-container {
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
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
    .status-badge.draft { background: #475569; color: #94a3b8; }
    .status-badge.submitted { background: #f59e0b20; color: #f59e0b; }
    .status-badge.approved { background: #22c55e20; color: #22c55e; }
    .status-badge.rejected { background: #ef444420; color: #ef4444; }
    .status-badge.published { background: #8b5cf620; color: #8b5cf6; }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.5rem;
    }
    .tab {
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
    .tab:hover:not(:disabled) {
      background: #334155;
      color: #f1f5f9;
    }
    .tab.active {
      background: #3b82f6;
      color: white;
    }
    .tab:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    .section-header {
      margin-bottom: 1.5rem;
    }
    .section-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 0.25rem 0;
    }
    .hint {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }
    .components-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .component-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #1e293b;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .component-order {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #334155;
      border-radius: 6px;
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .component-fields {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    .input-field {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 0.625rem 0.875rem;
      color: #f1f5f9;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }
    .input-field:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .input-field:disabled {
      background: #1e293b;
      color: #64748b;
    }
    .name-field { flex: 1; }
    .score-field, .weight-field { width: 80px; text-align: center; }
    .weight-label { color: #64748b; }
    .btn-remove {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ef444420;
      border: none;
      border-radius: 6px;
      color: #ef4444;
      font-size: 1.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-remove:hover {
      background: #ef444440;
    }
    .structure-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #334155;
    }
    .btn-add {
      background: transparent;
      border: 1px dashed #334155;
      color: #94a3b8;
      padding: 0.625rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .btn-add:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }
    .total-weight {
      font-size: 1rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 6px;
    }
    .total-weight.valid {
      background: #22c55e20;
      color: #22c55e;
    }
    .total-weight.invalid {
      background: #ef444420;
      color: #ef4444;
    }
    .warning {
      font-size: 0.75rem;
      font-weight: 400;
      margin-left: 0.5rem;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn-save, .btn-submit {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-save {
      background: #334155;
      color: #f1f5f9;
    }
    .btn-save:hover:not(:disabled) {
      background: #475569;
    }
    .btn-submit {
      background: #3b82f6;
      color: white;
    }
    .btn-submit:hover:not(:disabled) {
      background: #2563eb;
    }
    .btn-save:disabled, .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .rejection-banner {
      display: flex;
      gap: 1rem;
      background: #ef444420;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .rejection-icon {
      font-size: 1.5rem;
    }
    .rejection-content strong {
      color: #ef4444;
      display: block;
      margin-bottom: 0.25rem;
    }
    .rejection-content p {
      color: #fca5a5;
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
    }
    .rejection-date {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .grades-table-container {
      overflow-x: auto;
      background: #1e293b;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .grades-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }
    .grades-table th, .grades-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #334155;
    }
    .grades-table th {
      background: #0f172a;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      position: sticky;
      top: 0;
    }
    .grades-table td {
      color: #f1f5f9;
      font-size: 0.875rem;
    }
    .sticky-col {
      position: sticky;
      left: 0;
      background: #1e293b;
      z-index: 1;
    }
    .sticky-col-2 {
      position: sticky;
      left: 80px;
      background: #1e293b;
      z-index: 1;
    }
    .grades-table th.sticky-col, .grades-table th.sticky-col-2 {
      background: #0f172a;
      z-index: 2;
    }
    .max-score {
      display: block;
      font-size: 0.65rem;
      font-weight: 400;
      color: #64748b;
    }
    .grade-col {
      text-align: center;
      min-width: 100px;
    }
    .grade-cell {
      text-align: center;
    }
    .grade-input {
      width: 70px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 0.5rem;
      color: #f1f5f9;
      font-size: 0.875rem;
      text-align: center;
    }
    .grade-input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .grade-input:disabled {
      background: #1e293b;
      color: #64748b;
    }
    .total-col {
      text-align: center;
      min-width: 80px;
    }
    .total-cell {
      text-align: center;
      font-weight: 600;
      color: #3b82f6;
    }
    .status-col {
      text-align: center;
      min-width: 100px;
    }
    .status-cell {
      text-align: center;
    }
    .grade-status {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .grade-status.approved {
      background: #22c55e20;
      color: #22c55e;
    }
    .grade-status.failed {
      background: #ef444420;
      color: #ef4444;
    }
    .no-students {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
    }
    .no-students .icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 1rem;
    }
    .grades-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .approved-notice {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #22c55e20;
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
    }
    .approved-notice .icon {
      font-size: 1.5rem;
      color: #22c55e;
    }
    .approved-notice p {
      color: #86efac;
      margin: 0;
      font-size: 0.875rem;
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
    .toast.success {
      background: #22c55e;
      color: white;
    }
    .toast.error {
      background: #ef4444;
      color: white;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class GradeDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  offeringId!: number;
  subject: { name: string; code: string } | null = null;
  classroom = '';
  
  structure: GradeStructure = { components: [], total_weight: 0 };
  students: Student[] = [];
  submission: { id: number; status: string } | null = null;
  rejection: { reason: string; date: Date } | null = null;
  
  activeTab = 'structure';
  loading = true;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.offeringId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.http.get<any>(`/api/v1/teacher/grades/${this.offeringId}/structure`).subscribe({
      next: (res) => {
        const data = res.data;
        this.subject = data.subject;
        this.classroom = data.classroom?.name || 'Sin asignar';
        this.structure.components = data.structure || [];
        this.students = data.students || [];
        this.submission = data.submission;
        this.rejection = data.rejection;
        
        if (this.structure.components.length === 0) {
          this.addComponent();
        }
        
        if (this.hasValidStructure()) {
          this.activeTab = 'grades';
        }
        
        this.loading = false;
      },
      error: () => {
        this.showMessage('Error al cargar los datos', 'error');
        this.loading = false;
      }
    });
  }

  addComponent() {
    const order = this.structure.components.length + 1;
    this.structure.components.push({
      name: '',
      max_score: 100,
      weight: 0,
      order
    });
  }

  removeComponent(index: number) {
    this.structure.components.splice(index, 1);
    this.structure.components.forEach((c, i) => c.order = i + 1);
  }

  getTotalWeight(): number {
    return this.structure.components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  }

  hasValidStructure(): boolean {
    return this.structure.components.length > 0 && 
           this.structure.components.every(c => c.id && c.name && c.max_score > 0) &&
           this.getTotalWeight() === 100;
  }

  isStructureLocked(): boolean {
    return !!this.submission && ['submitted', 'approved', 'published'].includes(this.submission.status);
  }

  isGradesLocked(): boolean {
    return !!this.submission && ['submitted', 'approved', 'published'].includes(this.submission.status);
  }

  saveStructure() {
    if (this.getTotalWeight() !== 100) return;
    
    this.saving = true;
    this.http.post<any>(`/api/v1/teacher/grades/${this.offeringId}/structure`, {
      components: this.structure.components
    }).subscribe({
      next: (res) => {
        this.structure.components = res.data.components;
        this.showMessage('Estructura guardada correctamente', 'success');
        this.saving = false;
        this.loadData();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al guardar', 'error');
        this.saving = false;
      }
    });
  }

  updateGrade(student: Student, componentId: number, value: number) {
    student.grades[componentId] = value;
  }

  calculateFinal(student: Student): number {
    let total = 0;
    for (const comp of this.structure.components) {
      if (comp.id && student.grades[comp.id] !== undefined) {
        const score = Number(student.grades[comp.id]) || 0;
        const maxScore = Number(comp.max_score) || 1;
        const weight = Number(comp.weight) || 0;
        const percentage = (score / maxScore) * weight;
        total += percentage;
      }
    }
    return total;
  }

  hasAllGrades(student: Student): boolean {
    return this.structure.components.every(c => 
      c.id && student.grades[c.id] !== undefined && student.grades[c.id] !== null
    );
  }

  canSubmit(): boolean {
    return this.students.every(s => this.hasAllGrades(s));
  }

  saveGrades() {
    this.saving = true;
    const grades = this.students.map(s => ({
      enrollment_id: s.enrollment_id,
      grades: s.grades
    }));

    this.http.post<any>(`/api/v1/teacher/grades/${this.offeringId}/save`, { grades }).subscribe({
      next: () => {
        this.showMessage('Notas guardadas como borrador', 'success');
        this.saving = false;
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al guardar', 'error');
        this.saving = false;
      }
    });
  }

  submitForReview() {
    if (!this.canSubmit()) {
      this.showMessage('Debe ingresar todas las notas antes de enviar', 'error');
      return;
    }

    if (!confirm('¿Está seguro de enviar las notas a revisión? No podrá modificarlas hasta que sean revisadas.')) {
      return;
    }

    this.saving = true;
    
    // Primero guardar las notas, luego enviar a revisión
    const grades = this.students.map(s => ({
      enrollment_id: s.enrollment_id,
      grades: s.grades
    }));

    this.http.post<any>(`/api/v1/teacher/grades/${this.offeringId}/save`, { grades }).subscribe({
      next: () => {
        // Ahora enviar a revisión
        this.http.post<any>(`/api/v1/teacher/grades/${this.offeringId}/submit`, {}).subscribe({
          next: () => {
            this.showMessage('Notas enviadas a revisión', 'success');
            this.saving = false;
            this.loadData();
          },
          error: (err) => {
            this.showMessage(err.error?.message || 'Error al enviar a revisión', 'error');
            this.saving = false;
          }
        });
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Error al guardar notas', 'error');
        this.saving = false;
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

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.message = '', 4000);
  }
}
