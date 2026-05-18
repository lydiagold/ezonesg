import { Product } from '../models/product.model';

export interface CategoryItem {
  name: string;
  icon: string;
  color: string;
  bg: string;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Premium Almonds',
    category: 'Nuts',
    price: 12.90,
    oldPrice: 15.90,
    weight: '500g',
    description: 'California-origin premium almonds, rich in protein, vitamin E, and healthy fats. Perfect for daily snacking and cooking.',
    image: 'assets/images/badam.png',
    badge: 'Best Seller',
    featured: true
  },
  {
    id: 2,
    name: 'Roasted Cashews',
    category: 'Nuts',
    price: 14.90,
    weight: '500g',
    description: 'Lightly salted premium cashews, roasted to golden perfection. Creamy, crunchy, and packed with minerals.',
    image: 'assets/images/Roasted_Cashews.png',
    badge: 'Popular',
    featured: true
  },
  {
    id: 3,
    name: 'Premium Pistachios',
    category: 'Nuts',
    price: 18.90,
    oldPrice: 22.90,
    weight: '500g',
    description: 'Naturally opened, premium-grade pistachios with a satisfying crunch. Rich in antioxidants and fibre.',
    image: 'assets/images/Premium_Pistachios.png',
    badge: 'Sale',
    featured: true
  },
  {
    id: 4,
    name: 'Walnut Kernels',
    category: 'Nuts',
    price: 16.90,
    weight: '500g',
    description: 'Premium walnut halves, rich in Omega-3 fatty acids. Brain food that supports heart health and wellbeing.',
    image: 'assets/images/Walnut_Kernels.png',
    featured: true
  },
  {
    id: 5,
    name: 'Medjool Dates',
    category: 'Dry Fruits',
    price: 15.90,
    weight: '500g',
    description: 'Soft, caramel-sweet Medjool dates sourced from premium farms. A natural energy booster, perfect as dessert.',
    image: 'assets/images/Medjool_Dates.png',
    badge: 'Premium',
    featured: true
  },
  {
    id: 6,
    name: 'Golden Raisins',
    category: 'Dry Fruits',
    price: 9.90,
    oldPrice: 11.90,
    weight: '500g',
    description: 'Plump, juicy golden raisins with natural sweetness. Great for baking, cereals, and healthy snacking.',
    image: 'assets/images/Golden_Raisins.png',
    badge: 'Sale'
  },
  {
    id: 7,
    name: 'Healthy Trail Mix',
    category: 'Snack Mixes',
    price: 13.90,
    weight: '500g',
    description: 'A wholesome blend of almonds, cashews, raisins, cranberries and pumpkin seeds. The perfect on-the-go snack.',
    image: 'assets/images/Healthy_Trail_Mix.png',
    badge: 'New',
    featured: true
  },
  {
    id: 8,
    name: 'Corporate Nut Gift Box',
    category: 'Gift Boxes',
    price: 38.90,
    weight: '1kg',
    description: 'A beautifully presented gift box with 4 premium varieties — almonds, cashews, pistachios and walnuts. Perfect for corporate gifting.',
    image: 'assets/images/Corporate_Nut_Gift_Box.png',
    badge: 'Gift',
    featured: true
  },
  {
    id: 9,
    name: 'Family Dry Fruit Combo',
    category: 'Gift Boxes',
    price: 28.90,
    oldPrice: 34.90,
    weight: '750g',
    description: 'A family-favourite combo of dates, raisins, figs, apricots and mixed nuts. Healthy and delicious for all ages.',
    image: 'assets/images/Family_Dry_Fruit_Combo.png',
    badge: 'Value'
  },
  {
    id: 10,
    name: 'Premium Festival Hamper',
    category: 'Gift Boxes',
    price: 58.90,
    weight: '1.5kg',
    description: 'A grand festive hamper with 6 premium products — ideal for Deepavali, Christmas, New Year, Hari Raya, and corporate events.',
    image: 'assets/images/Premium_Festival_Hamper.png',
    badge: 'Premium',
    featured: true
  },
  {
    id: 11,
    name: 'Dried Apricots',
    category: 'Dry Fruits',
    price: 10.90,
    weight: '500g',
    description: 'Sun-dried, naturally sweet Turkish apricots. Rich in iron and vitamins, a great healthy snack for everyone.',
    image: 'assets/images/Dried_Apricots.png',
  },
  {
    id: 12,
    name: 'Macadamia Nuts',
    category: 'Nuts',
    price: 22.90,
    oldPrice: 26.90,
    weight: '400g',
    description: 'Rich, buttery macadamia nuts — the king of nuts. High in healthy monounsaturated fats, perfect for keto diets.',
    image: 'assets/images/Macadamia_Nuts.png',
    badge: 'Premium'
  },
  {
  id: 13,
  name: 'Premium Brazil Nuts',
  category: 'Nuts',
  price: 21.90,
  oldPrice: 25.90,
  weight: '400g',
  description: 'Premium Brazil nuts naturally rich in selenium, healthy fats, and antioxidants. A perfect healthy snack for immunity and wellness.',
  image: 'assets/images/Premium_Brazil_Nuts.png',
  badge: 'Premium',
  featured: true
},

