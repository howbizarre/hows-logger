import { describe, it, expect } from 'vitest';
import { toIsoString } from './index';

describe('toIsoString', () => {
  it('should return "Invalid Date" for an invalid timestamp', () => {
    expect(toIsoString(NaN)).toBe('Invalid Date');
    expect(toIsoString(Number.POSITIVE_INFINITY)).toBe('Invalid Date');
    expect(toIsoString(Number.NEGATIVE_INFINITY)).toBe('Invalid Date');
  });

  it('should return an ISO string for a valid timestamp', () => {
    const timestamp = 1672531200000; // 2023-01-01T00:00:00.000Z
    const expectedIsoString = new Date(timestamp).toISOString();
    expect(toIsoString(timestamp)).toBe(expectedIsoString);
  });

  it('should return the current date for a null or undefined timestamp', () => {
    const now = new Date();
    const isoString = toIsoString(null);
    const date = new Date(isoString);
    expect(Math.abs(now.getTime() - date.getTime())).toBeLessThan(1000); // Allow for a small delay

    const isoString2 = toIsoString(undefined);
    const date2 = new Date(isoString2);
    expect(Math.abs(now.getTime() - date2.getTime())).toBeLessThan(1000); // Allow for a small delay
  });

  it('should handle the zero timestamp correctly', () => {
    expect(toIsoString(0)).toBe('1970-01-01T00:00:00.000Z');
  });
});