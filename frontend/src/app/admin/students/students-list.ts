import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Student } from '../../core/services/api';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students-list.html',
  styleUrls: ['../shared/admin.css']
})
export class StudentsList implements OnInit {
  students: Student[] = [];
  loading = true;
  showModal = false;
  editing = false;
  
  form: any = {
    code: '',
    career: '',
    semester: 1,
    max_subjects: 6,
    academic_status: 'active',
    email: '',
    username: '',
    password: ''
  };
  
  selectedId: number | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getStudents().subscribe({
      next: (res) => { this.students = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading students'; }
    });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    this.form = { code: '', career: '', semester: 1, max_subjects: 6, academic_status: 'active', email: '', username: '', password: '' };
    this.showModal = true;
  }

  openEdit(s: Student) {
    this.editing = true;
    this.selectedId = s.id;
    this.form = { code: s.code, career: s.career, semester: s.semester, max_subjects: s.max_subjects, academic_status: s.academic_status, email: s.user?.email || '', username: s.user?.username || '', password: '' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  save() {
    const action = this.editing && this.selectedId 
      ? this.api.updateStudent(this.selectedId, this.form)
      : this.api.createStudent(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Student updated' : 'Student created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving student'; }
    });
  }

  delete(s: Student) {
    if (confirm(`Delete student ${s.code}?`)) {
      this.api.deleteStudent(s.id).subscribe({
        next: () => { this.success = 'Student deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting student'; }
      });
    }
  }
}
