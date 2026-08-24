import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignCenterPage } from './sign-center.page';

const routes: Routes = [{ path: '', component: SignCenterPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignCenterPageRoutingModule {}