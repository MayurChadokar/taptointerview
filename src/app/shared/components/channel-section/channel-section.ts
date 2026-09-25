import { Component, signal } from '@angular/core';
import { CHANNELS } from '../../../core/constants/marketing-content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-channel-section',
  imports: [RevealDirective],
  templateUrl: './channel-section.html',
  styleUrl: './channel-section.scss',
})
export class ChannelSection {
  protected readonly selectedChannel = signal(0);
  protected readonly headlineWords = ['Put', 'your', 'link', 'where', 'candidates', 'are.'];
  protected readonly channels = CHANNELS.map((title, index) => ({
    title,
    number: String(index + 1).padStart(2, '0'),
    ...[
      { label: 'From a posting to a conversation', tip: 'Add your interview link to a job posting so interested candidates know exactly where to take the next step.', icon: 'M8 6V4h8v2M4 7h16v13H4zM4 11h16M10 11v3h4v-3' },
      { label: 'Reconnect with your talent pool', tip: 'Include your link in a targeted email or text to candidates already in your database.', icon: 'M20 6c0 2-16 2-16 0s16-2 16 0ZM4 6v6c0 2 16 2 16 0V6M4 12v6c0 2 16 2 16 0v-6' },
      { label: 'Make your next outreach count', tip: 'Share the link in an ATS reactivation message and give candidates a clear next step when they are ready.', icon: 'M20 8a8 8 0 1 0 0 8M20 3v5h-5M12 8v4l3 2' },
      { label: 'Turn a post into a next step', tip: 'Place your link in a hiring post, profile, or direct message so candidates can continue from the channel they use.', icon: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.5 10.5l7-4M8.5 13.5l7 4' },
      { label: 'Give every scan a destination', tip: 'Use your interview link as the destination for a QR code on a flyer, sign, or printed hiring material.', icon: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6v-3M21 12v3M12 3v3M12 12h3M12 18v3' },
      { label: 'Keep the conversation moving', tip: 'Share your link at a booth or in an event follow-up so interested attendees can reach your interview channel.', icon: 'M4 6h16v15H4zM8 3v6M16 3v6M4 11h16M8 15h2M14 15h2' },
      { label: 'An open door for a new role', tip: 'Invite previous applicants to explore a new opportunity with a direct link in your follow-up message.', icon: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a7 7 0 0 1 12-5M16 13h6M19 10v6M16 21h6' },
      { label: 'One clear destination for a campaign', tip: 'Use the same interview link across your campaign emails, texts, and ads to give candidates a consistent next step.', icon: 'M3 10v5h5l11 5V5L8 10H3ZM8 15l2 6h4l-2-4M21 9v7' },
    ][index],
  }));

  protected selectChannel(index: number): void {
    this.selectedChannel.set(index);
  }

}
