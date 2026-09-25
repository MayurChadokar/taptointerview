import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { gsap } from 'gsap';
import { RevealObserver } from '../../core/services/reveal-observer.service';

@Directive({ selector: '[appCardRollReveal]' })
export class CardRollRevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly reveals = inject(RevealObserver);
  private motion?: ReturnType<typeof gsap.matchMedia>;

  ngAfterViewInit(): void {
    const slots = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > .position-card-slot'));
    if (!slots.length || typeof IntersectionObserver === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.motion = gsap.matchMedia();
      this.motion.add('(prefers-reduced-motion: no-preference)', () => {
        const scenes = slots.map(slot => ({
          slot,
          visible: false,
          played: false,
          animation: gsap.fromTo(slot.firstElementChild, {
            opacity: 0,
            x: () => Math.min(110, slot.clientWidth * .38),
            rotation: 8,
            transformOrigin: 'right 70%',
          }, {
            opacity: 1,
            x: 0,
            rotation: 0,
            duration: .8,
            ease: 'power3.out',
            paused: true,
            clearProps: 'transform,transformOrigin,opacity',
          }),
        }));
        let active: typeof scenes[number] | undefined;
        const playNext = (): void => {
          if (active) return;
          const next = scenes.find(scene => scene.visible && !scene.played);
          if (!next) return;
          active = next;
          next.played = true;
          next.animation.invalidate().restart();
        };
        scenes.forEach(scene => scene.animation.eventCallback('onComplete', () => {
          if (active === scene) active = undefined;
          playNext();
        }));

        const cleanup = scenes.map(scene => this.reveals.observe(scene.slot, {
          repeat: true,
          enter: () => { scene.visible = true; playNext(); },
          reset: () => {
            scene.visible = false;
            scene.played = false;
            scene.animation.pause(0);
            if (active === scene) active = undefined;
          },
          leave: () => {
            if (scene.visible) {
              scene.played = true;
              scene.animation.progress(1, true).pause();
            }
            scene.visible = false;
            if (active === scene) {
              scene.animation.progress(1, true).pause();
              active = undefined;
              playNext();
            }
          },
          finish: () => {
            scene.played = true;
            scene.animation.progress(1, true).pause();
            if (active === scene) active = undefined;
          },
        }));
        return () => cleanup.forEach(stop => stop());
      }, this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.motion?.revert();
  }
}
