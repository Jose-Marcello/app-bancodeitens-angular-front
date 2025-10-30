// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; // IMPORTANTE!

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ESTA LINHA É A CHAVE PARA RESOLVER O 'No provider for e!' DO HTTP CLIENT:
    provideHttpClient(withFetch()) 
  ]
};