import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentApiService, OfferingWithEligibility, OfferingsResponse } from '../../core/services/student-api';

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
  finalizing = false;
  success = '';
  error = '';
  enrollmentPeriodOpen = false;
  enrollmentFinalized = false;
  enrollmentFinalizedAt: string | null = null;
  period: any = null;

  constructor(private api: StudentApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getOfferings().subscribe({
      next: (res) => { 
        console.log('API Response:', res);
        const data = res.data as any;
        // Handle both possible response structures
        if (data && data.offerings && Array.isArray(data.offerings)) {
          this.offerings = data.offerings;
          this.enrollmentPeriodOpen = data.enrollment_period_open ?? false;
          this.enrollmentFinalized = data.enrollment_finalized ?? false;
          this.enrollmentFinalizedAt = data.enrollment_finalized_at;
          this.period = data.period;
        } else if (Array.isArray(data)) {
          this.offerings = data;
          this.enrollmentPeriodOpen = true;
          this.enrollmentFinalized = false;
          this.period = null;
        } else {
          this.offerings = [];
          this.enrollmentPeriodOpen = false;
          this.enrollmentFinalized = false;
          this.period = null;
        }
        console.log('Parsed offerings:', this.offerings);
        console.log('Period open:', this.enrollmentPeriodOpen);
        console.log('Enrollment finalized:', this.enrollmentFinalized);
        this.loading = false; 
      },
      error: (err) => { 
        console.error('Error:', err);
        this.loading = false; 
        this.error = 'Error cargando ofertas'; 
      }
    });
  }

  get canModifyEnrollment(): boolean {
    return this.enrollmentPeriodOpen && !this.enrollmentFinalized;
  }

  enroll(offering: OfferingWithEligibility) {
    if (!offering.can_enroll || this.enrolling || !this.canModifyEnrollment) return;

    this.enrolling = offering.id;
    this.error = ''; // Clear previous error
    this.api.enroll(offering.id).subscribe({
      next: () => {
        this.success = `Inscrito en ${offering.subject.name}`;
        this.enrolling = null;
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        const reasons = err.error?.data?.reasons || [];
        if (reasons.includes('Already enrolled in this subject')) {
          this.error = 'Ya estás inscrito en esta materia';
        } else if (reasons.includes('No available quota')) {
          this.error = 'No hay cupos disponibles';
        } else if (reasons.includes('Schedule conflict')) {
          this.error = 'Conflicto de horario con otra materia';
        } else if (reasons.includes('Prerequisites not met')) {
          this.error = 'No cumples con los prerrequisitos';
        } else if (reasons.includes('Maximum subjects limit reached')) {
          this.error = 'Has alcanzado el límite máximo de materias';
        } else if (reasons.includes('Enrollment period is not open')) {
          this.error = 'El período de inscripción no está abierto';
        } else if (reasons.includes('Enrollment already finalized')) {
          this.error = 'Ya finalizaste tu inscripción';
        } else {
          this.error = err.error?.message || 'Error al inscribirse';
        }
        this.enrolling = null;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  finalizeEnrollment() {
    if (this.finalizing || this.enrollmentFinalized || !this.enrollmentPeriodOpen) return;

    if (!confirm('¿Estás seguro de finalizar tu inscripción? Una vez finalizada, no podrás inscribirte ni desinscribirte de materias.')) {
      return;
    }

    this.finalizing = true;
    this.error = '';
    this.api.finalizeEnrollment().subscribe({
      next: () => {
        this.success = 'Inscripción finalizada correctamente';
        this.enrollmentFinalized = true;
        this.finalizing = false;
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        const reasons = err.error?.data?.reasons || [];
        if (reasons.includes('Must be enrolled in at least one subject')) {
          this.error = 'Debes estar inscrito en al menos una materia para finalizar';
        } else if (reasons.includes('Enrollment already finalized')) {
          this.error = 'La inscripción ya fue finalizada';
        } else {
          this.error = err.error?.message || 'Error al finalizar inscripción';
        }
        this.finalizing = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  formatSchedule(schedule: any[]): string {
    if (!schedule?.length) return '-';
    return schedule.map(s => `${s.day.substring(0, 3).toUpperCase()} ${s.start_time || s.start || ''}-${s.end_time || s.end || ''}`).join(', ');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(date: string): string {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('es-BO', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    const timeStr = d.toLocaleTimeString('es-BO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return `${dateStr} a las ${timeStr} hrs`;
  }
}
