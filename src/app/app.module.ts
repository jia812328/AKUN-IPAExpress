import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios26';
import { AppSelectorPageModule } from './pages/app-selector/app-selector.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios',
      navAnimation: iosTransitionAnimation,
    }),
    AppRoutingModule,
    AppSelectorPageModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}