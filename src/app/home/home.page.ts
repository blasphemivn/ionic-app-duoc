import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonButton, IonGrid, IonRow, IonCol, IonSearchbar, IonRefresher, IonRefresherContent, AnimationController } from '@ionic/angular/standalone';

// interfaz para los productos
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, DecimalPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonImg, IonButton, IonGrid, IonRow, IonCol, IonSearchbar, IonRefresher, IonRefresherContent],
})
export class HomePage implements OnInit {
  @ViewChild('homeContainer', { read: ElementRef }) homeContainer!: ElementRef;
  @ViewChild('productsGrid', { read: ElementRef }) productsGrid!: ElementRef;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';

  constructor(private animationCtrl: AnimationController) {}

  ngOnInit() {
    this.loadProducts();
    // animación de entrada cuando se carga la página
    setTimeout(() => {
      this.playEnterAnimation();
    }, 100);
  }

  // cargar productos
  loadProducts() {
    this.products = [
      {
        id: 1,
        name: 'RTX 4080 Super 16GB',
        price: 1400000,
        image: 'https://media.spdigital.cl/thumbnails/products/ww0mcw1i_bb8520b9_thumbnail_512.png',
        description: 'Tarjeta gráfica de alto rendimiento para gaming 4K',
        category: 'Tarjetas Gráficas',
        inStock: true
      },
      {
        id: 2,
        name: 'Intel Core i7-13700K',
        price: 400000,
        image: 'https://media.solotodo.com/media/products/1648741_picture_1664520596.jpg',
        description: 'Procesador de 16 núcleos para gaming y productividad',
        category: 'Procesadores',
        inStock: true
      },
      {
        id: 3,
        name: 'Teclado Mecánico RGB',
        price: 130000,
        image: 'https://www.winpy.cl/files/33309-8123-HyperX-Alloy-Origins-1.jpg',
        description: 'Teclado gaming con switches Cherry MX y retroiluminación RGB',
        category: 'Periféricos',
        inStock: true
      },
      {
        id: 4,
        name: 'SSD NVMe 2TB',
        price: 150000,
        image: 'https://media.spdigital.cl/thumbnails/products/jpe6hd0i_3209cbe3_thumbnail_4096.jpg',
        description: 'Almacenamiento ultrarrápido para sistema y juegos',
        category: 'Almacenamiento',
        inStock: false
      },
      {
        id: 5,
        name: 'VXE r1 PRO MAX',
        price: 36000,
        image: 'https://i.ytimg.com/vi/jJ_UQmw_Fmo/maxresdefault.jpg',
        description: 'Mouse de precisión con sensor óptico de 16000 DPI',
        category: 'Periféricos',
        inStock: true
      },
      {
        id: 6,
        name: 'Placa Madre Z790',
        price: 250000,
        image: 'https://www.asus.com/microsite/motherboard/Intel-Raptor-Lake-Z790-H770-B760/es/v1/img/pd/rog-strix-z790-f-gaming-wifi.png',
        description: 'Placa madre para Intel 12th/13th gen con WiFi 6E',
        category: 'Placas Base',
        inStock: true
      },
      {
        id: 7,
        name: 'RAM DDR5 32GB',
        price: 99990,
        image: 'https://media.spdigital.cl/thumbnails/products/jiilrvjj_607a5545_thumbnail_4096.jpg',
        description: 'Memoria RAM de alta velocidad 5600MHz',
        category: 'Memoria RAM',
        inStock: true
      },
      {
        id: 8,
        name: 'Fuente de Poder 850W',
        price: 110000,
        image: 'https://s3.amazonaws.com/w3.assets/fotos/34239/1..webp?v=259272006',
        description: 'Fuente modular 80+ Gold para sistemas de alto consumo',
        category: 'Fuentes de Poder',
        inStock: true
      },
      {
        id: 9,
        name: 'Monitor Gaming 27" 144Hz',
        price: 200000,
        image: 'https://media.spdigital.cl/thumbnails/products/fbe6xvuk_35a260c4_thumbnail_512.jpg',
        description: 'Monitor QHD con FreeSync y HDR para gaming competitivo',
        category: 'Monitores',
        inStock: true
      }
    ];
    this.filteredProducts = [...this.products];
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
    setTimeout(() => {
      this.loadProducts();
      event.target.complete();
    }, 1000);
  }

  // agregar al carrito 
  addToCart(product: Product) {
    console.log('Agregando al carrito:', product);
    // aquí implementar la lógica del carrito
  }

  // ver detalles del producto
  viewProduct(product: Product) {
    console.log('Ver producto:', product);
    
  }

  // funcion trackBy para optimizar el rendimiento del ngFor
  trackByProductId(index: number, product: Product): number {
    return product.id;
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
