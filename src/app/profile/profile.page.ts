import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonItem, IonLabel, IonList, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { UserStorageService } from '../services/user-storage.service';
import { Camera, CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonItem, IonLabel, IonList, IonButton, IonButtons, IonIcon],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  email = '';
  // señal reactiva para la url de la foto mostrada en el avatar
  photoUrl = signal<string | null>(null);

  // clave usada para almacenar la foto en el almacenamiento local
  private static readonly photoStorageKey = 'profilePhoto';

  constructor(private userStorage: UserStorageService, private router: Router) {}

  // cargar email y foto guardada al iniciar
  async ngOnInit() {
    const current = this.userStorage.getCurrentUser();
    this.email = current?.email ?? '';
    const saved = localStorage.getItem(ProfilePage.photoStorageKey);
    if (saved) this.photoUrl.set(saved);
  }

  // abrir prompt del sistema para tomar o elegir foto
  async changePhoto() {
    await this.ensurePermissions();
    const photo = await Camera.getPhoto({
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
    const status = await Camera.checkPermissions();
    if (status.camera !== 'granted' || status.photos !== 'granted') {
      const req = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      const camOk = req.camera === 'granted' || req.camera === 'limited';
      const phOk = req.photos === 'granted' || req.photos === 'limited';
      if (!camOk || !phOk) {
        throw new Error('Permisos de cámara/galería denegados');
      }
    }
  }

  // cerrar sesión y redirigir al login
  logout() {
    this.userStorage.clearCurrentUser();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}


