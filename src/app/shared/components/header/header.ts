import { Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { NAV_ITEMS } from '../../../core/constants/marketing-content';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly element = inject(ElementRef<HTMLElement>);
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.menuOpen()) return;
    this.closeMenu();
    this.menuToggle?.nativeElement.focus();
  }

  @HostListener('document:pointerdown', ['$event'])
  onOutsidePointer(event: PointerEvent): void {
    if (this.menuOpen() && event.target instanceof Node && !this.element.nativeElement.contains(event.target)) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1080) this.closeMenu();
  }
}
