import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { RevealObserver } from '../../core/services/reveal-observer.service';

@Directive({ selector: '[appFooterReveal]' })
export class FooterRevealDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) appFooterReveal!: HTMLElement;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly reveals = inject(RevealObserver);
  private motion?: ReturnType<typeof gsap.matchMedia>;

  ngAfterViewInit(): void {
    const stage = this.host.nativeElement;
    const cta = stage.querySelector<HTMLElement>('.final-cta');
    const footer = this.appFooterReveal;
    const footerContent = footer?.querySelector<HTMLElement>('.footer-reveal-content');
    if (!cta || !footerContent || typeof IntersectionObserver === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.motion = gsap.matchMedia();
      this.motion.add('(prefers-reduced-motion: no-preference)', () => {
        const drop = (target: HTMLElement, distance: number, delay = 0) => gsap.timeline({ paused: true })
          .fromTo(target, { opacity: 0, y: -distance }, { opacity: 1, y: 5, duration: .38, ease: 'power2.in' }, delay)
          .to(target, { y: 0, duration: .18, ease: 'power2.out', clearProps: 'transform,opacity' });

        const scenes = new Map([[stage, drop(cta, 72)], [footer, drop(footerContent, 36, .1)]]);
        const cleanup = Array.from(scenes, ([target, animation]) => this.reveals.observe(target, {
          repeat: true,
          enter: () => { animation.restart(); },
          reset: () => { animation.pause(0); },
          finish: () => { animation.progress(1).pause(); },
        }));
        return () => cleanup.forEach(stop => stop());
      });
    });
  }

  ngOnDestroy(): void {
    this.motion?.revert();
  }
}
