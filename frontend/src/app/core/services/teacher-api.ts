import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './api';

export interface TeacherOffering {
  id: number;
  subject: any;
  classroom: any;
  enrollment_period: any;
  schedule: any[];
  max_quota: number;
  enrollments_count: number;
  status: string;
}

export interface StudentWithGrades {
  enrollment_id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  enrolled_at: string;
  grades: {
    partial_1: number | null;
    partial_2: number | null;
    partial_3: number | null;
    final: number | null;
    recovery: number | null;
  };
  average: number | null;
}

export interface TeacherDashboardStats {
  total_offerings: number;
  total_students: number;
  pending_grades: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherApiService {
  private baseUrl = '/api/v1/teacher';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<ApiResponse<TeacherDashboardStats>> {
    return this.http.get<ApiResponse<TeacherDashboardStats>>(`${this.baseUrl}/dashboard`);
  }

  getMyOfferings(): Observable<ApiResponse<TeacherOffering[]>> {
    return this.http.get<ApiResponse<TeacherOffering[]>>(`${this.baseUrl}/offerings`);
  }

  getOfferingStudents(offeringId: number): Observable<ApiResponse<{ offering: any; students: StudentWithGrades[] }>> {
    return this.http.get<ApiResponse<{ offering: any; students: StudentWithGrades[] }>>(`${this.baseUrl}/offerings/${offeringId}/students`);
  }

  getStudentGrades(enrollmentId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/enrollments/${enrollmentId}/grades`);
  }

  saveGrade(enrollmentId: number, data: { grade_type: string; value: number; comments?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/enrollments/${enrollmentId}/grades`, data);
  }
}
