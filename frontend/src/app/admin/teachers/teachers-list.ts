import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Teacher } from '../../core/services/api';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers-list.html',
  styleUrls: ['../shared/admin.css']
})
export class TeachersList implements OnInit {
  teachers: Teacher[] = [];
  loading = true;
  showModal = false;
  editing = false;

  departments = [
    'Ingeniería de Sistemas',
    'Ingeniería Industrial',
    'Ingeniería Civil',
    'Ingeniería Electrónica',
    'Matemáticas',
    'Física',
    'Química',
    'Biología',
    'Economía',
    'Administración de Empresas',
    'Contaduría Pública',
    'Derecho',
    'Medicina',
    'Ciencias de la Comunicación'
  ];
  
  form: any = { code: '', department: '', max_students_total: 100, status: 'active', email: '', username: '', password: '' };
  selectedId: number | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getTeachers().subscribe({
      next: (res) => { this.teachers = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading teachers'; }
    });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    this.form = { code: '', department: '', max_students_total: 100, status: 'active', email: '', username: '', password: '' };
    this.showModal = true;
  }

  openEdit(t: Teacher) {
    this.editing = true;
    this.selectedId = t.id;
    this.form = { code: t.code, department: t.department, max_students_total: t.max_students_total, status: t.status, email: t.user?.email || '', username: t.user?.username || '', password: '' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  save() {
    const action = this.editing && this.selectedId 
      ? this.api.updateTeacher(this.selectedId, this.form)
      : this.api.createTeacher(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Teacher updated' : 'Teacher created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving teacher'; }
    });
  }

  delete(t: Teacher) {
    if (confirm(`Delete teacher ${t.code}?`)) {
      this.api.deleteTeacher(t.id).subscribe({
        next: () => { this.success = 'Teacher deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting teacher'; }
      });
    }
  }
}
