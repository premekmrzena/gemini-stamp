export type Product = {
  id: string;
  name: string;
  short_description: string;
  detailed_description: string;
  price: number;
  weight_grams: number;
  image_url: string;
  gallery_images: string[] | null;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  tag_new: boolean;
  tag_last_pieces: boolean;
  tag_top: boolean;
  catalog_number: string | null;
  stamp_type: string | null;
  release_date: string | null;
  print_sheets: string | null;
  dimensions_mm: string | null;
  designer: string | null;
  engraver: string | null;
  related_stamp_id: string[] | null;
  created_at: string;
};

export type OrderStatus =
  | 'Nová'
  | 'Zaplacena'
  | 'Zpracovává se'
  | 'Odesláno'
  | 'Dokončeno'
  | 'Zrušeno';

export type CartItemSnapshot = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  weight_grams: number;
  item_type: 'product' | 'custom';
};

export type Order = {
  id: string;
  created_at: string;
  status: OrderStatus;
  total_price: number;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  payment_cost: number;
  cart_items: CartItemSnapshot[];
  customer_note: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_company_name: string;
  billing_company_id: string;
  billing_company_tax_id: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_region: string;
  billing_zip: string;
  billing_country: string;
  shipping_is_different: boolean;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_company_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_region: string;
  shipping_zip: string;
  shipping_country: string;
};

export type CustomStamp = {
  id: string;
  product_id: string;
  preview_url: string;
  print_url: string;
  created_at: string;
};
