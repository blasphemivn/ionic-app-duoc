import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  inStock: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private get baseUrl(): string {
    const base = environment.apiBaseUrl;
    if (Capacitor.getPlatform() === 'android') {
      try {
        const u = new URL(base);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
          u.hostname = '10.0.2.2';
          // mantener protocolo y puerto
          return u.toString().replace(/\/$/, '');
        }
      } catch {
        // si base no es una URL valida, reemplazar localhost por 10.0.2.2
        return base.replace('localhost', '10.0.2.2');
      }
    }
    return base;
  }

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    const url = `${this.baseUrl}/products`;
    console.log('[ProductsService] GET', url);
    return this.http.get<Product[]>(url);
  }

  getProductById(id: number): Observable<Product> {
    return this.getProducts().pipe(
      map(products => {
        const product = products.find(p => p.id === id);
        if (product) {
          return product;
        } else {
          throw new Error(`Product with id ${id} not found`);
        }
      })
    );
  }
}


