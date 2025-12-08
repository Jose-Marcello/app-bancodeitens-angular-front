// src/app/questoes/lista-questoes/lista-questoes.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { Questao } from '../../shared/models/questao.model';
import { Disciplina } from '../../shared/models/disciplina.model';

// Angular Material Imports (necessários para o HTML)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 


// ⚠️ URL DA API: Ajuste este link para o endpoint real do seu Azure Container Apps (ACA)
const API_URL = 'http://localhost:5007/api/questoes';
//const API_URL = 'https://sua-api-do-aca/api/questoes'; 

@Component({
  selector: 'app-lista-questoes',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, NgIf,
    MatCardModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css']
})
export class ListaQuestoesComponent implements OnInit {
  // --- Estado da Aplicação com Signals ---
  questoes = signal<Questao[]>([]);
  isLoading = signal(false); 
  errorMessage = signal('');

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit(): void {
    this.carregarQuestoes();
  }

  // --- READ: Método para carregar a lista da API C# ---
  carregarQuestoes(): void {
    this.isLoading.set(true); 
    this.errorMessage.set('');

    this.http.get<Questao[]>(API_URL)
      .subscribe({
        next: (data) => {
          this.questoes.set(data); // Atualiza o Signal
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(`Falha ao conectar ou carregar dados. Verifique a URL (${API_URL}). Status: ${err.status || 'Sem Resposta'}.`);
          console.error('Erro ao carregar questões:', err);
        }
      });
  }

  // --- DELETE: Lógica de Exclusão (pronta para o teste) ---
  public excluirQuestao(questao: Questao): void {
    if (!window.confirm(`Tem certeza que deseja excluir a questão ID ${questao.id}?`)) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.delete(`${API_URL}/${questao.id}`)
      .subscribe({
        next: () => this.carregarQuestoes(), 
        error: (err) => {
          this.isLoading.set(false);
          let detail = (err.error && err.error.detail) || `Erro ao excluir. Status: ${err.status}`;
          this.errorMessage.set(detail);
        }
      });
  }

  // --- Navegação (Funciona com as rotas que definimos) ---
  public adicionarQuestao(): void {
    this.router.navigate(['/questoes', 'nova']); 
  }

  public editarQuestao(id: string): void {
    this.router.navigate(['/questoes', id]); 
  }
}