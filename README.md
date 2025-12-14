# Academic Workflow System

Professional academic workflow engine for university enrollment, grade management, and academic resource control.

## Technology Stack

### Backend
- **Framework**: Laravel 12.11.0
- **Language**: PHP 8.3.28
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (JWT)

### Frontend
- **Framework**: Angular 20.2.0
- **Language**: TypeScript
- **Styling**: CSS
- **HTTP Client**: Angular HttpClient

## Project Structure

```
academic-workflow/
├── backend/          # Laravel API
├── frontend/         # Angular SPA
├── php/              # PHP runtime
└── README.md
```

## Development Environment

### Prerequisites
- **Node.js**: v22.18.0
- **npm**: v10.9.3
- **PHP**: v8.3.28
- **Composer**: v2.9.2
- **Angular CLI**: v20.2.0
- **Git**: v2.51.1
- **MySQL**: v8.0

### Running Backend (Laravel)
```bash
cd backend
..\php\php.exe artisan serve
```

### Running Frontend (Angular)
```bash
cd frontend
npm start
```

## Features

### Workflow Types
- **Sequential Approval**: Document flows through fixed chain of approvers
- **Parallel Approval**: Multiple actors review simultaneously
- **Conditional Flow**: Next step depends on automated/manual decision
- **Cyclic Flow**: Process can return to previous step for corrections
- **Automatic Notifications**: Email/alerts when action required

### Core Modules
1. **User Management** - Students, Teachers, Administrators
2. **Academic Resources** - Subjects, Classrooms, Schedules
3. **Enrollment Workflow** - Lottery system, validations, state machine
4. **Grade Management** - Registration, publishing, academic transcript
5. **Exception Handling** - Special requests with approval workflow
6. **Audit System** - Complete action logging

### Validation Rules
- Prerequisite validation
- Quota management (students per teacher, classroom capacity)
- Schedule conflict detection
- Academic status verification
- Teacher/classroom availability

## Development Practices

### Code Standards
- **Language**: All code in English
- **Clean Code**: Self-documenting, no comments
- **SOLID Principles**: Strictly followed
- **Small Functions**: Max 10-15 lines
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Type Safety**: Full type hints in PHP, strict TypeScript

### Git Workflow
- Atomic commits
- Descriptive commit messages
- Conventional commits (feat, fix, refactor, docs, test)

## License

Proprietary - Academic Project
