import { Injectable, signal } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  isShowSidebar = signal<boolean>(false);
  globalSearch  = signal<string>("");

  constructor(
  ) {}

  setGlobalSearch(value:string){
    this.globalSearch.set(value);
    console.log(this.globalSearch());
  }

}
