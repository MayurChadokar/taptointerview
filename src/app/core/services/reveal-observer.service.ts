import { DestroyRef, Injectable, NgZone, afterNextRender, inject } from '@angular/core';

interface RevealCallbacks {
  enter: () => void;
  reset: () => void;
  finish: () => void;
  leave?: () => void;
  repeat?: boolean;
}

interface RevealEntry extends RevealCallbacks {
  target: HTMLElement;
  visible: boolean;
  played: boolean;
  rearmTimer?: number;
}

/** One viewport/anchor clock for CSS and GSAP entrances. */
@Injectable({ providedIn: 'root' })
export class RevealObserver {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly entries = new Map<HTMLElement, RevealEntry>();
  private observer?: IntersectionObserver;
  private preference?: MediaQueryList;
  private destination?: HTMLElement;
  private arrivalDeadline = 0;
  private settleTimer?: number;
  private deadlineTimer?: number;

  constructor() {
    afterNextRender(() => this.onHashChange());
  }

  observe(target: HTMLElement, callbacks: RevealCallbacks): () => void {
    return this.zone.runOutsideAngular(() => {
      this.initialize();
      const entry: RevealEntry = { ...callbacks, target, visible: false, played: false };
      this.entries.set(target, entry);
      if (!this.observer || this.preference?.matches) this.finish(entry);
      else {
        this.reset(entry);
        this.observer.observe(target);
      }
      const onFocus = () => this.finish(entry);
      target.addEventListener('focusin', onFocus);
      if (target.contains(document.activeElement)) onFocus();
      return () => {
        this.observer?.unobserve(target);
        this.entries.delete(target);
        window.clearTimeout(entry.rearmTimer);
        target.removeEventListener('focusin', onFocus);
        delete target.dataset['revealState'];
      };
    });
  }

