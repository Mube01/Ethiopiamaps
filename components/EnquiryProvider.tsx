"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type EnquiryItem = {
  id: string;
  slug: string;
  title: string;
  image: string;
  edition: string;
  size: string;
  format: string;
  price: number;
  quantity: number;
};

type EnquiryContextType = {
  items: EnquiryItem[];
  addItem: (item: EnquiryItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
};

const EnquiryContext =
  createContext<EnquiryContextType | undefined>(
    undefined
  );

export function EnquiryProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * IMPORTANT:
   *
   * Always start with an empty array.
   *
   * This guarantees that the server-rendered HTML
   * and the first client render are identical.
   */
  const [items, setItems] = useState<EnquiryItem[]>([]);

  /*
   * This tells us when sessionStorage has been loaded.
   */
  const [hydrated, setHydrated] = useState(false);

  /*
   * Load the saved enquiry AFTER the component
   * has mounted in the browser.
   */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "ethiopia-maps-enquiry"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load enquiry:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  /*
   * Save enquiry whenever items change.
   *
   * We wait until the saved enquiry has been loaded
   * before writing anything back to sessionStorage.
   */
  useEffect(() => {
    if (!hydrated) return;

    try {
      sessionStorage.setItem(
        "ethiopia-maps-enquiry",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Failed to save enquiry:",
        error
      );
    }
  }, [items, hydrated]);

  /*
   * ADD ARTWORK
   */
  const addItem = (item: EnquiryItem) => {
    setItems((current) => {
      const existing = current.find(
        (existingItem) =>
          existingItem.id === item.id
      );

      /*
       * Artwork already exists.
       * Increase quantity instead of creating
       * another row.
       */
      if (existing) {
        return current.map((existingItem) =>
          existingItem.id === item.id
            ? {
                ...existingItem,
                quantity:
                  existingItem.quantity +
                  item.quantity,
              }
            : existingItem
        );
      }

      /*
       * New artwork.
       */
      return [...current, item];
    });
  };

  /*
   * REMOVE ARTWORK
   */
  const removeItem = (id: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /*
   * UPDATE QUANTITY
   */
  const updateQuantity = (
    id: string,
    quantity: number
  ) => {
    /*
     * Never allow quantity below 1.
     */
    if (quantity < 1) return;

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  /*
   * CLEAR ENQUIRY
   */
  const clearItems = () => {
    setItems([]);
  };

  /*
   * CALCULATE TOTAL
   */
  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <EnquiryContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearItems,
        updateQuantity,
        total,
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const context = useContext(
    EnquiryContext
  );

  if (!context) {
    throw new Error(
      "useEnquiry must be used inside EnquiryProvider"
    );
  }

  return context;
}