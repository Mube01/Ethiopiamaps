"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type ArtworkSize = {
  size: string;
  description: string;
  price: number;
};

type ArtworkImage = {
  url: string;
  publicId: string;
};

type Artwork = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  year: number;
  type: "local" | "international";
  available: boolean;
  image: string;
  cloudinaryPublicId: string;
  images?: ArtworkImage[];
  sizes: ArtworkSize[];

  /*
   * Optional because older artwork documents may
   * not have createdAt returned by the API.
   */
  createdAt?: string;
};

type AvailabilityFilter =
  | "all"
  | "available"
  | "sold";

type TypeFilter =
  | "all"
  | "local"
  | "international";

/*
 * ----------------------------------------------------------
 * NEW ARTWORK
 *
 * An artwork is considered NEW for 30 days.
 *
 * If createdAt exists, we use it.
 *
 * If createdAt does not exist, we use the timestamp
 * embedded inside the MongoDB ObjectId.
 * ----------------------------------------------------------
 */

const NEW_ARTWORK_DAYS = 30;

function getArtworkCreationDate(
  work: Artwork
): Date | null {
  /*
   * Prefer createdAt if the API provides it.
   */
  if (work.createdAt) {
    const date = new Date(work.createdAt);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /*
   * MongoDB ObjectIds contain their creation timestamp
   * in their first 8 hexadecimal characters.
   *
   * Example:
   * 68A1B2C3xxxxxxxxxxxxxxxx
   */
  if (
    typeof work._id === "string" &&
    /^[a-fA-F0-9]{24}$/.test(work._id)
  ) {
    const timestamp = parseInt(
      work._id.substring(0, 8),
      16
    );

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp * 1000);
    }
  }

  return null;
}

function isNewArtwork(work: Artwork) {
  const createdAt =
    getArtworkCreationDate(work);

  if (!createdAt) {
    return false;
  }

  const now = Date.now();

  const age =
    now - createdAt.getTime();

  const thirtyDays =
    NEW_ARTWORK_DAYS *
    24 *
    60 *
    60 *
    1000;

  return (
    age >= 0 &&
    age < thirtyDays
  );
}

