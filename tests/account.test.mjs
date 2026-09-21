import test from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath, sessionDestination, passwordValidation, parseRetryAfter, accountErrorMessage } from '../src/utils/account.ts';
import { notificationLabel } from '../src/utils/notification.ts';

test('first-use login preserves the EO destination and never goes straight to protected data', () => {
  const eo = '/company/requests/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa?view=eo#item';
  const user = { role: 'company', mustChangePassword: true };
  const path = sessionDestination(user, eo);
  assert.equal(new URL(path, 'https://eo.internal').searchParams.get('next'), eo);
  assert.equal(path.startsWith('/change-password?'), true);
  assert.equal(sessionDestination({ ...user, mustChangePassword: false }, eo), eo);
  assert.equal(sessionDestination({ role: 'admin' }, null), '/admin');
});

test('return paths reject external redirects, backslashes and authentication loops', () => {
  for (const path of ['https://evil.example', '//evil.example', '/\\evil.example', '/\nevil', '/login?next=/company', '/change-password', '/company/../login', '/other']) assert.equal(safeNextPath(path), null, path);
  assert.equal(safeNextPath('/account/email'), '/account/email');
  assert.equal(safeNextPath('/admin/requests/12'), '/admin/requests/12');
});

test('password validation checks boundaries, default patterns, difference and confirmation without trimming secrets', () => {
  const current = 'current-password-123';
  assert.equal(passwordValidation(current, 'personal-password-123', 'personal-password-123'), null);
  for (const next of ['short', 'x'.repeat(257), current, 'prefix-change-me-suffix', 'prefix-REPLACE-ME']) assert.ok(passwordValidation(current, next, next));
  assert.ok(passwordValidation(current, 'personal-password-123', 'other-password-123'));
  const spaced = ' new personal password ';
  assert.equal(passwordValidation(current, spaced, spaced), null);
});

test('Retry-After supports seconds and HTTP dates without creating an invalid countdown', () => {
  const now = Date.parse('2026-09-21T00:00:00Z');
  assert.equal(parseRetryAfter('60', now), 60);
  assert.equal(parseRetryAfter('Mon, 21 Sep 2026 00:02:00 GMT', now), 120);
  assert.equal(parseRetryAfter('Mon, 21 Sep 2026 00:00:00 GMT', now), 0);
  for (const value of ['', undefined, 'unknown']) assert.equal(parseRetryAfter(value, now), null);
});

test('account errors distinguish failed delivery, expiration, attempts and conflicts', () => {
  for (const code of ['CURRENT_PASSWORD_INCORRECT', 'EMAIL_UNAVAILABLE', 'EMAIL_CHANGE_EXPIRED', 'EMAIL_CHANGE_ATTEMPTS_EXCEEDED', 'EMAIL_VERIFICATION_SEND_FAILED', 'EMAIL_DISABLED']) assert.match(accountErrorMessage({ code }), /[가-힣]/);
  assert.match(accountErrorMessage({ code: 'EMAIL_VERIFICATION_SEND_FAILED' }), /도착했다면/);
  assert.equal(accountErrorMessage({ code: 'future', message: 'server detail' }), 'server detail');
});

test('partial delivery is not hidden by a tracking failure and recipient skips are explained', () => {
  const message = notificationLabel({ status: 'partial', trackingError: true });
  assert.match(message, /일부 담당자/);
  assert.match(message, /기록 저장 실패/);
  assert.match(notificationLabel({ status: 'skipped', reason: 'recipient_inactive' }), /비활성/);
});
