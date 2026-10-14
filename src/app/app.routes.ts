import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login'; // <-- .component silindi
import { RegisterComponent } from './pages/register/register'; // <-- .component silindi

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
