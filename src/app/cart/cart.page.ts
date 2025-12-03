import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon, IonFooter, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CartService, CartItem } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonThumbnail, IonButton, IonIcon, IonFooter, IonGrid, IonRow, IonCol, DecimalPipe]
})
export class CartPage implements OnInit {

  cartItems: CartItem[] = [];
  total = 0;

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  removeFromCart(item: CartItem) {
    this.cartService.removeItem(item);
  }

  increaseQuantity(item: CartItem) {
    this.cartService.increaseQuantity(item);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.decreaseQuantity(item);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  checkout() {
    this.router.navigate(['/payment']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
