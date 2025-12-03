import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonButton, IonGrid, IonRow, IonCol, IonSearchbar, IonRefresher, IonRefresherContent, IonButtons, AnimationController, IonAvatar, ToastController, IonBadge } from '@ionic/angular/standalone';
import { ProductsService, Product } from '../services/products.service';
import { CartService } from '../services/cart.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, DecimalPipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonButton, IonGrid, IonRow, IonCol, IonSearchbar, IonRefresher, IonRefresherContent, IonButtons, IonAvatar, IonBadge],
})
export class HomePage implements OnInit {
  @ViewChild('homeContainer', { read: ElementRef }) homeContainer!: ElementRef;
  @ViewChild('productsGrid', { read: ElementRef }) productsGrid!: ElementRef;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  profilePhoto: string | null = null;
  cartItemCount = 0;

  constructor(
    private animationCtrl: AnimationController,
    private router: Router,
    private userStorageService: UserStorageService,
    private productsService: ProductsService,
    private cartService: CartService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    });
    // animación de entrada cuando se carga la página
    setTimeout(() => {
      this.playEnterAnimation();
    }, 100);
  }

  ionViewWillEnter() {
    // Cargar foto de perfil cada vez que se entra a la vista
    this.profilePhoto = localStorage.getItem('profilePhoto');
  }

  // cargar productos
  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        console.log('[HomePage] productos recibidos:', products?.length);
        this.products = products;
        this.filteredProducts = [...this.products];
      },
      error: (err) => {
        console.error('Error cargando productos desde la API', err);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  // filtrar productos por búsqueda
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm) ||
      product.category.toLowerCase().includes(this.searchTerm) ||
      product.description?.toLowerCase().includes(this.searchTerm)
    );
  }

  // actualizar productos
  doRefresh(event: any) {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.onSearchChange({ detail: { value: this.searchTerm } });
        event.target.complete();
      },
      error: () => {
        event.target.complete();
      }
    });
  }

  // agregar al carrito 
  async addToCart(product: Product) {
    this.cartService.addToCart(product);
    const toast = await this.toastController.create({
      message: `${product.name} agregado al carrito.`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  // ver detalles del producto
  viewProduct(product: Product) {
    this.router.navigate(['/product', product.id]);
  }

  // funcion trackBy para optimizar el rendimiento del ngFor
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Método para cerrar sesión
  logout() {
    // Eliminar el usuario actual
    this.userStorageService.clearCurrentUser();
    console.log('Sesión cerrada');
    // Redirigir al login
    this.router.navigateByUrl('/login');
  }

  // animación de entrada para la home page
  async playEnterAnimation() {
    // verificar que los elementos existen antes de animar
    if (this.homeContainer?.nativeElement) {
      const containerAnimation = this.animationCtrl.create()
        .addElement(this.homeContainer.nativeElement)
        .duration(800)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(20px)', 'translateY(0)');

      await containerAnimation.play();
    }

    if (this.productsGrid?.nativeElement) {
      const gridAnimation = this.animationCtrl.create()
        .addElement(this.productsGrid.nativeElement)
        .duration(1000)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(30px)', 'translateY(0)');

      await gridAnimation.play();
    }
  }
}
