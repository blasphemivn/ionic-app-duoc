import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonLabel, IonSpinner, IonToast, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pass-recover',
  templateUrl: './pass-recover.page.html',
  styleUrls: ['./pass-recover.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonLabel, IonSpinner, IonToast, IonBackButton, IonButtons, CommonModule, FormsModule]
})
export class PassRecoverPage implements OnInit {

  email: string = '';
  name: string = '';
  phone: string = '';
  isToastOpen: boolean = false;
  toastMessage: string = '';
  isLoading: boolean = false;

  emailError: string = '';
  nameError: string = '';
  phoneError: string = '';
  isFormValid: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
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

  // validación de nombre
  validateName(): boolean {
    if (!this.name) {
      this.nameError = 'El nombre es requerido';
      return false;
    } else if (this.name.trim().length < 2) {
      this.nameError = 'El nombre debe tener al menos 2 caracteres';
      return false;
    } else {
      this.nameError = '';
      return true;
    }
  }

  // validación de teléfono
  validatePhone(): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!this.phone) {
      this.phoneError = 'El número de teléfono es requerido';
      return false;
    } else if (!phoneRegex.test(this.phone)) {
      this.phoneError = 'Formato de teléfono inválido';
      return false;
    } else {
      this.phoneError = '';
      return true;
    }
  }

  // validar formulario completo
  validateForm(): boolean {
    const emailValid = this.validateEmail();
    const nameValid = this.validateName();
    const phoneValid = this.validatePhone();
    this.isFormValid = emailValid && nameValid && phoneValid;
    return this.isFormValid;
  }

  // método llamado cuando cambia el email
  onEmailChange() {
    this.validateEmail();
    this.validateForm();
  }

  // método llamado cuando cambia el nombre
  onNameChange() {
    this.validateName();
    this.validateForm();
  }

  // método llamado cuando cambia el teléfono
  onPhoneChange() {
    this.validatePhone();
    this.validateForm();
  }

  async submitRecovery() {
    // Validar formulario antes de proceder
    if (!this.validateForm()) {
      this.toastMessage = 'Por favor, corrige los errores en el formulario';
      this.isToastOpen = true;
      return;
    }

    console.log('Datos de recuperación:', {
      email: this.email,
      name: this.name,
      phone: this.phone
    });

    // mostrar loading
    this.isLoading = true;

    // simular delay de envío
    setTimeout(() => {
      this.isLoading = false;
      this.toastMessage = 'Solicitud enviada.';
      this.isToastOpen = true;
      
      // Limpiar formulario después del envío exitoso
      setTimeout(() => {
        this.email = '';
        this.name = '';
        this.phone = '';
        this.validateForm();
      }, 2000);
    }, 2000);
  }

  goBackToLogin() {
    this.router.navigateByUrl('/login');
  }

}
