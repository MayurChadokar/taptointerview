import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { PRICING_PLANS } from '../../../core/constants/marketing-content';
import { RevealObserver } from '../../../core/services/reveal-observer.service';

@Component({
  selector: 'app-pricing-section',
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
})
export class PricingSection implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly reveals = inject(RevealObserver);
  private motion?: ReturnType<typeof gsap.matchMedia>;
  protected readonly plans = PRICING_PLANS;

  ngAfterViewInit(): void {
    const plans = this.host.nativeElement.querySelector<HTMLElement>('.plans');
    const cards = this.host.nativeElement.querySelectorAll<HTMLElement>('.plan-entry');
    const heading = this.host.nativeElement.querySelector<HTMLElement>('.pricing-heading');
    if (!plans || !cards.length || !heading || typeof IntersectionObserver === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.motion = gsap.matchMedia();
      this.motion.add('(prefers-reduced-motion: no-preference)', () => {
        const copyEntrance = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } })
          .fromTo(heading.querySelector('.pricing-kicker'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8 }, 0)
          .fromTo(heading.querySelectorAll('.pricing-word'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, stagger: .075 }, .12)
          .fromTo(heading.querySelector('.pricing-description'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1 }, .55);

        // Animate the wrappers so card hover transforms remain independent.
        const observe = (target: HTMLElement, animation: gsap.core.Animation) => this.reveals.observe(target, {
          repeat: true,
          enter: () => { animation.restart(true); },
          reset: () => { animation.pause(0); },
          finish: () => { animation.progress(1).pause(); },
        });
        const cleanup = [observe(heading, copyEntrance)];
        cards.forEach((card, index) => {
          const entrance = gsap.fromTo(card, { opacity: 0, y: 24 }, {
            opacity: 1, y: 0, duration: 1, delay: index * .1,
            ease: 'power3.out', paused: true, clearProps: 'transform,opacity',
          });
          cleanup.push(observe(card, entrance));
        });
        return () => cleanup.forEach(stop => stop());
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.motion?.revert();
  }
}
