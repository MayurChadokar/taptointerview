import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { ProductMockup } from '../product-mockup/product-mockup';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  imports: [ProductMockup, RevealDirective],
  selector: 'app-scroll-showcase',
  templateUrl: './scroll-showcase.html',
  styleUrl: './scroll-showcase.scss',
})
export class ScrollShowcase implements AfterViewInit, OnDestroy {
  @ViewChild('scrollStage', { static: true }) private readonly scrollStage!: ElementRef<HTMLElement>;
  private frameId?: number;
  @ViewChild('tiltSurface', { static: true }) private readonly tiltSurface!: ElementRef<HTMLElement>;
  @ViewChild('perspectiveWrap', { static: true }) private readonly perspectiveWrap!: ElementRef<HTMLElement>;
  private readonly zone = inject(NgZone);
  private visibilityObserver?: IntersectionObserver;
  private motionPreference?: MediaQueryList;
  private pointerPreference?: MediaQueryList;
  private inView = true;
  private tiltFrameId?: number;
  private pointerX = 0;
  private pointerY = 0;
  protected readonly headingWords = 'Your hiring day,'.split(' ');
  protected readonly accentWords = 'moving in real time.'.split(' ');

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' || !this.pointerPreference?.matches) {
      this.resetTilt();
      return;
    }

    this.pointerX = event.clientX;
    this.pointerY = event.clientY;

    if (this.tiltFrameId !== undefined) return;
    this.tiltFrameId = requestAnimationFrame(() => {
      this.tiltFrameId = undefined;
      const bounds = this.perspectiveWrap.nativeElement.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const horizontal = Math.max(-1, Math.min(1, (this.pointerX - bounds.left) / bounds.width * 2 - 1));
      const vertical = Math.max(-1, Math.min(1, (this.pointerY - bounds.top) / bounds.height * 2 - 1));
      const surface = this.tiltSurface.nativeElement;
      surface.style.setProperty('--pointer-tilt-x', `${(-vertical * 1.5).toFixed(2)}deg`);
      surface.style.setProperty('--pointer-tilt-y', `${(horizontal * 2).toFixed(2)}deg`);
      surface.classList.add('has-pointer');
    });
  };

  private readonly resetTilt = (): void => {
    if (this.tiltFrameId !== undefined) cancelAnimationFrame(this.tiltFrameId);
    this.tiltFrameId = undefined;
    this.tiltSurface.nativeElement.style.removeProperty('--pointer-tilt-x');
    this.tiltSurface.nativeElement.style.removeProperty('--pointer-tilt-y');
    this.tiltSurface.nativeElement.classList.remove('has-pointer');
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
      this.motionPreference.addEventListener('change', this.queueUpdate);
      window.addEventListener('scroll', this.queueUpdate, { passive: true });
      window.addEventListener('resize', this.queueUpdate, { passive: true });
      const wrap = this.perspectiveWrap.nativeElement;
      wrap.addEventListener('pointermove', this.onPointerMove, { passive: true });
      wrap.addEventListener('pointerleave', this.resetTilt);
      wrap.addEventListener('pointercancel', this.resetTilt);
      if (typeof IntersectionObserver !== 'undefined') {
        this.visibilityObserver = new IntersectionObserver(([entry]) => {
          this.inView = entry.isIntersecting;
          this.scrollStage.nativeElement.classList.toggle('is-in-view', this.inView);
          if (this.inView) this.queueUpdate();
          else this.resetTilt();
        });
        this.visibilityObserver.observe(this.scrollStage.nativeElement);
      }
      this.updateProgress();
    });
  }

  private readonly queueUpdate = (): void => {
    if (!this.inView || this.frameId !== undefined) return;
    this.frameId = requestAnimationFrame(() => {
      if (this.tiltSurface.nativeElement.classList.contains('has-pointer')) this.resetTilt();
      this.updateProgress();
      this.frameId = undefined;
    });
  };

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.queueUpdate);
    window.removeEventListener('resize', this.queueUpdate);
    this.motionPreference?.removeEventListener('change', this.queueUpdate);
    this.visibilityObserver?.disconnect();
    const wrap = this.perspectiveWrap.nativeElement;
    wrap.removeEventListener('pointermove', this.onPointerMove);
    wrap.removeEventListener('pointerleave', this.resetTilt);
    wrap.removeEventListener('pointercancel', this.resetTilt);
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.tiltFrameId !== undefined) cancelAnimationFrame(this.tiltFrameId);
  }

  private updateProgress(): void {
    const element = this.scrollStage.nativeElement;
    const bounds = element.getBoundingClientRect();
    // This section now flows normally; unfold the product as it enters the viewport.
    const reducedMotion = this.motionPreference?.matches;
    const distance = Math.max(window.innerHeight * .85, 1);
    const progress = reducedMotion ? 1 : Math.min(Math.max((window.innerHeight - bounds.top) / distance, 0), 1);
    const isMobile = window.innerWidth <= 768;
    const rotation = (isMobile ? 0 : 10) * (1 - progress);
    const scale = .975 + progress * .025;
    const lift = (1 - progress) * 20;

    element.style.setProperty('--card-rotate', `${rotation.toFixed(2)}deg`);
    element.style.setProperty('--card-scale', scale.toFixed(3));
    element.style.setProperty('--content-lift', `${lift.toFixed(1)}px`);
    element.style.setProperty('--scroll-progress', progress.toFixed(3));
  }
}
