import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular/lazy';
import { registeredEffect, registerTabBarEffect } from '@rdlabo/ionic-theme-ios26';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, ViewDidEnter, ViewDidLeave {
  readonly #el = inject(ElementRef);
  readonly registeredGestures: registeredEffect[] = [];

  ngOnInit() {}

  ionViewDidEnter() {
    const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
    if (tabBar) {
      const gesture = registerTabBarEffect(tabBar);
      if (gesture) {
        this.registeredGestures.push(gesture);
      }
    }
  }

  ionViewDidLeave() {
    this.registeredGestures.forEach((g) => g.destroy());
    this.registeredGestures.length = 0;
  }
}