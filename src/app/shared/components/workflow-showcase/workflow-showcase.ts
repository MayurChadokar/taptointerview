import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { PROCESS_STEPS } from '../../../core/constants/marketing-content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-workflow-showcase',
  imports: [RevealDirective],
  templateUrl: './workflow-showcase.html',
  styleUrl: './workflow-showcase.scss',
})
export class WorkflowShowcase implements AfterViewInit, OnDestroy {
  @ViewChild('workflowSection', { static: true }) private section!: ElementRef<HTMLElement>;
  @ViewChild('watermark', { static: true }) private watermark!: ElementRef<HTMLElement>;
  @ViewChild('productPreview', { static: true }) private productPreview!: ElementRef<HTMLElement>;
  private readonly zone = inject(NgZone);
  private motionPreference?: MediaQueryList;
  private resizeObserver?: ResizeObserver;
  private scrollFrame?: number;
  private lastFrameTime = 0;
  private watermarkProgress = 0;
  private scrollStepPending = false;
  protected readonly headlineWords = 'One link. Four moments.'.split(' ');
  protected readonly accentWords = 'A faster interview.'.split(' ');
  protected readonly steps = PROCESS_STEPS;
  protected readonly activeStep = signal(0);
  protected readonly feedback = signal('');
  protected readonly answer = signal<string | null>(null);
  protected readonly interviewComplete = signal(false);
  protected readonly previewTitles = ['One link. Endless possibilities.', 'The right fit, before you meet.', 'Great people. Ready when you are.', 'Skip the scheduling. Say hello.'];
  protected readonly previewDescriptions = ['Your next conversation starts wherever candidates find you.', 'A few simple questions help the right candidates move forward.', 'A clear, live view of everyone ready for a conversation.', 'Turn a moment of interest into a real connection.'];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      window.addEventListener('scroll', this.onPageScroll, { passive: true });
      window.addEventListener('resize', this.scheduleWatermark, { passive: true });
      this.motionPreference.addEventListener('change', this.scheduleWatermark);
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.scheduleWatermark);
        this.resizeObserver.observe(this.section.nativeElement);
      }
      this.scheduleWatermark();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onPageScroll);
    window.removeEventListener('resize', this.scheduleWatermark);
    this.motionPreference?.removeEventListener('change', this.scheduleWatermark);
    this.resizeObserver?.disconnect();
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
  }

  private readonly scheduleWatermark = (): void => {
    if (this.scrollFrame === undefined) this.scrollFrame = requestAnimationFrame(this.renderWatermark);
  };

  private readonly onPageScroll = (): void => {
    this.scrollStepPending = true;
    this.scheduleWatermark();
  };

  private updateStepFromScroll(): void {
    const product = this.productPreview.nativeElement;
    // Keep an in-use demo control focused while the user interacts with it.
    if (product.contains(document.activeElement)) return;
    const preview = product.getBoundingClientRect();
    const viewport = Math.max(window.innerHeight, 1);
    if (preview.bottom <= 96 || preview.top >= viewport) return;
    const distance = Math.max(1, viewport * .55 - 96);
    const journey = Math.min(1, Math.max(0, (viewport * .55 - preview.top) / distance));
    const current = this.activeStep();
    const count = this.steps.length;
    let next = current;
    // Position selects the step directly; a dead band prevents boundary flicker.
    if (journey > (current + 1) / count + .025) next = Math.floor((journey - .025) * count);
    else if (journey < current / count - .025) next = Math.floor((journey + .025) * count);
    next = Math.min(count - 1, Math.max(0, next));
    if (next !== current) this.zone.run(() => this.activeStep.set(next));
  }

  private readonly renderWatermark = (time: number): void => {
    this.scrollFrame = undefined;
    // Only a new scroll event can change the step, never a timer or a settling frame.
    if (this.scrollStepPending) {
      this.scrollStepPending = false;
      this.updateStepFromScroll();
    }
    const mark = this.watermark.nativeElement;
    if (this.motionPreference?.matches) {
      mark.style.removeProperty('transform');
      this.lastFrameTime = 0;
      return;
    }
    const bounds = this.section.nativeElement.getBoundingClientRect();
    const viewport = Math.max(window.innerHeight, 1);
    const target = Math.min(1, Math.max(0, (viewport * .65 - bounds.top) / Math.max(bounds.height - viewport * .35, 1)));
    const elapsed = this.lastFrameTime ? Math.min(time - this.lastFrameTime, 64) : 16;
    this.lastFrameTime = time;
    const visible = bounds.bottom > 0 && bounds.top < viewport;
    this.watermarkProgress = visible
      ? this.watermarkProgress + (target - this.watermarkProgress) * (1 - Math.exp(-elapsed / 180))
      : target;
    const moving = Math.abs(target - this.watermarkProgress) > .0005;
    if (!moving) this.watermarkProgress = target;
    // Scroll down to lift the backdrop upward, with a bounded, subtle parallax.
    const travel = Math.min(220, Math.max(0, bounds.height - mark.offsetHeight - 96));
    const progress = this.watermarkProgress;
    mark.style.transform = `translate3d(${progress * -18}px, ${48 + travel * (1 - progress)}px, 0) rotate(${-5 + progress * 3}deg)`;
    if (moving && visible) this.scheduleWatermark();
    else this.lastFrameTime = 0;
  };

  protected selectStep(index: number): void {
    this.pauseScrollSteps();
    this.activeStep.set(index);
    this.feedback.set('');
  }

  protected pauseScrollSteps(): void {
    this.scrollStepPending = false;
  }

  protected onStepKey(event: KeyboardEvent, index: number): void {
    const directions: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? this.steps.length - 1 : (index + directions[event.key] + this.steps.length) % this.steps.length;
    this.selectStep(next);
    (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  protected async copyLink(): Promise<void> {
    try { await navigator.clipboard.writeText('https://taptointerview.com/sun-energy'); this.feedback.set('Interview link copied. Ready to share.'); }
    catch { this.feedback.set('Select the interview link above to copy it manually.'); }
  }

  protected chooseAnswer(value: string): void {
    this.answer.set(value);
    this.feedback.set(value === 'Yes' ? 'Great fit! Continue to the waiting room.' : 'Availability recorded. You can still explore the sample waiting room.');
  }
}
