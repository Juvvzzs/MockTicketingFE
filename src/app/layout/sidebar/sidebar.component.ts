import { Component, OnInit, inject } from '@angular/core';
import { faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { UtilsService } from 'src/app/service/utils.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  utilsService = inject(UtilsService);

  faCoffee = faUserDoctor;
  isShowSidebar = this.utilsService.isShowSidebar();

  sample3: number = 0;

  isMobileView = (): boolean => {
    return window.innerWidth <= 768; // Adjust the value as per your mobile breakpoint
  };

  ngOnInit(): void {
    this.detectScreenChange();
  }

  detectScreenChange = (): void => {
    let isMobileView = window.innerWidth <= 768; // Initial state
  
    // Function to check and update the screen view
    const updateScreenView = () => {
      const currentIsMobileView = window.innerWidth <= 768;
      if (currentIsMobileView !== isMobileView) {
        isMobileView = currentIsMobileView;
        this.utilsService.isShowSidebar.set(false)
        console.log(
          isMobileView
            ? "Switched to mobile view."
            : "Switched to desktop view."
        );
      }
    };
  
    window.addEventListener("resize", updateScreenView);
  
    updateScreenView();
  };
  
  setSidebarMobileView(){
    this.utilsService.isShowSidebar.set(!this.utilsService.isShowSidebar())
  }

}
