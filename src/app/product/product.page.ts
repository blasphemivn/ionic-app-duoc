import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService, Product } from '../services/products.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, DecimalPipe]
})
export class ProductPage implements OnInit {

  product: Product | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private cartService: CartService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productsService.getProductById(+id).subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (err) => {
          console.error('Error fetching product', err);
          this.router.navigate(['/home']);
        }
      });
    }
  }

  async addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      const toast = await this.toastController.create({
        message: `${this.product.name} agregado al carrito.`,
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
    }
  }
}
