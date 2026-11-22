import { Component, inject } from '@angular/core';

import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <section class="simple-page">
      <div class="page-heading">
        <p class="section-label">FIÓKKEZELÉS</p>
        <h1>Profilom</h1>
        <p>A bejelentkezett fiókod adatai.</p>
      </div>

      @if (auth.user(); as user) {
        <div class="profile-card">
          <div class="profile-avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <h2>{{ user.username }}</h2>
          <p>{{ user.email }}</p>

          <div class="profile-fields">
            <div>
              <span>Felhasználónév</span>
              <strong>{{ user.username }}</strong>
            </div>

            <div>
              <span>E-mail-cím</span>
              <strong>{{ user.email }}</strong>
            </div>

            <div>
              <span>Szerepkör</span>
              <strong>{{ user.role }}</strong>
            </div>

            <div>
              <span>Fiók állapota</span>
              <strong>{{ user.isActive ? 'Aktív' : 'Inaktív' }}</strong>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class ProfilePage {
  readonly auth = inject(AuthService);
}