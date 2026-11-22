import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <section class="simple-page">
      <div class="page-heading">
        <p class="section-label">HIBENTRA</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>

      <div class="simple-card">
        <div class="placeholder-icon">▤</div>
        <h2>{{ title }}</h2>
        <p>
          Az oldal útvonala elkészült.
          A kezelőfelületet a következő fejlesztési lépésben
          kapcsoljuk össze a meglévő API-végpontokkal.
        </p>
      </div>
    </section>
  `
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly title: string = this.route.snapshot.data['title'] ?? 'Modul';
  readonly description: string =
    this.route.snapshot.data['description'] ?? '';
}