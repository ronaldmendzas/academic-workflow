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

  formatSchedule(schedule: any): string {
    if (!schedule) return '-';
    // Handle both array and single object format
    const items = Array.isArray(schedule) ? schedule : [schedule];
    if (!items.length) return '-';
    return items.map(s => {
      const day = (s.day || '').substring(0, 3).toUpperCase();
      const start = s.start || s.start_time || '';
      const end = s.end || s.end_time || '';
      return `${day} ${start}-${end}`;
    }).join(', ');
  }
}
