import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { IpaFilesPage } from './ipa-files.page';
import { IpaFilesPageRoutingModule } from './ipa-files-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IpaFilesPageRoutingModule],
  declarations: [IpaFilesPage],
})
export class IpaFilesPageModule {}