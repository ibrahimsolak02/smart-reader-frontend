import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const userEmail = this.registerForm.get('email')?.value;
        this.router.navigate(['/verify'], { queryParams: { email: userEmail } });
      },
      error: (err) => {
        this.isLoading = false;

        let msg = 'Kayıt işlemi başarısız oldu.';
        if (err?.error) {
          try {
            const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            msg = body.message || msg;
          } catch {
            msg = typeof err.error === 'string' ? err.error : msg;
          }
        }

        this.errorMessage = msg;
        this.cdr.detectChanges();
      },
    });
  }
}
