import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-telemetry-badge',
  templateUrl: './telemetry-badge.html',
  styleUrl: './telemetry-badge.scss',
})
export class TelemetryBadge {
  @Input({ required: true }) value = '';
  @Input({ required: true }) label = '';
  @Input() detail = '';
  @Input() live = false;
}
