import { Component } from '@angular/core';
import { MallAdminSidebar } from '../../components/mall-admin-sidebar/mall-admin-sidebar'; 

@Component({
  selector: 'app-mall-admin-home',
  imports: [ MallAdminSidebar ],
  templateUrl: './mall-admin-home.html',
  styleUrl: './mall-admin-home.css',
})
export class MallAdminHome {

}
