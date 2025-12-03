import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      const currentUrl = this.router.url;

      // Define routes where the app should exit on back button press
      const exitAppRoutes = ['/login', '/home'];

      if (exitAppRoutes.includes(currentUrl)) {
        App.minimizeApp();
      } else {
        // For other routes, navigate back
        this.location.back();
      }
    });
  }
}
