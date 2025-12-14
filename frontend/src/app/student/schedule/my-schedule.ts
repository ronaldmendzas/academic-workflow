import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentApiService, ScheduleSlot } from '../../core/services/student-api';

interface DaySchedule {
  day: string;
  slots: ScheduleSlot[];
}

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-schedule.html',
  styleUrls: ['./my-schedule.css']
})
export class MySchedule implements OnInit {
  schedule: ScheduleSlot[] = [];
  weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  };
  loading = true;
  error = '';

  constructor(private api: StudentApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getMySchedule().subscribe({
      next: (res) => { this.schedule = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading schedule'; }
    });
  }

  getSlotsForDay(day: string): ScheduleSlot[] {
    return this.schedule
      .filter(s => s.day.toLowerCase() === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  hasSchedule(): boolean {
    return this.schedule.length > 0;
  }
}
