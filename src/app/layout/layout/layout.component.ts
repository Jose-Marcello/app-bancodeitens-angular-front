// src/app/layout/menu-header-layout/layout.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
// 👈 IMPORTAÇÃO NECESSÁRIA
import { MatIconModule } from '@angular/material/icon'; 

// Ajuste os caminhos de importação conforme sua estrutura de pastas
import { MenuComponent } from '../../menu/menu.component'; 
import { HeaderComponent } from '../../header/header.component'; 

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MenuComponent,
    HeaderComponent, 
    // Módulos do Material Design usados no template HTML
    MatToolbarModule,
    MatButtonModule,
    MatIconModule, // 👈 AGORA INCLUÍDO
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  // Lógica do componente
}