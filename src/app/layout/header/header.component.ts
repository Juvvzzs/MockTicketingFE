import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/modules/ticketing/service/auth.service';
import { UtilsService } from 'src/app/service/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private Auth: AuthService,
  ) {}

  public fullName: string | any;
  public officeName: string | any;
  public divisionName: string |any;
  public profilePicture: any = {};

  utilsService = inject(UtilsService);
  globalSearch = this.utilsService.globalSearch();
  search:string = "";
  ngOnInit(): void {
    this.fullName = localStorage.getItem('fullName');
    this.officeName = localStorage.getItem('officeName');
    this.divisionName = localStorage.getItem('divisionName');
    this.get_profile_picture();
  }

  onGlobalSearchChange(){
    this.utilsService.setGlobalSearch(this.search);
  }

  setSidebarMobileView(){
    this.utilsService.isShowSidebar.set(!this.utilsService.isShowSidebar())
  }

  get_profile_picture() {
  }

  Logout() {
    this.Auth.logout();
  }
}
