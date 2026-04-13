import { describe, it, expect } from 'vitest';
import { sanitize, getTier, getSubPageTitle, getSubPageBack, MAX_PHOTO_SIZE, ALLOWED_IMAGE_TYPES } from '@/components/profile/profileUtils';
import { Star, Shield, Crown } from 'lucide-react';

const tiers = [
  { min: 0, label: 'Bronze', color: 'text-arena-amber', icon: Star },
  { min: 1000, label: 'Silver', color: 'text-muted-foreground', icon: Shield },
  { min: 3000, label: 'Gold', color: 'text-accent', icon: Crown },
  { min: 7000, label: 'Platinum', color: 'text-primary', icon: Crown },
];

describe('profileUtils', () => {
  describe('sanitize', () => {
    it('strips HTML tags', () => {
      expect(sanitize('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('trims whitespace', () => {
      expect(sanitize('  hello world  ')).toBe('hello world');
    });

    it('handles empty string', () => {
      expect(sanitize('')).toBe('');
    });

    it('preserves normal text', () => {
      expect(sanitize('John Doe')).toBe('John Doe');
    });

    it('strips nested HTML', () => {
      expect(sanitize('<div><p>nested</p></div>')).toBe('nested');
    });
  });

  describe('getTier', () => {
    it('returns Bronze for 0 points', () => {
      expect(getTier(0, tiers).label).toBe('Bronze');
    });

    it('returns Bronze for 999 points', () => {
      expect(getTier(999, tiers).label).toBe('Bronze');
    });

    it('returns Silver for 1000 points', () => {
      expect(getTier(1000, tiers).label).toBe('Silver');
    });

    it('returns Gold for 3000 points', () => {
      expect(getTier(3000, tiers).label).toBe('Gold');
    });

    it('returns Platinum for 7000+ points', () => {
      expect(getTier(10000, tiers).label).toBe('Platinum');
    });
  });

  describe('getSubPageTitle', () => {
    it('returns correct title for each sub-page', () => {
      expect(getSubPageTitle('editProfile')).toBe('Edit Profile');
      expect(getSubPageTitle('settings')).toBe('App Settings');
      expect(getSubPageTitle('help')).toBe('Help Center');
      expect(getSubPageTitle('privacyPolicy')).toBe('Privacy Policy');
    });

    it('returns empty string for null', () => {
      expect(getSubPageTitle(null)).toBe('');
    });
  });

  describe('getSubPageBack', () => {
    it('changePassword goes back to editProfile', () => {
      expect(getSubPageBack('changePassword')).toBe('editProfile');
    });

    it('addPayment goes back to payments', () => {
      expect(getSubPageBack('addPayment')).toBe('payments');
    });

    it('privacyPolicy goes back to settings', () => {
      expect(getSubPageBack('privacyPolicy')).toBe('settings');
    });

    it('top-level pages go back to null', () => {
      expect(getSubPageBack('addresses')).toBeNull();
      expect(getSubPageBack('help')).toBeNull();
    });
  });

  describe('constants', () => {
    it('MAX_PHOTO_SIZE is 200KB', () => {
      expect(MAX_PHOTO_SIZE).toBe(200 * 1024);
    });

    it('ALLOWED_IMAGE_TYPES contains common formats', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
    });
  });
});
