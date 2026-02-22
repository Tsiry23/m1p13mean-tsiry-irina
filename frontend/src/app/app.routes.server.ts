import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

  // 🔐 pages authentifiées → PAS de SSR
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-boutique',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-boutique/commande-search',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-boutique/produit',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-boutique/vente',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-cc',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-cc/boutiques',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-cc/paiements',
    renderMode: RenderMode.Client
  },

  // 🌍 le reste garde SSR
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];