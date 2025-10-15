import { Injectable } from '@angular/core';

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private readonly STORAGE_KEY = 'ionic_app_users';

  constructor() { }

  // Obtener todos los usuarios
  getUsers(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    if (usersJson) {
      try {
        const users = JSON.parse(usersJson);
        // Convertir las fechas de string a Date
        return users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        }));
      } catch (error) {
        console.error('Error al parsear usuarios:', error);
        return [];
      }
    }
    return [];
  }

  // Guardar un nuevo usuario
  saveUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    
    // Verificar si el email ya existe
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
      throw new Error('Este email ya está registrado');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.generateId(),
      email: user.email,
      password: user.password,
      createdAt: new Date()
    };

    // Agregar a la lista
    users.push(newUser);
    
    // Guardar en localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    
    return newUser;
  }

  // Verificar credenciales de login
  validateUser(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  // Verificar si un email existe
  emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(u => u.email === email);
  }

  // Obtener usuario por email
  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // Eliminar un usuario (para testing)
  deleteUser(email: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.email !== email);
    
    if (filteredUsers.length < users.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  }

  // Limpiar todos los usuarios (para testing)
  clearAllUsers(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obtener estadísticas
  getUserStats(): { totalUsers: number; lastRegistered: Date | null } {
    const users = this.getUsers();
    const lastRegistered = users.length > 0 
      ? new Date(Math.max(...users.map(u => u.createdAt.getTime())))
      : null;
    
    return {
      totalUsers: users.length,
      lastRegistered
    };
  }
}
