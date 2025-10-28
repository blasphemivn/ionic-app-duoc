import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface UserWithDate {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'ionic_app_db';
  private readonly DB_VERSION = 1;
  private isNative = Capacitor.isNativePlatform();

  constructor() { 
    console.log('📱 SQLite Service inicializado - Plataforma:', this.isNative ? 'Nativa' : 'Web');
    this.initializeDatabase();
  }

  // inicializar base de datos
  async initializeDatabase(): Promise<void> {
    try {
      if (this.isNative) {
        await this.initializeNativeDB();
      } else {
        // Web: usar localStorage
        console.log('🌐 Usando localStorage para web');
      }
    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
    }
  }

  // inicializar base de datos nativa (Android)
  private async initializeNativeDB(): Promise<void> {
    try {
      const connection = new SQLiteConnection(CapacitorSQLite);
      
      // verificar si la conexión ya existe
      const isConn = await connection.isConnection(this.DB_NAME, false);
      
      if (!isConn.result) {
        // crear nueva conexión
        this.db = await connection.createConnection(
          this.DB_NAME, 
          false, 
          'no-encryption', 
          this.DB_VERSION, 
          false
        );
        await this.db.open();
      } else {
        // usar conexión existente
        this.db = await connection.retrieveConnection(this.DB_NAME, false);
      }

      // crear tabla de usuarios
      await this.createUsersTable();
      console.log('✅ Base de datos SQLite nativa inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar base de datos nativa:', error);
      throw error;
    }
  }

  // crear tabla de usuarios
  private async createUsersTable(): Promise<void> {
    if (!this.db || !this.isNative) return;

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `;

    try {
      await this.db.execute(createTableSQL);
      console.log('✅ Tabla de usuarios creada');
    } catch (error) {
      console.error('❌ Error al crear tabla:', error);
    }
  }

  // obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    if (!this.isNative) {
      // web: localStorage
      const usersJson = localStorage.getItem('ionic_app_users');
      return usersJson ? JSON.parse(usersJson) : [];
    }

    if (!this.db) {
      await this.initializeDatabase();
    }

    const selectSQL = `SELECT * FROM users;`;

    try {
      if (this.db) {
        const result = await this.db.query(selectSQL);
        return result.values as User[] || [];
      }
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
    }
    return [];
  }

  // guardar un nuevo usuario
  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // verificar si el email ya existe
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error('Este email ya está registrado');
    }

    // crear nuevo usuario
    const newUser: User = {
      id: this.generateId(),
      email: user.email,
      password: user.password,
      createdAt: new Date().toISOString()
    };

    if (!this.isNative) {
      // web: localStorage
      const users = await this.getUsers();
      users.push(newUser);
      localStorage.setItem('ionic_app_users', JSON.stringify(users));
      console.log('✅ Usuario guardado (localStorage):', newUser.email);
      return newUser;
    }

    if (!this.db) {
      await this.initializeDatabase();
    }

    const insertSQL = `INSERT INTO users (id, email, password, createdAt) VALUES (?, ?, ?, ?);`;

    try {
      if (this.db) {
        await this.db.run(insertSQL, [newUser.id, newUser.email, newUser.password, newUser.createdAt]);
        console.log('✅ Usuario guardado (SQLite):', newUser.email);
      }
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      throw error;
    }

    return newUser;
  }

  // obtener usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // validar credenciales
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // verificar si email existe
  async emailExists(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return user !== null;
  }

  // eliminar usuario
  async deleteUser(email: string): Promise<boolean> {
    if (!this.isNative) {
      // web: localStorage
      const users = await this.getUsers();
      const filteredUsers = users.filter(u => u.email !== email);
      localStorage.setItem('ionic_app_users', JSON.stringify(filteredUsers));
      return filteredUsers.length < users.length;
    }

    if (!this.db) {
      await this.initializeDatabase();
    }

    const deleteSQL = `DELETE FROM users WHERE email = ?;`;

    try {
      if (this.db) {
        await this.db.run(deleteSQL, [email]);
        return true;
      }
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
    }
    return false;
  }

  // eliminar todos los usuarios
  async clearAllUsers(): Promise<void> {
    if (!this.isNative) {
      localStorage.removeItem('ionic_app_users');
      return;
    }

    if (!this.db) {
      await this.initializeDatabase();
    }

    const deleteSQL = `DELETE FROM users;`;

    try {
      if (this.db) {
        await this.db.execute(deleteSQL);
        console.log('✅ Todos los usuarios eliminados');
      }
    } catch (error) {
      console.error('❌ Error al eliminar usuarios:', error);
    }
  }

  // obtener estadísticas
  async getUserStats(): Promise<{ totalUsers: number; lastRegistered: Date | null }> {
    const users = await this.getUsers();
    const lastRegistered = users.length > 0
      ? new Date(users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt)
      : null;

    return {
      totalUsers: users.length,
      lastRegistered
    };
  }

  // guardar sesión del usuario actual
  async saveCurrentUser(email: string): Promise<void> {
    localStorage.setItem('current_user', JSON.stringify({
      email: email,
      loginTime: new Date().toISOString()
    }));
  }

  // obtener el usuario actual
  getCurrentUser(): { email: string; loginTime: string } | null {
    const currentUser = localStorage.getItem('current_user');
    if (currentUser) {
      try {
        return JSON.parse(currentUser);
      } catch (error) {
        console.error('Error al parsear usuario actual:', error);
        return null;
      }
    }
    return null;
  }

  // eliminar sesión del usuario actual
  clearCurrentUser(): void {
    localStorage.removeItem('current_user');
  }

  // generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // cerrar conexión
  async closeDatabase(): Promise<void> {
    if (this.db && this.isNative) {
      try {
        await this.db.close();
        console.log('✅ Base de datos cerrada');
      } catch (error) {
        console.error('❌ Error al cerrar base de datos:', error);
      }
    }
  }
}
