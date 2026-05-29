import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('cinematch_token');

  if(token){
    return true;
  } else {
    alert('Acesso negado: faça login para continuar.')
    router.navigate(['/login']);

    return false;
  }
};
