import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Sıfırlama kodu e-posta adresinize gönderildi!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { queryParams: { email } });
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.authService.getErrorMessage(
          err,
          'Sıfırlama kodu gönderilemedi. Lütfen e-posta adresinizi kontrol edin.',
        );
        this.cdr.detectChanges();
      },
    });
  }
}
