import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProfilePage } from './profile.page';
import { UserStorageService } from '../services/user-storage.service';
import { Camera, PermissionStatus, Photo } from '@capacitor/camera';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let userStorageService: jasmine.SpyObj<UserStorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userStorageServiceSpy = jasmine.createSpyObj('UserStorageService', ['getCurrentUser', 'clearCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfilePage, RouterLink],
      providers: [
        { provide: UserStorageService, useValue: userStorageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '' } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    userStorageService = TestBed.inject(UserStorageService) as jasmine.SpyObj<UserStorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Default mocks
    userStorageService.getCurrentUser.and.returnValue({ email: 'test@example.com', loginTime: new Date().toISOString() });
    localStorage.clear();
    spyOn(Camera, 'checkPermissions').and.resolveTo({ camera: 'granted', photos: 'granted' } as PermissionStatus);
    spyOn(Camera, 'requestPermissions').and.resolveTo({ camera: 'granted', photos: 'granted' } as any);
    spyOn(Camera, 'getPhoto').and.resolveTo({ webPath: 'new-photo.jpg', saved: true, format: 'jpeg' } as Photo);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load email and photo on init', fakeAsync(() => {
      const photoUrl = 'test-photo.jpg';
      localStorage.setItem('profilePhoto', photoUrl);
      
      component.ngOnInit();
      tick();

      expect(component.email).toBe('test@example.com');
      expect(component.photoUrl()).toBe(photoUrl);
    }));
  });

  describe('changePhoto', () => {
    it('should change photo successfully', fakeAsync(() => {
      component.changePhoto();
      tick();

      expect(component.photoUrl()).toBe('new-photo.jpg');
      expect(localStorage.getItem('profilePhoto')).toBe('new-photo.jpg');
    }));

    it('should request permissions if not granted', fakeAsync(() => {
        (Camera.checkPermissions as jasmine.Spy).and.resolveTo({ camera: 'denied', photos: 'denied' } as PermissionStatus);
      
        component.changePhoto();
        tick();
  
        expect(Camera.requestPermissions).toHaveBeenCalled();
      }));
  });

  describe('logout', () => {
    it('should clear user and navigate to login', () => {
      component.logout();
      expect(userStorageService.clearCurrentUser).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    });
  });
});