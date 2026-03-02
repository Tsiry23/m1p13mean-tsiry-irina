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
import { InscriptionComponent } from './pages/inscription/inscription';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login/boutique', component: Login, canActivate: [LoginRedirectGuard] },
  { path: 'login/mall', component: Login, canActivate: [LoginRedirectGuard] },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'login', component: Login },
  { path: 'produits', component: ListProduits },

  // Routes boutique protégées
  { path: 'admin-boutique', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'admin-boutique/commande-search', component: CommandeSearch, canActivate: [AuthGuard] },
  { path: 'admin-boutique/produit', component: ProduitComponent, canActivate: [AuthGuard] },
  { path: 'admin-boutique/vente', component: VenteProduitsComponent, canActivate: [AuthGuard] },
  { path: 'admin-boutique/paiements', component: BoutiquePaymentHistory, canActivate: [AuthGuard] },

  // Routes mall protégées
  { path: 'admin-cc', component: MallAdminHome, canActivate: [AuthGuard] },
  { path: 'admin-cc/boutiques', component: MallBoutique, canActivate: [AuthGuard] },
  { path: 'admin-cc/paiements', component: PaymentHistory, canActivate: [AuthGuard] },
];
