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
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [guardGuard],
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then( m => m.CartPage),
    canActivate: [guardGuard],
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payment.page').then( m => m.PaymentPage),
    canActivate: [guardGuard],
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./product/product.page').then( m => m.ProductPage),
    canActivate: [guardGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];




