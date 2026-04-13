import type { LucideIcon } from 'lucide-react';

/** Tier definition for Arena Points loyalty program */
export interface TierDef {
  min: number;
  label: string;
  color: string;
  icon: LucideIcon;
}

/** Profile menu item configuration */
export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  color: string;
}

/** Sub-page routing type for profile navigation */
export type SubPage = null | 'addresses' | 'payments' | 'tickets' | 'help' | 'settings' | 'editProfile' | 'pastOrders' | 'notifications' | 'changePassword' | 'addPayment' | 'privacyPolicy' | 'termsOfService';

/** Maximum profile photo size in bytes (200KB) */
export const MAX_PHOTO_SIZE = 200 * 1024;

/** Allowed MIME types for profile photos */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** 
 * Sanitize user text input — strips HTML tags and trims whitespace.
 * For security, we also strip script and style tags along with their content.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/** Get the tier for a given point count */
export function getTier(points: number, tiers: TierDef[]): TierDef {
  return [...tiers].reverse().find((t) => points >= t.min) || tiers[0];
}

/**
 * Get the sub-page title for the profile navigation header.
 */
export function getSubPageTitle(subPage: SubPage): string {
  switch (subPage) {
    case 'editProfile': return 'Edit Profile';
    case 'changePassword': return 'Change Password';
    case 'addPayment': return 'Add Payment Method';
    case 'addresses': return 'Saved Addresses & Seats';
    case 'payments': return 'Payment Methods';
    case 'tickets': return 'My Tickets & Bookings';
    case 'pastOrders': return 'Past Orders';
    case 'notifications': return 'Notifications';
    case 'settings': return 'App Settings';
    case 'help': return 'Help Center';
    case 'privacyPolicy': return 'Privacy Policy';
    case 'termsOfService': return 'Terms of Service';
    default: return '';
  }
}

/**
 * Get the parent sub-page for "back" navigation.
 */
export function getSubPageBack(subPage: SubPage): SubPage {
  if (subPage === 'changePassword') return 'editProfile';
  if (subPage === 'addPayment') return 'payments';
  if (subPage === 'privacyPolicy' || subPage === 'termsOfService') return 'settings';
  return null;
}
