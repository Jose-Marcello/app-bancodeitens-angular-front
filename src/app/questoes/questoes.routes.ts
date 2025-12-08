// src/app/questoes/questoes.routes.ts

import { Routes } from '@angular/router';
import { ListaQuestoesComponent } from './lista-questoes/lista-questoes.component';
import { CadastroQuestoesComponent } from './cadastro-questoes/cadastro-questoes.component';

export const QUESTOES_ROUTES: Routes = [
    {
        // 🟢 Rota 1: /questoes (Index, a lista)
        path: '',
        component: ListaQuestoesComponent,
    },
    {
        // 🟢 Rota 2: /questoes/nova (Criação)
        path: 'nova',
        component: CadastroQuestoesComponent
    },
    {
        // 🟢 Rota 3: /questoes/:id (Edição)
        path: ':id',
        component: CadastroQuestoesComponent
    }
];