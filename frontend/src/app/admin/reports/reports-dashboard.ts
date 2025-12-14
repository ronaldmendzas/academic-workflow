import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ReportApi, 
  DashboardStats, 
  SubjectEnrollment, 
  GradeSummary, 
  TeacherWorkload 
} from '../../core/services/report-api';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-dashboard.html',
  styleUrl: './reports-dashboard.css'
})
export class ReportsDashboard implements OnInit {
  private reportApi = inject(ReportApi);

  stats = signal<DashboardStats | null>(null);
  subjectEnrollments = signal<SubjectEnrollment[]>([]);
  gradesSummary = signal<GradeSummary[]>([]);
  teacherWorkload = signal<TeacherWorkload[]>([]);

  activeTab = signal<'overview' | 'subjects' | 'grades' | 'teachers'>('overview');
  loading = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  setTab(tab: 'overview' | 'subjects' | 'grades' | 'teachers'): void {
    this.activeTab.set(tab);
    this.loadTabData(tab);
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.reportApi.getDashboardStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadTabData(tab: string): void {
    this.loading.set(true);
    
    switch (tab) {
      case 'subjects':
        this.reportApi.getStudentsBySubject().subscribe({
          next: (res) => {
            this.subjectEnrollments.set(res.data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
        break;
      
      case 'grades':
        this.reportApi.getGradesSummary().subscribe({
          next: (res) => {
            this.gradesSummary.set(res.data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
        break;
      
      case 'teachers':
        this.reportApi.getTeacherWorkload().subscribe({
          next: (res) => {
            this.teacherWorkload.set(res.data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
        break;
      
      default:
        this.loadDashboard();
    }
  }

  getOccupancyClass(enrolled: number, quota: number): string {
    const rate = (enrolled / quota) * 100;
    if (rate >= 90) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  }

  getPassRateClass(rate: number): string {
    if (rate >= 70) return 'good';
    if (rate >= 50) return 'warning';
    return 'danger';
  }
}
