import { Component, OnDestroy } from '@angular/core';
import { BENEFITS } from '../../core/constants/marketing-content';
import { DemoForm } from '../../shared/components/demo-form/demo-form';
import { Header } from '../../shared/components/header/header';
import { PricingSection } from '../../shared/components/pricing-section/pricing-section';
import { ProductMockup } from '../../shared/components/product-mockup/product-mockup';
import { ScrollShowcase } from '../../shared/components/scroll-showcase/scroll-showcase';
import { TelemetryBadge } from '../../shared/components/telemetry-badge/telemetry-badge';
import { Testimonials } from '../../shared/components/testimonials/testimonials';
import { WorkflowShowcase } from '../../shared/components/workflow-showcase/workflow-showcase';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ScrollAmbient } from '../../shared/components/scroll-ambient/scroll-ambient';
import { ChannelSection } from '../../shared/components/channel-section/channel-section';
import { SectionHandoffDirective } from '../../shared/directives/section-handoff.directive';
import { ResultsSection } from '../../shared/components/results-section/results-section';
import { FooterRevealDirective } from '../../shared/directives/footer-reveal.directive';
import { CardRollRevealDirective } from '../../shared/directives/card-roll-reveal.directive';
import { PageScrollControls } from '../../shared/components/page-scroll-controls/page-scroll-controls';

@Component({
  imports: [Header, ProductMockup, TelemetryBadge, WorkflowShowcase, ScrollShowcase, Testimonials, PricingSection, DemoForm, RevealDirective, ScrollAmbient, ChannelSection, SectionHandoffDirective, ResultsSection, FooterRevealDirective, CardRollRevealDirective, PageScrollControls],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnDestroy {
  private heroLightFrame?: number;
  protected readonly benefits = BENEFITS;
  protected readonly problemHeadlineWords = 'Hiring slows down when scheduling gets in the way.'.split(' ');
  protected readonly currentYear = new Date().getFullYear();

  protected moveHeroLight(event: PointerEvent): void {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (this.heroLightFrame !== undefined) cancelAnimationFrame(this.heroLightFrame);
    const hero = event.currentTarget as HTMLElement;
    const { clientX, clientY } = event;
    this.heroLightFrame = requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty('--hero-pointer-x', `${clientX - bounds.left}px`);
      hero.style.setProperty('--hero-pointer-y', `${clientY - bounds.top}px`);
      hero.classList.add('has-pointer');
      this.heroLightFrame = undefined;
    });
  }

  protected resetHeroLight(event: PointerEvent): void {
    this.ngOnDestroy();
    (event.currentTarget as HTMLElement).classList.remove('has-pointer');
  }

  ngOnDestroy(): void {
    if (this.heroLightFrame !== undefined) cancelAnimationFrame(this.heroLightFrame);
    this.heroLightFrame = undefined;
  }
}
