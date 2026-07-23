import { supabase } from '@/lib/supabase';
import { getCustomsHsCode } from '@/lib/constants';
import { CartItemSnapshot, ProductCategory } from '@/types/database';

export type CustomsDeclarationItem = {
  sequence: number;
  customCont: string;
  quantity: number;
  /** Celková hmotnost položky v kg (jednotková hmotnost × počet kusů). */
  weight: number;
  /** Celní hodnota položky v Kč (jednotková cena × počet kusů). */
  customVal: number;
  hsCode: string;
  iso: 'CZ';
};

/**
 * cart_items neukládá category produktu (jen snímek name/price/váhy), takže se musí dohledat
 * zvlášť - u item_type 'product' přímo v products, u 'custom' přes custom_stamps -> products
 * (vlastní archy vznikají z konkrétní šablony, každá šablona = jeden produkt v Supabase).
 */
export async function fetchCustomsCategoryMap(
  cartItems: CartItemSnapshot[]
): Promise<Record<string, ProductCategory>> {
  const map: Record<string, ProductCategory> = {};

  const productIds = cartItems.filter((i) => i.item_type === 'product').map((i) => i.id);
  const customStampIds = cartItems.filter((i) => i.item_type === 'custom').map((i) => i.id);

  if (productIds.length) {
    const { data } = await supabase.from('products').select('id, category').in('id', productIds);
    for (const row of data ?? []) {
      map[row.id] = row.category as ProductCategory;
    }
  }

  if (customStampIds.length) {
    const { data } = await supabase
      .from('custom_stamps')
      .select('id, products(category)')
      .in('id', customStampIds);
    for (const row of data ?? []) {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      if (product) {
        map[row.id] = product.category as ProductCategory;
      }
    }
  }

  return map;
}

/**
 * "weight"/"customVal" ve schématu ParcelCustomGoods (viz docs/api/ceska-posta-b2b-zsk-*.yaml)
 * nemá explicitně dokumentované, jestli jde o hodnotu za kus nebo za celou položku - zvoleno
 * "za celou položku" (jednotka × počet), protože to sedí na součet do Total weight/Total value
 * na CN22 formuláři. Pokud se ukáže, že ČP čeká hodnotu za kus, stačí upravit tuhle funkci.
 */
export function buildCustomsDeclarationItems(
  cartItems: CartItemSnapshot[],
  categoryByItemId: Record<string, ProductCategory>
): CustomsDeclarationItem[] {
  return cartItems.map((item, index) => {
    const category = categoryByItemId[item.id];
    return {
      sequence: index + 1,
      customCont: item.name,
      quantity: item.quantity,
      weight: Math.round(((item.weight_grams * item.quantity) / 1000) * 1000) / 1000,
      customVal: item.price * item.quantity,
      hsCode: category ? getCustomsHsCode(category) : '',
      iso: 'CZ',
    };
  });
}

const INTERNATIONAL_SHIPPING_METHOD_NAMES = ['Cenné psaní do zahraničí', 'EMS'];

export function requiresCustomsDeclaration(shippingMethod: string): boolean {
  return INTERNATIONAL_SHIPPING_METHOD_NAMES.includes(shippingMethod);
}
