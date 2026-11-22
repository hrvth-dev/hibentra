
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

interface LoginResponse {
  token?: string;
  data?: {
    token?: string;
  };
}

interface MeResponse {
  user?: User;
  data?: {
    user?: User;
  };
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  username: string;
}

const TOKEN_KEY = 'hibentra_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenState = signal<string | null>(
    sessionStorage.getItem(TOKEN_KEY)
  );

  readonly user = signal<User | null>(null);

  readonly isAuthenticated = computed(
    () => !!this.tokenState() && !!this.user()
  );

  getToken(): string | null {
    return this.tokenState();
  }

  register(data: RegisterPayload): Observable<unknown> {
    return this.http.post('/api/auth/register', data);
  }

  login(data: LoginPayload): Observable<User> {
    return this.http
      .post<LoginResponse>('/api/auth/login', data)
      .pipe(
        switchMap(response => {
          // Elfogadjuk a token és a data.token formátumot is.
          const token = response.token ?? response.data?.token;

          if (!token) {
            return throwError(() =>
              new Error('A backend nem küldött JWT-tokent.')
            );
          }

          this.saveToken(token);

          return this.fetchMe().pipe(
            catchError(error => {
              this.logout();
              return throwError(() => error);
            })
          );
        })
      );
  }

  ensureUser(): Observable<User | null> {
    if (!this.getToken()) {
      return of(null);
    }

    if (this.user()) {
      return of(this.user());
    }

    return this.fetchMe().pipe(
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  private fetchMe(): Observable<User> {
    return this.http.get<MeResponse>('/api/users/me').pipe(
      map(response => {
        const user = response.data?.user ?? response.user;

        if (!user || !user.isActive) {
          throw new Error('Érvénytelen vagy inaktív felhasználó.');
        }

        return user;
      }),
      tap(user => this.user.set(user))
    );
  }

  private saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    this.tokenState.set(token);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.tokenState.set(null);
    this.user.set(null);
  }
}
