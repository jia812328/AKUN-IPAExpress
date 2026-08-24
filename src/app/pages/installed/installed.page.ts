import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular/lazy';

interface InstalledApp {
  name: string; version: string; bundleId: string;
  status: string; statusText: string;
}

@Component({
  selector: 'app-installed',
  templateUrl: 'installed.page.html',
  styleUrls: ['installed.page.scss'],
  standalone: false,
})
export class InstalledPage {
  installedApps: InstalledApp[] = [];

  get signedCount(): number { return this.installedApps.filter(a => a.status === 'success').length; }
  get expiredCount(): number { return this.installedApps.filter(a => a.status === 'warning').length; }

  constructor(private alertCtrl: AlertController) {}

  openApp(index: number) {
    this.alertCtrl.create({
      header: '打开应用',
      message: `尝试打开 ${this.installedApps[index].name}`,
      buttons: ['确定']
    }).then(a => a.present());
  }

  uninstallApp(index: number) {
    this.alertCtrl.create({
      header: '卸载确认',
      message: `确定要卸载 ${this.installedApps[index].name} 吗？`,
      buttons: ['取消', {
        text: '卸载', role: 'destructive',
        handler: () => { this.installedApps.splice(index, 1); }
      }]
    }).then(a => a.present());
  }
}