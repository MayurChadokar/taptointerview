import { Component, signal } from '@angular/core';
import { PROCESS_STEPS } from '../../../core/constants/marketing-content';

@Component({
  selector: 'app-workflow-showcase',
  templateUrl: './workflow-showcase.html',
  styleUrl: './workflow-showcase.scss',
})
export class WorkflowShowcase {
  protected readonly steps = PROCESS_STEPS;
  protected readonly activeStep = signal(0);
  protected readonly feedback = signal('');
  protected readonly answer = signal<string | null>(null);
  protected readonly interviewComplete = signal(false);
  protected readonly previewTitles = ['One link. Endless possibilities.', 'The right fit, before you meet.', 'Great people. Ready when you are.', 'Skip the scheduling. Say hello.'];
  protected readonly previewDescriptions = ['Your next conversation starts wherever candidates find you.', 'A few simple questions help the right candidates move forward.', 'A clear, live view of everyone ready for a conversation.', 'Turn a moment of interest into a real connection.'];

  protected selectStep(index: number): void {
    this.activeStep.set(index);
    this.feedback.set('');
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
