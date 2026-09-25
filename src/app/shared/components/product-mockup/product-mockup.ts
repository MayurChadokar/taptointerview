import { AfterViewInit, Component, ElementRef, Input, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

const icons: Record<string, string> = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  job: 'M4 7h16v14H4z M9 7V3h6v4 M8 7v14 M16 7v14',
  plus: 'M12 4v16 M4 12h16',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  credits: 'M3 5h18v14H3z M3 9h18 M6 15h4',
  back: 'M20 12H4 M10 6l-6 6 6 6',
  mic: 'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8',
  video: 'M3 5h12v14H3z M15 9l6-3v12l-6-3z',
  screen: 'M3 3h18v14H3z M12 17v4 M8 21h8 M12 13V7 M9 10l3-3 3 3',
  chat: 'M21 11a9 8 0 0 1-9 8H8l-5 3 1-6a8 8 0 0 1-1-5 9 8 0 0 1 18 0',
  more: 'M4 12h1 M11 12h1 M18 12h1',
  notes: 'M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',
  logout: 'M10 3H3v18h7 M9 12h12 M17 8l4 4-4 4',
};

@Component({ selector: 'app-mock-icon', template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name] || paths[\'people\']" /></svg>', styles: [':host { display: inline-flex; width: 1.3em; height: 1.3em; flex-shrink: 0; } svg { width: 100%; height: 100%; }'] })
export class MockIcon {
  @Input() name = 'people';
  readonly paths = icons;
}

interface Candidate { name: string; initials: string; joined: string; }
interface DemoJob { title: string; location: string; type: string; live: boolean; department?: string; description?: string; requirements?: string; salaryFrom?: number | null; salaryTo?: number | null; question?: string; start?: string; end?: string; interviewers?: string[]; }
interface TeamMember { first: string; last: string; email: string; role: string; jobs: string[]; }

@Component({
  selector: 'app-product-mockup',
  imports: [FormsModule, MockIcon],
  templateUrl: './product-mockup.html',
  styleUrls: ['./product-mockup.scss', './product-workspace.scss'],
})
export class ProductMockup implements AfterViewInit, OnDestroy {
  @Input() mode: 'queue' | 'waiting-room' = 'queue';

  readonly tabs = [
    { label: 'Dashboard', icon: 'dashboard' }, { label: 'My Queue', icon: 'people' },
    { label: 'My Jobs', icon: 'job' }, { label: 'Post Job', icon: 'plus' },
    { label: 'Team', icon: 'people' }, { label: 'Settings', icon: 'settings' }, { label: 'Credits', icon: 'credits' },
  ];
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const viewport = this.host.nativeElement.querySelector<HTMLElement>('.mock-viewport');
    const canvas = this.host.nativeElement.querySelector<HTMLElement>('.mock-desktop-canvas');
    if (!viewport || !canvas || typeof ResizeObserver === 'undefined') return;

