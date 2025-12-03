import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PassRecoverPage } from './pass-recover.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PassRecoverPage', () => {
  let component: PassRecoverPage;
  let fixture: ComponentFixture<PassRecoverPage>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], {
      events: of() // Mock the events property with an empty observable
    });

    await TestBed.configureTestingModule({
      imports: [PassRecoverPage],
      providers: [
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(PassRecoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should validate email correctly', () => {
      component.email = '';
      expect(component.validateEmail()).toBe(false);
      expect(component.emailError).toBe('El email es requerido');
      
      component.email = 'invalid-email';
      expect(component.validateEmail()).toBe(false);
      expect(component.emailError).toBe('Formato de email inválido');

      component.email = 'valid@email.com';
      expect(component.validateEmail()).toBe(true);
      expect(component.emailError).toBe('');
    });

    it('should validate name correctly', () => {
      component.name = '';
      expect(component.validateName()).toBe(false);
      expect(component.nameError).toBe('El nombre es requerido');
      
      component.name = 'a';
      expect(component.validateName()).toBe(false);
      expect(component.nameError).toBe('El nombre debe tener al menos 2 caracteres');

      component.name = 'John Doe';
      expect(component.validateName()).toBe(true);
      expect(component.nameError).toBe('');
    });

    it('should validate phone correctly', () => {
      component.phone = '';
      expect(component.validatePhone()).toBe(false);
      expect(component.phoneError).toBe('El número de teléfono es requerido');
      
      component.phone = '123';
      expect(component.validatePhone()).toBe(false);
      expect(component.phoneError).toBe('Formato de teléfono inválido');

      component.phone = '12345678';
      expect(component.validatePhone()).toBe(true);
      expect(component.phoneError).toBe('');
    });

    it('should validate the whole form', () => {
      spyOn(component, 'validateEmail').and.returnValue(true);
      spyOn(component, 'validateName').and.returnValue(true);
      spyOn(component, 'validatePhone').and.returnValue(true);
      
      component.validateForm();
      
      expect(component.isFormValid).toBe(true);
    });
  });

  describe('Form Interaction', () => {
    it('should trigger validation on email change', () => {
      spyOn(component, 'validateEmail');
      spyOn(component, 'validateForm');
      component.onEmailChange();
      expect(component.validateEmail).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });

    it('should trigger validation on name change', () => {
      spyOn(component, 'validateName');
      spyOn(component, 'validateForm');
      component.onNameChange();
      expect(component.validateName).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });

    it('should trigger validation on phone change', () => {
      spyOn(component, 'validatePhone');
      spyOn(component, 'validateForm');
      component.onPhoneChange();
      expect(component.validatePhone).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });
  });

  describe('submitRecovery', () => {
    it('should not submit if form is invalid', () => {
      component.isFormValid = false;
      component.submitRecovery();
      expect(component.isLoading).toBe(false);
    });

    it('should show loading, toast, and clear form on successful submission', fakeAsync(() => {
      component.email = 'test@example.com';
      component.name = 'Test User';
      component.phone = '12345678';
      component.isFormValid = true;

      component.submitRecovery();

      expect(component.isLoading).toBe(true);

      tick(2000);

      expect(component.isLoading).toBe(false);
      expect(component.toastMessage).toBe('Solicitud enviada.');
      expect(component.isToastOpen).toBe(true);

      tick(2000);
      
      expect(component.email).toBe('');
      expect(component.name).toBe('');
      expect(component.phone).toBe('');
    }));
  });

  it('should navigate to login on goBackToLogin', () => {
    component.goBackToLogin();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});