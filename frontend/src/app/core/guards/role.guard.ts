import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;
  const currentUser = authService.currentUserValue;

  if (currentUser && currentUser.role === requiredRole) {
    return true;
  }

  // Redirect to dashboard if logged in but wrong role
  router.navigate(['/dashboard']);
  return false;
};
