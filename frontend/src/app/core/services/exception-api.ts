import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExceptionRequest {
  id: number;
  student_id: number;
  type: 'extra_subject' | 'skip_prerequisite' | 'schedule_conflict' | 'quota_override';
  reason: string;
  offering_id?: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: number;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  student?: {
    id: number;
    code: string;
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
  reviewer?: {
    id: number;
    username: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ExceptionApiService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<ExceptionRequest[]>> {
    return this.http.get<ApiResponse<ExceptionRequest[]>>('/api/v1/exceptions');
  }

  getPending(): Observable<ApiResponse<ExceptionRequest[]>> {
    return this.http.get<ApiResponse<ExceptionRequest[]>>('/api/v1/exceptions/pending');
  }

  getMyRequests(): Observable<ApiResponse<ExceptionRequest[]>> {
    return this.http.get<ApiResponse<ExceptionRequest[]>>('/api/v1/student/exceptions');
  }

  create(data: { type: string; reason: string; offering_id?: number }): Observable<ApiResponse<ExceptionRequest>> {
    return this.http.post<ApiResponse<ExceptionRequest>>('/api/v1/student/exceptions', data);
  }

  approve(id: number, adminNotes?: string): Observable<ApiResponse<ExceptionRequest>> {
    return this.http.post<ApiResponse<ExceptionRequest>>(`/api/v1/exceptions/${id}/approve`, { admin_notes: adminNotes });
  }

  reject(id: number, adminNotes: string): Observable<ApiResponse<ExceptionRequest>> {
    return this.http.post<ApiResponse<ExceptionRequest>>(`/api/v1/exceptions/${id}/reject`, { admin_notes: adminNotes });
  }
}
