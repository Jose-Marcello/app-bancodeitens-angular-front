import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Importação correta do Layout Manager
import { provideHttpClient, withFetch } from '@angular/common/http'; 
import { provideRouter } from '@angular/router'; 
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Importa o array de rotas

// Usamos provideHttpClient no main.ts, o que o torna injetável em toda a aplicação.

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes), // 1. Injeta o novo sistema de roteamento baseado em funções
        provideHttpClient(withFetch()), provideAnimationsAsync() // 2. Mantém o HttpClient configurado globalmente
    ]
})
.catch((err) => console.error(err));