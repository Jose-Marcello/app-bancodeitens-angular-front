// src/app/disciplinas/disciplina-principal/disciplina-principal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-disciplina-principal',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class DisciplinaPrincipalComponent {}