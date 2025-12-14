import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherApiService, StudentWithGrades } from '../../core/services/teacher-api';

@Component({
  selector: 'app-course-students',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './course-students.html',
  styleUrls: ['./course-students.css']
})
export class CourseStudents implements OnInit {
  offeringId = 0;
  offering: any = null;
  students: StudentWithGrades[] = [];
  loading = true;
  saving = false;
  error = '';
  success = '';

  gradeTypes = ['partial_1', 'partial_2', 'partial_3', 'final', 'recovery'];
  gradeLabels: Record<string, string> = {
    partial_1: 'P1',
    partial_2: 'P2',
    partial_3: 'P3',
    final: 'Final',
    recovery: 'Rec'
  };

  editingGrade: { enrollmentId: number; gradeType: string; value: number } | null = null;

  constructor(private api: TeacherApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.offeringId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getOfferingStudents(this.offeringId).subscribe({
      next: (res) => {
        this.offering = res.data.offering;
        this.students = res.data.students || [];
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = 'Error loading students'; }
    });
  }

  startEdit(student: StudentWithGrades, gradeType: string) {
    const currentValue = student.grades[gradeType as keyof typeof student.grades];
    this.editingGrade = {
      enrollmentId: student.enrollment_id,
      gradeType,
      value: currentValue ?? 0
    };
  }

  cancelEdit() {
    this.editingGrade = null;
  }

  saveGrade() {
    if (!this.editingGrade) return;

    this.saving = true;
    this.api.saveGrade(this.editingGrade.enrollmentId, {
      grade_type: this.editingGrade.gradeType,
      value: this.editingGrade.value
    }).subscribe({
      next: () => {
        this.success = 'Grade saved';
        this.editingGrade = null;
        this.saving = false;
        this.load();
        setTimeout(() => this.success = '', 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error saving grade';
        this.saving = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  isEditing(enrollmentId: number, gradeType: string): boolean {
    return this.editingGrade?.enrollmentId === enrollmentId && 
           this.editingGrade?.gradeType === gradeType;
  }

  getGradeValue(grades: any, gradeType: string): number | null {
    return grades[gradeType] ?? null;
  }

  getGradeClass(value: number | null): string {
    if (value === null) return 'grade-empty';
    if (value >= 51) return 'grade-pass';
    return 'grade-fail';
  }
}
