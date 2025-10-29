import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStorageService } from './services/user-storage.service';

export const guardGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userStorageService = inject(UserStorageService);

  // verificar si hay un usuario en sesión
  const currentUser = userStorageService.getCurrentUser();
  if (!currentUser || !currentUser.email) {
    console.log(' Acceso denegado: No hay sesión activa');
    return router.createUrlTree(['/login']);
  }

  // validar que el usuario exista en la base de datos (SQLite o localStorage en web)
  try {
    const dbUser = await userStorageService.getUserByEmail(currentUser.email);
    if (dbUser) {
      console.log('Usuario autenticado y presente en BD:', currentUser.email);
      return true;
    }
    console.log(' Acceso denegado: Usuario de sesión no existe en BD');
    return router.createUrlTree(['/login']);
  } catch (error) {
    console.error('Error validando usuario en BD:', error);
    return router.createUrlTree(['/login']);
  }
};
