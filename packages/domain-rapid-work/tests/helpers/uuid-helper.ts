import { v7 as uuidv7 } from 'uuid';

export function generateUUIDv7(): string {
  return uuidv7();
}
// Predefined test UUIDs for consistent testing
export const TEST_UUIDS = {
  DOMAIN_1: generateUUIDv7(),
  DOMAIN_2: generateUUIDv7(),
  NON_EXISTENT_DOMAIN: generateUUIDv7(),
  NON_EXISTENT_SESSION: generateUUIDv7(),
  NON_EXISTENT_SUBDOMAIN: generateUUIDv7(),
  NON_EXISTENT_TASK: generateUUIDv7(),
  NON_EXISTENT_USER: generateUUIDv7(),
  SESSION_1: generateUUIDv7(),
  SESSION_2: generateUUIDv7(),
  SUBDOMAIN_1: generateUUIDv7(),
  SUBDOMAIN_2: generateUUIDv7(),
  TASK_1: generateUUIDv7(),
  TASK_2: generateUUIDv7(),
  USER_1: generateUUIDv7(),
  USER_2: generateUUIDv7(),
};
