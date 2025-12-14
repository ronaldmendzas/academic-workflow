import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditApi, AuditLog } from '../../core/services/audit-api';

@Component({
  selector: 'app-audit-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-viewer.html',
  styleUrl: './audit-viewer.css'
})
export class AuditViewer implements OnInit {
  private auditApi = inject(AuditApi);

  logs = signal<AuditLog[]>([]);
  actions = signal<string[]>([]);
  entityTypes = signal<string[]>([]);
  loading = signal(false);

  filters = signal({
    action: '',
    entity_type: '',
    date_from: '',
    date_to: ''
  });

  pagination = signal({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  selectedLog = signal<AuditLog | null>(null);

  ngOnInit(): void {
    this.loadFilters();
    this.loadLogs();
  }

  private loadFilters(): void {
    this.auditApi.getActions().subscribe({
      next: (res) => this.actions.set(res.data)
    });
    this.auditApi.getEntityTypes().subscribe({
      next: (res) => this.entityTypes.set(res.data)
    });
  }

  loadLogs(page = 1): void {
    this.loading.set(true);
    const f = this.filters();
    
    this.auditApi.getLogs({
      action: f.action || undefined,
      entity_type: f.entity_type || undefined,
      date_from: f.date_from || undefined,
      date_to: f.date_to || undefined,
      page,
      per_page: 20
    }).subscribe({
      next: (res) => {
        this.logs.set(res.data.data);
        this.pagination.set({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    this.loadLogs(1);
  }

  clearFilters(): void {
    this.filters.set({
      action: '',
      entity_type: '',
      date_from: '',
      date_to: ''
    });
    this.loadLogs(1);
  }

  updateFilter(key: string, value: string): void {
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  viewDetails(log: AuditLog): void {
    this.selectedLog.set(log);
  }

  closeDetails(): void {
    this.selectedLog.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().last_page) {
      this.loadLogs(page);
    }
  }

  formatJson(obj: Record<string, unknown> | null): string {
    if (!obj) return 'N/A';
    return JSON.stringify(obj, null, 2);
  }

  getActionClass(action: string): string {
    if (action.includes('create') || action.includes('store')) return 'create';
    if (action.includes('update') || action.includes('edit')) return 'update';
    if (action.includes('delete') || action.includes('destroy')) return 'delete';
    if (action.includes('approve')) return 'approve';
    if (action.includes('reject')) return 'reject';
    return 'default';
  }
}
