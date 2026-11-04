import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  isAccountLocked: boolean = false;
  countdownSeconds: number = 0;
  private timerInterval: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onSubmit() {
    if (this.countdownSeconds > 0 || this.isAccountLocked) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;

        if (this.authService.isAccountLockedError(err)) {
          this.isAccountLocked = true;
          this.errorMessage = this.authService.getErrorMessage(
            err,
            'Çok fazla hatalı deneme! Hesabınız güvenlik nedeniyle 15 dakika kilitlendi.',
          );
        }
        else if (this.authService.isRateLimitError(err)) {
          const seconds = this.authService.getRetryAfterSeconds(err, 60);
          this.startCountdown(seconds);
          this.errorMessage = this.authService.getErrorMessage(
            err,
            'Çok fazla istekte bulundunuz. Lütfen bekleyin.',
          );
        }
        else {
          this.errorMessage = this.authService.getErrorMessage(
            err,
            'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
          );
        }

        this.cdr.detectChanges();
      },
    });
  }

  private startCountdown(seconds: number): void {
    this.clearTimer();
    this.countdownSeconds = seconds;

    this.timerInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.clearTimer();
        this.errorMessage = '';
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.countdownSeconds = 0;
  }
}
