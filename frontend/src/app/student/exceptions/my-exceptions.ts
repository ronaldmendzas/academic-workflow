import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExceptionApiService, ExceptionRequest } from '../../core/services/exception-api';

@Component({
  selector: 'app-my-exceptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-exceptions.html'
})
export class MyExceptions implements OnInit {
  requests: ExceptionRequest[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  form: FormGroup;
  error = '';
  success = '';

  exceptionTypes = [
    { value: 'extra_subject', label: 'Extra Subject (exceed max subjects limit)' },
    { value: 'skip_prerequisite', label: 'Skip Prerequisite' },
    { value: 'schedule_conflict', label: 'Schedule Conflict Override' },
    { value: 'quota_override', label: 'Quota Override (class is full)' }
  ];

  constructor(
    private exceptionApi: ExceptionApiService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      type: ['extra_subject', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.exceptionApi.getMyRequests().subscribe({
      next: res => {
        this.requests = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.error = '';
    this.success = '';
    if (!this.showForm) {
      this.form.reset({ type: 'extra_subject', reason: '' });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.error = '';

    this.exceptionApi.create(this.form.value).subscribe({
      next: () => {
        this.success = 'Request submitted successfully';
        this.submitting = false;
        this.showForm = false;
        this.form.reset({ type: 'extra_subject', reason: '' });
        this.loadRequests();
      },
      error: err => {
        this.error = err.error?.message || 'Failed to submit request';
        this.submitting = false;
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

  getTypeLabel(type: string): string {
    return this.exceptionTypes.find(t => t.value === type)?.label || type;
  }
}