{
  id: 14,
  name: 'Roasted Hazelnuts',
  category: 'Nuts',
  price: 17.90,
  weight: '400g',
  description: 'Crunchy roasted hazelnuts packed with vitamin E, healthy oils, and natural nutrition for smart snacking.',
  image: 'assets/images/Roasted_Hazelnuts.png',
  badge: 'Healthy'
},

{
  id: 15,
  name: 'Premium Pecans',
  category: 'Nuts',
  price: 24.90,
  oldPrice: 28.90,
  weight: '400g',
  description: 'Buttery premium pecans rich in antioxidants and heart-healthy nutrients. Perfect for healthy lifestyles.',
  image: 'assets/images/Premium_Pecans.png',
  badge: 'Luxury',
  featured: true
},

{
  id: 16,
  name: 'Premium Pine Nuts',
  category: 'Nuts',
  price: 29.90,
  weight: '300g',
  description: 'Luxury-grade pine nuts loaded with healthy fats, vitamins, and minerals. Great for gourmet dishes and salads.',
  image: 'assets/images/Premium_Pine_Nuts.png',
  badge: 'Premium'
},

{
  id: 17,
  name: 'Organic Chia Seeds',
  category: 'Seeds & Superfoods',
  price: 12.90,
  oldPrice: 15.90,
  weight: '500g',
  description: 'Organic chia seeds rich in omega-3, fibre, and protein. Ideal for smoothies, oats, and healthy breakfasts.',
  image: 'assets/images/Organic_Chia_Seeds.png',
  badge: 'Organic',
  featured: true
},

{
  id: 18,
  name: 'Roasted Pumpkin Seeds',
  category: 'Seeds & Superfoods',
  price: 13.90,
  weight: '500g',
  description: 'Crunchy roasted pumpkin seeds packed with magnesium, protein, and antioxidants for healthy daily nutrition.',
  image: 'assets/images/Roasted_Pumpkin_Seeds.png',
  badge: 'Healthy'
},

{
  id: 19,
  name: 'Sunflower Seeds',
  category: 'Seeds & Superfoods',
  price: 11.90,
  weight: '500g',
  description: 'Nutritious sunflower seeds rich in vitamin E and healthy fats. Great for salads, cereals, and snacking.',
  image: 'assets/images/Sunflower_Seeds.png',
  badge: 'Natural'
},

{
  id: 20,
  name: 'Premium Flax Seeds',
  category: 'Seeds & Superfoods',
  price: 10.90,
  weight: '500g',
  description: 'Premium flax seeds naturally rich in omega-3 and fibre. Supports digestion and healthy living.',
  image: 'assets/images/Premium_Flax_Seeds.png',
  badge: 'Wellness'
},

{
  id: 21,
  name: 'Honey Roasted Almonds',
  category: 'Snack Mixes',
  price: 16.90,
  oldPrice: 19.90,
  weight: '400g',
  description: 'Lightly honey-coated almonds with a delicious crunch. A healthier premium snack for all ages.',
  image: 'assets/images/Honey_Roasted_Almonds.png',
  badge: 'Popular',
  featured: true
},

{
  id: 22,
  name: 'Spicy Masala Cashews',
  category: 'Snack Mixes',
  price: 15.90,
  weight: '400g',
  description: 'Premium roasted cashews blended with traditional spices for a bold and flavourful healthy snack.',
  image: 'assets/images/Spicy_Masala_Cashews.png',
  badge: 'New'
},

{
  id: 23,
  name: 'Protein Power Mix',
  category: 'Fitness Nutrition',
  price: 18.90,
  oldPrice: 22.90,
  weight: '500g',
  description: 'High-protein mix of almonds, walnuts, pumpkin seeds, and raisins crafted for active lifestyles.',
  image: 'assets/images/Protein_Power_Mix.png',
  badge: 'Fitness',
  featured: true
},

