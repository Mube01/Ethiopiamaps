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

const EnquiryContext = createContext<EnquiryContextType | undefined>(
  undefined
);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = sessionStorage.getItem("ethiopia-maps-enquiry");

      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load enquiry:", error);
    }

    return [];
  });

  /* Save enquiry */
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "ethiopia-maps-enquiry",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save enquiry:", error);
    }
  }, [items]);

  const addItem = (item: EnquiryItem) => {
    setItems((current) => {
      const existing = current.find((existingItem) => existingItem.id === item.id);

      if (existing) {
        return current.map((existingItem) =>
          existingItem.id === item.id
            ? {
                ...existingItem,
                quantity: existingItem.quantity + item.quantity,
              }
            : existingItem
        );
      }

      return [...current, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
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

  const clearItems = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
  const context = useContext(EnquiryContext);

  if (!context) {
    throw new Error(
      "useEnquiry must be used inside EnquiryProvider"
    );
  }

  return context;
}
