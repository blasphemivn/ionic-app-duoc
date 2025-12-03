import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductPage } from './product.page';
import { ProductsService, Product } from '../services/products.service';
import { CartService } from '../services/cart.service';
import { ToastController } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProductPage', () => {
  let component: ProductPage;
  let fixture: ComponentFixture<ProductPage>;
  let activatedRoute: any;
  let router: jasmine.SpyObj<Router>;
  let productsService: jasmine.SpyObj<ProductsService>;
  let cartService: jasmine.SpyObj<CartService>;
  let toastController: jasmine.SpyObj<ToastController>;

  const mockProduct: Product = { id: 1, name: 'Test Product', price: 100, category: 'Test Category', image: '', inStock: true };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of() // Mock the events property with an empty observable
    });
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProductById']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(mockToast));

    await TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1',
              },
            },
          },
        },
        { provide: Router, useValue: routerSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPage);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productsService = TestBed.inject(ProductsService) as jasmine.SpyObj<ProductsService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
  });

  it('should create', () => {
    productsService.getProductById.and.returnValue(of(mockProduct));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load product on init', () => {
      productsService.getProductById.and.returnValue(of(mockProduct));
      fixture.detectChanges();
      expect(component.product).toEqual(mockProduct);
    });

    it('should navigate to home if product not found', () => {
      productsService.getProductById.and.returnValue(throwError(() => new Error('Product not found')));
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not load product if id is not present', () => {
      spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue(null);
      fixture.detectChanges();
      expect(productsService.getProductById).not.toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    beforeEach(() => {
        productsService.getProductById.and.returnValue(of(mockProduct));
        fixture.detectChanges();
    });

    it('should add product to cart and show toast', async () => {
      await component.addToCart();
      expect(cartService.addToCart).toHaveBeenCalledWith(mockProduct);
      expect(toastController.create).toHaveBeenCalledWith({
        message: `${mockProduct.name} agregado al carrito.`,
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
    });

    it('should not add to cart if product is not defined', async () => {
        component.product = undefined;
        await component.addToCart();
        expect(cartService.addToCart).not.toHaveBeenCalled();
        expect(toastController.create).not.toHaveBeenCalled();
      });
  });
});