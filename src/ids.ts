export const YOU_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
export const NIGHT_SHIFT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
export const PARK_RATS_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2';
export const BUDGET_SQUAD_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';

export function nid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
