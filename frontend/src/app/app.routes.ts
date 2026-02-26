import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { HomeComponent } from './pages/admin-home/admin-home';
import { CommandeSearch } from './pages/commande-search/commande-search';
import { ProduitComponent } from './pages/produit/produit';
import { VenteProduitsComponent } from './pages/vente-produits/vente-produits';
import { ListProduits } from './pages/list-produits/list-produits';
import { MallAdminHome } from './pages/mall-admin-home/mall-admin-home';
import { MallBoutique } from './pages/mall-boutique/mall-boutique';
import { PaymentHistory } from './pages/payment-history/payment-history';
import { LoginRedirectGuard } from './guards/login-redirect.guard';
import { BoutiquePaymentHistory } from './pages/boutique-payment-history/boutique-payment-history';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'login/boutique',
    component: Login,
    canActivate: [LoginRedirectGuard]
  },
  {
    path: 'login/mall',
    component: Login,
    canActivate: [LoginRedirectGuard]
  },
  { path: 'login', component: Login },
  { path: 'login/boutique', component: Login },
  { path: 'login/mall', component: Login },
  { path: 'admin-boutique', component: HomeComponent },
  { path: 'admin-boutique/commande-search', component: CommandeSearch },
  { path: 'admin-boutique/produit', component: ProduitComponent },
  { path: 'admin-boutique/vente', component: VenteProduitsComponent },
  { path: 'admin-boutique/paiements', component: BoutiquePaymentHistory },
  { path: 'produits', component: ListProduits },
  { path: 'admin-cc', component: MallAdminHome },
  { path: 'admin-cc/boutiques', component: MallBoutique },
  { path: 'admin-cc/paiements', component: PaymentHistory },
];
