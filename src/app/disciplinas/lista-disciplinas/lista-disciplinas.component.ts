// src/app/disciplinas/lista-disciplinas/lista-disciplinas.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// Importe a interface Disciplina do seu arquivo model
import { Disciplina } from '../../shared/models/disciplina.model'
// Importe os módulos necessários para o componente standalone
import { CommonModule } from '@angular/common'; 
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; // Também para o input de busca
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

// ⚠️ ATENÇÃO: Confirme que esta URL está correta!
const API_URL = 'http://localhost:5007/api/disciplinas'; 

@Component({
  selector: 'app-lista-disciplinas',
  templateUrl: './lista-disciplinas.component.html',
  styleUrl: './lista-disciplinas.component.css',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, // 🟢 ADICIONADO: Para <mat-card> e <mat-card-content>
    MatFormFieldModule, // 🟢 ADICIONADO: Para o input de busca
    MatInputModule, // 🟢 ADICIONADO: Para o input de busca
    MatIconModule, 
    MatProgressSpinnerModule,
    RouterLink // Necessário se você estiver usando [routerLink] para Edição
  ]
})
export class ListaDisciplinasComponent implements OnInit {

  // Injeções
  private http = inject(HttpClient);
  private router = inject(Router);

  // Propriedades (Signals)
  public disciplinas = signal<Disciplina[]>([]);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');

  // Colunas da Tabela (Você ajustou para remover o 'id', o que é ótimo para UX)
  public displayedColumns: string[] = ['nome', 'acoes']; 

  ngOnInit() {
    this.carregarDisciplinas();
  }

  public carregarDisciplinas(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.get<Disciplina[]>(API_URL)
      .subscribe({
        next: (data) => {
          this.disciplinas.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(`Falha ao carregar dados. Status: ${err.status}.`);
          console.error(err);
        }
      });
  }


  // Método de Navegação para Criação (adicionarDisciplina)
public adicionarDisciplina(): void {
    // 💡 Usa o Router injetado para navegar para a rota de criação: /disciplinas/nova
    this.router.navigate(['/disciplinas', 'nova']);
}
 public onEditar(id: string): void {
    // 🟢 Deve navegar para: /disciplinas/{ID}
    this.router.navigate(['/disciplinas', id]);
}
  
  // 🟢 MÉTODO DE EXCLUSÃO (Com a lógica refinada de tratamento de erros)
  public excluirDisciplina(disciplina: Disciplina): void {
    if (!window.confirm(`Tem certeza que deseja excluir a disciplina "${disciplina.nome}"?`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const url = `${API_URL}/${disciplina.id}`;

    this.http.delete(url)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          // Sucesso: Recarrega a lista
          this.carregarDisciplinas(); 
        },
        error: (err: any) => {
          this.isLoading.set(false);
          
          // 👈 LÓGICA DE TRATAMENTO DE ERROS REFINADA
          let errorDetail = 'Ocorreu um erro desconhecido.';

          if (err.error && err.error.detail) {
            // 1. Se o Backend C# enviou o JSON padronizado (com 'detail')
            errorDetail = err.error.detail;
          } else if (err.status === 409 || err.status === 400) {
            // 2. Erro de Conflito (Item em uso) ou Requisição Inválida sem detalhe específico
            errorDetail = `Erro: O item ID ${disciplina.id} está provavelmente em uso em Questões. (Status ${err.status})`;
          } else if (err.status) {
            // 3. Erro de rede ou servidor (ex: 500 Internal Server Error)
            errorDetail = `Falha na conexão com o servidor. Status: ${err.status}.`;
          }
          
          this.errorMessage.set(errorDetail);
          console.error('Erro ao excluir:', err);
        }
      });
  }
}