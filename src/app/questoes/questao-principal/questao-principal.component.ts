// src/app/questoes/questao-principal/questao-principal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Necessário para carregar as rotas filhas

@Component({
  selector: 'app-questao-principal',
  standalone: true,
  // O componente Host precisa apenas do RouterOutlet e CommonModule
  imports: [CommonModule, RouterOutlet], 
  // O template apenas contém o ponto de injeção
  template: '<router-outlet></router-outlet>', 
  styleUrls: ['./questao-principal.component.css'] // Garante o arquivo CSS
})
export class QuestaoPrincipalComponent {
  // A lógica é mínima, pois ele apenas hospeda o conteúdo da rota.
}