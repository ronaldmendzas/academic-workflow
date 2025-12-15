import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeacherApiService } from '../../core/services/teacher-api';

interface StudentByCourse {
  offering_id: number;
  subject_code: string;
  subject_name: string;
  students: {
    enrollment_id: number;
    student_id: number;
    student_code: string;
    student_name: string;
    enrolled_at: string;
  }[];
}

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-students.html',
  styleUrls: ['./all-students.css']
})
export class AllStudents implements OnInit {
  courseStudents: StudentByCourse[] = [];
  loading = true;
  error = '';
  totalStudents = 0;

  constructor(private api: TeacherApiService) {}

  ngOnInit() {
    this.loadAllStudents();
  }

  loadAllStudents() {
    this.loading = true;
    this.api.getMyOfferings().subscribe({
      next: (res) => {
        const offerings = res.data || [];
        this.loadStudentsForOfferings(offerings);
      },
      error: () => {
        this.loading = false;
        this.error = 'Error loading courses';
      }
    });
  }

  loadStudentsForOfferings(offerings: any[]) {
    if (!offerings.length) {
      this.loading = false;
      return;
    }

    let completed = 0;
    this.courseStudents = [];
    this.totalStudents = 0;

    offerings.forEach(offering => {
      this.api.getOfferingStudents(offering.id).subscribe({
        next: (res) => {
          const students = res.data?.students || [];
          if (students.length > 0) {
            this.courseStudents.push({
              offering_id: offering.id,
              subject_code: offering.subject?.code || '',
              subject_name: offering.subject?.name || '',
              students: students
            });
            this.totalStudents += students.length;
          }
          completed++;
          if (completed === offerings.length) {
            this.loading = false;
            // Sort by subject code
            this.courseStudents.sort((a, b) => a.subject_code.localeCompare(b.subject_code));
          }
        },
        error: () => {
          completed++;
          if (completed === offerings.length) {
            this.loading = false;
          }
        }
      });
    });
  }
}
