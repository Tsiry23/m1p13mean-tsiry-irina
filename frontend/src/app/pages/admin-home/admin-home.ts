import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: 'admin-home.html',
  styleUrls: ['admin-home.css']
})
export class HomeComponent {}