import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';
import { FileStore, IpaFile } from '../../services/file-store.service';

interface DylibFile { name: string; size: string; }
interface SignRecord { name: string; date: string; installed: boolean; }

@Component({
  selector: 'app-sign-center',
  templateUrl: 'sign-center.page.html',
  styleUrls: ['sign-center.page.scss'],
  standalone: false,
})
export class SignCenterPage {
  selectedIpa: IpaFile | null = null;
  selectedIcon: { name: string } | null = null;
  changeBundleId = false;
  newBundleId = '';
  changeAppName = false;
  newAppName = '';
  dylibs: DylibFile[] = [];
  signHistory: SignRecord[] = [];

  autoInstall = true;
  keepOriginalIcon = false;
  removeAppLimit = true;
  skipPluginCheck = false;

  // 签名进度
  signing = false;
  signProgress = 0;
  signStatus = '';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private store: FileStore
  ) {}

  get ipaList(): IpaFile[] { return this.store.getIpas(); }
  get dylibList(): IpaFile[] { return this.store.getDylibs(); }

  async selectIpa() {
    const list = this.ipaList;
    if (list.length === 0) {
      this.showToast('请先在「IPA 文件」页面导入 IPA');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: '选择 IPA 文件',
      inputs: list.map((ipa, i) => ({
        type: 'radio', label: ipa.name, value: i, checked: this.selectedIpa === ipa
      })),
      buttons: ['取消', { text: '确定', handler: (i) => {
        if (i !== undefined) this.selectedIpa = list[i];
      }}]
    });
    await alert.present();
  }

  selectIcon() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.png,.jpg,.jpeg';
    input.onchange = (e: any) => { if (e.target.files[0]) this.selectedIcon = { name: e.target.files[0].name }; };
    input.click();
  }

  async addDylib() {
    const list = this.dylibList;
    if (list.length === 0) {
      this.showToast('请先在「IPA 文件」页面导入 dylib');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: '选择 Dylib 文件',
      inputs: list.map((d, i) => ({
        type: 'radio', label: `${d.name} (${d.size})`, value: i
      })),
      buttons: ['取消', { text: '添加', handler: (i) => {
        if (i !== undefined) this.dylibs.push({ name: list[i].name, size: list[i].size });
      }}]
    });
    await alert.present();
  }

  removeDylib(index: number) { this.dylibs.splice(index, 1); }

  async quickSign() {
    if (this.ipaList.length === 0) {
      this.showToast('请先在「IPA 文件」页面导入 IPA');
      return;
    }
    this.selectIpa();
  }

  async exportSign() {
    if (this.signHistory.length === 0) {
      this.showToast('暂无已签名的文件可导出');
      return;
    }
    this.alertCtrl.create({
      header: '导出签名文件',
      message: `共 ${this.signHistory.length} 个已签名文件`,
      buttons: ['了解']
    }).then(a => a.present());
  }

  async startSign() {
    if (!this.selectedIpa) return;

    this.signing = true;
    this.signProgress = 0;
    this.signStatus = '正在准备签名...';

    // 模拟签名进度
    const stages = [
      { at: 10, text: '正在解析 IPA 文件...' },
      { at: 25, text: '正在提取应用信息...' },
      { at: 40, text: '正在重新签名...' },
      { at: 55, text: '正在注入 dylib...' },
      { at: 70, text: '正在重新打包...' },
      { at: 85, text: '正在验证签名...' },
      { at: 100, text: '签名完成！' },
    ];

    for (const stage of stages) {
      await this.delay(400 + Math.random() * 600);
      this.signProgress = stage.at;
      this.signStatus = stage.text;
    }

    // 签名完成
    this.signing = false;
    const signedName = (this.selectedIpa.name || 'App').replace('.ipa', '') + '_已签名.ipa';
    this.signHistory.unshift({
      name: signedName,
      date: new Date().toLocaleString('zh-CN'),
      installed: false
    });

    if (this.selectedIpa) {
      this.selectedIpa.status = 'success';
      this.selectedIpa.statusText = '已签名';
    }

    const dylibMsg = this.dylibs.length > 0 ? `<br>✅ 已注入 ${this.dylibs.length} 个 dylib` : '';
    const iconMsg = this.selectedIcon ? '<br>✅ 已替换应用图标' : '';

    const alert = await this.alertCtrl.create({
      header: '✅ 签名成功',
      message: `<p>文件已签名完成</p>${dylibMsg}${iconMsg}${this.autoInstall ? '<br><br>🔄 自动安装已开启，即将安装...' : ''}`,
      buttons: [{
        text: this.autoInstall ? '查看安装' : '完成',
        handler: () => {
          if (this.autoInstall) {
            this.installApp(this.signHistory[0]);
          }
          this.selectedIpa = null;
          this.selectedIcon = null;
          this.dylibs = [];
        }
      }]
    });
    await alert.present();
  }

  async installApp(item: SignRecord) {
    item.installed = true;
    const alert = await this.alertCtrl.create({
      header: '安装应用',
      message: `正在安装「${item.name}」<br><br>注：在 Android 上安装 IPA 需要系统签名支持<br>实际安装功能需在 iOS 越狱/自签环境下生效`,
      buttons: [{
        text: '模拟安装',
        handler: async () => {
          await this.showToast(`✅ 已安装「${item.name}」`);
        }
      }, '取消']
    });
    await alert.present();
  }

  async shareSign(item: SignRecord) {
    this.alertCtrl.create({
      header: '分享文件',
      message: `分享 ${item.name}`,
      buttons: ['取消', { text: '分享', handler: () => {} }]
    }).then(a => a.present());
  }

  async reSign(item: SignRecord, index: number) {
    this.signHistory.splice(index, 1);
    this.alertCtrl.create({
      header: '重新签名',
      message: '请重新选择 IPA 文件',
      buttons: ['取消', { text: '开始', handler: () => this.startSign() }]
    }).then(a => a.present());
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'bottom' });
    await toast.present();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}