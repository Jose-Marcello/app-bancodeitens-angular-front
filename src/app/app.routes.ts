// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Rotas que usam o Layout Fixo (Menu/Header)
  {
    path: '',
    component: LayoutComponent, 
    children: [
      { path: 'home', component: HomeComponent },
      
      // 👈 Lazy Loading do CRUD de Questões
      {
        path: 'questoes',
        loadChildren: () => import('./questoes/questoes.routes').then(m => m.QUESTOES_ROUTES)
      },
    
      // 🟢 ROTA DE DISCIPLINAS FALTANTE (Adicione esta seção)
      {
        path: 'disciplinas',
        loadChildren: () => import('./disciplinas/disciplinas.routes').then(m => m.DISCIPLINAS_ROUTES)
      },

      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
    ]
  },
  
  { path: '**', redirectTo: 'home' }
];