    // Measure layout dimensions, unaffected by the marketing frame's transforms.
    // The desktop canvas owns its container units; only its rendered size changes.
    const fit = () => {
      const scale = Math.min(viewport.clientWidth / canvas.offsetWidth, viewport.clientHeight / canvas.offsetHeight);
      viewport.style.setProperty('--mock-scale', String(Math.max(0, scale)));
    };
    fit();
    this.resizeObserver = new ResizeObserver(fit);
    this.resizeObserver.observe(viewport);
  }
  tab = 'My Queue';
  inInterview = true;
  interviewEnded = false;
  loggedOut = false;
  muted = false;
  camera = true;
  sharing = false;
  chatOpen = false;
  moreOpen = false;
  selected: Candidate | null = null;
  readonly elapsed = signal(24 * 60 + 17);
  readonly notice = signal('');
  current: Candidate = { name: 'Alejandra Gonzalez', initials: 'AG', joined: '11:35 AM' };
  readonly demoCandidates: Candidate[] = [
    { name: 'Israel Torres', initials: 'I', joined: '10:39 AM' },
    { name: 'Devonta Brown', initials: 'D', joined: '10:59 AM' },
    { name: 'Jason Valle', initials: 'J', joined: '11:38 AM' },
  ];
  candidates: Candidate[] = this.demoCandidates.map(person => ({ ...person }));
  get waiting(): Candidate[] { return this.candidates; }
  set waiting(value: Candidate[]) { this.candidates = value; }
  completed = 12;
  readonly evaluatedInterviews = 12;
  readonly passedInterviews = 9;
  get passRate(): number { return Math.round(this.passedInterviews / this.evaluatedInterviews * 100); }
  notes = 'Two years of warehouse experience. Available for afternoon shifts and comfortable with loading, inventory checks, and team coordination.';
  savedNotes: Record<string, string> = { 'Alejandra Gonzalez': this.notes };
  chatMessage = '';
  messages: string[] = ['Hi Alejandra, welcome! We’ll start with your warehouse experience.', 'This role has afternoon shifts. We can discuss your availability next.'];
  credits = 24;
  company = 'Sun Energy Insulation';
  companyDraft = this.company;
  reminders = true;
  recruiterImageFailed = false;
  applicantImageFailed = false;
  jobs: DemoJob[] = [
    { title: 'Dock Loader', location: 'Florida', type: 'Part-time', live: true, department: 'Operations', description: 'Load and unload shipments, organize materials, and keep the loading dock safe and efficient.', salaryFrom: 18, salaryTo: 24, interviewers: ['cesar@example.com'] },
    { title: 'Customer Support Associate', location: 'Remote', type: 'Full-time', live: true, department: 'Customer Experience', description: 'Help customers with orders, answer product questions, and deliver thoughtful support.', salaryFrom: 42000, salaryTo: 55000, interviewers: ['morgan@example.com'] },
    { title: 'Warehouse Supervisor', location: 'Austin, TX', type: 'Full-time', live: true, department: 'Operations', description: 'Lead daily warehouse operations, coordinate shift schedules, and coach a growing team.', salaryFrom: 52000, salaryTo: 68000, interviewers: ['cesar@example.com'] },
    { title: 'Sales Representative', location: 'Tampa, FL', type: 'Contract', live: false, department: 'Sales', description: 'Build customer relationships and help businesses choose the right insulation solutions.', salaryFrom: 45000, salaryTo: 65000, interviewers: ['jordan@example.com'] },
  ];
  readonly steps = ['Job Details', 'Qualifications', 'Windows', 'Interviewers', 'Review'];
  readonly employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  step = 0;
  draftJob = {
    ...this.emptyJob(), title: 'Inventory Coordinator', location: 'Orlando, FL', department: 'Operations',
    salaryFrom: 40000 as number | null, salaryTo: 52000 as number | null,
    description: 'Coordinate incoming stock, maintain accurate inventory records, and work with the warehouse team to keep orders moving on time.',
    requirements: 'One year of inventory or warehouse experience. Strong attention to detail, basic spreadsheet skills, and clear communication.',
    question: 'Are you comfortable working with inventory software and checking incoming deliveries?',
    start: this.futureLocalTime(1, 10), end: this.futureLocalTime(1, 12), interviewers: ['cesar@example.com'],
  };
  team: TeamMember[] = [
    { first: 'Mayur', last: 'Chadokar', email: 'mayurchadokar14@gmail.com', role: 'Admin', jobs: ['Dock Loader', 'Customer Support Associate', 'Warehouse Supervisor', 'Sales Representative'] },
    { first: 'Cesar', last: 'Desir', email: 'cesar@example.com', role: 'Interviewer', jobs: ['Dock Loader', 'Warehouse Supervisor'] },
    { first: 'Morgan', last: 'Lee', email: 'morgan@example.com', role: 'Interviewer', jobs: ['Customer Support Associate'] },
    { first: 'Jordan', last: 'Parker', email: 'jordan@example.com', role: 'Admin', jobs: ['Sales Representative'] },
  ];
  invite: TeamMember = { first: 'Jane', last: 'Wilson', email: 'jane.wilson@example.com', role: 'Interviewer', jobs: ['Dock Loader'] };
  editingMember: number | null = null;
  settingsTab = 'Company Profile';
  displayName = 'Mayur Chadokar';
  accountName = this.displayName;
  accountEmail = this.team[0].email;
  emailUpdates = true;
  previewCompany = false;
  jobSearch = '';
  jobFilter = 'All';

  private emptyJob() { return { title: '', location: '', department: '', type: 'Full-time', salaryFrom: null as number | null, salaryTo: null as number | null, description: '', requirements: '', question: '', start: '', end: '', interviewers: [] as string[] }; }
  private futureLocalTime(days: number, hour: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  get activeJobs(): DemoJob[] { return this.jobs.filter(job => job.live); }
  get filteredJobs(): DemoJob[] { return this.jobs.filter(job => job.title.toLowerCase().includes(this.jobSearch.toLowerCase()) && (this.jobFilter === 'All' || (job.live ? 'Live' : 'Paused') === this.jobFilter)); }
  get slug(): string { return this.company.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-2451o02'; }
  get companyUrl(): string { return 'https://app.taptointerview.com/company/' + this.slug; }
  get pageKicker(): string { return ({ Dashboard: 'WELCOME BACK', 'My Queue': 'QUEUE MANAGEMENT', 'My Jobs': 'JOB MANAGEMENT', 'Post Job': `STEP ${this.step + 1} OF 5`, Team: 'MANAGE TEAM', Settings: 'PREFERENCES', Credits: 'MANAGE CREDITS' } as Record<string, string>)[this.tab]; }
  get pageTitle(): string { return ({ 'My Jobs': 'MY JOBS', 'Post Job': 'POST NEW JOB', Team: 'Team Members', Settings: 'SETTINGS', Credits: 'CREDITS' } as Record<string, string>)[this.tab] ?? this.tab; }
  private readonly ticker = setInterval(() => {
    if (this.inInterview && !this.loggedOut) this.elapsed.update(value => value + 1);
  }, 1000);

  get time(): string { return `${Math.floor(this.elapsed() / 60).toString().padStart(2, '0')}:${(this.elapsed() % 60).toString().padStart(2, '0')}`; }
  navigate(tab: string): void { this.tab = tab; this.notice.set(''); this.selected = null; this.moreOpen = false; this.scrollTop(); }
  scrollTop(): void { this.host.nativeElement.querySelector('.product-content')?.scrollTo({ top: 0 }); }
  startDemo(): void {
    this.waiting = this.demoCandidates.map(person => ({ ...person }));
    this.current = { name: 'Alejandra Gonzalez', initials: 'AG', joined: '11:35 AM' };
    this.inInterview = true; this.interviewEnded = false; this.elapsed.set(24 * 60 + 17); this.notes = this.savedNotes[this.current.name] ?? '';
    this.navigate('My Queue');
  }
  saveNotes(): void { this.savedNotes[this.current.name] = this.notes; this.notice.set('Notes saved for this preview.'); }
  endInterview(): void { this.saveNotes(); this.inInterview = false; this.interviewEnded = true; this.completed++; this.chatOpen = false; this.sharing = false; this.notice.set('Interview ended. Admit the next candidate when you’re ready.'); }
  admit(candidate: Candidate): void {
    this.current = candidate; this.waiting = this.waiting.filter(person => person !== candidate);
    this.notes = this.savedNotes[candidate.name] ?? ''; this.elapsed.set(0); this.inInterview = true; this.interviewEnded = false;
    this.messages = []; this.chatMessage = ''; this.muted = false; this.camera = true;
    this.selected = null; this.notice.set('Demo interview started. No live camera or microphone is connected.');
  }
  sendMessage(): void { if (this.chatMessage.trim()) { this.messages.push(this.chatMessage.trim()); this.chatMessage = ''; } }
  postJob(form: NgForm): void {
    if (form.invalid || !this.validStep()) { this.notice.set('Please complete the required fields before continuing.'); return; }
    if (this.step < 4) { this.step++; this.notice.set(''); this.scrollTop(); return; }
    this.jobs = [...this.jobs, { ...this.draftJob, interviewers: [...this.draftJob.interviewers], title: this.draftJob.title.trim(), location: this.draftJob.location.trim(), live: true }];
    this.draftJob = this.emptyJob(); this.step = 0; this.navigate('My Jobs'); this.notice.set('Job published in this demo workspace.');
  }
  validStep(): boolean {
    if (this.step === 0) return !!(this.draftJob.title.trim() && this.draftJob.location.trim() && this.draftJob.department.trim() && this.draftJob.description.trim()) && (this.draftJob.salaryFrom === null || this.draftJob.salaryFrom >= 0) && (this.draftJob.salaryTo === null || this.draftJob.salaryTo >= 0) && (this.draftJob.salaryFrom === null || this.draftJob.salaryTo === null || this.draftJob.salaryTo >= this.draftJob.salaryFrom);
    if (this.step === 2) return !!this.draftJob.start && !!this.draftJob.end && new Date(this.draftJob.start).getTime() > Date.now() && new Date(this.draftJob.end).getTime() > new Date(this.draftJob.start).getTime();
    if (this.step === 3) return this.draftJob.interviewers.length > 0;
    return true;
  }
  toggleSelection(list: string[], value: string): void { const index = list.indexOf(value); if (index < 0) list.push(value); else list.splice(index, 1); }
  editMember(index: number): void { this.editingMember = index; this.invite = { ...this.team[index], jobs: [...this.team[index].jobs] }; this.scrollTop(); }
  cancelInvite(): void { this.editingMember = null; this.invite = { first: '', last: '', email: '', role: 'Interviewer', jobs: [] }; }
  addMember(form: NgForm): void {
    if (form.invalid || !this.invite.first.trim() || !this.invite.last.trim()) return;
    const email = this.invite.email.trim().toLowerCase();
    if (this.team.some((member, index) => member.email.toLowerCase() === email && index !== this.editingMember)) { this.notice.set('This email is already on your team.'); return; }
    const member = { ...this.invite, first: this.invite.first.trim(), last: this.invite.last.trim(), email, jobs: [...this.invite.jobs] };
    if (this.editingMember === null) this.team = [...this.team, member];
    else { this.team = this.team.map((value, index) => index === this.editingMember ? member : value); if (this.editingMember === 0) { this.displayName = member.first + ' ' + member.last; this.accountName = this.displayName; this.accountEmail = member.email; } }
    this.cancelInvite(); form.resetForm({ first: '', last: '', email: '' }); this.notice.set('Team updated in this demo. No invitation email was sent.');
  }
  saveSettings(): void { if (this.companyDraft.trim()) { this.company = this.companyDraft.trim(); this.notice.set('Preferences saved for this preview.'); } }
  saveAccount(form: NgForm): void {
    if (form.invalid || !this.accountName.trim()) return;
    const email = this.accountEmail.trim().toLowerCase();
    if (this.team.slice(1).some(member => member.email.toLowerCase() === email)) { this.notice.set('This email is already used by a teammate.'); return; }
    this.displayName = this.accountName.trim();
    const [first, ...last] = this.displayName.split(/\s+/);
    this.team = this.team.map((member, index) => index === 0 ? { ...member, first, last: last.join(' '), email } : member);
    this.notice.set('Account details saved in this demo.');
  }
  async copyCompanyUrl(): Promise<void> { try { await navigator.clipboard.writeText(this.companyUrl); this.notice.set('Company URL copied.'); } catch { this.notice.set('Copy is unavailable. Select the company URL and copy it manually.'); } }
  async expand(): Promise<void> { try { if (document.fullscreenElement === this.host.nativeElement) await document.exitFullscreen(); else await this.host.nativeElement.requestFullscreen(); } catch { this.notice.set('Fullscreen is unavailable in this browser. You can still use every tab here.'); } }
  ngOnDestroy(): void { clearInterval(this.ticker); this.resizeObserver?.disconnect(); }
}
