import 'server-only';

// RFC 5545 minimal ICS builder pra anexar em emails de confirmação/lembrete.

export interface BuildIcsInput {
  uid: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  organizerEmail: string;
  organizerName?: string;
  attendeeEmail?: string;
  meetingUrl?: string;
  location?: string;
}

function formatIcsDate(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildIcsForSession(input: BuildIcsInput): string {
  const lines: string[] = [];
  const now = formatIcsDate(new Date());
  const description = [
    input.description ? input.description : '',
    input.meetingUrl ? `Sala: ${input.meetingUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Joel Burigo//joelburigo-site//PT-BR');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:REQUEST');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${input.uid}`);
  lines.push(`DTSTAMP:${now}`);
  lines.push(`DTSTART:${formatIcsDate(input.startsAt)}`);
  lines.push(`DTEND:${formatIcsDate(input.endsAt)}`);
  lines.push(`SUMMARY:${escape(input.title)}`);
  if (description) lines.push(`DESCRIPTION:${escape(description)}`);
  if (input.location) lines.push(`LOCATION:${escape(input.location)}`);
  if (input.meetingUrl) lines.push(`URL:${escape(input.meetingUrl)}`);
  lines.push(
    `ORGANIZER;CN=${escape(input.organizerName ?? 'Joel Burigo')}:mailto:${input.organizerEmail}`
  );
  if (input.attendeeEmail) {
    lines.push(
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${input.attendeeEmail}`
    );
  }
  lines.push('STATUS:CONFIRMED');
  lines.push('SEQUENCE:0');
  lines.push('TRANSP:OPAQUE');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n') + '\r\n';
}
