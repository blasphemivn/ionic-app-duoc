import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo, PermissionStatus } from '@capacitor/camera';

@Injectable({
    providedIn: 'root'
})
export class CameraService {

    constructor() { }

    async getPhoto(options: { resultType: CameraResultType, quality?: number, allowEditing?: boolean, source?: CameraSource, presentationStyle?: 'fullscreen' | 'popover' }): Promise<Photo> {
        return Camera.getPhoto(options);
    }

    async checkPermissions(): Promise<PermissionStatus> {
        return Camera.checkPermissions();
    }

    async requestPermissions(options?: { permissions: ('camera' | 'photos')[] }): Promise<PermissionStatus> {
        return Camera.requestPermissions(options);
    }
}
