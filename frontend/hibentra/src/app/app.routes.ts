
import { Routes } from '@angular/router';

import {
  authGuard,
  guestGuard,
  adminGuard,
  staffGuard
} from '../auth/aurh.guard';

import { AuthPage } from '../pages/auth/auth';
import { DashboardLayout } from '../layout/dashboard-layout/dashboard-layout';
import { DashboardHome } from '../pages/dashboard-home/dashboard-home';
import { PlaceholderPage } from '../pages/placeholder/placeholder';
import { ProfilePage } from '../pages/profile/profile';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthPage,
    canActivate: [guestGuard]
  },

  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      {
        path: 'dashboard',
        component: DashboardHome
      },

      {
        path: 'tickets',
        component: PlaceholderPage,
        data: {
          title: 'Hibajegyek',
          description: 'Hibabejelentések megtekintése és kezelése.'
        }
      },

      {
        path: 'rooms',
        component: PlaceholderPage,
        data: {
          title: 'Helyiségek',
          description: 'Intézményi termek és helyiségek nyilvántartása.'
        }
      },

      {
        path: 'categories',
        component: PlaceholderPage,
        data: {
          title: 'Kategóriák',
          description: 'Hibakategóriák áttekintése.'
        }
      },

      {
        path: 'assigned',
        component: PlaceholderPage,
        canActivate: [staffGuard],
        data: {
          title: 'Kiosztott feladatok',
          description: 'Karbantartói feladatok és javítások.'
        }
      },

      {
        path: 'users',
        component: PlaceholderPage,
        canActivate: [adminGuard],
        data: {
          title: 'Felhasználók kezelése',
          description: 'Felhasználók és szerepkörök adminisztrációja.'
        }
      },

      {
        path: 'profile',
        component: ProfilePage
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
