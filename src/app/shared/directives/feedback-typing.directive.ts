import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy, inject } from '@angular/core';

@Directive({ selector: '[appFeedbackTyping]' })
export class FeedbackTypingDirective implements AfterViewInit, OnDestroy {
  @Input() typingDelay = 240;
  @Input() typingInterval = 24;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private revealObserver?: MutationObserver;
  private preference?: MediaQueryList;
  private output?: HTMLElement;
  private text = '';
  private deadlines: number[] = [];
  private visible = false;
  private phase: 'typing' | 'holding' | 'resetting' = 'typing';
  private cursor = 0;
  private elapsed = 0;
  private lastFrame?: number;
  private frame?: number;

  ngAfterViewInit(): void {
    const host = this.element.nativeElement;
    this.text = host.querySelector('[data-typing-source]')?.textContent?.trim() ?? '';
    this.output = host.querySelector<HTMLElement>('[data-typing-text]') ?? undefined;
    if (!this.text || !this.output) return;

    let deadline = this.typingDelay;
    this.deadlines = Array.from(this.text, character => {
      deadline += /[.!?]/.test(character) ? 100 : /[,;]/.test(character) ? 65 : this.typingInterval;
      return deadline;
    });

    this.zone.runOutsideAngular(() => {
      this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (typeof IntersectionObserver === 'undefined') return;
      this.preference.addEventListener('change', this.onPreferenceChange);
      document.addEventListener('visibilitychange', this.updatePlayback);
      const reveal = host.closest('[appReveal]');
      if (reveal) {
        this.revealObserver = new MutationObserver(this.updatePlayback);
        this.revealObserver.observe(reveal, { attributes: true, attributeFilter: ['data-reveal-state'] });
      }
      this.updatePlayback();
      this.observer = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.updatePlayback();
      }, { threshold: .12 });
      this.observer.observe(host);
    });
  }

  private readonly onPreferenceChange = (): void => {
    this.resetCycle();
    this.updatePlayback();
  };

  private readonly updatePlayback = (): void => {
    const host = this.element.nativeElement;
    const staticText = this.preference?.matches;
    host.classList.toggle('is-typing', !staticText);
    const waitingForReveal = !!host.closest('[data-reveal-state="pending"]');
    if (staticText || !this.visible || document.hidden || waitingForReveal) {
      if (this.frame !== undefined) cancelAnimationFrame(this.frame);
      this.frame = undefined;
      this.lastFrame = undefined;
      host.classList.add('is-typing-paused');
      if (staticText) host.classList.remove('is-typing', 'is-resetting');
      return;
    }
    host.classList.remove('is-typing-paused');
    host.classList.add('is-typing');
    if (this.frame === undefined) this.frame = requestAnimationFrame(this.typeFrame);
  };

  private readonly typeFrame = (now: number): void => {
    this.frame = undefined;
    if (this.lastFrame !== undefined) this.elapsed += Math.min(now - this.lastFrame, 60);
    this.lastFrame = now;
    if (this.phase === 'typing') {
      const previous = this.cursor;
      while (this.cursor < this.deadlines.length && this.elapsed >= this.deadlines[this.cursor]) this.cursor++;
      if (this.cursor !== previous && this.output) this.output.textContent = this.text.slice(0, this.cursor);
      if (this.cursor === this.deadlines.length) {
        this.phase = 'holding';
        this.elapsed = 0;
      }
    } else if (this.phase === 'holding' && this.elapsed >= 2600) {
      // Leave the complete feedback readable, then gently fade before the next pass.
      this.phase = 'resetting';
      this.elapsed = 0;
      this.element.nativeElement.classList.add('is-resetting');
    } else if (this.phase === 'resetting' && this.elapsed >= 450) {
      this.resetCycle();
    }
    this.frame = requestAnimationFrame(this.typeFrame);
  };

  private resetCycle(): void {
    this.phase = 'typing';
    this.cursor = 0;
    this.elapsed = 0;
    this.lastFrame = undefined;
    this.element.nativeElement.classList.remove('is-resetting');
    if (this.output) this.output.textContent = '';
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.revealObserver?.disconnect();
    this.preference?.removeEventListener('change', this.onPreferenceChange);
    document.removeEventListener('visibilitychange', this.updatePlayback);
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
  }
}
