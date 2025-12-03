import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './products.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cart.asObservable();

  constructor() { }

  addToCart(product: Product) {
    const currentCart = this.cart.getValue();
    const existingItem = currentCart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1 });
    }

    this.cart.next(currentCart);
  }

  getCart() {
    return this.cart.getValue();
  }

  clearCart() {
    this.cart.next([]);
  }

  getCartItemCount() {
    return this.cart.getValue().reduce((acc, item) => acc + item.quantity, 0);
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
    this.cart.next(this.getCart());
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item);
    }
    this.cart.next(this.getCart());
  }

  removeItem(item: CartItem) {
    const currentCart = this.getCart();
    const updatedCart = currentCart.filter(i => i.product.id !== item.product.id);
    this.cart.next(updatedCart);
  }
}
