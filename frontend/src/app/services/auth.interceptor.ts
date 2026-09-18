import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';
import { ToastService } from './toast';

// Rotas em que um 401 é uma resposta esperada e deve ser tratada pela própria tela
const ROTAS_SEM_REDIRECIONAMENTO = ['/login', '/logout'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const token = authService.obterToken();
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((erro: HttpErrorResponse) => {
      const ignorarRota = ROTAS_SEM_REDIRECIONAMENTO.some(rota => req.url.endsWith(rota));

      // Token expirado ou revogado: encerra a sessão local e volta para o login
      // (a checagem de estaAutenticado evita toasts repetidos quando várias requisições falham juntas)
      if (erro.status === 401 && authService.estaAutenticado() && !ignorarRota) {
        authService.limparSessao();
        toastService.show('Sua sessão expirou. Faça login novamente.', 'warning');
        router.navigate(['/login']);
      }

      return throwError(() => erro);
    })
  );
};
