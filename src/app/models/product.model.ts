export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  weight: string;
  description: string;
  image: string;
  badge?: string;
  featured?: boolean;
}
