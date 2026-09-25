import { Component } from '@angular/core';
import { PRICING_PLANS } from '../../../core/constants/marketing-content';

@Component({
  selector: 'app-pricing-section',
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
})
export class PricingSection {
  protected readonly plans = PRICING_PLANS;
}
