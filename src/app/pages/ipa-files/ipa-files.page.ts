import { Component } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import { FileStore, IpaFile } from '../../services/file-store.service';
import { AppSelectorPage } from '../app-selector/app-selector.page';

@Component({
  selector: 'app-ipa-files',
  templateUrl: 'ipa-files.page.html',
  styleUrls: ['ipa-files.page.scss'],
  standalone: false,
})
export class IpaFilesPage {
  searchQuery = '';
  currentFilter = 'all';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private router: Router,
    public store: FileStore
  ) {}

  get allFiles(): IpaFile[] { return this.store.files; }

  get filteredFiles(): IpaFile[] {
    let list = this.store.files;
    if (this.currentFilter !== 'all') {
      list = list.filter(f => f.type === this.currentFilter);
    }
    const q = this.searchQuery.toLowerCase();
    return q ? list.filter(f => f.name.toLowerCase().includes(q)) : list;
  }

  get ipaCount(): number { return this.store.getByType('ipa').length; }
  get dylibCount(): number { return this.store.getByType('dylib').length; }
  get certCount(): number { return this.store.getByType('p12').length; }
  get provCount(): number { return this.store.getByType('mobileprovision').length; }

  get signedCount(): number {
    return this.store.getByType('ipa').filter(f => f.status === 'success').length;
  }

  get totalSize(): string {
    const totalMB = this.store.files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0) / (1024 * 1024);
    if (totalMB === 0) return '0 MB';
    return totalMB >= 1024 ? (totalMB / 1024).toFixed(1) + ' GB' : totalMB.toFixed(0) + ' MB';
  }

  setFilter(type: string) { this.currentFilter = type; }
  filterFiles() {}

  importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => {
      const imported: IpaFile[] = [];
      for (const file of e.target.files) {
        const name = file.name;
        const ext = name.split('.').pop()?.toLowerCase() || '';
        let type: IpaFile['type'] = 'other';
        if (ext === 'ipa') type = 'ipa';
        else if (['dylib', 'deb'].includes(ext)) type = 'dylib';
        else if (['p12', 'pfx'].includes(ext)) type = 'p12';
        else if (ext === 'mobileprovision') type = 'mobileprovision';

        imported.push({
          name,
          size: this.formatSize(file.size),
          sizeBytes: file.size,
          date: new Date().toLocaleDateString('zh-CN'),
          status: 'info',
          statusText: type === 'ipa' ? '待签名' : '就绪',
          type,
          icon: this.getFileIcon(type),
          iconBg: this.getFileColor(type)
        });
      }
      this.store.addMultiple(imported);
      this.showToast(`已导入 ${imported.length} 个文件`);
    };
    input.click();
  }

  async importFromUrl() {
    const alert = await this.alertCtrl.create({
      header: '下载文件',
      inputs: [{ name: 'url', type: 'url', placeholder: 'https://example.com/file.ipa' }],
      buttons: ['取消', {
        text: '下载',
        handler: (data) => {
          if (data.url) {
            const name = data.url.split('/').pop() || 'unknown';
            const ext = name.split('.').pop()?.toLowerCase() || '';
            let type: IpaFile['type'] = 'other';
            if (ext === 'ipa') type = 'ipa';
            else if (['dylib', 'deb'].includes(ext)) type = 'dylib';
            else if (['p12', 'pfx'].includes(ext)) type = 'p12';
            else if (ext === 'mobileprovision') type = 'mobileprovision';

            this.store.add({
              name, size: '下载中...', sizeBytes: 0,
              date: new Date().toLocaleDateString('zh-CN'),
              status: 'warning', statusText: '下载中', type,
              icon: 'cloud-download-outline', iconBg: 'rgba(255,149,0,0.15)'
            });
            setTimeout(() => {
              const files = this.store.getByType(type);
              if (files.length > 0) {
                const mb = Math.floor(Math.random() * 50 + 5);
                files[0].size = mb + ' MB';
                files[0].sizeBytes = mb * 1024 * 1024;
                files[0].status = 'info';
                files[0].statusText = type === 'ipa' ? '待签名' : '就绪';
                files[0].icon = this.getFileIcon(type);
                files[0].iconBg = this.getFileColor(type);
              }
            }, 2000);
          }
        }
      }]
    });
    await alert.present();
  }

  async selectInstalledApp() {
    const modal = await this.modalCtrl.create({
      component: AppSelectorPage,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'fullscreen-modal'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.imported) {
      this.showToast(`已从「${data.name}」提取应用信息`);
    }
  }

  showDetail(file: IpaFile) {
    this.alertCtrl.create({
      header: file.name,
      subHeader: '文件详细信息',
      message: `
        <div style="text-align:left">
          <p><strong>文件名：</strong>${file.name}</p>
          <p><strong>类型：</strong>${file.type.toUpperCase()}</p>
          <p><strong>大小：</strong>${file.size}</p>
          <p><strong>导入日期：</strong>${file.date}</p>
          <p><strong>状态：</strong>${file.statusText}</p>
          ${file.bundleId ? `<p><strong>Bundle ID：</strong>${file.bundleId}</p>` : ''}
          ${file.version ? `<p><strong>版本：</strong>${file.version}</p>` : ''}
        </div>
      `,
      buttons: ['关闭', { text: '删除', role: 'destructive', handler: () => {
        const idx = this.store.files.indexOf(file);
        if (idx >= 0) this.store.remove(idx);
      }}]
    }).then(a => a.present());
  }

  deleteFile(index: number) { this.store.remove(index); }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await toast.present();
  }

  getFileIcon(type: string): string {
    const map: Record<string, string> = {
      ipa: 'cube-outline', dylib: 'code-slash-outline',
      p12: 'key-outline', mobileprovision: 'document-text-outline',
      other: 'document-outline'
    };
    return map[type] || 'document-outline';
  }

  getFileColor(type: string): string {
    const map: Record<string, string> = {
      ipa: 'rgba(0,122,255,0.15)', dylib: 'rgba(191,90,242,0.15)',
      p12: 'rgba(255,149,0,0.15)', mobileprovision: 'rgba(52,199,89,0.15)',
      other: 'rgba(142,142,147,0.15)'
    };
    return map[type] || 'rgba(142,142,147,0.15)';
  }

  getFileIconColor(type: string): string {
    const map: Record<string, string> = {
      ipa: '#007aff', dylib: '#bf5af2',
      p12: '#ff9500', mobileprovision: '#34c759',
      other: '#8e8e93'
    };
    return map[type] || '#8e8e93';
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}