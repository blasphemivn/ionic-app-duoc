import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { LoginPage } from './login.page';
import { UserStorageService } from '../services/user-storage.service';
import { provideRouter } from '@angular/router';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let router: jasmine.SpyObj<Router>;
  let animationCtrl: jasmine.SpyObj<AnimationController>;
  let userStorageService: jasmine.SpyObj<UserStorageService>;

  beforeEach(async () => {
    // Crear spies para los servicios
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const animationCtrlSpy = jasmine.createSpyObj('AnimationController', ['create']);
    const userStorageServiceSpy = jasmine.createSpyObj('UserStorageService', [
      'validateUser',
      'saveCurrentUser',
      'emailExists',
      'saveUser',
      'getUserStats',
      'getUsers',
      'clearAllUsers'
    ]);

    // Configurar el mock de animación
    const mockAnimation: any = {
      addElement: jasmine.createSpy('addElement'),
      duration: jasmine.createSpy('duration'),
      easing: jasmine.createSpy('easing'),
      fromTo: jasmine.createSpy('fromTo'),
      play: jasmine.createSpy('play').and.returnValue(Promise.resolve())
    };
    // Configurar métodos para retornar el objeto mismo (chain pattern)
    mockAnimation.addElement.and.returnValue(mockAnimation);
    mockAnimation.duration.and.returnValue(mockAnimation);
    mockAnimation.easing.and.returnValue(mockAnimation);
    mockAnimation.fromTo.and.returnValue(mockAnimation);
    animationCtrlSpy.create.and.returnValue(mockAnimation);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: routerSpy },
        { provide: AnimationController, useValue: animationCtrlSpy },
        { provide: UserStorageService, useValue: userStorageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    animationCtrl = TestBed.inject(AnimationController) as jasmine.SpyObj<AnimationController>;
    userStorageService = TestBed.inject(UserStorageService) as jasmine.SpyObj<UserStorageService>;

    // Configurar valores por defecto para los mocks
    userStorageService.getUserStats.and.returnValue(
      Promise.resolve({ totalUsers: 0, lastRegistered: null })
    );
    userStorageService.getUsers.and.returnValue(Promise.resolve([]));
  });

  describe('Inicialización', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.confirmPassword).toBe('');
      expect(component.isToastOpen).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.isRegisterMode).toBe(false);
      expect(component.isFormValid).toBe(false);
    });

    it('should call showUserStats on ngOnInit', () => {
      spyOn(component, 'showUserStats');
      component.ngOnInit();
      expect(component.showUserStats).toHaveBeenCalled();
    });

    it('should clear form and play animation on ionViewDidEnter', () => {
      spyOn(component, 'clearForm');
      spyOn(component, 'playEnterAnimation');
      component.ionViewDidEnter();
      expect(component.clearForm).toHaveBeenCalled();
      expect(component.playEnterAnimation).toHaveBeenCalled();
    });
  });

  describe('Validación de Email', () => {
    it('should return false and set error when email is empty', () => {
      component.email = '';
      const result = component.validateEmail();
      expect(result).toBe(false);
      expect(component.emailError).toBe('El email es requerido');
    });

    it('should return false and set error when email format is invalid', () => {
      component.email = 'invalid-email';
      const result = component.validateEmail();
      expect(result).toBe(false);
      expect(component.emailError).toBe('Formato de email inválido');
    });

    it('should return false and set error when email has no @ symbol', () => {
      component.email = 'testemail.com';
      const result = component.validateEmail();
      expect(result).toBe(false);
      expect(component.emailError).toBe('Formato de email inválido');
    });

    it('should return false and set error when email has no domain', () => {
      component.email = 'test@';
      const result = component.validateEmail();
      expect(result).toBe(false);
      expect(component.emailError).toBe('Formato de email inválido');
    });

    it('should return true and clear error when email is valid', () => {
      component.email = 'test@example.com';
      const result = component.validateEmail();
      expect(result).toBe(true);
      expect(component.emailError).toBe('');
    });

    it('should validate email on email change', () => {
      spyOn(component, 'validateEmail').and.returnValue(true);
      spyOn(component, 'validateForm');
      component.onEmailChange();
      expect(component.validateEmail).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });
  });

  describe('Validación de Contraseña', () => {
    it('should return false and set error when password is empty', () => {
      component.password = '';
      const result = component.validatePassword();
      expect(result).toBe(false);
      expect(component.passwordError).toBe('La contraseña es requerida');
    });

    it('should return false and set error when password is too short', () => {
      component.password = '12345';
      const result = component.validatePassword();
      expect(result).toBe(false);
      expect(component.passwordError).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('should return true and clear error when password is valid', () => {
      component.password = '123456';
      const result = component.validatePassword();
      expect(result).toBe(true);
      expect(component.passwordError).toBe('');
    });

    it('should validate password on password change', () => {
      component.isRegisterMode = false;
      spyOn(component, 'validatePassword').and.returnValue(true);
      spyOn(component, 'validateForm');
      component.onPasswordChange();
      expect(component.validatePassword).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });

    it('should validate confirm password when in register mode', () => {
      component.isRegisterMode = true;
      spyOn(component, 'validatePassword').and.returnValue(true);
      spyOn(component, 'validateConfirmPassword');
      spyOn(component, 'validateForm');
      component.onPasswordChange();
      expect(component.validateConfirmPassword).toHaveBeenCalled();
    });
  });

  describe('Validación de Confirmar Contraseña', () => {
    it('should return false and set error when confirm password is empty', () => {
      component.confirmPassword = '';
      const result = component.validateConfirmPassword();
      expect(result).toBe(false);
      expect(component.confirmPasswordError).toBe('Confirma tu contraseña');
    });

    it('should return false and set error when passwords do not match', () => {
      component.password = '123456';
      component.confirmPassword = '654321';
      const result = component.validateConfirmPassword();
      expect(result).toBe(false);
      expect(component.confirmPasswordError).toBe('Las contraseñas no coinciden');
    });

    it('should return true and clear error when passwords match', () => {
      component.password = '123456';
      component.confirmPassword = '123456';
      const result = component.validateConfirmPassword();
      expect(result).toBe(true);
      expect(component.confirmPasswordError).toBe('');
    });

    it('should validate confirm password on confirm password change', () => {
      spyOn(component, 'validateConfirmPassword').and.returnValue(true);
      spyOn(component, 'validateForm');
      component.onConfirmPasswordChange();
      expect(component.validateConfirmPassword).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
    });
  });

  describe('Validación de Formulario', () => {
    it('should return false when email is invalid', () => {
      component.email = 'invalid';
      component.password = '123456';
      const result = component.validateForm();
      expect(result).toBe(false);
      expect(component.isFormValid).toBe(false);
    });

    it('should return false when password is invalid', () => {
      component.email = 'test@example.com';
      component.password = '123';
      const result = component.validateForm();
      expect(result).toBe(false);
      expect(component.isFormValid).toBe(false);
    });

    it('should return true when all fields are valid in login mode', () => {
      component.isRegisterMode = false;
      component.email = 'test@example.com';
      component.password = '123456';
      const result = component.validateForm();
      expect(result).toBe(true);
      expect(component.isFormValid).toBe(true);
    });

    it('should return false when confirm password is invalid in register mode', () => {
      component.isRegisterMode = true;
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '654321';
      const result = component.validateForm();
      expect(result).toBe(false);
      expect(component.isFormValid).toBe(false);
    });

    it('should return true when all fields are valid in register mode', () => {
      component.isRegisterMode = true;
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      const result = component.validateForm();
      expect(result).toBe(true);
      expect(component.isFormValid).toBe(true);
    });
  });

  describe('Login', () => {
    it('should not login when form is invalid', () => {
      component.email = 'invalid';
      component.password = '';
      spyOn(component, 'validateForm').and.returnValue(false);
      component.login();
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Por favor, corrige los errores en el formulario');
      expect(component.isLoading).toBe(false);
    });

    it('should show loading when login starts', fakeAsync(() => {
      component.email = 'test@example.com';
      component.password = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.validateUser.and.returnValue(Promise.resolve(null));
      
      component.login();
      expect(component.isLoading).toBe(true);
      tick(1500);
    }));

    it('should navigate to home on successful login with default user', fakeAsync(() => {
      component.email = 'seba@gmail.com';
      component.password = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      spyOn(component, 'playExitAnimation').and.returnValue(Promise.resolve());
      userStorageService.validateUser.and.returnValue(Promise.resolve(null));
      
      component.login();
      tick(1500);
      
      expect(userStorageService.saveCurrentUser).toHaveBeenCalledWith('seba@gmail.com');
      expect(component.playExitAnimation).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    }));

    it('should navigate to home on successful login with stored user', fakeAsync(() => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: '123456',
        createdAt: new Date()
      };
      
      component.email = 'test@example.com';
      component.password = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      spyOn(component, 'playExitAnimation').and.returnValue(Promise.resolve());
      userStorageService.validateUser.and.returnValue(Promise.resolve(mockUser as any));
      
      component.login();
      tick(1500);
      
      expect(userStorageService.saveCurrentUser).toHaveBeenCalledWith('test@example.com');
      expect(component.playExitAnimation).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    }));

    it('should show error message on failed login', fakeAsync(() => {
      component.email = 'test@example.com';
      component.password = 'wrongpassword';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.validateUser.and.returnValue(Promise.resolve(null));
      
      component.login();
      tick(1500);
      
      expect(component.isLoading).toBe(false);
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Credenciales incorrectas');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should handle login error', async () => {
      component.email = 'test@example.com';
      component.password = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.validateUser.and.returnValue(Promise.reject(new Error('Database error')));
      
      // Capturar errores no manejados
      spyOn(console, 'error');
      
      await component.login();
      
      // Since login has a setTimeout, we need to wait for it to complete
      await new Promise(resolve => setTimeout(resolve, 1600));

      expect(component.isLoading).toBe(false);
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Error al iniciar sesión');
    });
  });

  describe('Registro', () => {
    it('should not register when form is invalid', () => {
      component.isRegisterMode = true;
      component.email = 'invalid';
      component.password = '';
      spyOn(component, 'validateForm').and.returnValue(false);
      component.register();
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Por favor, corrige los errores en el formulario');
      expect(component.isLoading).toBe(false);
    });

    it('should show loading when register starts', fakeAsync(() => {
      component.isRegisterMode = true;
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.emailExists.and.returnValue(Promise.resolve(false));
      
      component.register();
      expect(component.isLoading).toBe(true);
      tick(1500);
    }));

    it('should show error when email already exists', fakeAsync(() => {
      component.isRegisterMode = true;
      component.email = 'existing@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.emailExists.and.returnValue(Promise.resolve(true));
      
      component.register();
      tick(1500);
      
      expect(component.isLoading).toBe(false);
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Este email ya está registrado');
      expect(userStorageService.saveUser).not.toHaveBeenCalled();
    }));

    it('should register user successfully', fakeAsync(() => {
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        password: '123456',
        createdAt: new Date()
      };
      
      component.isRegisterMode = true;
      component.email = 'newuser@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.emailExists.and.returnValue(Promise.resolve(false));
      userStorageService.saveUser.and.returnValue(Promise.resolve(mockUser as any));
      
      component.register();
      tick(1500);
      
      expect(userStorageService.saveUser).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: '123456'
      });
      expect(component.isLoading).toBe(false);
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toContain('¡Registro exitoso!');
      
      tick(2000);
      expect(component.isRegisterMode).toBe(false);
    }));

    it('should handle registration error', async () => {
      component.isRegisterMode = true;
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      spyOn(component, 'validateForm').and.returnValue(true);
      userStorageService.emailExists.and.returnValue(Promise.resolve(false));
      userStorageService.saveUser.and.returnValue(Promise.reject(new Error('Save error')));
      
      // Capturar errores no manejados
      spyOn(console, 'error');
      
      await component.register();

      // Since register has a setTimeout, we need to wait for it to complete
      await new Promise(resolve => setTimeout(resolve, 1600));
      
      expect(component.isLoading).toBe(false);
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Save error');
    });
  });

  describe('Cambio de Modo', () => {
    it('should toggle between login and register mode', () => {
      expect(component.isRegisterMode).toBe(false);
      component.toggleMode();
      expect(component.isRegisterMode).toBe(true);
      component.toggleMode();
      expect(component.isRegisterMode).toBe(false);
    });

    it('should clear form when toggling mode', () => {
      component.email = 'test@example.com';
      component.password = '123456';
      spyOn(component, 'clearForm');
      component.toggleMode();
      expect(component.clearForm).toHaveBeenCalled();
    });
  });

  describe('Limpieza de Formulario', () => {
    it('should clear all form fields and errors', () => {
      component.email = 'test@example.com';
      component.password = '123456';
      component.confirmPassword = '123456';
      component.emailError = 'Error';
      component.passwordError = 'Error';
      component.confirmPasswordError = 'Error';
      component.isFormValid = true;
      
      component.clearForm();
      
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.confirmPassword).toBe('');
      expect(component.emailError).toBe('');
      expect(component.passwordError).toBe('');
      expect(component.confirmPasswordError).toBe('');
      expect(component.isFormValid).toBe(false);
    });
  });

  describe('Navegación', () => {
    it('should navigate to password recovery page', () => {
      component.goToPasswordRecovery();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/pass-recover');
    });
  });

  /*describe('Animaciones', () => {
    beforeEach(() => {
      // Resetear el spy antes de cada prueba
      animationCtrl.create.calls.reset();
    });

    it('should create and play enter animation', async () => {
      // Simular elementos del DOM
      component.logoContainer = { nativeElement: document.createElement('div') } as any;
      component.formContainer = { nativeElement: document.createElement('div') } as any;
      component.loginContainer = { nativeElement: document.createElement('div') } as any;
      
      await component.playEnterAnimation();
      
      expect(animationCtrl.create).toHaveBeenCalled();
    }, 10000); // Aumentar timeout a 10 segundos

    it('should handle missing elements in enter animation', async () => {
      component.logoContainer = null as any;
      component.formContainer = null as any;
      component.loginContainer = null as any;
      
      spyOn(console, 'warn');
      
      await component.playEnterAnimation();
      
      // No debería lanzar error y no debería llamar a create cuando faltan elementos
      expect(component).toBeTruthy();
      expect(console.warn).toHaveBeenCalledWith('Elementos de animación no encontrados');
    });

    it('should create and play exit animation', async () => {
      component.loginContainer = { nativeElement: document.createElement('div') } as any;
      
      await component.playExitAnimation();
      
      expect(animationCtrl.create).toHaveBeenCalled();
    });

    it('should handle missing container in exit animation', async () => {
      component.loginContainer = null as any;
      
      await component.playExitAnimation();
      
      // No debería lanzar error y no debería llamar a create cuando el container es null
      expect(component).toBeTruthy();
      // No esperamos que se llame create cuando el container es null
      expect(animationCtrl.create).not.toHaveBeenCalled();
    });
  });*/

  describe('Métodos de Desarrollo', () => {
    it('should show user stats', async () => {
      const mockStats = { totalUsers: 5, lastRegistered: new Date() };
      userStorageService.getUserStats.and.returnValue(Promise.resolve(mockStats));
      
      await component.showUserStats();
      
      expect(userStorageService.getUserStats).toHaveBeenCalled();
    });

    it('should show registered users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', password: 'pass', createdAt: new Date() },
        { id: 2, email: 'user2@example.com', password: 'pass', createdAt: new Date() }
      ];
      userStorageService.getUsers.and.returnValue(Promise.resolve(mockUsers as any));
      
      await component.showRegisteredUsers();
      
      expect(userStorageService.getUsers).toHaveBeenCalled();
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toContain('2 usuarios registrados');
    });

    it('should show message when no users are registered', async () => {
      userStorageService.getUsers.and.returnValue(Promise.resolve([]));
      
      await component.showRegisteredUsers();
      
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('No hay usuarios registrados');
    });

    it('should clear all users after confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      userStorageService.clearAllUsers.and.returnValue(Promise.resolve());
      
      await component.clearAllUsers();
      
      expect(userStorageService.clearAllUsers).toHaveBeenCalled();
      expect(component.isToastOpen).toBe(true);
      expect(component.toastMessage).toBe('Todos los usuarios han sido eliminados');
    });

    it('should not clear users if confirmation is cancelled', async () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      await component.clearAllUsers();
      
      expect(userStorageService.clearAllUsers).not.toHaveBeenCalled();
    });
  });
});
