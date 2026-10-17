import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.html',
  styleUrls: ['./verify.scss'],
})
export class Verify implements OnInit {
  email: string = '';
  code: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  onVerify(): void {
    if (this.code.length !== 6) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verify({ email: this.email, code: this.code }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Doğrulama sırasında bir hata oluştu.';
      },
    });
  }
}
