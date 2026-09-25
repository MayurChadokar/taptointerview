import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { RevealObserver } from '../../core/services/reveal-observer.service';

@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal = 'rise';
  @Input() appRevealRepeat = false;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reveals = inject(RevealObserver);
  private stopObserving?: () => void;

  ngAfterViewInit(): void {
    const host = this.element.nativeElement;
    host.dataset['reveal'] = this.appReveal;
    const pieces = host.querySelectorAll<HTMLElement>('.benefit-grid > article, .position-grid > article, .position-grid > aside, .metric-grid > div, .path, .channels > article');
    const children = pieces.length ? Array.from(pieces) : Array.from(host.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    children.forEach((child, index) => {
      child.classList.add('reveal-piece');
      child.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 85}ms`);
    });
    this.stopObserving = this.reveals.observe(host, {
      repeat: this.appRevealRepeat,
      enter: () => host.classList.add('is-visible'),
      reset: () => host.classList.remove('is-visible'),
      finish: () => {
        host.classList.add('is-visible');
        host.getAnimations({ subtree: true }).forEach(animation => {
          if (animation.effect?.getComputedTiming().iterations !== Infinity) animation.finish();
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.stopObserving?.();
  }
}
