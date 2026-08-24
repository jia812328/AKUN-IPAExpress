import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IpaFilesPage } from './ipa-files.page';

const routes: Routes = [
  { path: '', component: IpaFilesPage },
  {
    path: 'file-manager',
    loadChildren: () => import('../file-manager/file-manager.module').then(m => m.FileManagerPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IpaFilesPageRoutingModule {}