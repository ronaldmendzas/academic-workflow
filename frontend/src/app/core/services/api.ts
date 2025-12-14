import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  email: string;
  status: string;
}

export interface Student {
  id: number;
  user_id: number;
  code: string;
  career: string;
  semester: number;
  max_subjects: number;
  exception_requests_used: number;
  academic_status: string;
  user?: User;
}

export interface Teacher {
  id: number;
  user_id: number;
  code: string;
  department: string;
  max_students_total: number;
  status: string;
  user?: User;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  semester: number;
  type: string;
  requires_lab: boolean;
  prerequisites?: Subject[];
}

export interface Classroom {
  id: number;
  code: string;
  building: string;
  floor: number;
  number: string;
  type: string;
  capacity: number;
  pcs: number;
  equipment: string[];
  status: string;
}

export interface Schedule {
  day: string;
  start_time: string;
  end_time: string;
}

export interface AcademicOffering {
  id: number;
  subject_id: number;
  teacher_id: number;
  classroom_id: number;
  schedule: Schedule[];
  max_quota: number;
  semester_year: string;
  status: string;
  subject?: Subject;
  teacher?: Teacher;
  classroom?: Classroom;
  enrollments_count?: number;
}

export interface EnrollmentPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  semester_year: string;
  status: string;
  slots_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // Students
  getStudents(): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(`${this.baseUrl}/students`);
  }

  getStudent(id: number): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.baseUrl}/students/${id}`);
  }

  createStudent(data: any): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(`${this.baseUrl}/students`, data);
  }

  updateStudent(id: number, data: any): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.baseUrl}/students/${id}`, data);
  }

  deleteStudent(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/students/${id}`);
  }

  // Teachers
  getTeachers(): Observable<ApiResponse<Teacher[]>> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/teachers`);
  }

  getActiveTeachers(): Observable<ApiResponse<Teacher[]>> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/teachers/active`);
  }

  getTeacher(id: number): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`${this.baseUrl}/teachers/${id}`);
  }

  createTeacher(data: any): Observable<ApiResponse<Teacher>> {
    return this.http.post<ApiResponse<Teacher>>(`${this.baseUrl}/teachers`, data);
  }

  updateTeacher(id: number, data: any): Observable<ApiResponse<Teacher>> {
    return this.http.put<ApiResponse<Teacher>>(`${this.baseUrl}/teachers/${id}`, data);
  }

  deleteTeacher(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/teachers/${id}`);
  }

  // Subjects
  getSubjects(): Observable<ApiResponse<Subject[]>> {
    return this.http.get<ApiResponse<Subject[]>>(`${this.baseUrl}/subjects`);
  }

  getSubject(id: number): Observable<ApiResponse<Subject>> {
    return this.http.get<ApiResponse<Subject>>(`${this.baseUrl}/subjects/${id}`);
  }

  createSubject(data: any): Observable<ApiResponse<Subject>> {
    return this.http.post<ApiResponse<Subject>>(`${this.baseUrl}/subjects`, data);
  }

  updateSubject(id: number, data: any): Observable<ApiResponse<Subject>> {
    return this.http.put<ApiResponse<Subject>>(`${this.baseUrl}/subjects/${id}`, data);
  }

  deleteSubject(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/subjects/${id}`);
  }

  // Classrooms
  getClassrooms(): Observable<ApiResponse<Classroom[]>> {
    return this.http.get<ApiResponse<Classroom[]>>(`${this.baseUrl}/classrooms`);
  }

  getAvailableClassrooms(): Observable<ApiResponse<Classroom[]>> {
    return this.http.get<ApiResponse<Classroom[]>>(`${this.baseUrl}/classrooms/available`);
  }

  getClassroom(id: number): Observable<ApiResponse<Classroom>> {
    return this.http.get<ApiResponse<Classroom>>(`${this.baseUrl}/classrooms/${id}`);
  }

  createClassroom(data: any): Observable<ApiResponse<Classroom>> {
    return this.http.post<ApiResponse<Classroom>>(`${this.baseUrl}/classrooms`, data);
  }

  updateClassroom(id: number, data: any): Observable<ApiResponse<Classroom>> {
    return this.http.put<ApiResponse<Classroom>>(`${this.baseUrl}/classrooms/${id}`, data);
  }

  deleteClassroom(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/classrooms/${id}`);
  }

  // Academic Offerings
  getAcademicOfferings(): Observable<ApiResponse<AcademicOffering[]>> {
    return this.http.get<ApiResponse<AcademicOffering[]>>(`${this.baseUrl}/academic-offerings`);
  }

  getAcademicOfferingsBySemester(semester: string): Observable<ApiResponse<AcademicOffering[]>> {
    return this.http.get<ApiResponse<AcademicOffering[]>>(`${this.baseUrl}/academic-offerings/semester/${semester}`);
  }

  getAcademicOffering(id: number): Observable<ApiResponse<AcademicOffering>> {
    return this.http.get<ApiResponse<AcademicOffering>>(`${this.baseUrl}/academic-offerings/${id}`);
  }

  createAcademicOffering(data: any): Observable<ApiResponse<AcademicOffering>> {
    return this.http.post<ApiResponse<AcademicOffering>>(`${this.baseUrl}/academic-offerings`, data);
  }

  updateAcademicOffering(id: number, data: any): Observable<ApiResponse<AcademicOffering>> {
    return this.http.put<ApiResponse<AcademicOffering>>(`${this.baseUrl}/academic-offerings/${id}`, data);
  }

  deleteAcademicOffering(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/academic-offerings/${id}`);
  }

  // Enrollment Periods
  getEnrollmentPeriods(): Observable<ApiResponse<EnrollmentPeriod[]>> {
    return this.http.get<ApiResponse<EnrollmentPeriod[]>>(`${this.baseUrl}/enrollment-periods`);
  }

  getCurrentEnrollmentPeriod(): Observable<ApiResponse<EnrollmentPeriod>> {
    return this.http.get<ApiResponse<EnrollmentPeriod>>(`${this.baseUrl}/enrollment-periods/current`);
  }

  getEnrollmentPeriod(id: number): Observable<ApiResponse<EnrollmentPeriod>> {
    return this.http.get<ApiResponse<EnrollmentPeriod>>(`${this.baseUrl}/enrollment-periods/${id}`);
  }

  createEnrollmentPeriod(data: any): Observable<ApiResponse<EnrollmentPeriod>> {
    return this.http.post<ApiResponse<EnrollmentPeriod>>(`${this.baseUrl}/enrollment-periods`, data);
  }

  updateEnrollmentPeriod(id: number, data: any): Observable<ApiResponse<EnrollmentPeriod>> {
    return this.http.put<ApiResponse<EnrollmentPeriod>>(`${this.baseUrl}/enrollment-periods/${id}`, data);
  }

  deleteEnrollmentPeriod(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/enrollment-periods/${id}`);
  }

  generateEnrollmentSlots(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/enrollment-periods/${id}/generate-slots`, data);
  }

  activateEnrollmentPeriod(id: number): Observable<ApiResponse<EnrollmentPeriod>> {
    return this.http.post<ApiResponse<EnrollmentPeriod>>(`${this.baseUrl}/enrollment-periods/${id}/activate`, {});
  }
}
