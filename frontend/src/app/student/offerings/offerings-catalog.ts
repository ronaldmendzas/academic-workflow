import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentApiService, OfferingWithEligibility } from '../../core/services/student-api';

@Component({
  selector: 'app-offerings-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offerings-catalog.html',
  styleUrls: ['./offerings-catalog.css']
})
export class OfferingsCatalog implements OnInit {
  offerings: OfferingWithEligibility[] = [];
  loading = true;
  enrolling: number | null = null;
  success = '';
  error = '';

  constructor(private api: StudentApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getOfferings().subscribe({
      next: (res) => { this.offerings = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading offerings'; }
    });
  }

  enroll(offering: OfferingWithEligibility) {
    if (!offering.can_enroll || this.enrolling) return;

    this.enrolling = offering.id;
    this.api.enroll(offering.id).subscribe({
      next: () => {
        this.success = `Enrolled in ${offering.subject.name}`;
        this.enrolling = null;
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error enrolling';
        this.enrolling = null;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  formatSchedule(schedule: any[]): string {
    if (!schedule?.length) return '-';
    return schedule.map(s => `${s.day.substring(0, 3).toUpperCase()} ${s.start_time}-${s.end_time}`).join(', ');
  }
}
