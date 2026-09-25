import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly selected = signal<Theme>(this.document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark');
  readonly theme = this.selected.asReadonly();

  toggle(): void {
    const theme: Theme = this.selected() === 'dark' ? 'light' : 'dark';
    this.selected.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fffaf6' : '#06111d');
    if (isPlatformBrowser(this.platformId)) {
      try { this.document.defaultView?.localStorage.setItem('tti-theme', theme); }
      catch { /* The toggle still works when browser storage is unavailable. */ }
    }
  }
}
