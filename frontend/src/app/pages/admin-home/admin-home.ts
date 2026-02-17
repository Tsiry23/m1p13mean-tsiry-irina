import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Sidebar],
  templateUrl: 'admin-home.html',
  styleUrls: ['admin-home.css']
})
export class HomeComponent {}