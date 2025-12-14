import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
    },
    {
        path: '',
        loadComponent: () => import('./shared/layout/layout').then(m => m.Layout),
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
            },
            // Admin routes
            {
                path: 'admin/students',
                loadComponent: () => import('./admin/students/students-list').then(m => m.StudentsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/teachers',
                loadComponent: () => import('./admin/teachers/teachers-list').then(m => m.TeachersList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/subjects',
                loadComponent: () => import('./admin/subjects/subjects-list').then(m => m.SubjectsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/classrooms',
                loadComponent: () => import('./admin/classrooms/classrooms-list').then(m => m.ClassroomsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/offerings',
                loadComponent: () => import('./admin/offerings/offerings-list').then(m => m.OfferingsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/periods',
                loadComponent: () => import('./admin/periods/periods-list').then(m => m.PeriodsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            {
                path: 'admin/exceptions',
                loadComponent: () => import('./admin/exceptions/exceptions-list').then(m => m.ExceptionsList),
                canActivate: [RoleGuard],
                data: { role: 'administrator' }
            },
            // Student routes
            {
                path: 'student',
                redirectTo: 'student/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'student/dashboard',
                loadComponent: () => import('./student/dashboard/student-dashboard').then(m => m.StudentDashboard),
                canActivate: [RoleGuard],
                data: { role: 'student' }
            },
            {
                path: 'student/offerings',
                loadComponent: () => import('./student/offerings/offerings-catalog').then(m => m.OfferingsCatalog),
                canActivate: [RoleGuard],
                data: { role: 'student' }
            },
            {
                path: 'student/enrollments',
                loadComponent: () => import('./student/enrollments/my-enrollments').then(m => m.MyEnrollments),
                canActivate: [RoleGuard],
                data: { role: 'student' }
            },
            {
                path: 'student/schedule',
                loadComponent: () => import('./student/schedule/my-schedule').then(m => m.MySchedule),
                canActivate: [RoleGuard],
                data: { role: 'student' }
            },
            {
                path: 'student/exceptions',
                loadComponent: () => import('./student/exceptions/my-exceptions').then(m => m.MyExceptions),
                canActivate: [RoleGuard],
                data: { role: 'student' }
            },
            // Teacher routes
            {
                path: 'teacher',
                redirectTo: 'teacher/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'teacher/dashboard',
                loadComponent: () => import('./teacher/dashboard/teacher-dashboard').then(m => m.TeacherDashboard),
                canActivate: [RoleGuard],
                data: { role: 'teacher' }
            },
            {
                path: 'teacher/offerings',
                loadComponent: () => import('./teacher/courses/my-courses').then(m => m.MyCourses),
                canActivate: [RoleGuard],
                data: { role: 'teacher' }
            },
            {
                path: 'teacher/courses/:id/students',
                loadComponent: () => import('./teacher/courses/course-students').then(m => m.CourseStudents),
                canActivate: [RoleGuard],
                data: { role: 'teacher' }
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
