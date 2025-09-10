import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonToast, IonItem, IonButton, IonInputPasswordToggle, IonInput, IonLabel, IonSpinner, AnimationController, Animation } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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
  isToastOpen: boolean = false;
  toastMessage: string = '';
  isLoading: boolean = false;

  
  emailError: string = '';
  passwordError: string = '';
  isFormValid: boolean = false;

  constructor(private router: Router, private animationCtrl: AnimationController) {}

  ngOnInit() {
    // animación de entrada cuando se carga la página
    setTimeout(() => {
      this.playEnterAnimation();
    }, 100);
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

  // validar formulario completo
  validateForm(): boolean {
    const emailValid = this.validateEmail();
    const passwordValid = this.validatePassword();
    this.isFormValid = emailValid && passwordValid;
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
    this.validateForm();
  }

  async login() {
    // Validar formulario antes de proceder
    if (!this.validateForm()) {
      this.toastMessage = 'Por favor, corrige los errores en el formulario';
      this.isToastOpen = true;
      return;
    }

    console.log(this.email);
    console.log(this.password);

    // mostrar loading
    this.isLoading = true;

    // simular delay de autenticación
    setTimeout(async () => {
      if (this.email === 'seba@gmail.com' && this.password === '123456') {
        // reproducir animación de salida antes de navegar
        await this.playExitAnimation();
        this.router.navigateByUrl('/home');
      } else {
        this.isLoading = false;
        this.toastMessage = 'Credenciales incorrectas';
        this.isToastOpen = true;
      }
    }, 1500);
  }

  goToPasswordRecovery() {
    this.router.navigateByUrl('/pass-recover');
  }

}
