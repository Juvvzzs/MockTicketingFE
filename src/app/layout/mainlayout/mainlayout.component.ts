import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-mainlayout',
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent]
})
export class MainlayoutComponent implements OnInit {
  constructor(private Auth: AuthService) {}

 
  ngOnInit(): void {
    
  }

}
