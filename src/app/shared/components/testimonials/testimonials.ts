import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  imports: [RevealDirective],
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly reasons = [
    {
      number: '01',
      title: 'Faster candidate movement',
      copy: 'Interest can turn into an interview while the candidate is still engaged.',
    },
    {
      number: '02',
      title: 'Less scheduling',
      copy: 'Recruiters spend more time interviewing and less time coordinating interviews.',
    },
    {
      number: '03',
      title: 'More interviews in less time',
      copy: 'A single recruiter can conduct qualified applicant interviews continuously during an open interview window.',
    },
  ];

  protected readonly feedbackThemes = ['Smooth.', 'Easy.', 'Stable.', 'Felt like a walk-in interview.', 'This one seemed faster.'];
}
