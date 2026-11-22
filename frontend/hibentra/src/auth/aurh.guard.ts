
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';


export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureUser().pipe(
    map(user => user ? true : router.parseUrl('/auth'))
  );
};


export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureUser().pipe(
    map(user => user ? router.parseUrl('/dashboard') : true)
  );
};


export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureUser().pipe(
    map(user =>
      user?.role === 'ADMIN'
        ? true
        : router.parseUrl(user ? '/dashboard' : '/auth')
    )
  );
};


export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureUser().pipe(
    map(user =>
      user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
        ? true
        : router.parseUrl(user ? '/dashboard' : '/auth')
    )
  );
};
