import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  constructor(private router: Router, private AuthService: AuthService) {}

  logout() {
    this.AuthService.logout();
    this.router.navigate(['/login']);
  }
}
