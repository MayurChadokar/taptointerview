import { Component, DestroyRef, NgZone, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-page-scroll-controls',
  templateUrl: './page-scroll-controls.html',
  styleUrl: './page-scroll-controls.scss',
})
export class PageScrollControls {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly atTop = signal(true);
  protected readonly atBottom = signal(false);

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        let frame: number | undefined;
        const update = () => {
          frame = undefined;
          const top = window.scrollY <= 4;
          const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
          if (top !== this.atTop() || bottom !== this.atBottom()) {
            this.zone.run(() => {
              this.atTop.set(top);
              this.atBottom.set(bottom);
            });
          }
        };
        const scheduleUpdate = () => {
          if (frame === undefined) frame = requestAnimationFrame(update);
        };
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        const resizeObserver = new ResizeObserver(scheduleUpdate);
        resizeObserver.observe(document.body);
        update();
        this.destroyRef.onDestroy(() => {
          window.removeEventListener('scroll', scheduleUpdate);
          window.removeEventListener('resize', scheduleUpdate);
          resizeObserver.disconnect();
          if (frame !== undefined) cancelAnimationFrame(frame);
        });
      });
    });
  }

  protected scrollTo(edge: 'top' | 'bottom'): void {
    window.scrollTo({
      top: edge === 'top' ? 0 : document.documentElement.scrollHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}
