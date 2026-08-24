import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { SignCenterPage } from './sign-center.page';
import { SignCenterPageRoutingModule } from './sign-center-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SignCenterPageRoutingModule],
  declarations: [SignCenterPage],
})
export class SignCenterPageModule {}