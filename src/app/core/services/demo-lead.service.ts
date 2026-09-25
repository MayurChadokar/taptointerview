import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface DemoLead {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  volume: string;
}

@Injectable({ providedIn: 'root' })
export class DemoLeadService {
  submit(_lead: DemoLead): Observable<{ success: true }> {
    return of({ success: true as const }).pipe(delay(700));
  }
}
