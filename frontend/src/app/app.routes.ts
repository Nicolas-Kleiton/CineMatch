import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'register', component: Register},
    { path: 'login', component: Login },
    {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
    path: 'history',
    loadComponent: () => import('./pages/history/history').then(m => m.History)
    },
    {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
    },

    { path: '**', redirectTo: 'dashboard' }
];
