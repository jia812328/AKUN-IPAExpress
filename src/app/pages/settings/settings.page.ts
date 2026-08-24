import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: false,
})
export class SettingsPage {
  darkMode = 'system';
  showHiddenFiles = false;
  fileSort = 'name';
  autoCleanTemp = true;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  changeDarkMode(event: any) {
    const val = event.detail.value;
    document.documentElement.classList.toggle('ion-palette-dark', val === 'dark');
    if (val === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('ion-palette-dark', prefersDark);
    }
  }

  clearCache() {
    this.alertCtrl.create({
      header: '清除缓存',
      message: '确定要清除所有缓存文件吗？',
      buttons: [
        '取消',
        { text: '确定', handler: async () => {
          const toast = await this.toastCtrl.create({ message: '缓存已清除', duration: 2000, position: 'bottom' });
          await toast.present();
        }}
      ]
    }).then(a => a.present());
  }
}