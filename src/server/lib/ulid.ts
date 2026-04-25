import 'server-only';
import { ulid as _ulid } from 'ulid';

export function ulid(): string {
  return _ulid();
}
