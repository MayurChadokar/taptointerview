import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { CASE_STUDY_METRICS, LIVE_TEST_METRICS } from '../../../core/constants/marketing-content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-results-section',
  imports: [RevealDirective],
  templateUrl: './results-section.html',
  styleUrl: './results-section.scss',
})
export class ResultsSection implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private header?: HTMLElement;
  private resizeObserver?: ResizeObserver;

  protected readonly studies = [
    { number: '01', label: 'RECENT LIVE TEST', title: 'More interviews in less recruiter time.', metrics: LIVE_TEST_METRICS, featured: false },
    { number: '02', label: 'HIRING-DAY CASE STUDY', title: 'A live hiring session built for volume.', metrics: CASE_STUDY_METRICS, featured: true },
  ].map(study => ({
    ...study,
    metrics: study.metrics.map(metric => ({
      ...metric,
      digits: Array.from(metric.value, character => {
        const turns = /^\d$/.test(character) ? Number(character) + 10 : null;
        return { character, turns, reel: turns === null ? [] : Array.from({ length: turns + 1 }, (_, index) => index % 10) };
      }),
    })),
  }));

  ngAfterViewInit(): void {
    this.header = document.querySelector<HTMLElement>('.site-header') ?? undefined;
    this.zone.runOutsideAngular(() => {
      this.alignAnchor();
      if (this.header && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.alignAnchor);
        this.resizeObserver.observe(this.header);
      }
      window.addEventListener('resize', this.alignAnchor, { passive: true });
    });
  }

  private readonly alignAnchor = (): void => {
    const headerBottom = Math.ceil(this.header?.getBoundingClientRect().bottom ?? 83);
    const pageInset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    this.host.nativeElement.style.setProperty('--results-scroll-margin', `${headerBottom - 1 - pageInset}px`);
  };

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.alignAnchor);
  }
}
