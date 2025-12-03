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
    // Suscribirse a los cambios del carrito para actualizar la lista y el total
    this.cartService.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.calculateTotal();
    });
  }

  // Calcular el total de la compra sumando precio * cantidad de cada item
  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  // Eliminar un producto del carrito
  removeFromCart(item: CartItem) {
    this.cartService.removeItem(item);
  }

  // Aumentar la cantidad de un producto
  increaseQuantity(item: CartItem) {
    this.cartService.increaseQuantity(item);
  }

  // Disminuir la cantidad de un producto
  decreaseQuantity(item: CartItem) {
    this.cartService.decreaseQuantity(item);
  }

  // Vaciar todo el carrito
  clearCart() {
    this.cartService.clearCart();
  }

  // Ir a la página de pago
  checkout() {
    this.router.navigate(['/payment']);
  }

  // Volver a la página de inicio
  goBack() {
    this.router.navigate(['/home']);
  }
}
