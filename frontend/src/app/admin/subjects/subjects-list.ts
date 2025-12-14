import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Subject } from '../../core/services/api';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects-list.html',
  styleUrls: ['../shared/admin.css']
})
export class SubjectsList implements OnInit {
  subjects: Subject[] = [];
  allSubjects: Subject[] = [];
  loading = true;
  showModal = false;
  editing = false;
  
  form: any = { code: '', name: '', semester: 1, type: 'theoretical', requires_lab: false, prerequisites: [] as number[] };
  selectedId: number | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getSubjects().subscribe({
      next: (res) => { this.subjects = res.data || []; this.allSubjects = [...this.subjects]; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading subjects'; }
    });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    this.form = { code: '', name: '', semester: 1, type: 'mandatory', requires_lab: false, prerequisites: [] };
    this.showModal = true;
  }

  openEdit(s: Subject) {
    this.editing = true;
    this.selectedId = s.id;
    this.form = { code: s.code, name: s.name, semester: s.semester, type: s.type, requires_lab: s.requires_lab, prerequisites: s.prerequisites?.map((p: any) => p.id) || [] };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  togglePrerequisite(id: number) {
    const idx = this.form.prerequisites.indexOf(id);
    if (idx === -1) { this.form.prerequisites.push(id); } else { this.form.prerequisites.splice(idx, 1); }
  }

  isPrerequisite(id: number): boolean { return this.form.prerequisites.includes(id); }

  getAvailablePrerequisites(): Subject[] { return this.allSubjects.filter(s => s.id !== this.selectedId); }

  save() {
    const action = this.editing && this.selectedId
      ? this.api.updateSubject(this.selectedId, this.form)
      : this.api.createSubject(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Subject updated' : 'Subject created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving subject'; }
    });
  }

  delete(s: Subject) {
    if (confirm(`Delete subject ${s.name}?`)) {
      this.api.deleteSubject(s.id).subscribe({
        next: () => { this.success = 'Subject deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting subject'; }
      });
    }
  }
}
