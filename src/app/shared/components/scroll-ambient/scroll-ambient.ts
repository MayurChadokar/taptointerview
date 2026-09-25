import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

@Component({
  selector: 'app-scroll-ambient',
  template: '<div class="ambient-glow" #glow aria-hidden="true"></div>',
  styleUrl: './scroll-ambient.scss',
  host: { 'aria-hidden': 'true' },
})
export class ScrollAmbient implements AfterViewInit, OnDestroy {
  @ViewChild('glow', { static: true }) private readonly glow!: ElementRef<HTMLElement>;
  private readonly zone = inject(NgZone);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private sections: HTMLElement[] = [];
  private footer?: HTMLElement;
  private frameId?: number;
  private preference?: MediaQueryList;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private currentOpacity = 1;
  private targetOpacity = 1;
  private ready = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const page: HTMLElement | null = this.host.nativeElement.parentElement;
      const main = page?.querySelector<HTMLElement>('main');
      this.sections = main
        ? Array.from<HTMLElement>(main.querySelectorAll<HTMLElement>('section'))
          .filter(section => section.parentElement === main || section.parentElement?.parentElement === main)
        : [];
      this.footer = page?.querySelector<HTMLElement>('footer') ?? undefined;
      this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      window.addEventListener('scroll', this.updateTarget, { passive: true });
      window.addEventListener('resize', this.updateTarget, { passive: true });
      this.preference.addEventListener('change', this.updateTarget);
      this.updateTarget();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.updateTarget);
    window.removeEventListener('resize', this.updateTarget);
    this.preference?.removeEventListener('change', this.updateTarget);
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
  }

  private readonly updateTarget = (): void => {
    if (this.preference?.matches) {
      if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
      this.ready = false;
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);
    const anchor = viewportHeight * .45;
    let sectionIndex = 0;
    let sectionProgress = 0;
    this.sections.forEach((section, index) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= anchor) {
        sectionIndex = index;
        sectionProgress = Math.min(1, Math.max(0, (anchor - bounds.top) / Math.max(bounds.height, 1)));
      }
    });
    const transition = Math.min(1, Math.max(0, (sectionProgress - .55) / .45));
    const eased = transition * transition * (3 - 2 * transition);
    const start = sectionIndex % 2 === 0 ? .78 : .22;
    const end = sectionIndex % 2 === 0 ? .22 : .78;
    this.targetX = window.innerWidth * (start + (end - start) * eased);
    this.targetY = viewportHeight * .5;
    const footerTop = this.footer?.getBoundingClientRect().top;
    this.targetOpacity = footerTop === undefined ? 1 : Math.min(1, Math.max(0, footerTop / viewportHeight));
    if (this.footer) {
      const remaining = document.documentElement.scrollHeight - window.scrollY - viewportHeight;
      this.targetOpacity = Math.min(this.targetOpacity, Math.max(0, remaining / (viewportHeight * .55)));
    }
    if (!this.ready) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.currentOpacity = this.targetOpacity;
      this.ready = true;
    }
    if (this.frameId === undefined) this.frameId = requestAnimationFrame(this.render);
  };

  private readonly render = (): void => {
    this.currentX += (this.targetX - this.currentX) * .14;
    this.currentY += (this.targetY - this.currentY) * .14;
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * .14;
    this.glow.nativeElement.style.transform = `translate3d(${this.currentX.toFixed(1)}px, ${this.currentY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    this.glow.nativeElement.style.setProperty('--ambient-opacity', this.currentOpacity.toFixed(3));
    if (Math.abs(this.targetX - this.currentX) + Math.abs(this.targetY - this.currentY) > .3 || Math.abs(this.targetOpacity - this.currentOpacity) > .001) {
      this.frameId = requestAnimationFrame(this.render);
    } else {
      this.glow.nativeElement.style.setProperty('--ambient-opacity', this.targetOpacity.toFixed(3));
      this.frameId = undefined;
    }
  };
}
