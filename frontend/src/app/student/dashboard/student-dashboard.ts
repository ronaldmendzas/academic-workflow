import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentApiService } from '../../core/services/student-api';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {
  stats = { enrolled: 0, available: 0, schedule: 0 };
  loading = true;

  constructor(private api: StudentApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    Promise.all([
      this.api.getMyEnrollments().toPromise(),
      this.api.getOfferings().toPromise(),
      this.api.getMySchedule().toPromise()
    ]).then(([enrollments, offerings, schedule]) => {
      this.stats.enrolled = enrollments?.data?.length || 0;
      this.stats.available = offerings?.data?.filter((o: any) => o.can_enroll).length || 0;
      this.stats.schedule = schedule?.data?.length || 0;
      this.loading = false;
    }).catch(() => this.loading = false);
  }
}
