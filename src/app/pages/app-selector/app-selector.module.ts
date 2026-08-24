import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { AppSelectorPage } from './app-selector.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [AppSelectorPage],
  exports: [AppSelectorPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppSelectorPageModule {}