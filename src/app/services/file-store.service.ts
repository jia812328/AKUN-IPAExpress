import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IpaFile {
  name: string;
  size: string;
  sizeBytes: number;
  date: string;
  bundleId?: string;
  version?: string;
  status: string;
  statusText: string;
  icon?: string;
  iconBg?: string;
  type: 'ipa' | 'dylib' | 'p12' | 'mobileprovision' | 'other';
}

@Injectable({ providedIn: 'root' })
export class FileStore {
  private filesSubject = new BehaviorSubject<IpaFile[]>([]);
  files$ = this.filesSubject.asObservable();

  get files(): IpaFile[] {
    return this.filesSubject.value;
  }

  add(file: IpaFile) {
    const list = this.filesSubject.value;
    list.unshift(file);
    this.filesSubject.next([...list]);
  }

  addMultiple(files: IpaFile[]) {
    const list = this.filesSubject.value;
    list.unshift(...files);
    this.filesSubject.next([...list]);
  }

  remove(index: number) {
    const list = this.filesSubject.value;
    list.splice(index, 1);
    this.filesSubject.next([...list]);
  }

  getByType(type: string): IpaFile[] {
    return this.files.filter(f => f.type === type);
  }

  getIpas(): IpaFile[] {
    return this.files.filter(f => f.type === 'ipa');
  }

  getDylibs(): IpaFile[] {
    return this.files.filter(f => f.type === 'dylib');
  }

  getCerts(): IpaFile[] {
    return this.files.filter(f => f.type === 'p12');
  }

  getProvisions(): IpaFile[] {
    return this.files.filter(f => f.type === 'mobileprovision');
  }
}