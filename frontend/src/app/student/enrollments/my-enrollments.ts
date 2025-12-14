import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentApiService, StudentEnrollment } from '../../core/services/student-api';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-enrollments.html',
  styleUrls: ['./my-enrollments.css']
})
export class MyEnrollments implements OnInit {
  enrollments: StudentEnrollment[] = [];
  loading = true;
  unenrolling: number | null = null;
  success = '';
  error = '';

  constructor(private api: StudentApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getMyEnrollments().subscribe({
      next: (res) => { this.enrollments = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading enrollments'; }
    });
  }

  unenroll(enrollment: StudentEnrollment) {
    if (this.unenrolling) return;

    if (!confirm('Are you sure you want to unenroll from this subject?')) return;

    this.unenrolling = enrollment.id;
    this.api.unenroll(enrollment.id).subscribe({
      next: () => {
        this.success = 'Successfully unenrolled';
        this.unenrolling = null;
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error unenrolling';
        this.unenrolling = null;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  formatSchedule(schedule: any[]): string {
    if (!schedule?.length) return '-';
    return schedule.map(s => `${s.day.substring(0, 3).toUpperCase()} ${s.start_time}-${s.end_time}`).join(', ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}
