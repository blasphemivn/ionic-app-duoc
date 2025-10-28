import { Injectable } from '@angular/core';
import { SqliteService, User, UserWithDate } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  constructor(private sqliteService: SqliteService) {
    console.log('📱 UserStorageService inicializado');
  }

  // Obtener todos los usuarios
  async getUsers(): Promise<UserWithDate[]> {
    const users = await this.sqliteService.getUsers();
    // convertir las fechas de string a Date
    return users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt)
    }));
  }

  // guardar un nuevo usuario
  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<UserWithDate> {
    const savedUser = await this.sqliteService.saveUser(user);
    return {
      ...savedUser,
      createdAt: new Date(savedUser.createdAt)
    };
  }

  // Verificar credenciales de login
  async validateUser(email: string, password: string): Promise<UserWithDate | null> {
    const user = await this.sqliteService.validateUser(email, password);
    if (user) {
      return {
        ...user,
        createdAt: new Date(user.createdAt)
      };
    }
    return null;
  }

  // Verificar si un email existe
  async emailExists(email: string): Promise<boolean> {
    return await this.sqliteService.emailExists(email);
  }

  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<UserWithDate | null> {
    const user = await this.sqliteService.getUserByEmail(email);
    if (user) {
      return {
        ...user,
        createdAt: new Date(user.createdAt)
      };
    }
    return null;
  }

  // Eliminar un usuario (para testing)
  async deleteUser(email: string): Promise<boolean> {
    return await this.sqliteService.deleteUser(email);
  }

  // Limpiar todos los usuarios (para testing)
  async clearAllUsers(): Promise<void> {
    await this.sqliteService.clearAllUsers();
  }

  // Obtener estadísticas
  async getUserStats(): Promise<{ totalUsers: number; lastRegistered: Date | null }> {
    return await this.sqliteService.getUserStats();
  }

  // Métodos para manejar la sesión del usuario actual
  async saveCurrentUser(email: string): Promise<void> {
    await this.sqliteService.saveCurrentUser(email);
  }

  getCurrentUser(): { email: string; loginTime: string } | null {
    return this.sqliteService.getCurrentUser();
  }

  clearCurrentUser(): void {
    this.sqliteService.clearCurrentUser();
  }
}
