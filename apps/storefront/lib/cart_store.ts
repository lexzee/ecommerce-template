import { createBrowserClientSafe } from "@repo/database";
import { create } from "zustand";
import { createClient } from "./supabase/client";

const [url, key] = [
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
];
// const supabase = createBrowserClientSafe(url, key);
const supabase = createClient();

export interface CartItem {
  id: string;
  cart_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
  product?: {
    name: string;
    price: number;
    quantity: number;
    unit_price: number;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      set({ items: [], isLoading: false });
      return;
    }
    const { data, error } = await supabase.from("cart_items").select(`
      id,
      quantity,
      product:products (
        id,
        name,
        price,
        images
      )`);
    if (data) {
      const mappedItems: CartItem[] = data.map((row: any) => ({
        id: row.product.id,
        cart_item_id: row.id,
        quantity: row.quantity,
        name: row.product.name,
        price: row.product.price,
        image: row.product.images?.[0],
      }));
      set({ items: mappedItems, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
  addItem: async (newItem) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.id === newItem.id);

    if (existingItem) {
      set({
        items: currentItems.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // @ts-ignore
    const { error } = await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: newItem.id,
        quantity: existingItem ? existingItem.quantity + 1 : 1,
      },
      { onConflict: "user_id, product_id" }
    );

    if (error) console.error("Failed to sync cart:", error);
  },
  decreaseItem: async (productId) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.id === productId);
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
      set({
        items: currentItems.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // @ts-ignore
        const { error } = await supabase
          .from("cart_items")
          // @ts-ignore
          .update({ quantity: existingItem.quantity - 1 })
          .match({ user_id: user.id, product_id: productId });

        if (error) console.error("Failed to sync delete to cart:", error);
      }
    } else {
      get().removeItem(productId);
    }
  },
  removeItem: async (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .match({ user_id: user.id, product_id: productId });

      if (error) console.error("Failed to sync remove from cart:", error);
    }
  },
  clearCart: async () => {
    set({ items: [] });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  },
  total: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
