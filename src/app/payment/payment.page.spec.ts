import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PaymentPage } from './payment.page';
import { CartService } from '../services/cart.service';
import { ToastController, AnimationController } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PaymentPage', () => {
  let component: PaymentPage;
  let fixture: ComponentFixture<PaymentPage>;
  let router: jasmine.SpyObj<Router>;
  let cartService: jasmine.SpyObj<CartService>;
  let toastController: jasmine.SpyObj<ToastController>;
  let animationCtrl: jasmine.SpyObj<AnimationController>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of() // Mock the events property with an empty observable
    });
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['clearCart']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const animationCtrlSpy = jasmine.createSpyObj('AnimationController', ['create']);
    
    const mockAnimation = jasmine.createSpyObj('Animation', ['addElement', 'duration', 'fromTo', 'play']);
    mockAnimation.addElement.and.returnValue(mockAnimation);
    mockAnimation.duration.and.returnValue(mockAnimation);
    mockAnimation.fromTo.and.returnValue(mockAnimation);
    mockAnimation.play.and.returnValue(Promise.resolve());
    animationCtrlSpy.create.and.returnValue(mockAnimation);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [PaymentPage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: AnimationController, useValue: animationCtrlSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    animationCtrl = TestBed.inject(AnimationController) as jasmine.SpyObj<AnimationController>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a payment method', () => {
    const method = 'credit-card';
    component.selectPaymentMethod(method);
    expect(component.selectedPaymentMethod).toBe(method);
  });

  describe('simulatePayment', () => {
    it('should show a warning if no payment method is selected', async () => {
      component.selectedPaymentMethod = '';
      await component.simulatePayment();
      expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: 'Por favor, selecciona un método de pago.',
        color: 'warning'
      }));
    });

    it('should process payment successfully', fakeAsync(() => {
      component.selectedPaymentMethod = 'credit-card';
      component.simulatePayment();

      expect(component.isLoading).toBeTrue();
      
      tick(2000); // Fast-forward through the payment delay

      expect(component.isLoading).toBeFalse();
      expect(cartService.clearCart).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith(jasmine.objectContaining({
        message: '¡Pago realizado con éxito!',
        color: 'success'
      }));
      
      tick(1000); // Fast-forward through the navigation delay

      expect(router.navigate).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
    }));

    it('should play success animation on successful payment', fakeAsync(() => {
      component.selectedPaymentMethod = 'credit-card';
      // Manually create a mock element for the animation
      const successEl = document.createElement('div');
      component.successAnimationEl = { nativeElement: successEl };
      
      component.simulatePayment();
      tick(2000);
      
      fixture.detectChanges(); // To be sure the animation element is there

      expect(animationCtrl.create).toHaveBeenCalled();
      
      tick(1000);
    }));
  });

  it('should present a toast', async () => {
    await component.presentToast('Test message');
    expect(toastController.create).toHaveBeenCalledWith({
      message: 'Test message',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
  });
});