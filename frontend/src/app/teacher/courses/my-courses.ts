import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeacherApiService, TeacherOffering } from '../../core/services/teacher-api';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.css']
})
export class MyCourses implements OnInit {
  offerings: TeacherOffering[] = [];
  loading = true;
  error = '';

  constructor(private api: TeacherApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getMyOfferings().subscribe({
      next: (res) => { this.offerings = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading courses'; }
    });
  }

  formatSchedule(schedule: any[]): string {
    if (!schedule?.length) return '-';
    return schedule.map(s => `${s.day.substring(0, 3).toUpperCase()} ${s.start_time}-${s.end_time}`).join(', ');
  }
}
