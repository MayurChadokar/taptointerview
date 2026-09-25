import { Component } from '@angular/core';
import { BENEFITS, CASE_STUDY_METRICS, CHANNELS, LIVE_TEST_METRICS } from '../../core/constants/marketing-content';
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

@Component({
  imports: [Header, ProductMockup, TelemetryBadge, WorkflowShowcase, ScrollShowcase, Testimonials, PricingSection, DemoForm, RevealDirective, ScrollAmbient],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly benefits = BENEFITS;
  protected readonly channels = CHANNELS;
  protected readonly liveTestMetrics = LIVE_TEST_METRICS;
  protected readonly caseStudyMetrics = CASE_STUDY_METRICS;
  protected readonly currentYear = new Date().getFullYear();

  protected moveHeroLight(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const hero = event.currentTarget as HTMLElement;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-pointer-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--hero-pointer-y', `${event.clientY - bounds.top}px`);
    hero.classList.add('has-pointer');
  }

  protected resetHeroLight(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('has-pointer');
  }
}
