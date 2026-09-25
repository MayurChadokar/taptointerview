import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DemoLeadService } from '../../../core/services/demo-lead.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-demo-form',
  templateUrl: './demo-form.html',
  styleUrl: './demo-form.scss',
})
export class DemoForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly demoLeadService = inject(DemoLeadService);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: ['', Validators.required],
    volume: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.demoLeadService.submit(this.form.getRawValue()).subscribe(() => {
      this.submitting.set(false);
      this.submitted.set(true);
      this.form.reset();
    });
  }
}
