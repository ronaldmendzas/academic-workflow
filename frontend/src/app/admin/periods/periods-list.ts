import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, EnrollmentPeriod } from '../../core/services/api';

@Component({
  selector: 'app-periods-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periods-list.html',
  styleUrls: ['../shared/admin.css']
})
export class PeriodsList implements OnInit {
  periods: EnrollmentPeriod[] = [];
  loading = true;
  showModal = false;
  editing = false;
  
  form: any = { name: '', start_date: '', end_date: '', semester_year: '', status: 'planned' };
  selectedId: number | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getEnrollmentPeriods().subscribe({
      next: (res) => { this.periods = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading periods'; }
    });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    const now = new Date();
    this.form = { name: '', start_date: '', end_date: '', semester_year: `${now.getFullYear()}-${now.getMonth() < 6 ? 1 : 2}`, status: 'planned' };
    this.showModal = true;
  }

  openEdit(p: EnrollmentPeriod) {
    this.editing = true;
    this.selectedId = p.id;
    this.form = { 
      name: p.name, 
      start_date: p.start_date ? p.start_date.split('T')[0] : '', 
      end_date: p.end_date ? p.end_date.split('T')[0] : '', 
      semester_year: p.semester_year, 
      status: p.status 
    };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  save() {
    const action = this.editing && this.selectedId
      ? this.api.updateEnrollmentPeriod(this.selectedId, this.form)
      : this.api.createEnrollmentPeriod(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Period updated' : 'Period created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving period'; }
    });
  }

  delete(p: EnrollmentPeriod) {
    if (confirm(`Delete period "${p.name}"?`)) {
      this.api.deleteEnrollmentPeriod(p.id).subscribe({
        next: () => { this.success = 'Period deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting period'; }
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'badge-success';
      case 'planned': return 'badge-warning';
      case 'closed': return 'badge-muted';
      default: return 'badge-muted';
    }
  }
}
