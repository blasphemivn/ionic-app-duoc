import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService, Product } from '../services/products.service';
import { CartService } from '../services/cart.service';
import { UserStorageService } from '../services/user-storage.service';
import { AnimationController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let router: jasmine.SpyObj<Router>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartService: jasmine.SpyObj<CartService>;
  let userStorageService: jasmine.SpyObj<UserStorageService>;
  let animationCtrl: jasmine.SpyObj<AnimationController>;
  let toastController: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProducts']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart', 'getCart', 'cart$']);
    const userStorageServiceSpy = jasmine.createSpyObj('UserStorageService', ['clearCurrentUser']);
    const animationCtrlSpy = jasmine.createSpyObj('AnimationController', ['create']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    const mockAnimation = jasmine.createSpyObj('Animation', ['addElement', 'duration', 'easing', 'fromTo', 'play']);
    mockAnimation.addElement.and.returnValue(mockAnimation);
    mockAnimation.duration.and.returnValue(mockAnimation);
    mockAnimation.easing.and.returnValue(mockAnimation);
    mockAnimation.fromTo.and.returnValue(mockAnimation);
    mockAnimation.play.and.returnValue(Promise.resolve());
    animationCtrlSpy.create.and.returnValue(mockAnimation);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast));

    productsServiceSpy.getProducts.and.returnValue(of([]));
    cartServiceSpy.cart$ = of([]);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: UserStorageService, useValue: userStorageServiceSpy },
        { provide: AnimationController, useValue: animationCtrlSpy },
        { provide: ToastController, useValue: toastControllerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    userStorageService = TestBed.inject(UserStorageService) as jasmine.SpyObj<UserStorageService>;
    animationCtrl = TestBed.inject(AnimationController) as jasmine.SpyObj<AnimationController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadProducts on ngOnInit', () => {
      spyOn(component, 'loadProducts');
      component.ngOnInit();
      expect(component.loadProducts).toHaveBeenCalled();
    });

    it('should subscribe to cartService.cart$ and update cartItemCount', () => {
      const mockCart = [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 3 }];
      cartService.cart$ = of(mockCart as any);
      component.ngOnInit();
      expect(component.cartItemCount).toBe(5);
    });

    it('should call playEnterAnimation after a timeout on ngOnInit', fakeAsync(() => {
      spyOn(component, 'playEnterAnimation');
      component.ngOnInit();
      tick(100);
      expect(component.playEnterAnimation).toHaveBeenCalled();
    }));
  });

  describe('ionViewWillEnter', () => {
    it('should load profile photo from localStorage', () => {
      const mockPhoto = 'mock-photo-url';
      spyOn(localStorage, 'getItem').and.returnValue(mockPhoto);
      component.ionViewWillEnter();
      expect(localStorage.getItem).toHaveBeenCalledWith('profilePhoto');
      expect(component.profilePhoto).toBe(mockPhoto);
    });

    it('should set profilePhoto to null if no photo in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      component.ionViewWillEnter();
      expect(localStorage.getItem).toHaveBeenCalledWith('profilePhoto');
      expect(component.profilePhoto).toBeNull();
    });
  });

  describe('loadProducts', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product A', category: 'Category 1', price: 10, image: 'imgA.jpg', inStock: true, description: 'Desc A' },
      { id: 2, name: 'Product B', category: 'Category 2', price: 20, image: 'imgB.jpg', inStock: true, description: 'Desc B' },
    ];

    it('should load products and update filteredProducts on success', () => {
      productsService.getProducts.and.returnValue(of(mockProducts));
      component.loadProducts();
      expect(component.products).toEqual(mockProducts);
      expect(component.filteredProducts).toEqual(mockProducts);
    });

    it('should set products and filteredProducts to empty arrays on error', () => {
      productsService.getProducts.and.returnValue(throwError(() => new Error('test error')));
      component.loadProducts();
      expect(component.products).toEqual([]);
      expect(component.filteredProducts).toEqual([]);
    });
  });

  describe('onSearchChange', () => {
    const allProducts: Product[] = [
      { id: 1, name: 'Apple', category: 'Fruit', description: 'Red fruit', price: 1, image: 'apple.jpg', inStock: true },
      { id: 2, name: 'Banana', category: 'Fruit', description: 'Yellow fruit', price: 0.5, image: 'banana.jpg', inStock: true },
      { id: 3, name: 'Carrot', category: 'Vegetable', description: 'Orange root', price: 0.75, image: 'carrot.jpg', inStock: true },
    ];

    beforeEach(() => {
      component.products = allProducts;
      component.filteredProducts = allProducts;
    });

    it('should filter products by name', () => {
      component.onSearchChange({ detail: { value: 'app' } });
      expect(component.filteredProducts).toEqual([allProducts[0]]);
    });

    it('should filter products by category', () => {
      component.onSearchChange({ detail: { value: 'veg' } });
      expect(component.filteredProducts).toEqual([allProducts[2]]);
    });

    it('should filter products by description', () => {
      component.onSearchChange({ detail: { value: 'yellow' } });
      expect(component.filteredProducts).toEqual([allProducts[1]]);
    });

    it('should show all products if search term is empty', () => {
      component.onSearchChange({ detail: { value: '' } });
      expect(component.filteredProducts).toEqual(allProducts);
    });

    it('should be case-insensitive', () => {
      component.onSearchChange({ detail: { value: 'APPLE' } });
      expect(component.filteredProducts).toEqual([allProducts[0]]);
    });
  });

  describe('doRefresh', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'New Apple', category: 'Fruit', price: 10, image: 'new_apple.jpg', inStock: true, description: 'New Desc A' },
    ];
    let refreshEventSpy: jasmine.SpyObj<any>; // Using any because HTMLIonRefresherElement is not directly available

    beforeEach(() => {
      refreshEventSpy = { target: jasmine.createSpyObj('target', ['complete']) };
      component.searchTerm = 'new';
      spyOn(component, 'onSearchChange');
    });

    it('should refresh products and re-apply search term on success', fakeAsync(() => {
      productsService.getProducts.and.returnValue(of(mockProducts));
      
      component.doRefresh(refreshEventSpy);
      tick(); // Simulate the observable completing

      expect(productsService.getProducts).toHaveBeenCalled();
      expect(component.products).toEqual(mockProducts);
      expect(component.onSearchChange).toHaveBeenCalledWith({ detail: { value: component.searchTerm } });
      expect(refreshEventSpy.target.complete).toHaveBeenCalled();
    }));

    it('should call event.target.complete on error', fakeAsync(() => {
      const initialProducts: Product[] = [
        { id: 10, name: 'Old Product', category: 'Old Category', price: 5, image: 'old.jpg', inStock: true },
      ];
      component.products = initialProducts;
      component.filteredProducts = initialProducts;

      productsService.getProducts.and.returnValue(throwError(() => new Error('refresh error')));
      
      component.doRefresh(refreshEventSpy);
      tick(); // Simulate the observable completing

      expect(productsService.getProducts).toHaveBeenCalled();
      expect(refreshEventSpy.target.complete).toHaveBeenCalled();
      expect(component.products).toEqual(initialProducts); 
      expect(component.filteredProducts).toEqual(initialProducts); 
    }));
  });

  describe('addToCart', () => {
    it('should add product to cart and show toast', async () => {
      const mockProduct: Product = { id: 1, name: 'Test Product', category: 'Test', price: 10, image: 'test.jpg', inStock: true };
      const mockToastInstance = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastController.create.and.returnValue(Promise.resolve(mockToastInstance));

      await component.addToCart(mockProduct);
      
      expect(cartService.addToCart).toHaveBeenCalledWith(mockProduct);
      expect(toastController.create).toHaveBeenCalledWith({
        message: `${mockProduct.name} agregado al carrito.`,
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      expect(mockToastInstance.present).toHaveBeenCalled();
    });
  });

  describe('viewProduct', () => {
    it('should navigate to product details page', () => {
      const mockProduct: Product = { id: 1, name: 'Test Product', category: 'Test', price: 10, image: 'test.jpg', inStock: true };
      component.viewProduct(mockProduct);
      expect(router.navigate).toHaveBeenCalledWith(['/product', mockProduct.id]);
    });
  });

  describe('logout', () => {
    it('should clear current user and navigate to login page', () => {
      component.logout();
      expect(userStorageService.clearCurrentUser).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('playEnterAnimation', () => {
    beforeEach(() => {
      animationCtrl.create.calls.reset();
    });

    it('should create and play animations when elements exist', async () => {
      component.homeContainer = { nativeElement: document.createElement('div') } as any;
      component.productsGrid = { nativeElement: document.createElement('div') } as any;
      
      await component.playEnterAnimation();
      
      expect(animationCtrl.create).toHaveBeenCalledTimes(2); // One for homeContainer, one for productsGrid
    }, 10000);

    it('should not create animations when elements are missing', async () => {
      component.homeContainer = null as any;
      component.productsGrid = null as any;

      await component.playEnterAnimation();

      expect(animationCtrl.create).not.toHaveBeenCalled();
    });
  });
});