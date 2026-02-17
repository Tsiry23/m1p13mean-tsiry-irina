import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: 'admin-home.component.html',
  styleUrls: ['admin-home.component.css']
})
export class HomeComponent {}