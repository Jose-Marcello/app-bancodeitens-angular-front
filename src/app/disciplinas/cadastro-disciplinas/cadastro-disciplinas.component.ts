// src/app/disciplinas/cadastro-disciplinas/cadastro-disciplinas.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Disciplina } from '../../shared/models/disciplina.model'

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

// 🟢 CORREÇÃO 1: Definir API_URL como uma constante externa
const API_URL = 'http://localhost:5007/api/disciplinas'; 


@Component({
  selector: 'app-cadastro-disciplinas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './cadastro-disciplinas.component.html',
  styleUrl: './cadastro-disciplinas.component.css'
})
export class CadastroDisciplinasComponent implements OnInit {
  // --- Estado da Aplicação (Signals) ---
  isLoading = signal(false); 
  
  // --- Injeção de Dependências (melhor prática com inject) ---
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Formulário reativo
  public disciplinaForm!: FormGroup;
  
  // Variáveis de estado
  public isEditMode: boolean = false;
  public disciplinaId: string | null = null;
  public pageTitle: string = 'Nova Disciplina';
  
  // 🔴 REMOVIDO: A declaração incorreta da URL dentro da classe

  ngOnInit(): void {
    // 1. Inicializa o formulário com validações
    this.disciplinaForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(3)]]      
    });

    // 2. Verifica se está em modo de edição
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam && idParam !== 'nova') {
        this.disciplinaId = idParam;
        this.isEditMode = true;
        this.pageTitle = 'Editar Disciplina';
        this.carregarDisciplina(this.disciplinaId);
      }
    });
  }

  // 3. Carrega os dados da disciplina para edição
  private carregarDisciplina(id: string): void { 
    this.isLoading.set(true); 
    // 🟢 CORREÇÃO 2: Usa a constante API_URL
    this.http.get<Disciplina>(`${API_URL}/${id}`).subscribe({
      next: (data) => {
        // Mapear explicitamente apenas o campo 'nome'
        this.disciplinaForm.patchValue(data);
        //this.disciplinaForm.patchValue({ nome: data.nome }); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar disciplina:', err);
        this.isLoading.set(false);
        // 💡 Exibir um alerta de erro de carregamento (Opcional)
        this.handleError('Erro ao carregar disciplina para edição.', err); 
      }
    });
  }

  // 4. Lógica de submissão do formulário (Salvar ou Editar)
 public onSubmit(): void {
    if (this.disciplinaForm.invalid) {
      this.disciplinaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true); 
    let disciplinaData: any = this.disciplinaForm.value;

    // Se for modo de CRIAÇÃO, o Id deve ser removido do objeto de dados
    if (!this.isEditMode) {
        delete disciplinaData.id; 
    }
    
    // 🟢 CORREÇÃO 3: Usa a constante API_URL para POST/PUT
    // Decide se é POST (Criação) ou PUT (Edição)
    const request$ = this.isEditMode
      ? this.http.put(`${API_URL}/${this.disciplinaId}`, disciplinaData)
      : this.http.post(API_URL, disciplinaData);

    request$.subscribe({
      next: () => this.handleSuccess(this.isEditMode ? 'atualizada' : 'criada'),
      error: (err) => this.handleError('Erro ao salvar disciplina.', err)
    });
}
  private handleSuccess(action: string): void {
    console.log(`Disciplina ${action} com sucesso!`);
    this.isLoading.set(false);
    // Redireciona para a rota 'disciplinas' raiz
    this.router.navigate(['/disciplinas']); 
  }

  // MÉTODO HANDLE ERROR REFINADO
  private handleError(message: string, err: any): void {
    console.error(message, err);
    this.isLoading.set(false); 
    
    let errorDetail = 'Erro desconhecido ao tentar salvar/atualizar.';

    if (err.error) {
      if (err.error.detail) {
        errorDetail = err.error.detail;
      } else if (err.error.errors) {
         const validationErrors = Object.values(err.error.errors).flat();
         errorDetail = `Erros de Validação: ${validationErrors.join(' | ')}`;
      } else if (typeof err.error === 'string') {
        errorDetail = err.error;
      }
    } else if (err.status === 0) {
      errorDetail = 'Falha de conexão: O Backend C# pode estar offline ou inacessível.';
    } else {
      errorDetail = `Falha no servidor. Status: ${err.status}.`;
    }

    window.alert(`${message}\n\nDetalhe: ${errorDetail}`);
  }
  
  public voltar(): void {
    this.router.navigate(['/disciplinas']);
  }
}