import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { HomeComponent } from './pages/admin-home/admin-home';
import { ProduitComponent } from './pages/produit/produit';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'admin-home', component: HomeComponent },
  { path: 'admin-home/produit', component: ProduitComponent }
];
