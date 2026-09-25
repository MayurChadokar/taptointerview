import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

@Directive({ selector: '[appSectionHandoff]' })
export class SectionHandoffDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private preview?: HTMLElement;
  private incoming?: HTMLElement;
  private header?: HTMLElement;
  private covered = false;
  private pinTop?: number;
  private scrollMargin?: number;
  private previewOpacity = 1;
  private pinPreference?: MediaQueryList;
  private observer?: ResizeObserver;
  private frame?: number;

  ngAfterViewInit(): void {
    this.preview = this.host.nativeElement.querySelector<HTMLElement>('app-scroll-showcase') ?? undefined;
    if (!this.preview) return;
    this.incoming = this.preview.nextElementSibling instanceof HTMLElement ? this.preview.nextElementSibling : undefined;
    this.header = document.querySelector<HTMLElement>('.site-header') ?? undefined;
    this.zone.runOutsideAngular(() => {
      this.pinPreference = window.matchMedia('(min-width: 1081px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
      this.pinPreference.addEventListener('change', this.scheduleMeasure);
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.scheduleMeasure);
        this.observer.observe(this.preview!);
        if (this.header) this.observer.observe(this.header);
      }
      window.addEventListener('resize', this.scheduleMeasure, { passive: true });
      window.addEventListener('scroll', this.scheduleMeasure, { passive: true });
      this.scheduleMeasure();
    });
  }

  private readonly scheduleMeasure = (): void => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      if (!this.preview) return;
      const landingTop = Math.ceil(this.header?.getBoundingClientRect().bottom ?? 83) - 1;
      const pageInset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const margin = landingTop - pageInset;
      if (margin !== this.scrollMargin) {
        this.scrollMargin = margin;
        this.host.nativeElement.style.setProperty('--fits-scroll-margin', `${margin}px`);
      }
      // A tall preview scrolls fully into view before it holds behind the next section.
      const top = Math.min(landingTop, window.innerHeight - this.preview.offsetHeight - 16);
      if (top !== this.pinTop) {
        this.pinTop = top;
        this.host.nativeElement.style.setProperty('--showcase-sticky-top', `${top}px`);
      }
      const sticky = this.pinPreference?.matches ?? false;
      const incomingTop = this.incoming?.getBoundingClientRect().top ?? window.innerHeight;
      const opacity = sticky ? Math.max(0, Math.min(1, (incomingTop - landingTop) / 160)) : 1;
      if (opacity !== this.previewOpacity) {
        this.previewOpacity = opacity;
        this.preview.style.setProperty('--showcase-handoff-opacity', String(opacity));
      }
      const covered = sticky && !!this.incoming && incomingTop <= landingTop + 1;
      if (covered !== this.covered) {
        this.covered = covered;
        this.preview.inert = covered;
        this.preview.classList.toggle('is-covered', covered);
        this.preview.style.setProperty('--showcase-play-state', covered ? 'paused' : 'running');
      }
    });
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.scheduleMeasure);
    window.removeEventListener('scroll', this.scheduleMeasure);
    this.pinPreference?.removeEventListener('change', this.scheduleMeasure);
    this.observer?.disconnect();
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
  }
}
