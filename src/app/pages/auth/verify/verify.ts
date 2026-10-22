import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  resendMessage: string = '';
  resendDisabled: boolean = false;

  onResend(): void {
    this.resendDisabled = true;
    this.resendMessage = '';
    this.errorMessage = '';

    this.authService.resendCode({ email: this.email }).subscribe({
      next: () => {
        this.resendMessage = 'Yeni doğrulama kodu gönderildi!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.resendDisabled = false;
          this.cdr.detectChanges();
        }, 60000);
      },
      error: (err) => {
        this.resendDisabled = false;
        this.errorMessage = this.authService.getErrorMessage(
          err,
          'Kod gönderilemedi, lütfen tekrar deneyin.',
        );
        this.cdr.detectChanges();
      },
    });
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
        this.errorMessage = this.authService.getErrorMessage(
          err,
          'Doğrulama sırasında bir hata oluştu.',
        );
        this.cdr.detectChanges();
      },
    });
  }
}
