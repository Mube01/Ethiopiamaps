"use client";

import {
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useEnquiry } from "@/components/EnquiryProvider";

export default function Header() {
  const pathname = usePathname();

  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] =
    useState(false);

  /*
   * Keep the enquiry count at 0 during the first
   * render so the server and client HTML match.
   */
  const [enquiryCount, setEnquiryCount] =
    useState(0);

  const { items } = useEnquiry();

  const isShopActive =
    pathname === "/shop" ||
    pathname.startsWith("/shop/");

  /*
   * Update the enquiry count after hydration.
   *
   * This prevents:
   * Server: 0
   * Client: 1
   *
   * which causes the hydration error.
   */
  useEffect(() => {
    setEnquiryCount(items.length);
  }, [items]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileShopOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#8C7355] bg-white">
      <div className="container-gallery flex h-24 items-center justify-between">

        {/* =====================================================
            LOGO
        ====================================================== */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group shrink-0"
        >
          <div className="serif text-[25px] md:text-[30px] font-black tracking-[0.04em]">
            ETHIOPIA MAPS
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <div className="hidden items-center lg:flex">

          <nav className="flex items-center gap-9">

            {/* =================================================
                HOME
            ================================================== */}
            <Link
              href="/"
              className={`text-[14px] font-medium uppercase tracking-[0.08em] transition-opacity duration-300 ${
                pathname === "/"
                  ? "opacity-50"
                  : "hover:opacity-50"
              }`}
            >
              Home
            </Link>

            {/* =================================================
                SHOP
            ================================================== */}
            <div
              className="relative"
              onMouseEnter={() =>
                setShopOpen(true)
              }
              onMouseLeave={() =>
                setShopOpen(false)
              }
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1 text-[14px] font-medium uppercase tracking-[0.08em] transition-opacity duration-300 ${
                  isShopActive
                    ? "opacity-50"
                    : "hover:opacity-50"
                }`}
              >
                Shop

                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {/* =================================================
                  SHOP DROPDOWN
              ================================================== */}
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-5 transition-all duration-200 ${
                  shopOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <div className="w-60 border border-black/10 bg-white py-3 shadow-sm">

                  {/* Cities */}
                  <Link
                    href="/shop?category=cities"
                    onClick={() =>
                      setShopOpen(false)
                    }
                    className="block px-5 py-3 text-[11px] uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-50"
                  >
                    Cities
                  </Link>

                  {/* Connections */}
                  <div className="flex items-center justify-between px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-black/40">
                    <span>
                      Connections
                    </span>

                    <span className="text-[8px] tracking-[0.12em] text-[var(--ochre)]">
                      Coming Soon
                    </span>
                  </div>

                  {/* Landscapes */}
                  <div className="flex items-center justify-between px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-black/40">
                    <span>
                      Landscapes
                    </span>

                    <span className="text-[8px] tracking-[0.12em] text-[var(--ochre)]">
                      Coming Soon
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* =================================================
                ABOUT
            ================================================== */}
            <Link
              href="/about"
              className={`text-[14px] font-medium uppercase tracking-[0.08em] transition-opacity duration-300 ${
                pathname.startsWith("/about")
                  ? "opacity-50"
                  : "hover:opacity-50"
              }`}
            >
              About
            </Link>

            {/* =================================================
                CONTACT
            ================================================== */}
            <Link
              href="/contact"
              className={`text-[14px] font-medium uppercase tracking-[0.08em] transition-opacity duration-300 ${
                pathname.startsWith("/contact")
                  ? "opacity-50"
                  : "hover:opacity-50"
              }`}
            >
              Contact
            </Link>

          </nav>

          {/* =================================================
              DESKTOP ENQUIRY / CART
          ================================================== */}
          <Link
            href="/enquiry"
            aria-label={
              enquiryCount > 0
                ? `Enquiry, ${enquiryCount} ${
                    enquiryCount === 1
                      ? "item"
                      : "items"
                  }`
                : "Enquiry"
            }
            className="relative ml-9 flex items-center justify-center transition-opacity duration-300 hover:opacity-50"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.5}
            />

            {/* =================================================
                ENQUIRY COUNT
            ================================================== */}
            {enquiryCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--ochre)] px-1 text-[8px] font-medium leading-none text-white">
                {enquiryCount > 99
                  ? "99+"
                  : enquiryCount}
              </span>
            )}
          </Link>

        </div>

        {/* =====================================================
            MOBILE CONTROLS
        ====================================================== */}
        <div className="flex items-center gap-3 lg:hidden">

          {/* Mobile Enquiry */}
          <Link
            href="/enquiry"
            aria-label={
              enquiryCount > 0
                ? `Enquiry, ${enquiryCount} ${
                    enquiryCount === 1
                      ? "item"
                      : "items"
                  }`
                : "Enquiry"
            }
            onClick={closeMobileMenu}
            className="relative flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-50"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.5}
            />

            {/* =================================================
                MOBILE ENQUIRY COUNT
            ================================================== */}
            {enquiryCount > 0 && (
              <span className="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--ochre)] px-1 text-[7px] font-medium leading-none text-white">
                {enquiryCount > 99
                  ? "99+"
                  : enquiryCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen(
                (current) => !current
              )
            }
            className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-50"
          >
            {mobileOpen ? (
              <X
                size={22}
                strokeWidth={1.5}
              />
            ) : (
              <Menu
                size={22}
                strokeWidth={1.5}
              />
            )}
          </button>

        </div>

      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      <div
        className={`overflow-hidden border-t border-black/10 bg-white transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container-gallery py-6">

          {/* =================================================
              HOME
          ================================================== */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className={`block border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.12em] transition-opacity duration-300 ${
              pathname === "/"
                ? "opacity-50"
                : "hover:opacity-50"
            }`}
          >
            Home
          </Link>

          {/* =================================================
              MOBILE SHOP
          ================================================== */}
          <div className="border-b border-black/10">

            <button
              type="button"
              onClick={() =>
                setMobileShopOpen(
                  (current) => !current
                )
              }
              className={`flex w-full items-center justify-between py-4 text-left text-[13px] font-medium uppercase tracking-[0.12em] transition-opacity duration-300 ${
                isShopActive
                  ? "opacity-50"
                  : "hover:opacity-50"
              }`}
            >
              <span>
                Shop
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.5}
                className={`transition-transform duration-300 ${
                  mobileShopOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* =================================================
                MOBILE CATEGORIES
            ================================================== */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileShopOpen
                  ? "max-h-60 pb-3"
                  : "max-h-0"
              }`}
            >

              {/* All Collection */}
              <Link
                href="/shop"
                onClick={closeMobileMenu}
                className="block py-3 pl-4 text-[11px] uppercase tracking-[0.15em] text-black/60 transition-opacity duration-300 hover:opacity-50"
              >
                All Collection
              </Link>

              {/* Cities */}
              <Link
                href="/shop?category=cities"
                onClick={closeMobileMenu}
                className="block py-3 pl-4 text-[11px] uppercase tracking-[0.15em] text-black/60 transition-opacity duration-300 hover:opacity-50"
              >
                Cities
              </Link>

              {/* Connections */}
              <div className="flex items-center justify-between py-3 pl-4 pr-2 text-[11px] uppercase tracking-[0.15em] text-black/30">
                <span>
                  Connections
                </span>

                <span className="text-[8px] tracking-[0.12em] text-[var(--ochre)]">
                  Coming Soon
                </span>
              </div>

              {/* Landscapes */}
              <div className="flex items-center justify-between py-3 pl-4 pr-2 text-[11px] uppercase tracking-[0.15em] text-black/30">
                <span>
                  Landscapes
                </span>

                <span className="text-[8px] tracking-[0.12em] text-[var(--ochre)]">
                  Coming Soon
                </span>
              </div>

            </div>
          </div>

          {/* =================================================
              ABOUT
          ================================================== */}
          <Link
            href="/about"
            onClick={closeMobileMenu}
            className={`block border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.12em] transition-opacity duration-300 ${
              pathname.startsWith("/about")
                ? "opacity-50"
                : "hover:opacity-50"
            }`}
          >
            About
          </Link>

          {/* =================================================
              CONTACT
          ================================================== */}
          <Link
            href="/contact"
            onClick={closeMobileMenu}
            className={`block border-b border-black/10 py-4 text-[13px] font-medium uppercase tracking-[0.12em] transition-opacity duration-300 ${
              pathname.startsWith("/contact")
                ? "opacity-50"
                : "hover:opacity-50"
            }`}
          >
            Contact
          </Link>

          {/* =================================================
              ENQUIRY
          ================================================== */}
          <Link
            href="/enquiry"
            onClick={closeMobileMenu}
            className="mt-5 flex items-center justify-between bg-[var(--charcoal)] px-5 py-4 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-opacity duration-300 hover:opacity-80"
          >
            <span>
              My Enquiry
            </span>

            <div className="flex items-center gap-3">
              {enquiryCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--ochre)] px-1 text-[8px] font-medium leading-none text-white">
                  {enquiryCount > 99
                    ? "99+"
                    : enquiryCount}
                </span>
              )}

              <ShoppingBag
                size={17}
                strokeWidth={1.5}
              />
            </div>
          </Link>

        </nav>
      </div>
    </header>
  );
}