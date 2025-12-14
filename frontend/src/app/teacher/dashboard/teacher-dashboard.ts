import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeacherApiService, TeacherDashboardStats } from '../../core/services/teacher-api';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teacher-dashboard.html',
  styleUrls: ['./teacher-dashboard.css']
})
export class TeacherDashboard implements OnInit {
  stats: TeacherDashboardStats = { total_offerings: 0, total_students: 0, pending_grades: 0 };
  loading = true;

  constructor(private api: TeacherApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getDashboardStats().subscribe({
      next: (res) => { this.stats = res.data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
