import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ProductMockup } from '../product-mockup/product-mockup';

@Component({
  imports: [ProductMockup],
  selector: 'app-scroll-showcase',
  templateUrl: './scroll-showcase.html',
  styleUrl: './scroll-showcase.scss',
})
export class ScrollShowcase implements AfterViewInit, OnDestroy {
  @ViewChild('scrollStage', { static: true }) private readonly scrollStage!: ElementRef<HTMLElement>;
  private frameId?: number;
  @ViewChild('tiltSurface', { static: true }) private readonly tiltSurface!: ElementRef<HTMLElement>;
  private tiltFrameId?: number;
  private tiltX = 0;
  private tiltY = 0;

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
      this.resetTilt();
      return;
    }

    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    this.tiltX = -vertical * 4;
    this.tiltY = horizontal * 5;

    if (this.tiltFrameId !== undefined) return;
    this.tiltFrameId = requestAnimationFrame(() => {
      const surface = this.tiltSurface.nativeElement;
      surface.style.setProperty('--pointer-tilt-x', `${this.tiltX.toFixed(2)}deg`);
      surface.style.setProperty('--pointer-tilt-y', `${this.tiltY.toFixed(2)}deg`);
      surface.style.setProperty('--pointer-light-x', `${(this.tiltY / 5 * 50 + 50).toFixed(2)}%`);
      surface.style.setProperty('--pointer-light-y', `${(-this.tiltX / 4 * 50 + 50).toFixed(2)}%`);
      surface.classList.add('has-pointer');
      this.tiltFrameId = undefined;
    });
  }

  protected resetTilt(): void {
    if (this.tiltFrameId !== undefined) cancelAnimationFrame(this.tiltFrameId);
    this.tiltFrameId = undefined;
    this.tiltSurface.nativeElement.style.removeProperty('--pointer-tilt-x');
    this.tiltSurface.nativeElement.style.removeProperty('--pointer-tilt-y');
    this.tiltSurface.nativeElement.classList.remove('has-pointer');
  }

  ngAfterViewInit(): void {
    this.updateProgress();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  queueUpdate(): void {
    this.resetTilt();
    if (this.frameId) return;
    this.frameId = requestAnimationFrame(() => {
      this.updateProgress();
      this.frameId = undefined;
    });
  }

  ngOnDestroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.tiltFrameId !== undefined) cancelAnimationFrame(this.tiltFrameId);
  }

  private updateProgress(): void {
    const element = this.scrollStage.nativeElement;
    const bounds = element.getBoundingClientRect();
    const distance = Math.max(element.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-bounds.top / distance, 0), 1);
    const isMobile = window.innerWidth <= 768;
    const rotation = (isMobile ? 8 : 19) * (1 - progress);
    const scale = isMobile ? 0.78 + progress * 0.2 : 1.055 - progress * 0.055;
    const lift = progress * -72;

    element.style.setProperty('--card-rotate', `${rotation.toFixed(2)}deg`);
    element.style.setProperty('--card-scale', scale.toFixed(3));
    element.style.setProperty('--content-lift', `${lift.toFixed(1)}px`);
    element.style.setProperty('--scroll-progress', progress.toFixed(3));
  }
}
