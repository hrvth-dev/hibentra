
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

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

  // ============================
  // BEJELENTKEZÉSI FORM
  // ============================

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required
      ]
    ]
  });

  // ============================
  // REGISZTRÁCIÓS FORM
  // ============================

  readonly registerForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12)
      ]
    ],
    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ]
  });

  // ============================
  // NÉZETVÁLTÁS
  // ============================

  setMode(mode: 'login' | 'register'): void {
    console.log('[AUTH] Nézetváltás:', mode);

    this.mode.set(mode);
    this.error.set('');
    this.success.set('');
  }

  // ============================
  // BEJELENTKEZÉS
  // ============================

  submitLogin(): void {
    console.log('[LOGIN] Gomb megnyomva!');
    console.log('[LOGIN] Form érvényes:', this.loginForm.valid);
    console.log('[LOGIN] Form státusz:', this.loginForm.status);

    console.log(
      '[LOGIN] Email validációs hibák:',
      this.loginForm.controls.email.errors
    );

    console.log(
      '[LOGIN] Jelszó validációs hibák:',
      this.loginForm.controls.password.errors
    );

    if (this.loading()) {
      console.warn('[LOGIN] Már folyamatban van egy kérés.');
      return;
    }

    // Form validáció

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      console.warn('[LOGIN] Érvénytelen űrlap.');

      this.error.set(
        'Kérlek, add meg helyesen az e-mail-címedet és a jelszavadat!'
      );

      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    console.log('[LOGIN] API-kérés indítása...');

    this.auth.login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => {
          this.loading.set(false);
          console.log('[LOGIN] Kérés befejezve.');
        })
      )
      .subscribe({
        next: (user) => {
          console.log(
            '[LOGIN] Sikeres bejelentkezés:',
            user.username
          );

          console.log('[LOGIN] Átirányítás a dashboardra...');

          this.router.navigateByUrl('/dashboard')
            .then(success => {
              console.log(
                '[LOGIN] Navigáció sikeres:',
                success
              );
            });
        },

        error: (error) => {
          console.error('[LOGIN] API-hiba:', error);

          if (error instanceof HttpErrorResponse) {
            console.error(
              '[LOGIN] HTTP státuszkód:',
              error.status
            );
          }

          this.error.set(this.getErrorMessage(error));
        }
      });
  }

  // ============================
  // REGISZTRÁCIÓ
  // ============================

  submitRegister(): void {
    console.log('[REGISTER] Gomb megnyomva!');
    console.log(
      '[REGISTER] Form érvényes:',
      this.registerForm.valid
    );

    console.log(
      '[REGISTER] Form státusz:',
      this.registerForm.status
    );

    console.log('[REGISTER] Validációs hibák:', {
      username: this.registerForm.controls.username.errors,
      email: this.registerForm.controls.email.errors,
      password: this.registerForm.controls.password.errors,
      confirmPassword:
        this.registerForm.controls.confirmPassword.errors
    });

    if (this.loading()) {
      console.warn(
        '[REGISTER] Már folyamatban van egy kérés.'
      );
      return;
    }

    // Form validáció

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      console.warn('[REGISTER] Érvénytelen űrlap.');

      this.error.set(
        'Kérlek, töltsd ki helyesen az összes regisztrációs mezőt!'
      );

      return;
    }

    const data = this.registerForm.getRawValue();

    // Jelszavak egyezése

    if (data.password !== data.confirmPassword) {
      console.warn(
        '[REGISTER] A jelszavak nem egyeznek.'
      );

      this.error.set('A két jelszó nem egyezik.');
      return;
    }

    // Jelszó maximális méretének ellenőrzése

    if (new TextEncoder().encode(data.password).length > 72) {
      console.warn(
        '[REGISTER] A jelszó meghaladja a 72 bájtot.'
      );

      this.error.set(
        'A jelszó legfeljebb 72 bájt lehet.'
      );

      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    console.log('[REGISTER] API-kérés indítása...');

    this.auth.register({
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          console.log('[REGISTER] Kérés befejezve.');
        })
      )
      .subscribe({
        next: () => {
          console.log(
            '[REGISTER] Sikeres regisztráció!'
          );

          this.loginForm.patchValue({
            email: data.email.trim(),
            password: ''
          });

          this.registerForm.reset();

          this.mode.set('login');

          this.success.set(
            'Sikeres regisztráció! Most már bejelentkezhetsz.'
          );
        },

        error: (error) => {
          console.error(
            '[REGISTER] API-hiba:',
            error
          );

          if (error instanceof HttpErrorResponse) {
            console.error(
              '[REGISTER] HTTP státuszkód:',
              error.status
            );
          }

          this.error.set(this.getErrorMessage(error));
        }
      });
  }

  // ============================
  // HIBAÜZENETEK
  // ============================

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'Nem sikerült kapcsolódni a backend szerverhez.';
      }

      if (error.status === 401) {
        return 'Hibás e-mail-cím vagy jelszó.';
      }

      if (error.status === 409) {
        return 'A felhasználónév vagy e-mail-cím már foglalt.';
      }

      return `Szerverhiba történt. HTTP: ${error.status}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Váratlan hiba történt.';
  }
}
