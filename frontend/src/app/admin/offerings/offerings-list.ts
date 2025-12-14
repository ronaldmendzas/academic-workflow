import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AcademicOffering, Subject, Teacher, Classroom, Schedule } from '../../core/services/api';

@Component({
  selector: 'app-offerings-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offerings-list.html',
  styleUrls: ['../shared/admin.css']
})
export class OfferingsList implements OnInit {
  offerings: AcademicOffering[] = [];
  subjects: Subject[] = [];
  teachers: Teacher[] = [];
  classrooms: Classroom[] = [];
  loading = true;
  showModal = false;
  editing = false;
  
  form: any = { subject_id: null, teacher_id: null, classroom_id: null, schedule: [], max_quota: 30, semester_year: '', status: 'active' };
  newSchedule: Schedule = { day: 'monday', start_time: '08:00', end_time: '10:00' };
  selectedId: number | null = null;
  error = '';
  success = '';

  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); this.loadRelated(); }

  load() {
    this.loading = true;
    this.api.getAcademicOfferings().subscribe({
      next: (res) => { this.offerings = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading offerings'; }
    });
  }

  loadRelated() {
    this.api.getSubjects().subscribe({ next: (res) => this.subjects = res.data || [] });
    this.api.getTeachers().subscribe({ next: (res) => this.teachers = res.data || [] });
    this.api.getClassrooms().subscribe({ next: (res) => this.classrooms = res.data || [] });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    const now = new Date();
    this.form = { subject_id: null, teacher_id: null, classroom_id: null, schedule: [], max_quota: 30, semester_year: `${now.getFullYear()}-${now.getMonth() < 6 ? 1 : 2}`, status: 'active' };
    this.newSchedule = { day: 'monday', start_time: '08:00', end_time: '10:00' };
    this.showModal = true;
  }

  openEdit(o: AcademicOffering) {
    this.editing = true;
    this.selectedId = o.id;
    this.form = { subject_id: o.subject_id, teacher_id: o.teacher_id, classroom_id: o.classroom_id, schedule: [...(o.schedule || [])], max_quota: o.max_quota, semester_year: o.semester_year, status: o.status };
    this.newSchedule = { day: 'monday', start_time: '08:00', end_time: '10:00' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  addSchedule() {
    if (this.newSchedule.day && this.newSchedule.start_time && this.newSchedule.end_time) {
      this.form.schedule.push({ ...this.newSchedule });
      this.newSchedule = { day: 'monday', start_time: '08:00', end_time: '10:00' };
    }
  }

  removeSchedule(i: number) { this.form.schedule.splice(i, 1); }

  save() {
    if (!this.form.schedule.length) { this.error = 'At least one schedule is required'; return; }
    const action = this.editing && this.selectedId
      ? this.api.updateAcademicOffering(this.selectedId, this.form)
      : this.api.createAcademicOffering(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Offering updated' : 'Offering created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving offering'; }
    });
  }

  delete(o: AcademicOffering) {
    if (confirm('Delete this offering?')) {
      this.api.deleteAcademicOffering(o.id).subscribe({
        next: () => { this.success = 'Offering deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting offering'; }
      });
    }
  }

  formatSchedule(schedule: Schedule[]): string {
    if (!schedule || !schedule.length) return '-';
    return schedule.map(s => `${s.day.substring(0, 3).toUpperCase()} ${s.start_time}-${s.end_time}`).join(', ');
  }
}