{
  id: 24,
  name: 'Immunity Booster Mix',
  category: 'Healthy Snack Mixes',
  price: 17.90,
  weight: '500g',
  description: 'A nutritious blend of nuts, dates, raisins, and seeds designed to support immunity and wellness naturally.',
  image: 'assets/images/Immunity_Booster_Mix.png',
  badge: 'Healthy'
},

{
  id: 25,
  name: 'Smart Kids Nut Mix',
  category: 'Kids Healthy Snacks',
  price: 14.90,
  weight: '400g',
  description: 'Healthy nut and dry fruit mix specially crafted for growing kids with brain-boosting nutrition.',
  image: 'assets/images/Smart_Kids_Nut_Mix.png',
  badge: 'Kids'
},

{
  id: 26,
  name: 'Executive Wellness Box',
  category: 'Corporate Gifting',
  price: 69.90,
  oldPrice: 79.90,
  weight: '1.5kg',
  description: 'Luxury premium nut collection curated for corporate gifting, festive occasions, and wellness hampers.',
  image: 'assets/images/Executive_Wellness_Box.png',
  badge: 'Luxury',
  featured: true
},

{
  id: 27,
  name: 'Deluxe Mixed Nuts',
  category: 'Snack Mixes',
  price: 19.90,
  oldPrice: 23.90,
  weight: '500g',
  description: 'A premium blend of almonds, pistachios, cashews, walnuts, pecans, and macadamias for healthy snacking.',
  image: 'assets/images/Deluxe_Mixed_Nuts.png',
  badge: 'Best Seller',
  featured: true
}
];

export const CATEGORIES: CategoryItem[] = [
  {
    name: 'Almonds',
    icon: '🌰',
    color: '#4A7C2F',
    bg: '#EAF0E3',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Cashews',
    icon: '🥜',
    color: '#6B3A1F',
    bg: '#F5EDD8',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Pistachios',
    icon: '🟢',
    color: '#2D5016',
    bg: '#EAF0E3',
    image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Walnuts',
    icon: '🌰',
    color: '#3D1C08',
    bg: '#F5EDD8',
    image: 'https://images.unsplash.com/photo-1563412885-e1c22b859f1f?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Dates',
    icon: '🫐',
    color: '#C8960C',
    bg: '#FDF4DC',
    image: 'https://images.unsplash.com/photo-1593101960633-b4d07e4ac2c2?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Raisins',
    icon: '🍇',
    color: '#6B3A1F',
    bg: '#F5EDD8',
    image: 'https://images.unsplash.com/photo-1596591868231-05e808fd4ca4?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Trail Mix',
    icon: '🥗',
    color: '#4A7C2F',
    bg: '#EAF0E3',
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=200&h=200&fit=crop&auto=format'
  },
  {
    name: 'Gift Boxes',
    icon: '🎁',
    color: '#C8960C',
    bg: '#FDF4DC',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=200&h=200&fit=crop&auto=format'
  },
  {
  name: 'Brazil Nuts',
  icon: '🥜',
  color: '#6B4F3A',
  bg: '#F5E6DA',
  image: '/assets/categories/brazil-nuts.jpg'
},

{
  name: 'Hazelnuts',
  icon: '🌰',
  color: '#5A341D',
  bg: '#F8EBDD',
  image: '/assets/categories/hazelnuts.jpg'
},

{
  name: 'Pecans',
  icon: '🥜',
  color: '#7A4B2A',
  bg: '#F5E2D5',
  image: '/assets/categories/pecans.jpg'
},

{
  name: 'Macadamia',
  icon: '🥥',
  color: '#C8960C',
  bg: '#FFF4D6',
  image: '/assets/categories/macadamia.jpg'
},

{
  name: 'Seeds',
  icon: '🌱',
  color: '#4A7C2F',
  bg: '#EAF0E3',
  image: '/assets/categories/seeds.jpg'
},

{
  name: 'Healthy Snacks',
  icon: '🥗',
  color: '#2D5016',
  bg: '#EDF6E7',
  image: '/assets/categories/healthy-snacks.jpg'
},

{
  name: 'Fitness',
  icon: '💪',
  color: '#C8960C',
  bg: '#FFF6E0',
  image: '/assets/categories/fitness.jpg'
},

{
  name: 'Corporate Gifts',
  icon: '🎁',
  color: '#6B3A1F',
  bg: '#F5EDD8',
  image: '/assets/categories/corporate-gifts.jpg'
}
];
