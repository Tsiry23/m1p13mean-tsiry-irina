import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { HomeComponent } from './pages/admin-home/admin-home';
import { CommandeSearch } from './pages/commande-search/commande-search';
import { ProduitComponent } from './pages/produit/produit';
import { ListProduits } from './pages/list-produits/list-produits';
import { MallAdminHome } from './pages/mall-admin-home/mall-admin-home';
import { MallBoutique } from './pages/mall-boutique/mall-boutique';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login/boutique', component: Login },
  { path: 'login/mall', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'admin-boutique', component: HomeComponent },
  { path: 'admin-boutique/commande-search', component: CommandeSearch },
  { path: 'admin-boutique/produit', component: ProduitComponent },
  { path: 'produits', component: ListProduits },
  { path: 'admin-cc', component: MallAdminHome },
  { path: 'admin-cc/boutique', component: MallBoutique }
];
