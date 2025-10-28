import { Routes } from '@angular/router';
import { guardGuard } from './guard-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'pass-recover',
    loadComponent: () => import('./pass-recover/pass-recover.page').then( m => m.PassRecoverPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [guardGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },

];
