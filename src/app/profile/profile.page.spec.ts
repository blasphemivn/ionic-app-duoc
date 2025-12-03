import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfilePage } from './profile.page';
import { UserStorageService } from '../services/user-storage.service';
import { CameraService } from '../services/camera.service';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { pencilOutline, cameraOutline, logOutOutline, arrowBackOutline } from 'ionicons/icons';

// Register icons globally
addIcons({ pencilOutline, cameraOutline, logOutOutline, arrowBackOutline });

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let userStorageService: jasmine.SpyObj<UserStorageService>;
  let router: jasmine.SpyObj<Router>;
  let cameraService: jasmine.SpyObj<CameraService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    const userStorageSpy = jasmine.createSpyObj('UserStorageService', ['getCurrentUser', 'clearCurrentUser', 'getUserByEmail', 'updateUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: of()
    });
    const cameraServiceSpy = jasmine.createSpyObj('CameraService', ['checkPermissions', 'requestPermissions', 'getPhoto']);
    const alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    // Mock return values
    userStorageSpy.getCurrentUser.and.returnValue({ email: 'test@example.com', loginTime: new Date().toISOString() });
    userStorageSpy.getUserByEmail.and.returnValue(Promise.resolve({ id: '1', email: 'test@example.com', password: '123', name: 'Test User', createdAt: new Date() }));
    userStorageSpy.updateUser.and.returnValue(Promise.resolve(true));

    const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: UserStorageService, useValue: userStorageSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CameraService, useValue: cameraServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    userStorageService = TestBed.inject(UserStorageService) as jasmine.SpyObj<UserStorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    cameraService = TestBed.inject(CameraService) as jasmine.SpyObj<CameraService>;
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', async () => {
    await component.ngOnInit();
    expect(component.email).toBe('test@example.com');
    expect(component.name).toBe('Test User');
    expect(userStorageService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should logout', () => {
    component.logout();
    expect(userStorageService.clearCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('should change photo successfully', async () => {
    cameraService.checkPermissions.and.returnValue(Promise.resolve({ camera: 'granted', photos: 'granted' } as any));
    cameraService.getPhoto.and.returnValue(Promise.resolve({ webPath: 'test-path' } as any));

    await component.changePhoto();

    expect(component.photoUrl()).toBe('test-path');
  });

  it('should request permissions if not granted', async () => {
    cameraService.checkPermissions.and.returnValue(Promise.resolve({ camera: 'denied', photos: 'denied' } as any));
    cameraService.requestPermissions.and.returnValue(Promise.resolve({ camera: 'granted', photos: 'granted' } as any));
    cameraService.getPhoto.and.returnValue(Promise.resolve({ webPath: 'test-path' } as any));

    await component.changePhoto();

    expect(cameraService.requestPermissions).toHaveBeenCalled();
    expect(component.photoUrl()).toBe('test-path');
  });

  it('should throw error if permissions denied', async () => {
    cameraService.checkPermissions.and.returnValue(Promise.resolve({ camera: 'denied', photos: 'denied' } as any));
    cameraService.requestPermissions.and.returnValue(Promise.resolve({ camera: 'denied', photos: 'denied' } as any));

    await expectAsync(component.changePhoto()).toBeRejectedWithError('Permisos de cámara/galería denegados');
  });

  it('should open edit name alert', async () => {
    await component.editName();
    expect(alertController.create).toHaveBeenCalled();
  });
});