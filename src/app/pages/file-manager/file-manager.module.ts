import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { FileManagerPage } from './file-manager.page';
import { FileManagerPageRoutingModule } from './file-manager-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FileManagerPageRoutingModule],
  declarations: [FileManagerPage],
})
export class FileManagerPageModule {}