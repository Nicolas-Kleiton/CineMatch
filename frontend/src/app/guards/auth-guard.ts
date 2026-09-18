import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (inject(Auth).estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
