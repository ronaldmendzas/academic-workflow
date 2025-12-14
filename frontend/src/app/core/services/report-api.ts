import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_subjects: number;
  active_period: string;
  period_enrollments: number;
  pending_enrollments: number;
  approved_enrollments: number;
  rejected_enrollments: number;
}

export interface EnrollmentReport {
  by_period: Record<string, number>;
  by_status: Record<string, number>;
  total_enrollments: number;
}

export interface SubjectEnrollment {
  offering_id: number;
  subject: string;
  teacher: string;
  classroom: string;
  period: string;
  quota: number;
  enrolled: number;
  available: number;
  schedule: string;
}

export interface GradeSummary {
  subject: string;
  period: string;
  average: number;
  min: number;
  max: number;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
}

export interface TeacherWorkload {
  teacher_id: number;
  name: string;
  email: string;
  department: string;
  offerings: number;
  total_students: number;
}

@Injectable({ providedIn: 'root' })
export class ReportApi {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/reports';

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard`);
  }

  getEnrollmentsByPeriod(periodId?: number): Observable<ApiResponse<EnrollmentReport>> {
    let params = new HttpParams();
    if (periodId) params = params.set('period_id', periodId);
    return this.http.get<ApiResponse<EnrollmentReport>>(`${this.baseUrl}/enrollments`, { params });
  }

  getStudentsBySubject(subjectId?: number, periodId?: number): Observable<ApiResponse<SubjectEnrollment[]>> {
    let params = new HttpParams();
    if (subjectId) params = params.set('subject_id', subjectId);
    if (periodId) params = params.set('period_id', periodId);
    return this.http.get<ApiResponse<SubjectEnrollment[]>>(`${this.baseUrl}/students-by-subject`, { params });
  }

  getGradesSummary(periodId?: number, subjectId?: number): Observable<ApiResponse<GradeSummary[]>> {
    let params = new HttpParams();
    if (periodId) params = params.set('period_id', periodId);
    if (subjectId) params = params.set('subject_id', subjectId);
    return this.http.get<ApiResponse<GradeSummary[]>>(`${this.baseUrl}/grades`, { params });
  }

  getTeacherWorkload(periodId?: number): Observable<ApiResponse<TeacherWorkload[]>> {
    let params = new HttpParams();
    if (periodId) params = params.set('period_id', periodId);
    return this.http.get<ApiResponse<TeacherWorkload[]>>(`${this.baseUrl}/teacher-workload`, { params });
  }
}
