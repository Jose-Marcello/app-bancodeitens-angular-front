import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
// 💡 Importe os modelos necessários (Confirme seus caminhos)
import { Questao } from '../../shared/models/questao.model';
import { Disciplina } from '../../shared/models/disciplina.model';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // 🟢 Para o Dropdown de Disciplinas
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para o loading
import { RouterLink } from '@angular/router';


// ⚠️ ATENÇÃO: Verifique se estas URLs estão corretas!
const API_URL_QUESTOES = 'http://localhost:5007/api/questoes'; 
const API_URL_DISCIPLINAS = 'http://localhost:5007/api/disciplinas'; 

@Component({
  selector: 'app-cadastro-questoes',
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
    MatSelectModule, // 🟢 NOVO
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './cadastro-questoes.component.html',
  styleUrl: './cadastro-questoes.component.css'
})
export class CadastroQuestoesComponent implements OnInit {
  // --- Estado da Aplicação (Signals) ---
  isLoading = signal(false); 
  public disciplinas = signal<Disciplina[]>([]); 
  // 🟢 SIGNAL CORRIGIDO: Usado para exibir mensagens de erro no template
  public errorMessage = signal<string | null>(null); 
  
  // --- Injeção de Dependências e Variáveis de estado... ---
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public questaoForm!: FormGroup;
  public isEditMode: boolean = false;
  public questaoId: string | null = null;
  public pageTitle: string = 'Nova Questão';  

  ngOnInit(): void {
    // 1. Inicializa o formulário (Incluindo a chave estrangeira disciplinaId)
    this.questaoForm = this.fb.group({
      id: [null], // 💡 Necessário para o PUT (Edição)
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      // 🟢 CAMPO CHAVE ESTRANGEIRA (deve ser o ID da Disciplina - GUID)      
      disciplinaId: ['', [Validators.required]]
    });

    // 2. 🟢 CHAMA A FUNÇÃO PARA BUSCAR AS DISCIPLINAS
    this.carregarDisciplinasParaDropdown();
    
    // 3. Verifica se está em modo de edição
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam && idParam !== 'nova') {
        this.questaoId = idParam;
        this.isEditMode = true;
        this.pageTitle = 'Editar Questão';
        this.carregarQuestao(this.questaoId);
      }
    });
  }
  
  // =========================================================
  // 🟢 NOVO MÉTODO: Carregar Disciplinas para o Dropdown
  // =========================================================
  private carregarDisciplinasParaDropdown(): void {
    this.http.get<Disciplina[]>(API_URL_DISCIPLINAS)
      .subscribe({
        next: (data) => {
          // Armazena a lista de disciplinas no signal
          this.disciplinas.set(data);

        // 🟢 PONTO DE DEBUG 2: Valores do Dropdown
        if (data.length > 0) {
            console.log('Lista de Disciplinas (Dropdown) carregada. Exemplo de ID:', data[0].id);
            console.log('Tipo do ID do Dropdown:', typeof data[0].id);
        }

        },
        error: (err) => {
          console.error('Erro ao carregar lista de disciplinas:', err);
          this.handleError('Falha ao carregar disciplinas. O dropdown estará vazio.', err);
        }
      });
  }
  
// Em CadastroQuestoesComponent.ts
// =========================================================
// 💡 Carrega os dados da Questão para Edição (GET por ID)
// =========================================================
private carregarQuestao(id: string): void { 
  this.isLoading.set(true); 
  
  // ⚠️ ATENÇÃO: Assegure-se de que a API_URL_QUESTOES aponta para o seu backend C#
  this.http.get<Questao>(`${API_URL_QUESTOES}/${id}`).subscribe({
    next: (data) => {

      // 🟢 PONTO DE DEBUG 1: Valor da Questão
      console.log('Dados da Questão carregados:', data);
      console.log('ID da Disciplina da Questão (Backend):', data.disciplinaId);
      console.log('Tipo do ID da Disciplina (Backend):', typeof data.disciplinaId);

      // 🟢 patchValue para ID, Descrição e DisciplinaId
      this.questaoForm.patchValue({ 
          id: data.id,
          descricao: data.descricao, 
          // ✅ CORREÇÃO: Usar String(data.disciplinaId) para garantir que é uma STRING limpa (GUID)
          // O tratamento de null/undefined já é feito pelo String()
          disciplinaId: data.disciplinaId ? String(data.disciplinaId) : null 
      }); 
      this.isLoading.set(false);
    },
    error: (err) => { 
      console.error('Erro ao carregar questão:', err);
      this.isLoading.set(false);
      this.handleError('Erro ao carregar questão para edição.', err); 
    }
  });
}

  // =========================================================
  // 💡 Lógica de submissão do formulário (POST/PUT)
  // =========================================================
 // Em CadastroQuestoesComponent.ts, no onSubmit()
public onSubmit(): void {
    if (this.questaoForm.invalid) {
        this.questaoForm.markAllAsTouched();
        return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true); 
    
    let questaoData: any = this.questaoForm.value;

    // 🟢 Trata GUID vazio para NULL
    if (questaoData.disciplinaId === '') {
        questaoData.disciplinaId = null;
    }

    if (this.isEditMode) {
        // ✅ CORREÇÃO CRÍTICA: GARANTE que o ID da Rota está no corpo,
        // mesmo que o form control 'id' tenha falhado ou esteja nulo.
        questaoData.id = this.questaoId; 
    } else {
        // Mantém a exclusão do ID para o POST
        delete questaoData.id; 
    }
    
    const API_URL_QUESTOES = 'http://localhost:5007/api/questoes'; 

    const request$ = this.isEditMode
      ? this.http.put(`${API_URL_QUESTOES}/${this.questaoId}`, questaoData)
      : this.http.post(API_URL_QUESTOES, questaoData);

    request$.subscribe({
        next: () => this.handleSuccess(this.isEditMode ? 'atualizada' : 'criada'),
        error: (err) => this.handleError('Erro ao salvar questão.', err)
    });
}

  private handleSuccess(action: string): void {
    console.log(`Questão ${action} com sucesso!`);
    this.isLoading.set(false);
    // Redireciona para a rota 'questoes' raiz
    this.router.navigate(['/questoes']); 
  }

  // =========================================================
// 🟢 MÉTODO HANDLE ERROR (COMPLETO E CORRIGIDO)
// =========================================================
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

    // 🟢 DEFINE O SIGNAL PARA SER EXIBIDO NO TEMPLATE
    this.errorMessage.set(errorDetail); 
    // window.alert(`ERRO ao Salvar: ${errorDetail}`); // Opcional, se o alert não for mais necessário
  } 
  public voltar(): void {
    this.router.navigate(['/questoes']);
  }

// ✅ VERSÃO MAIS ROBUSTA DO compareFn
compareFn(v1: any, v2: any): boolean {
    if (v1 && v2) {
        // Converte explicitamente para string para garantir que a comparação seja
        // entre strings limpas (ex: remove a chance de serem objetos GUID)
        return String(v1) === String(v2);
    }
    return v1 === v2;
}


}