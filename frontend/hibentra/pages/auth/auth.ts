
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly registerForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    ],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12)
      ]
    ],
    confirmPassword: ['', [Validators.required]]
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set('');
    this.success.set('');
  }

  submitLogin(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.auth.login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/dashboard');
        },
        error: error => {
          this.error.set(this.getErrorMessage(error));
        }
      });
  }

  submitRegister(): void {
    if (this.registerForm.invalid || this.loading()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const data = this.registerForm.getRawValue();

    if (data.password !== data.confirmPassword) {
      this.error.set('A két jelszó nem egyezik.');
      return;
    }

    if (new TextEncoder().encode(data.password).length > 72) {
      this.error.set('A jelszó legfeljebb 72 bájt lehet.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.auth.register({
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.loginForm.patchValue({
            email: data.email.trim(),
            password: ''
          });

          this.registerForm.reset();
          this.mode.set('login');
          this.success.set('Sikeres regisztráció! Most már bejelentkezhetsz.');
        },
        error: error => {
          this.error.set(this.getErrorMessage(error));
        }
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return typeof error.error?.message === 'string'
        ? error.error.message
        : 'Nem sikerült kapcsolódni a szerverhez.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Váratlan hiba történt.';
  }
}
