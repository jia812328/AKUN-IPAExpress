import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'ipa-files',
        loadChildren: () => import('../pages/ipa-files/ipa-files.module').then(m => m.IpaFilesPageModule)
      },
      {
        path: 'certificates',
        loadChildren: () => import('../pages/certificates/certificates.module').then(m => m.CertificatesPageModule)
      },
      {
        path: 'sign-center',
        loadChildren: () => import('../pages/sign-center/sign-center.module').then(m => m.SignCenterPageModule)
      },
      {
        path: 'installed',
        loadChildren: () => import('../pages/installed/installed.module').then(m => m.InstalledPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: 'ipa-files',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}