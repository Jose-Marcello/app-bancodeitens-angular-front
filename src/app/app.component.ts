import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { provideHttpClient, withFetch } from '@angular/common/http'; 
import { ApplicationConfig } from '@angular/core';

// IMPORTAÇÃO CORRETA DO ENVIRONMENT (o Angular CLI escolhe o arquivo certo)
import { environment } from '../environments/environment';

// FUNÇÃO CRÍTICA: LÊ A VARIÁVEL DE AMBIENTE INJETADA PELO RAILWAY
// Se process.env.API_URL existir (no contêiner Railway), usa ele. 
// Caso contrário, usa o valor hardcoded do environment.ts (Azure/Local).
/*
function getApiBaseUrl(): string {
  // @ts-ignore: Variáveis de ambiente injetadas no contêiner são lidas como process.env no Railway
  const railwayUrl = typeof process !== 'undefined' ? process.env['API_URL'] : undefined;
  
  // Prioriza o URL injetado pelo Railway, depois o environment.apiUrl
  const baseUrl = railwayUrl || environment.apiUrl;

  // Garantia: se for o URL base, remove a barra final para anexar o /api/questoes
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
  */

// --- URL da API: Lida do Environment ---
//const API_BASE = getApiBaseUrl();
//const API_URL = `${API_BASE}/api/questoes`;

//const API_BASE = (process.env as any)['API_URL'] || environment.apiUrl;
//const API_URL = `${API_BASE}/api/questoes`;

const API_URL = `${environment.apiUrl}/api/questoes`;


// --- Interface do Modelo de Dados (MMV) ---
interface Questao {
  id: number;
  descricao: string;
}

@Component({
  selector: 'app-root', // Seletor padrão para carregar no index.html
  standalone: true,
  // Dependências de módulos:
  imports: [CommonModule, FormsModule], 
  // O template é inserido diretamente no TS
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <header class="bg-indigo-700 text-white p-6 rounded-t-xl shadow-lg">
        <h1 class="text-3xl font-extrabold">BANCO DE ITENS (MMV)</h1>
        <p class="text-indigo-200 mt-1">Conexão Back-end C# & Railway - Status: {{ status() }}</p>
      </header>

      <main class="container mx-auto mt-8 space-y-8">
        <!-- 1. FORMULÁRIO DE CADASTRO (POST) -->
        <div class="bg-white p-6 rounded-xl shadow-xl">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Adicionar Nova Questão</h2>
          <form (ngSubmit)="salvarQuestao()" class="space-y-4">

            <!-- Campo Descrição -->
            <div>
              <label for="descricao" class="block text-sm font-medium text-gray-700">Descrição (Pergunta)</label>
              <!-- CORREÇÃO: [ngModel] e (ngModelChange) para Signals -->
              <textarea id="descricao" name="descricao" rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                placeholder="Ex: Qual é o nome do primeiro imperador do Brasil?"
                required
                [ngModel]="novaQuestao().descricao"
                (ngModelChange)="novaQuestao.set({ descricao: $event })"></textarea>
            </div>

            <!-- Botão Salvar -->
            <button type="submit" [disabled]="isLoading() || !novaQuestao().descricao"
              class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150">
              <span *ngIf="isLoading()" class="animate-spin mr-2">⚙️</span>
              {{ isLoading() ? 'Salvando...' : 'Salvar Questão' }}
            </button>
          </form>
        </div>

        <!-- 2. LISTA DE QUESTÕES (GET) -->
        <div class="bg-white p-6 rounded-xl shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-800">Banco de Questões ({{ questoes().length }})</h2>
            <button (click)="carregarQuestoes()" [disabled]="isLoading()"
              class="text-indigo-600 hover:text-indigo-800 transition duration-150 disabled:opacity-50">
              <span *ngIf="isLoading()">Carregando...</span>
              <span *ngIf="!isLoading()">Atualizar Lista</span>
            </button>
          </div>

          <!-- Mensagens de Status -->
          <div *ngIf="errorMessage()" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p class="font-bold">Erro de Conexão</p>
            <p>{{ errorMessage() }}</p>
          </div>

          <!-- Lista de Itens -->
          <ul class="divide-y divide-gray-200">
            <li *ngIf="questoes().length === 0 && !isLoading()" class="py-4 text-center text-gray-500">
              Nenhuma questão cadastrada. Comece adicionando uma!
            </li>
            <li *ngFor="let questao of questoes()" class="py-4 flex justify-between items-center">
              <span class="text-gray-900 font-medium">{{ questao.id }} - {{ questao.descricao }}</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Estilos simples para o spinner */
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class BancoDeItensAppComponent implements OnInit {
  // --- Estado da Aplicação (Signals) ---
  questoes = signal<Questao[]>([]);
  // Inicialização do signal
  novaQuestao = signal<Omit<Questao, 'id'>>({ descricao: '' }); 
  isLoading = signal(false);
  status = signal('Aguardando teste...');
  errorMessage = signal('');

  // --- Injeção de Dependências ---
  private http = inject(HttpClient);

  ngOnInit(): void {
    // Carrega a lista ao iniciar o componente
    this.carregarQuestoes();
  }

  carregarQuestoes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(''); // Limpa erros anteriores
    this.status.set('Tentando GET...');

    this.http.get<Questao[]>(API_URL)
      .subscribe({
        next: (data) => {
          this.questoes.set(data);
          this.isLoading.set(false);
          this.status.set('Conectado! Lista carregada.');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.status.set('ERRO de Conexão!');
          // Mensagem de erro informativa para o Front-end
          this.errorMessage.set(`Falha ao conectar com o Back-end (${API_URL}). Status: ${err.status || 'Sem Resposta'}. Por favor, verifique se o servidor C# está ativo na porta 5001.`);
          console.error('Erro ao carregar questões:', err);
        }
      });
  }

  salvarQuestao(): void {
    if (!this.novaQuestao().descricao) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.status.set('Tentando POST...');

    // O payload é o valor do signal (que é o JSON { "descricao": "..." })
    const payload = this.novaQuestao(); 

    this.http.post<Questao>(API_URL, payload)
      .subscribe({
        next: (questaoCriada) => {
          // Limpa o formulário e recarrega a lista
          this.novaQuestao.set({ descricao: '' }); 
          this.carregarQuestoes(); 
          this.status.set('Questão salva com sucesso!');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.status.set('ERRO ao Salvar!');
          this.errorMessage.set(`Falha ao salvar. Verifique se o Back-end está rodando. Status: ${err.status || 'Sem Resposta'}.`);
          console.error('Erro ao salvar questão:', err);
        }
      });
  }
}
// Configuração do provider para o HttpClientModule (necessário em standalone)
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withFetch()) // Usando withFetch para compatibilidade e robustez
    ]
};