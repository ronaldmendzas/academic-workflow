import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats = {
    students: 0,
    teachers: 0,
    subjects: 0,
    classrooms: 0
  };
  loading = true;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.redirectByRole();
  }

  redirectByRole() {
    const role = this.auth.currentUserValue?.role;
    
    if (role === 'student') {
      this.router.navigate(['/student/dashboard']);
      return;
    }

    if (role === 'teacher') {
      this.loading = false;
      return;
    }

    this.loadStats();
  }

  loadStats() {
    Promise.all([
      this.api.getStudents().toPromise(),
      this.api.getTeachers().toPromise(),
      this.api.getSubjects().toPromise(),
      this.api.getClassrooms().toPromise()
    ]).then(([students, teachers, subjects, classrooms]) => {
      this.stats.students = students?.data?.length || 0;
      this.stats.teachers = teachers?.data?.length || 0;
      this.stats.subjects = subjects?.data?.length || 0;
      this.stats.classrooms = classrooms?.data?.length || 0;
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }
}
