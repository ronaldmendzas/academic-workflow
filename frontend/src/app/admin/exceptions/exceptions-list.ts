import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExceptionApiService, ExceptionRequest } from '../../core/services/exception-api';

@Component({
  selector: 'app-exceptions-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exceptions-list.html'
})
export class ExceptionsList implements OnInit {
  requests: ExceptionRequest[] = [];
  filteredRequests: ExceptionRequest[] = [];
  loading = true;
  processing = false;
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  selectedRequest: ExceptionRequest | null = null;
  adminNotes = '';
  actionError = '';

  exceptionTypes: Record<string, string> = {
    'extra_subject': 'Extra Subject',
    'skip_prerequisite': 'Skip Prerequisite',
    'schedule_conflict': 'Schedule Conflict',
    'quota_override': 'Quota Override'
  };

  constructor(private exceptionApi: ExceptionApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.exceptionApi.getAll().subscribe({
      next: res => {
        this.requests = res.data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredRequests = this.activeFilter === 'all' 
      ? this.requests 
      : this.requests.filter(r => r.status === this.activeFilter);
  }

  openAction(request: ExceptionRequest): void {
    this.selectedRequest = request;
    this.adminNotes = '';
    this.actionError = '';
  }

  closeAction(): void {
    this.selectedRequest = null;
    this.adminNotes = '';
    this.actionError = '';
  }

  approve(): void {
    if (!this.selectedRequest) return;
    
    this.processing = true;
    this.actionError = '';

    this.exceptionApi.approve(this.selectedRequest.id, this.adminNotes).subscribe({
      next: () => {
        this.processing = false;
        this.closeAction();
        this.loadRequests();
      },
      error: err => {
        this.actionError = err.error?.message || 'Failed to approve';
        this.processing = false;
      }
    });
  }

  reject(): void {
    if (!this.selectedRequest || !this.adminNotes.trim()) {
      this.actionError = 'Please provide a reason for rejection';
      return;
    }
    
    this.processing = true;
    this.actionError = '';

    this.exceptionApi.reject(this.selectedRequest.id, this.adminNotes).subscribe({
      next: () => {
        this.processing = false;
        this.closeAction();
        this.loadRequests();
      },
      error: err => {
        this.actionError = err.error?.message || 'Failed to reject';
        this.processing = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'approved': 'bg-green-500/20 text-green-400',
      'rejected': 'bg-red-500/20 text-red-400'
    }[status] || 'bg-gray-500/20 text-gray-400';
  }

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }
}
