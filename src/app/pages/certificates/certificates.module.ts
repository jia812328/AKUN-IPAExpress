import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { CertificatesPage } from './certificates.page';
import { CertificatesPageRoutingModule } from './certificates-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CertificatesPageRoutingModule],
  declarations: [CertificatesPage],
})
export class CertificatesPageModule {}