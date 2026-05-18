export interface GiftOption {
  icon: string;
  name: string;
  desc: string;
  price: string;
  serves: string;
  popular: boolean;
}

export interface Occasion {
  icon: string;
  name: string;
}

export interface CorporateBenefit {
  icon: string;
  title: string;
  desc: string;
}

export const GIFT_OPTIONS: GiftOption[] = [
  {
    icon: '🎁',
    name: 'Classic Gift Box',
    desc: 'A curated selection of premium almonds, cashews, and raisins in elegant packaging.',
    price: 'From SGD 28.90',
    serves: '2–4 persons',
    popular: false
  },
  {
    icon: '🏆',
    name: 'Premium Executive Box',
    desc: 'Luxury assortment of 4 premium nuts with branded packaging — ideal for executive gifts.',
    price: 'From SGD 48.90',
    serves: '4–6 persons',
    popular: true
  },
  {
    icon: '🌟',
    name: 'Festival Hamper',
    desc: 'Grand festive hamper with 6 varieties — perfect for Deepavali, Christmas, New Year & Hari Raya.',
    price: 'From SGD 58.90',
    serves: '6–8 persons',
    popular: false
  },
  {
    icon: '💼',
    name: 'Wellness Snack Pack',
    desc: 'Healthy trail mixes and nut portions in reusable containers — great for office wellness programmes.',
    price: 'From SGD 18.90',
    serves: '1–2 persons',
    popular: false
  }
];

export const OCCASIONS: Occasion[] = [
  { icon: '🪔', name: 'Deepavali' },
  { icon: '🎄', name: 'Christmas' },
  { icon: '🎆', name: 'New Year' },
  { icon: '🌙', name: 'Hari Raya' },
  { icon: '🏢', name: 'Corporate Events' },
  { icon: '🎂', name: 'Staff Appreciation' },
  { icon: '🤝', name: 'Client Gifting' },
  { icon: '💪', name: 'Wellness Packs' }
];

export const CORPORATE_BENEFITS: CorporateBenefit[] = [
  {
    icon: '🌿',
    title: 'Premium Quality',
    desc: 'Only the finest nuts and dry fruits, freshly packed to preserve taste and nutrition.'
  },
  {
    icon: '📦',
    title: 'Custom Packaging',
    desc: 'Branded boxes, custom labels, and personalised messages for your company.'
  },
  {
    icon: '💰',
    title: 'Bulk Discounts',
    desc: 'Attractive pricing tiers for orders of 10, 50, 100+ units. Contact us for quotes.'
  },
  {
    icon: '🚀',
    title: 'Fast Delivery',
    desc: 'Reliable island-wide delivery across Singapore within agreed timelines.'
  },
  {
    icon: '📱',
    title: 'WhatsApp Support',
    desc: 'Dedicated support via WhatsApp for bulk orders, tracking, and customisation.'
  },
  {
    icon: '♻️',
    title: 'Eco Packaging',
    desc: 'Sustainable, recyclable packaging options available for eco-conscious companies.'
  }
];
