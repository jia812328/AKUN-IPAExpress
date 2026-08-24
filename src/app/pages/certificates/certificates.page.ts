import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular/lazy';
import { FileStore, IpaFile } from '../../services/file-store.service';

@Component({
  selector: 'app-certificates',
  templateUrl: 'certificates.page.html',
  styleUrls: ['certificates.page.scss'],
  standalone: false,
})
export class CertificatesPage {
  constructor(
    private alertCtrl: AlertController,
    public store: FileStore
  ) {}

  get certList(): IpaFile[] { return this.store.getCerts(); }
  get provList(): IpaFile[] { return this.store.getProvisions(); }

  showDetail(file: IpaFile) {
    this.alertCtrl.create({
      header: file.name,
      subHeader: file.type === 'p12' ? '证书详情' : '描述文件详情',
      message: `
        <div style="text-align:left">
          <p><strong>名称：</strong>${file.name}</p>
          <p><strong>类型：</strong>${file.type.toUpperCase()}</p>
          <p><strong>大小：</strong>${file.size}</p>
          <p><strong>导入日期：</strong>${file.date}</p>
        </div>
      `,
      buttons: ['关闭']
    }).then(a => a.present());
  }

  deleteCert(cert: IpaFile) {
    const idx = this.store.files.indexOf(cert);
    if (idx >= 0) this.store.remove(idx);
  }

  deleteProv(prov: IpaFile) {
    const idx = this.store.files.indexOf(prov);
    if (idx >= 0) this.store.remove(idx);
  }
}