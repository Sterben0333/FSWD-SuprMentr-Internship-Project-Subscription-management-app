import spotifyLogo from './spotify_image.png';
import netflixLogo from './netflix_image.png';
import amazonprimeLogo from './amazonprime_image.png';
import youtubeLogo from './youtubepremium_image.png';
import discordLogo from './discord_image.png';
/*
  Default Subscription Apps — Displayed on dashboard after login
  billingCycle values map to existing Subscription model:
    monthly  - monthly cycle
    yearly   - yearly cycle
    custom   - custom cycle with customCycleDays
 */

export const DEFAULT_APPS = [
  {
    id: 'netflix',
    name: 'Netflix',
    color: '#e01d26ff',
    logo: `<img src="${netflixLogo}" alt="Netflix" style="width:100%;height:100%;object-fit:contain" />`,
    plans: [
      { name: 'Basic', price: 199, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Standard', price: 499, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Premium', price: 649, billingCycle: 'monthly', customCycleDays: null },
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    color: '#1DB954',
    logo: `<img src="${spotifyLogo}" alt="Spotify" style="width:100%;height:100%;object-fit:contain" />`,
    plans: [
      { name: 'Individual', price: 119, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Family', price: 179, billingCycle: 'monthly', customCycleDays: null },
    ],
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    color: '#00A8E1',
    logo: `<img src="${amazonprimeLogo}" alt="Amazon Prime" style="width:100%;height:100%;object-fit:contain" />`,
    plans: [
      { name: 'Monthly', price: 299, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Quarterly', price: 599, billingCycle: 'custom', customCycleDays: 90 },
      { name: 'Yearly', price: 1499, billingCycle: 'yearly', customCycleDays: null },
    ],
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    color: '#ff0000ff',
    logo: `<img src="${youtubeLogo}" alt="YouTube Premium" style="width:100%;height:100%;object-fit:contain" />`,
    plans: [
      { name: 'Individual', price: 129, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Family', price: 189, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Student', price: 79, billingCycle: 'monthly', customCycleDays: null },
    ],
  },
  {
    id: 'discord-nitro',
    name: 'Discord Nitro',
    color: '#5865F2',
    logo: `<img src="${discordLogo}" alt="Discord Nitro" style="width:100%;height:100%;object-fit:contain" />`,
    plans: [
      { name: 'Nitro Basic Monthly', price: 99, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Nitro Basic Yearly', price: 999, billingCycle: 'yearly', customCycleDays: null },
      { name: 'Nitro Monthly', price: 299, billingCycle: 'monthly', customCycleDays: null },
      { name: 'Nitro Yearly', price: 2999, billingCycle: 'yearly', customCycleDays: null },
    ],
  },
];

/*For Getting billing cycle label for display */
export const getCycleLabel = (billingCycle, customCycleDays) => {
  if (billingCycle === 'monthly') return '/mo';
  if (billingCycle === 'yearly') return '/yr';
  if (billingCycle === 'custom' && customCycleDays === 90) return '/quarter';
  return `/${customCycleDays}d`;
};
