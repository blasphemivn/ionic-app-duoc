import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonItem, IonLabel, IonList, IonButton, IonButtons, IonIcon, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';
import { CameraService } from '../services/camera.service';
import { CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { pencilOutline, cameraOutline, logOutOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonItem, IonLabel, IonList, IonButton, IonButtons, IonIcon],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  email = '';
  name = '';
  // señal reactiva para la url de la foto mostrada en el avatar
  photoUrl = signal<string | null>(null);

  // clave usada para almacenar la foto en el almacenamiento local
  private static readonly photoStorageKey = 'profilePhoto';

  constructor(
    private userStorage: UserStorageService,
    private router: Router,
    private cameraService: CameraService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ pencilOutline, cameraOutline, logOutOutline, arrowBackOutline });
  }

  // cargar email y foto guardada al iniciar
  async ngOnInit() {
    const current = this.userStorage.getCurrentUser();
    this.email = current?.email ?? '';

    if (this.email) {
      const user = await this.userStorage.getUserByEmail(this.email);
      this.name = user?.name || 'Usuario';
    }

    const saved = localStorage.getItem(ProfilePage.photoStorageKey);
    if (saved) this.photoUrl.set(saved);
  }

  // abrir prompt del sistema para tomar o elegir foto
  async changePhoto() {
    await this.ensurePermissions();
    const photo = await this.cameraService.getPhoto({
      resultType: CameraResultType.Uri,
      quality: 70,
      allowEditing: false,
      source: CameraSource.Prompt,
      presentationStyle: 'fullscreen'
    });
    // obtener url utilizable en la aplicación
    const webPath = (photo as GalleryPhoto).webPath || photo.webPath || null;
    if (webPath) {
      this.photoUrl.set(webPath);
      localStorage.setItem(ProfilePage.photoStorageKey, webPath);
    }
  }

  // solicitar permisos de cámara y galería si no están concedidos
  private async ensurePermissions() {
    const status = await this.cameraService.checkPermissions();
    if (status.camera !== 'granted' || status.photos !== 'granted') {
      const req = await this.cameraService.requestPermissions({ permissions: ['camera', 'photos'] });
      const camOk = req.camera === 'granted' || req.camera === 'limited';
      const phOk = req.photos === 'granted' || req.photos === 'limited';
      if (!camOk || !phOk) {
        throw new Error('Permisos de cámara/galería denegados');
      }
    }
  }

  async editName() {
    const alert = await this.alertController.create({
      header: 'Editar Nombre',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.name,
          placeholder: 'Tu nombre'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.name && data.name.trim() !== '') {
              const success = await this.userStorage.updateUser(this.email, data.name);
              if (success) {
                this.name = data.name;
                this.presentToast('Nombre actualizado correctamente', 'success');
              } else {
                this.presentToast('Error al actualizar el nombre', 'danger');
              }
            } else {
              this.presentToast('El nombre no puede estar vacío', 'warning');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  // cerrar sesión y redirigir al login
  logout() {
    this.userStorage.clearCurrentUser();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}


