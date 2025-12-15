import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './api';

export interface OfferingWithEligibility {
  id: number;
  subject: any;
  teacher: any;
  classroom: any;
  schedule: any[];
  max_quota: number;
  enrolled_count: number;
  available_quota: number;
  can_enroll: boolean;
  restrictions: string[];
}

export interface StudentEnrollment {
  id: number;
  student_id: number;
  academic_offering_id: number;
  status: string;
  enrolled_at: string;
  academic_offering: any;  // Laravel returns snake_case
}

export interface ScheduleSlot {
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  subject_code: string;
  classroom: string;
  teacher: string;
}

export interface OfferingsResponse {
  offerings: OfferingWithEligibility[];
  enrollment_period_open: boolean;
  enrollment_finalized: boolean;
  enrollment_finalized_at: string | null;
  period: {
    name: string;
    start_date: string;
    end_date: string;
    semester_year: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class StudentApiService {
  private baseUrl = '/api/v1/student';

  constructor(private http: HttpClient) {}

  getOfferings(): Observable<ApiResponse<OfferingsResponse>> {
    return this.http.get<ApiResponse<OfferingsResponse>>(`${this.baseUrl}/offerings`);
  }

  getMyEnrollments(): Observable<ApiResponse<StudentEnrollment[]>> {
    return this.http.get<ApiResponse<StudentEnrollment[]>>(`${this.baseUrl}/enrollments`);
  }

  getMySchedule(): Observable<ApiResponse<ScheduleSlot[]>> {
    return this.http.get<ApiResponse<ScheduleSlot[]>>(`${this.baseUrl}/schedule`);
  }

  enroll(offeringId: number): Observable<ApiResponse<StudentEnrollment>> {
    return this.http.post<ApiResponse<StudentEnrollment>>(`${this.baseUrl}/enroll/${offeringId}`, {});
  }

  unenroll(enrollmentId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/unenroll/${enrollmentId}`);
  }

  checkEligibility(offeringId: number): Observable<ApiResponse<{ eligible: boolean; reasons: string[] }>> {
    return this.http.get<ApiResponse<{ eligible: boolean; reasons: string[] }>>(`${this.baseUrl}/check-eligibility/${offeringId}`);
  }

  finalizeEnrollment(): Observable<ApiResponse<{ finalized: boolean; finalized_at: string }>> {
    return this.http.post<ApiResponse<{ finalized: boolean; finalized_at: string }>>(`${this.baseUrl}/finalize-enrollment`, {});
  }

  getEnrollmentStatus(): Observable<ApiResponse<{ enrollment_finalized: boolean; enrollment_finalized_at: string | null }>> {
    return this.http.get<ApiResponse<{ enrollment_finalized: boolean; enrollment_finalized_at: string | null }>>(`${this.baseUrl}/enrollment-status`);
  }
}
