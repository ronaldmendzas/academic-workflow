import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Classroom } from '../../core/services/api';

@Component({
  selector: 'app-classrooms-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classrooms-list.html',
  styleUrls: ['../shared/admin.css']
})
export class ClassroomsList implements OnInit {
  classrooms: Classroom[] = [];
  loading = true;
  showModal = false;
  editing = false;
  
  form: any = { code: '', building: '', floor: 1, number: '', type: 'classroom', capacity: 30, pcs: 0, equipment: [], status: 'available' };
  selectedId: number | null = null;
  error = '';
  success = '';
  equipmentInput = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getClassrooms().subscribe({
      next: (res) => { this.classrooms = res.data || []; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Error loading classrooms'; }
    });
  }

  openCreate() {
    this.editing = false;
    this.selectedId = null;
    this.form = { code: '', building: '', floor: 1, number: '', type: 'classroom', capacity: 30, pcs: 0, equipment: [], status: 'available' };
    this.equipmentInput = '';
    this.showModal = true;
  }

  openEdit(c: Classroom) {
    this.editing = true;
    this.selectedId = c.id;
    this.form = { code: c.code, building: c.building, floor: c.floor, number: c.number, type: c.type, capacity: c.capacity, pcs: c.pcs, equipment: c.equipment || [], status: c.status };
    this.equipmentInput = (c.equipment || []).join(', ');
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.error = ''; }

  updateEquipment() {
    this.form.equipment = this.equipmentInput.split(',').map((e: string) => e.trim()).filter((e: string) => e);
  }

  save() {
    this.updateEquipment();
    const action = this.editing && this.selectedId
      ? this.api.updateClassroom(this.selectedId, this.form)
      : this.api.createClassroom(this.form);
    action.subscribe({
      next: () => { this.success = this.editing ? 'Classroom updated' : 'Classroom created'; this.closeModal(); this.load(); setTimeout(() => this.success = '', 3000); },
      error: (err) => { this.error = err.error?.message || 'Error saving classroom'; }
    });
  }

  delete(c: Classroom) {
    if (confirm(`Delete classroom ${c.code}?`)) {
      this.api.deleteClassroom(c.id).subscribe({
        next: () => { this.success = 'Classroom deleted'; this.load(); setTimeout(() => this.success = '', 3000); },
        error: () => { this.error = 'Error deleting classroom'; }
      });
    }
  }

  getTypeLabel(type: string): string {
    const labels: any = { classroom: 'Classroom', laboratory: 'Laboratory', auditorium: 'Auditorium' };
    return labels[type] || type;
  }
}
