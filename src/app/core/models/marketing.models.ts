export interface NavItem {
  label: string;
  href: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface ResultMetric {
  value: string;
  label: string;
}

export interface PricingPlan {
  interviews: string;
  price: string;
  featured?: boolean;
}
