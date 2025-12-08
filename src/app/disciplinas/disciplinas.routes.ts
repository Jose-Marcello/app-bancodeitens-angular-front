// src/app/disciplinas/disciplinas.routes.ts
import { Routes } from '@angular/router';
import { DisciplinaPrincipalComponent } from './disciplina-principal/disciplina-principal.component';
import { ListaDisciplinasComponent } from './lista-disciplinas/lista-disciplinas.component';
import { CadastroDisciplinasComponent } from './cadastro-disciplinas/cadastro-disciplinas.component'; // Usado para C/U


export const DISCIPLINAS_ROUTES: Routes = [
  { 
    path: '', 
    component: DisciplinaPrincipalComponent,
    children: [
      // Rota 1: Lista (READ e DELETE)
      // URL: /disciplinas
      { path: '', component: ListaDisciplinasComponent },
      
      // Rota 2: Formulário (CREATE e UPDATE)
      // Esta rota cobre dois casos:
      // a) /disciplinas/nova
      // b) /disciplinas/:id (para editar, ex: /disciplinas/123)
      { path: ':id', component: CadastroDisciplinasComponent } 
    ]
  }
];