export default function ShopPage() {
  const [works, setWorks] =
    useState<Artwork[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all");

  const [type, setType] =
    useState<TypeFilter>("all");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [searchFocused, setSearchFocused] =
    useState(false);

  const filterRef =
    useRef<HTMLDivElement>(null);

  const searchRef =
    useRef<HTMLDivElement>(null);

  const [appliedFilters, setAppliedFilters] =
    useState({
      availability:
        "all" as AvailabilityFilter,

      type:
        "all" as TypeFilter,

      minPrice: "",

      maxPrice: "",
    });

  /*
   * ----------------------------------------------------------
   * FETCH ARTWORKS
   * ----------------------------------------------------------
   */

  useEffect(() => {
    async function fetchArtworks() {
      try {
        const response =
          await fetch("/api/artworks", {
            cache: "no-store",
          });

        if (!response.ok) {
          throw new Error(
            "Failed to fetch artworks"
          );
        }

        const data =
          await response.json();

        setWorks(data);
      } catch (error) {
        console.error(
          "Failed to load artworks:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchArtworks();
  }, []);

  /*
   * ----------------------------------------------------------
   * CLOSE FILTER WHEN CLICKING OUTSIDE
   * ----------------------------------------------------------
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        filterRef.current &&
        !filterRef.current.contains(
          event.target as Node
        )
      ) {
        setFilterOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setSearchFocused(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ----------------------------------------------------------
   * NORMALIZE SEARCH
   *
   * Converts:
   * " Addis   Ababa "
   * into:
   * "addis ababa"
   * ----------------------------------------------------------
   */

  const normalizeSearch = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  };

  /*
   * ----------------------------------------------------------
   * SEARCH SUGGESTIONS
   *
   * Suggestions are based ONLY on artwork titles.
   *
   * This prevents descriptions from causing unrelated
   * artworks to appear in predictive search.
   * ----------------------------------------------------------
   */

  const searchSuggestions = useMemo(() => {
    const query =
      normalizeSearch(search);

    if (!query) {
      return [];
    }

    const queryWords =
      query.split(" ");

    return works
      .map((work) => {
        const title =
          normalizeSearch(work.title);

        const titleWords =
          title.split(" ");

        let score = 0;

        /*
         * Exact title
         */
        if (title === query) {
          score += 1000;
        }

        /*
         * Title starts with the search
         */
        if (title.startsWith(query)) {
          score += 500;
        }

        /*
         * Individual words start with the search words
         *
         * Example:
         * "Addis Aba"
         *
         * matches:
         * "Addis Ababa"
         */
        for (const queryWord of queryWords) {
          if (!queryWord) continue;

          const exactWord =
            titleWords.some(
              (word) => word === queryWord
            );

          const partialWord =
            titleWords.some(
              (word) =>
                word.startsWith(queryWord)
            );

          if (exactWord) {
            score += 150;
          } else if (partialWord) {
            score += 100;
          }
        }

        /*
         * Individual title contains the search
         */
        if (title.includes(query)) {
          score += 300;
        }

        return {
          work,
          score,
        };
      })
      .filter(
        ({ score }) => score > 0
      )
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.work.title.localeCompare(
          b.work.title,
          undefined,
          {
            sensitivity: "base",
          }
        );
      })
      .slice(0, 6)
      .map(({ work }) => work);
  }, [search, works]);

  /*
   * ----------------------------------------------------------
   * FILTER ARTWORKS
   * ----------------------------------------------------------
   */

  const filteredWorks = useMemo(() => {
    const searchTerm =
      normalizeSearch(search);

    return works
      .filter((work) => {
        /*
         * ----------------------------------------------------
         * SEARCH MATCHING
         *
         * IMPORTANT:
         *
         * Search is primarily based on TITLE.
         *
         * We do NOT search the entire description by default.
         * This prevents:
         *
         * "Addis Ababa"
         *
         * from returning several unrelated artworks simply
         * because their descriptions mention Addis.
         * ----------------------------------------------------
         */

        let searchMatch = true;

        if (searchTerm) {
          const title =
            normalizeSearch(work.title);

          /*
           * Exact title
           */
          if (title === searchTerm) {
            searchMatch = true;
          }

          /*
           * Title contains complete search phrase
           *
           * Example:
           * "Addis" -> "Addis Ababa"
           */
          else if (
            title.includes(searchTerm)
          ) {
            searchMatch = true;
          }

          /*
           * Word-by-word partial matching
           *
           * Example:
           *
           * "Addis Aba"
           *
           * matches:
           *
           * "Addis Ababa"
           */
          else {
            const queryWords =
              searchTerm.split(" ");

            const titleWords =
              title.split(" ");

            searchMatch =
              queryWords.every(
                (queryWord) =>
                  titleWords.some(
                    (titleWord) =>
                      titleWord.startsWith(
                        queryWord
                      )
                  )
              );
          }
        }

        /*
         * ----------------------------------------------------
         * AVAILABILITY
         * ----------------------------------------------------
         */

        const availabilityMatch =
          appliedFilters.availability ===
            "all" ||
          (appliedFilters.availability ===
            "available" &&
            work.available) ||
          (appliedFilters.availability ===
            "sold" &&
            !work.available);

        /*
         * ----------------------------------------------------
         * TYPE
         * ----------------------------------------------------
         */

        const typeMatch =
          appliedFilters.type === "all" ||
          work.type ===
            appliedFilters.type;

        /*
         * ----------------------------------------------------
         * PRICE
         * ----------------------------------------------------
         */

        const minimumPrice =
          appliedFilters.minPrice === ""
            ? 0
            : Number(
                appliedFilters.minPrice
              );

        const maximumPrice =
          appliedFilters.maxPrice === ""
            ? Infinity
            : Number(
                appliedFilters.maxPrice
              );

        const prices =
          work.sizes.map(
            (size) => size.price
          );

        const startingPrice =
          prices.length > 0
            ? Math.min(...prices)
            : 0;

        const priceMatch =
          startingPrice >= minimumPrice &&
          startingPrice <= maximumPrice;

        return (
          searchMatch &&
          availabilityMatch &&
          typeMatch &&
          priceMatch
        );
      })
      .sort((a, b) => {
        /*
         * When searching, put the strongest title
         * match first.
         */

        if (searchTerm) {
          const aTitle =
            normalizeSearch(a.title);

          const bTitle =
            normalizeSearch(b.title);

          const aExact =
            aTitle === searchTerm;

          const bExact =
            bTitle === searchTerm;

          if (aExact && !bExact) {
            return -1;
          }

          if (!aExact && bExact) {
            return 1;
          }

          const aStarts =
            aTitle.startsWith(
              searchTerm
            );

          const bStarts =
            bTitle.startsWith(
              searchTerm
            );

          if (aStarts && !bStarts) {
            return -1;
          }

          if (!aStarts && bStarts) {
            return 1;
          }
        }

        return a.title.localeCompare(
          b.title,
          undefined,
          {
            sensitivity: "base",
          }
        );
      });
  }, [
    search,
    appliedFilters,
    works,
  ]);

  /*
   * ----------------------------------------------------------
   * LOCAL ARTWORKS
   * ----------------------------------------------------------
   */

  const localWorks = useMemo(
    () =>
      filteredWorks.filter(
        (work) =>
          work.type === "local"
      ),
    [filteredWorks]
  );

  /*
   * ----------------------------------------------------------
   * INTERNATIONAL ARTWORKS
   * ----------------------------------------------------------
   */

  const internationalWorks = useMemo(
    () =>
      filteredWorks.filter(
        (work) =>
          work.type === "international"
      ),
    [filteredWorks]
  );

  /*
   * ----------------------------------------------------------
   * APPLY FILTERS
   * ----------------------------------------------------------
   */

  const applyFilters = () => {
    setAppliedFilters({
      availability,
      type,
      minPrice,
      maxPrice,
    });

    setFilterOpen(false);
  };

  /*
   * ----------------------------------------------------------
   * CLEAR FILTERS
   * ----------------------------------------------------------
   */

  const clearFilters = () => {
    setAvailability("all");
    setType("all");
    setMinPrice("");
    setMaxPrice("");

    setAppliedFilters({
      availability: "all",
      type: "all",
      minPrice: "",
      maxPrice: "",
    });
  };

  const hasActiveFilters =
    appliedFilters.availability !==
      "all" ||
    appliedFilters.type !== "all" ||
    appliedFilters.minPrice !== "" ||
    appliedFilters.maxPrice !== "";

  /*
   * ----------------------------------------------------------
   * SELECT SEARCH SUGGESTION
   * ----------------------------------------------------------
   */

  const selectSuggestion = (
    work: Artwork
  ) => {
    setSearch(work.title);
    setSearchFocused(false);
  };

  /*
   * ----------------------------------------------------------
   * LOADING SKELETON
   * ----------------------------------------------------------
   */

  const renderLoadingSkeleton = () => {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse"
          >
            <div className="aspect-[4/5] bg-black/[0.06]" />

            <div className="mt-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="h-7 w-2/3 bg-black/[0.06]" />

                <div className="mt-3 h-4 w-1/2 bg-black/[0.05]" />
              </div>

              <div className="ml-4 h-3 w-10 bg-black/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  /*
   * ----------------------------------------------------------
   * ARTWORK CARD
   * ----------------------------------------------------------
   */

  const renderArtwork = (
    work: Artwork
  ) => {
    const prices =
      work.sizes.map(
        (size) => size.price
      );

    const startingPrice =
      prices.length > 0
        ? Math.min(...prices)
        : 0;

    const isNew = isNewArtwork(work);

    return (
      <Link
        key={work._id}
        href={`/shop/${work.slug}`}
        className="group block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm-paper)]">
          <Image
            src={
              work.images?.[0]?.url ||
              work.image
            }
            alt={work.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="scale-[1.15] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.25]"
          />

          {isNew && (
  <span className="absolute left-3 top-3 z-20 flex items-center gap-2 border border-[var(--ochre)] bg-[var(--ochre)] px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-[#fff] shadow-sm">
    New
  </span>
)}

          {/* SOLD TAG */}
          {!work.available && (
            <div
              className={`absolute left-4 bg-black/70 px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-white backdrop-blur-sm ${
                isNew
                  ? "top-[52px]"
                  : "top-4"
              }`}
            >
              Sold
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-between">
          <div>
            <h2 className="serif text-2xl transition-colors duration-300 group-hover:text-[var(--ochre)]">
              {work.title}
            </h2>

            <p className="mt-2 text-sm">
              From ETB{" "}
              {startingPrice.toLocaleString()}
            </p>
          </div>

          <p className="text-[10px] text-[var(--muted-text)]">
            {work.year}
          </p>
        </div>
      </Link>
    );
  };

  /*
   * ----------------------------------------------------------
   * PAGE
   * ----------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <Header />

      {/* =========================
          INTRO
      ========================== */}

      <section className="container-gallery pb-8 pt-24 md:pb-10 md:pt-32">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

          {/* Collection title */}

          <div>
            <p className="mt-8 text-[15px] uppercase tracking-[0.3em] text-[var(--ochre)] sm:-mt-7">
              The Collection
            </p>
          </div>

          {/* Search + Filter */}

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end md:w-auto">

            {/* SEARCH */}

            <div
              ref={searchRef}
              className="relative w-full sm:w-[280px]"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setSearchFocused(true);
                }}
                onFocus={() =>
                  setSearchFocused(true)
                }
                placeholder="Search artworks..."
                autoComplete="off"
                className="w-full rounded-sm border border-black/20 bg-white py-3 pl-3 pr-10 text-sm outline-none transition-colors placeholder:text-black/40 focus:border-[var(--ochre)]"
              />

              <Search
                size={17}
                strokeWidth={1.5}
                className="absolute right-3 top-3 text-black/50"
              />

              {/* =========================
                  PREDICTIVE SEARCH
              ========================== */}

              {searchFocused &&
                search.trim() !== "" &&
                searchSuggestions.length >
                  0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden border border-black/10 bg-[#FAF9F6] shadow-xl">

                    {searchSuggestions.map(
                      (work) => (
                        <button
                          key={work._id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();

                            selectSuggestion(
                              work
                            );
                          }}
                          className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-black/[0.04]"
                        >
                          <span className="serif text-base">
                            {work.title}
                          </span>

                          <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted-text)]">
                            {work.type}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            {/* FILTER */}

            <div
              ref={filterRef}
              className="relative w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() =>
                  setFilterOpen(
                    (current) => !current
                  )
                }
                className={`flex w-full items-center justify-between gap-7 rounded-sm border bg-white px-3 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-colors sm:w-[180px] ${
                  hasActiveFilters
                    ? "border-[var(--ochre)]"
                    : "border-black/20 hover:border-[var(--ochre)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={14}
                    strokeWidth={1.5}
                  />

                  {hasActiveFilters
                    ? "Filters"
                    : "Filter"}
                </span>

                <ChevronDown
                  size={15}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${
                    filterOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* FILTER PANEL */}

              {filterOpen && (
                <div className="absolute right-0 top-full z-40 mt-3 w-full min-w-[290px] border border-black/10 bg-[#FAF9F6] p-6 shadow-xl sm:w-[340px]">

                  {/* AVAILABILITY */}

                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ochre)]">
                      Availability
                    </h3>

                    <div className="mt-5 space-y-4">
                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="availability"
                          checked={
                            availability ===
                            "all"
                          }
                          onChange={() =>
                            setAvailability(
                              "all"
                            )
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>All</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="availability"
                          checked={
                            availability ===
                            "available"
                          }
                          onChange={() =>
                            setAvailability(
                              "available"
                            )
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>
                          Available
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="availability"
                          checked={
                            availability ===
                            "sold"
                          }
                          onChange={() =>
                            setAvailability(
                              "sold"
                            )
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>Sold</span>
                      </label>
                    </div>
                  </div>

                  <div className="my-6 border-t border-black/10" />

                  {/* COLLECTION */}

                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ochre)]">
                      Collection
                    </h3>

                    <div className="mt-5 space-y-4">
                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="type"
                          checked={
                            type === "all"
                          }
                          onChange={() =>
                            setType("all")
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>All</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="type"
                          checked={
                            type === "local"
                          }
                          onChange={() =>
                            setType("local")
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>Local</span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="type"
                          checked={
                            type ===
                            "international"
                          }
                          onChange={() =>
                            setType(
                              "international"
                            )
                          }
                          className="h-4 w-4 accent-[var(--ochre)]"
                        />

                        <span>
                          International
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="my-6 border-t border-black/10" />

                  {/* PRICE */}

                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ochre)]">
                      Price Range
                    </h3>

                    <div className="mt-5 flex items-center gap-3">
      <div className="relative flex-1">
  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs text-black/40">
    ETB
  </span>

  <input
    type="number"
    min="0"
    value={minPrice}
    onChange={(e) =>
      setMinPrice(e.target.value)
    }
    placeholder="Min"
    className="price-input w-full border border-black/15 bg-white py-3 pl-12 pr-3 text-sm outline-none transition-colors focus:border-[var(--ochre)]"
  />
</div>

                      <span className="text-black/30">
                        —
                      </span>

                      <div className="relative flex-1">
  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs text-black/40">
    ETB
  </span>

  <input
    type="number"
    min="0"
    value={maxPrice}
    onChange={(e) => setMaxPrice(e.target.value)}
    placeholder="Max"
    className="price-input w-full border border-black/15 bg-white py-3 pl-12 pr-3 text-sm outline-none transition-colors focus:border-[var(--ochre)]"
  />
</div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-7 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[10px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:text-black"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={applyFilters}
                      className="bg-[var(--ochre)] px-7 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-white transition-all duration-300 hover:opacity-80"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WORKS
      ========================== */}

      <section className="container-gallery pb-32 pt-0">

        {/* LOADING */}

        {loading ? (
          <div>
            <div className="mb-10 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--ochre)]" />

              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
                Loading Collection
              </p>
            </div>

            {renderLoadingSkeleton()}
          </div>
        ) : filteredWorks.length >
          0 ? (
          <>
            {/* LOCAL */}

            {localWorks.length > 0 && (
              <section>
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
                    Local
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                  {localWorks.map(
                    renderArtwork
                  )}
                </div>
              </section>
            )}

            {/* DIVIDER */}

            {localWorks.length > 0 &&
              internationalWorks.length >
                0 && (
                <div className="my-20 border-t border-black/15" />
              )}

            {/* INTERNATIONAL */}

            {internationalWorks.length >
              0 && (
              <section>
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
                    International
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                  {internationalWorks.map(
                    renderArtwork
                  )}
                </div>
              </section>
            )}
          </>
        ) : (
          /* NO RESULTS */

          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
                No Works Found
              </p>

              <h2 className="serif mt-4 text-3xl">
                No artworks match your
                search.
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  clearFilters();
                }}
                className="mt-7 border border-black/20 px-6 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)]"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}