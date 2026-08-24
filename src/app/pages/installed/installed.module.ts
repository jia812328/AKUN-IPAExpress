import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { InstalledPage } from './installed.page';
import { InstalledPageRoutingModule } from './installed-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, InstalledPageRoutingModule],
  declarations: [InstalledPage],
})
export class InstalledPageModule {}