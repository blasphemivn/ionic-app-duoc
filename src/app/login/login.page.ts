import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonToast, IonItem, IonButton, IonInputPasswordToggle, IonInput, IonLabel, IonSpinner, AnimationController, Animation } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonButton, IonInput, IonInputPasswordToggle, IonToast, IonLabel, IonSpinner]
})
export class LoginPage implements OnInit {

  @ViewChild('loginContainer', { read: ElementRef }) loginContainer!: ElementRef;
  @ViewChild('logoContainer', { read: ElementRef }) logoContainer!: ElementRef;
  @ViewChild('formContainer', { read: ElementRef }) formContainer!: ElementRef;

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isToastOpen: boolean = false;
  toastMessage: string = '';
  isLoading: boolean = false;
  isRegisterMode: boolean = false;

  
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  isFormValid: boolean = false;

  constructor(
    private router: Router, 
    private animationCtrl: AnimationController,
    private userStorageService: UserStorageService
  ) {}

  ngOnInit() {
    // animación de entrada cuando se carga la página
    setTimeout(() => {
      this.playEnterAnimation();
    }, 100);

    // Mostrar estadísticas de usuarios en consola (para desarrollo)
    this.showUserStats();
  }

  // animación de entradaa
  async playEnterAnimation() {
    const logoAnimation = this.animationCtrl.create()
      .addElement(this.logoContainer.nativeElement)
      .duration(800)
      .easing('ease-out')
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(-30px)', 'translateY(0)');

    const formAnimation = this.animationCtrl.create()
      .addElement(this.formContainer.nativeElement)
      .duration(800)
      .easing('ease-out')
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(30px)', 'translateY(0)');

    const containerAnimation = this.animationCtrl.create()
      .addElement(this.loginContainer.nativeElement)
      .duration(1000)
      .easing('ease-out')
      .fromTo('opacity', '0', '1');

    await containerAnimation.play();
    await Promise.all([logoAnimation.play(), formAnimation.play()]);
  }

  // animación de salida
  async playExitAnimation(): Promise<void> {
    const exitAnimation = this.animationCtrl.create()
      .addElement(this.loginContainer.nativeElement)
      .duration(500)
      .easing('ease-in')
      .fromTo('opacity', '1', '0')
      .fromTo('transform', 'translateY(0)', 'translateY(-20px)');

    await exitAnimation.play();
  }

  // validación de email
  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'El email es requerido';
      return false;
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Formato de email inválido';
      return false;
    } else {
      this.emailError = '';
      return true;
    }
  }

  // validación de password
  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'La contraseña es requerida';
      return false;
    } else if (this.password.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  // validación de confirmar contraseña
  validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirma tu contraseña';
      return false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
      return false;
    } else {
      this.confirmPasswordError = '';
      return true;
    }
  }

  // validar formulario completo
  validateForm(): boolean {
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    let confirmPasswordValid = true;
    
    if (this.isRegisterMode) {
      confirmPasswordValid = this.validateConfirmPassword();
    }
    
    this.isFormValid = emailValid && passwordValid && confirmPasswordValid;
    return this.isFormValid;
  }

  // método llamado cuando cambia el email
  onEmailChange() {
    this.validateEmail();
    this.validateForm();
  }

  // método llamado cuando cambia la contraseña
  onPasswordChange() {
    this.validatePassword();
    if (this.isRegisterMode) {
      this.validateConfirmPassword();
    }
    this.validateForm();
  }

  // método llamado cuando cambia la confirmación de contraseña
  onConfirmPasswordChange() {
    this.validateConfirmPassword();
    this.validateForm();
  }

  async login() {
    // Validar formulario antes de proceder
    if (!this.validateForm()) {
      this.toastMessage = 'Por favor, corrige los errores en el formulario';
      this.isToastOpen = true;
      return;
    }

    console.log('Intentando login con:', this.email);

    // mostrar loading
    this.isLoading = true;

    // simular delay de autenticación
    setTimeout(async () => {
      try {
        // Verificar credenciales con usuarios guardados
        const user = this.userStorageService.validateUser(this.email, this.password);
        
        // También permitir el usuario por defecto
        const isDefaultUser = this.email === 'seba@gmail.com' && this.password === '123456';
        
        if (user || isDefaultUser) {
          // Guardar sesión activa
          localStorage.setItem('current_user', JSON.stringify({
            email: this.email,
            loginTime: new Date().toISOString()
          }));
          
          console.log('Login exitoso');
          // reproducir animación de salida antes de navegar
          await this.playExitAnimation();
          this.router.navigateByUrl('/home');
        } else {
          this.isLoading = false;
          this.toastMessage = 'Credenciales incorrectas';
          this.isToastOpen = true;
        }
      } catch (error) {
        this.isLoading = false;
        this.toastMessage = 'Error al iniciar sesión';
        this.isToastOpen = true;
        console.error('Error en login:', error);
      }
    }, 1500);
  }

  goToPasswordRecovery() {
    this.router.navigateByUrl('/pass-recover');
  }

  // cambiar entre modo login y registro
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.clearForm();
  }

  // limpiar formulario
  clearForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.isFormValid = false;
  }

  // método de registro
  async register() {
    // Validar formulario antes de proceder
    if (!this.validateForm()) {
      this.toastMessage = 'Por favor, corrige los errores en el formulario';
      this.isToastOpen = true;
      return;
    }

    console.log('Registrando usuario:', this.email);

    // mostrar loading
    this.isLoading = true;

    // simular delay de registro
    setTimeout(async () => {
      try {
        // Verificar si el email ya existe
        if (this.userStorageService.emailExists(this.email)) {
          this.isLoading = false;
          this.toastMessage = 'Este email ya está registrado';
          this.isToastOpen = true;
          return;
        }

        // Guardar nuevo usuario
        const newUser = this.userStorageService.saveUser({
          email: this.email,
          password: this.password
        });

        console.log('Usuario registrado exitosamente:', newUser);
        this.isLoading = false;
        this.toastMessage = `¡Registro exitoso! Bienvenido ${this.email}`;
        this.isToastOpen = true;
        
        // Cambiar a modo login después del registro exitoso
        setTimeout(() => {
          this.isRegisterMode = false;
          this.clearForm();
        }, 2000);
        
      } catch (error) {
        this.isLoading = false;
        this.toastMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
        this.isToastOpen = true;
        console.error('Error en registro:', error);
      }
    }, 1500);
  }

  // Mostrar estadísticas de usuarios (para desarrollo)
  showUserStats() {
    const stats = this.userStorageService.getUserStats();
    console.log('📊 Estadísticas de usuarios:', {
      totalUsuarios: stats.totalUsers,
      ultimoRegistro: stats.lastRegistered?.toLocaleString() || 'Ninguno'
    });
  }

  // Método para limpiar todos los usuarios (para testing)
  clearAllUsers() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los usuarios registrados?')) {
      this.userStorageService.clearAllUsers();
      this.toastMessage = 'Todos los usuarios han sido eliminados';
      this.isToastOpen = true;
      console.log('🗑️ Todos los usuarios eliminados');
    }
  }

  // Método para mostrar usuarios registrados (para desarrollo)
  showRegisteredUsers() {
    const users = this.userStorageService.getUsers();
    console.log('👥 Usuarios registrados:', users.map(u => ({
      email: u.email,
      fechaRegistro: u.createdAt.toLocaleString()
    })));
    
    if (users.length === 0) {
      this.toastMessage = 'No hay usuarios registrados';
    } else {
      this.toastMessage = `${users.length} usuarios registrados (ver consola)`;
    }
    this.isToastOpen = true;
  }

}
