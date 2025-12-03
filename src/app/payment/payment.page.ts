import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonRadioGroup, IonRadio, IonButton, IonIcon, IonSpinner, ToastController, AnimationController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonRadioGroup, IonRadio, IonButton, IonIcon, IonSpinner]
})
export class PaymentPage implements OnInit {

  @ViewChild('successAnimation', { read: ElementRef }) successAnimationEl!: ElementRef;

  selectedPaymentMethod: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastController: ToastController,
    private animationCtrl: AnimationController
  ) { }

  ngOnInit() {
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  async simulatePayment() {
    if (!this.selectedPaymentMethod) {
      this.presentToast('Por favor, selecciona un método de pago.');
      return;
    }

    this.isLoading = true;

    // Simulate a delay for payment processing
    setTimeout(async () => {
      this.isLoading = false;
      this.cartService.clearCart();

      const toast = await this.toastController.create({
        message: '¡Pago realizado con éxito!',
        duration: 2000,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      });
      await toast.present();

      // Play a success animation
      if (this.successAnimationEl) {
        const successAnimation = this.animationCtrl.create()
          .addElement(this.successAnimationEl.nativeElement)
          .duration(1000)
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'scale(0.5)', 'scale(1)');

        await successAnimation.play();
      }


      setTimeout(() => {
        this.router.navigate(['/home'], { replaceUrl: true });
      }, 1000);
    }, 2000);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    toast.present();
  }
}
