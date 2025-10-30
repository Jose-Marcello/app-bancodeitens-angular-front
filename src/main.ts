import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { BancoDeItensAppComponent } from './app/app.component';

bootstrapApplication(BancoDeItensAppComponent, appConfig)
  .catch((err) => console.error(err));