  private initialize(): void {
    if (this.preference) return;
    this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(records => {
        for (const record of records) {
          const entry = this.entries.get(record.target as HTMLElement);
          if (!entry) continue;
          entry.visible = record.isIntersecting && record.intersectionRatio >= .12;
          if (this.preference?.matches) continue;
          if (!record.isIntersecting) entry.leave?.();
          if (entry.visible) {
            window.clearTimeout(entry.rearmTimer);
            this.reveal(entry);
          }
          else if (!record.isIntersecting && record.boundingClientRect.top >= (record.rootBounds?.bottom ?? innerHeight)
            && entry.played && entry.repeat && !entry.target.contains(document.activeElement)) this.rearm(entry);
        }
      }, { threshold: [0, .12], rootMargin: '0px 0px -32px 0px' });
    }
    this.preference.addEventListener('change', this.onMotionChange);
    document.addEventListener('click', this.onAnchorClick);
    window.addEventListener('hashchange', this.onHashChange);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('scrollend', this.finishNavigation);
    window.addEventListener('wheel', this.interruptNavigation, { passive: true });
    window.addEventListener('touchstart', this.interruptNavigation, { passive: true });
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.preference?.removeEventListener('change', this.onMotionChange);
      document.removeEventListener('click', this.onAnchorClick);
      window.removeEventListener('hashchange', this.onHashChange);
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('scrollend', this.finishNavigation);
      window.removeEventListener('wheel', this.interruptNavigation);
      window.removeEventListener('touchstart', this.interruptNavigation);
      window.clearTimeout(this.settleTimer);
      window.clearTimeout(this.deadlineTimer);
      this.entries.forEach(entry => window.clearTimeout(entry.rearmTimer));
    });
  }

  private reset(entry: RevealEntry): void {
    window.clearTimeout(entry.rearmTimer);
    entry.played = false;
    entry.target.dataset['revealState'] = 'pending';
    entry.reset();
  }

  private rearm(entry: RevealEntry): void {
    // The entrance's own translation can briefly cross the observer edge.
    // Wait for that motion to settle before treating it as a real scroll exit.
    const remaining = entry.target.getAnimations().reduce((longest, animation) => {
      const end = Number(animation.effect?.getComputedTiming().endTime ?? 0);
      return Number.isFinite(end) ? Math.max(longest, end - Number(animation.currentTime ?? 0)) : longest;
    }, 0);
    window.clearTimeout(entry.rearmTimer);
    entry.rearmTimer = window.setTimeout(() => {
      if (!this.preference?.matches && !entry.visible && !entry.target.contains(document.activeElement)
        && entry.target.getBoundingClientRect().top >= innerHeight) this.reset(entry);
    }, Math.min(remaining + 50, 4000));
  }

  private reveal(entry: RevealEntry): void {
    if (entry.played || this.destination) return;
    if (entry.target.parentElement?.closest('[data-reveal-state="pending"]')) return;
    entry.played = true;
    entry.target.dataset['revealState'] = 'visible';
    entry.enter();
    this.entries.forEach(child => {
      if (child !== entry && child.visible && entry.target.contains(child.target)) this.reveal(child);
    });
  }

  private finish(entry: RevealEntry): void {
    window.clearTimeout(entry.rearmTimer);
    entry.played = true;
    entry.target.dataset['revealState'] = 'visible';
    entry.finish();
  }

  private readonly onMotionChange = (): void => {
    if (this.preference?.matches) {
      this.interruptNavigation();
      this.entries.forEach(entry => this.finish(entry));
    }
  };

  private readonly onAnchorClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (anchor.origin === location.origin && anchor.pathname === location.pathname && anchor.search === location.search) {
      this.beginNavigation(anchor.hash);
    }
  };

  private readonly onHashChange = (): void => this.beginNavigation(location.hash);

  private beginNavigation(hash: string): void {
    if (!hash || this.preference?.matches) return;
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const destination = document.getElementById(id);
    if (!destination || this.destination === destination) return;
    this.destination = destination;
    this.arrivalDeadline = performance.now() + 2500;
    this.entries.forEach(entry => {
      if (destination.contains(entry.target) && entry.repeat && !entry.target.contains(document.activeElement)) this.reset(entry);
    });
    window.clearTimeout(this.deadlineTimer);
    this.deadlineTimer = window.setTimeout(this.interruptNavigation, 2500);
    // Also handles clicking the current anchor, where no scroll event is emitted.
    this.onScroll();
  }

  private readonly onScroll = (): void => {
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(this.finishNavigation, 160);
  };

  private readonly interruptNavigation = (): void => {
    if (!this.destination) return;
    this.arrivalDeadline = 0;
    this.finishNavigation();
  };

  private readonly finishNavigation = (): void => {
    // Re-arm only after a target has completely left the actual screen.
    // The observer's inset is an entrance trigger, not a visibility boundary.
    if (!this.preference?.matches) this.entries.forEach(entry => {
      if (entry.played && entry.repeat && !entry.visible && !entry.target.contains(document.activeElement)
        && entry.target.getBoundingClientRect().top >= innerHeight) this.reset(entry);
    });
    if (!this.destination) return;
    const inset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (parseFloat(getComputedStyle(this.destination).scrollMarginTop) || 0);
    const targetY = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight,
      scrollY + this.destination.getBoundingClientRect().top - inset));
    if (Math.abs(targetY - scrollY) > 3 && performance.now() < this.arrivalDeadline) {
      // An interrupted older scroll can emit scrollend before the new anchor arrives.
      window.clearTimeout(this.settleTimer);
      this.settleTimer = window.setTimeout(this.finishNavigation, 120);
      return;
    }
    this.destination = undefined;
    window.clearTimeout(this.settleTimer);
    window.clearTimeout(this.deadlineTimer);
    // Re-measure at arrival; intersection callbacks can be queued after scrollend.
    this.entries.forEach(entry => {
      const rect = entry.target.getBoundingClientRect();
      const visibleHeight = Math.min(innerHeight - 32, rect.bottom) - Math.max(0, rect.top);
      entry.visible = visibleHeight >= rect.height * .12 && rect.height > 0;
      if (entry.visible) this.reveal(entry);
    });
  };
}
