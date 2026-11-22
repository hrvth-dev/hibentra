
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService, UserRole} from '../../auth/auth.service';


interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  readonly navigation = computed<NavigationItem[]>(() => {
    const role = this.auth.user()?.role;

    const items: NavigationItem[] = [
      { label: 'Áttekintés', path: '/dashboard', icon: '⌂' },
      { label: 'Hibajegyek', path: '/tickets', icon: '▤' },
      { label: 'Helyiségek', path: '/rooms', icon: '▦' },
      { label: 'Kategóriák', path: '/categories', icon: '◈' }
    ];

    if (role === 'TECHNICIAN' || role === 'ADMIN') {
      items.push({
        label: 'Kiosztott feladatok',
        path: '/assigned',
        icon: '◷'
      });
    }

    if (role === 'ADMIN') {
      items.push({
        label: 'Felhasználók',
        path: '/users',
        icon: '♙'
      });
    }

    items.push({
      label: 'Profilom',
      path: '/profile',
      icon: '◉'
    });

    return items;
  });

  roleLabel(role?: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Adminisztrátor';
      case 'TECHNICIAN':
        return 'Karbantartó';
      default:
        return 'Felhasználó';
    }
  }

  getInitial(): string {
    return (this.auth.user()?.username ?? 'H')
      .charAt(0)
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth');
  }
}
