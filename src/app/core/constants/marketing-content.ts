import {
  BenefitItem,
  NavItem,
  PricingPlan,
  ProcessStep,
  ResultMetric,
} from '../models/marketing.models';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Why TTI', href: '#why-tti' },
  { label: 'Where It Fits', href: '#where-it-fits' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
];

export const BENEFITS: BenefitItem[] = [
  {
    icon: 'clock',
    title: 'Reduce scheduling delays',
    description: 'Eliminate the back-and-forth so your team can keep hiring moving.',
  },
  {
    icon: 'people',
    title: 'Engage candidates sooner',
    description: 'Reach people while they are still interested and available.',
  },
  {
    icon: 'bolt',
    title: 'Complete more interviews',
    description: 'Spend more time interviewing and less time scheduling.',
  },
  {
    icon: 'target',
    title: 'Fill open roles faster',
    description: 'Move qualified candidates from interest to interview in less time.',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Share Your Link',
    description: 'Place it in job postings, texts, emails, your ATS, career page, or anywhere candidates can click.',
  },
  {
    number: '02',
    title: 'Qualify Candidates',
    description: 'Candidates answer your qualification questions before entering the interview queue.',
  },
  {
    number: '03',
    title: 'Enter the Waiting Room',
    description: 'Qualified candidates join during your selected live interview window.',
  },
  {
    number: '04',
    title: 'Interview Live',
    description: 'Recruiters connect with qualified candidates as they become available.',
  },
];

export const CHANNELS = [
  'Job Board Postings',
  'Your Existing Database',
  'ATS Reactivation',
  'Social Media',
  'QR Codes',
  'Job Fairs & Hiring Events',
  'Past Candidates',
  'Mass Hiring Campaigns',
];

export const LIVE_TEST_METRICS: ResultMetric[] = [
  { value: '22', label: 'Job Ad Views' },
  { value: '13', label: 'Qualified Candidates' },
  { value: '11', label: 'Completed Interviews' },
  { value: '2', label: 'Hour Interview Window' },
  { value: '1', label: 'Recruiter' },
  { value: '5.5', label: 'Interviews / Recruiter Hour' },
];

export const CASE_STUDY_METRICS: ResultMetric[] = [
  { value: '$35', label: 'Job Ad Spend' },
  { value: '22', label: 'Qualified Applicants' },
  { value: '20', label: 'Live Interviews' },
  { value: '4', label: 'Hour Interview Window' },
  { value: '1', label: 'Recruiter' },
];

export const PRICING_PLANS: PricingPlan[] = [
  { interviews: '10 Interviews', price: '$99' },
  { interviews: '50 Interviews', price: '$399', featured: true },
  { interviews: '100 Interviews', price: '$749' },
];
