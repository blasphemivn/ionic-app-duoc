import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStorageService } from './services/user-storage.service';

export const guardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStorageService = inject(UserStorageService);
  
  // verificar si hay un usuario actual
  const currentUser = userStorageService.getCurrentUser();
  
  if (currentUser && currentUser.email && currentUser.loginTime) {
    // usuario autenticado válido, permitir acceso
    console.log('Usuario autenticado:', currentUser.email);
    return true;
  }
  
  // no hay usuario autenticado, redirigir al login
  console.log('⚠️ Acceso denegado: Usuario no autenticado');
  router.navigateByUrl('/login');
  return false;
};
