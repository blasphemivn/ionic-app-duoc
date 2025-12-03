import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CartPage } from './cart.page';
import { CartService } from '../services/cart.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { addIcons } from 'ionicons';
import { trashOutline, removeOutline, addOutline, trashBinOutline, cartOutline, arrowBackOutline } from 'ionicons/icons';

// Register icons globally
addIcons({
  'trash-outline': trashOutline,
  'remove-outline': removeOutline,
  'add-outline': addOutline,
  'trash-bin-outline': trashBinOutline,
  'cart-outline': cartOutline,
  'arrow-back-outline': arrowBackOutline
});

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;
  let cartService: jasmine.SpyObj<CartService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['getCart', 'cart$', 'removeItem', 'increaseQuantity', 'decreaseQuantity', 'clearCart']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of() // Mock the events property with an empty observable
    });

    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    cartService.cart$ = of([]);

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to cart$ and update cartItems', () => {
      const mockCartItems = [
        { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 1 }
      ];
      cartService.cart$ = of(mockCartItems);

      component.ngOnInit();

      expect(component.cartItems).toEqual(mockCartItems);
    });

    it('should call calculateTotal on subscription update', () => {
      spyOn(component, 'calculateTotal');
      const mockCartItems = [
        { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 1 }
      ];
      cartService.cart$ = of(mockCartItems);

      component.ngOnInit();

      expect(component.calculateTotal).toHaveBeenCalled();
    });
  });

  describe('calculateTotal', () => {
    it('should calculate the total price of items in the cart', () => {
      component.cartItems = [
        { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 2 },
        { product: { id: 2, name: 'Product 2', price: 5, category: 'Category 2', image: '', inStock: true }, quantity: 3 }
      ];
      component.calculateTotal();
      expect(component.total).toBe(35); // (10 * 2) + (5 * 3)
    });

    it('should have a total of 0 if the cart is empty', () => {
      component.cartItems = [];
      component.calculateTotal();
      expect(component.total).toBe(0);
    });
  });

  it('should remove item from cart', () => {
    const mockItem = { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 1 };
    component.removeFromCart(mockItem);
    expect(cartService.removeItem).toHaveBeenCalledWith(mockItem);
  });

  it('should increase item quantity', () => {
    const mockItem = { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 1 };
    component.increaseQuantity(mockItem);
    expect(cartService.increaseQuantity).toHaveBeenCalledWith(mockItem);
  });

  it('should decrease item quantity', () => {
    const mockItem = { product: { id: 1, name: 'Product 1', price: 10, category: 'Category 1', image: '', inStock: true }, quantity: 1 };
    component.decreaseQuantity(mockItem);
    expect(cartService.decreaseQuantity).toHaveBeenCalledWith(mockItem);
  });

  it('should clear the cart', () => {
    component.clearCart();
    expect(cartService.clearCart).toHaveBeenCalled();
  });

  it('should navigate to payment on checkout', () => {
    component.checkout();
    expect(router.navigate).toHaveBeenCalledWith(['/payment']);
  });

  it('should navigate to home on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});