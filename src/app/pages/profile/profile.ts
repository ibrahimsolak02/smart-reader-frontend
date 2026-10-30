import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserResponse } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  isLoading = false;
  loadErrorMsg = '';

  editFirstName = '';
  editLastName = '';
  profileSuccessMsg = '';
  profileErrorMsg = '';

  currentPassword = '';
  newPassword = '';
  passwordSuccessMsg = '';
  passwordErrorMsg = '';

  deletePassword = '';
  showDeleteModal = false;
  deleteErrorMsg = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.loadErrorMsg = '';

    if (!this.authService.getToken()) {
      this.logout();
      return;
    }

    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.editFirstName = data.firstName;
        this.editLastName = data.lastName;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.logout();
        } else {
          this.loadErrorMsg =
            'Profil bilgileri yüklenemedi. Lütfen backend servisinin açık olduğundan emin olun.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  onUpdateProfile(): void {
    this.profileSuccessMsg = '';
    this.profileErrorMsg = '';

    if (!this.editFirstName.trim() || !this.editLastName.trim()) {
      this.profileErrorMsg = 'Ad ve soyad alanları boş bırakılamaz.';
      return;
    }

    this.userService
      .updateProfile({
        firstName: this.editFirstName,
        lastName: this.editLastName,
      })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.profileSuccessMsg = 'Profil bilgileriniz başarıyla güncellendi!';
          setTimeout(() => (this.profileSuccessMsg = ''), 4000);
        },
        error: (err) => {
          this.profileErrorMsg = this.authService.getErrorMessage(
            err,
            'Profil güncellenirken bir hata oluştu.',
          );
        },
      });
  }

  onChangePassword(): void {
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    if (!this.currentPassword || !this.newPassword) {
      this.passwordErrorMsg = 'Lütfen tüm şifre alanlarını doldurun.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMsg = 'Yeni şifreniz en az 6 karakter olmalıdır.';
      return;
    }

    this.userService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.passwordSuccessMsg = 'Şifreniz başarıyla güncellendi!';
          this.currentPassword = '';
          this.newPassword = '';
          setTimeout(() => (this.passwordSuccessMsg = ''), 4000);
        },
        error: (err) => {
          this.passwordErrorMsg = this.authService.getErrorMessage(
            err,
            'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.',
          );
        },
      });
  }

  onDeleteAccount(): void {
    this.deleteErrorMsg = '';

    if (!this.deletePassword) {
      this.deleteErrorMsg = 'Lütfen şifrenizi girin.';
      return;
    }

    this.userService.deleteAccount(this.deletePassword).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.deleteErrorMsg = this.authService.getErrorMessage(
          err,
          'Hesap silinemedi. Lütfen şifrenizi doğru girdiğinizden emin olun.',
        );
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
