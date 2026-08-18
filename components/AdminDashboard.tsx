"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SizeOption = {
  size: string;
  description: string;
  price: number;
};

type ArtworkMarket = "local" | "international";

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
  available: boolean;
  image: string;
  cloudinaryPublicId: string;
  images: ArtworkImage[];
  type: ArtworkMarket;
  sizes: SizeOption[];
};

type ArtworkPayload = {
  slug: string;
  title: string;
  description: string;
  year: number;
  available: boolean;
  images: ArtworkImage[];
  type: ArtworkMarket;
  sizes: SizeOption[];
};

const emptyImages: ArtworkImage[] = [
  { url: "", publicId: "" },
  { url: "", publicId: "" },
  { url: "", publicId: "" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeArtwork(artwork: Artwork): Artwork {
  const images =
    Array.isArray(artwork.images) &&
    artwork.images.length === 3
      ? artwork.images
      : [
          {
            url: artwork.image || "",
            publicId: artwork.cloudinaryPublicId || "",
          },
          { url: "", publicId: "" },
          { url: "", publicId: "" },
        ];

  return {
    ...artwork,
    images,
  };
}

export default function AdminDashboard() {
  const router = useRouter();

  const [works, setWorks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<Artwork | null>(null);

  const [search, setSearch] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  // Delete confirmation
  const [deleteWork, setDeleteWork] = useState<Artwork | null>(null);

  const [deleting, setDeleting] = useState(false);

  /**
   * Redirect the admin to login if the
   * session has expired or is no longer valid.
   */
  const handleUnauthorized = () => {
    router.replace("/admin/login");
    router.refresh();
  };

  /**
   * Load artworks.
   */
  useEffect(() => {
    let active = true;

    const loadArtworks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/artworks", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load artworks."
          );
        }

        if (active) {
          setWorks(
            Array.isArray(data)
              ? data.map(normalizeArtwork)
              : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load artworks."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadArtworks();

    return () => {
      active = false;
    };
  }, []);

  /**
   * SEARCH
   *
   * Partial / predictive title search.
   *
   * Examples:
   *
   * "add"  -> Addis
   * "add"  -> Addis Ababa
   * "addi" -> Addis Ababa
   * "aba"  -> Addis Ababa
   * "gond" -> Gondar
   *
   * The search ONLY checks the artwork title.
   * It does NOT search the description.
   */
  const filteredWorks = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Empty search = show everything
    if (!query) {
      return works;
    }

    return works.filter((work) => {
      const title = work.title.trim().toLowerCase();

      // Partial title search.
      //
      // This means:
      // "add" -> "Addis"
      // "add" -> "Addis Ababa"
      // "aba" -> "Addis Ababa"
      //
      // Only the title is searched.
      return title.includes(query);
    });
  }, [search, works]);

  /**
   * Delete artwork after confirmation.
   */
  const handleDelete = async () => {
    if (!deleteWork) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/artworks/${deleteWork._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      setWorks((current) =>
        current.filter(
          (work) => work._id !== deleteWork._id
        )
      );

      setDeleteWork(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete artwork."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (work: Artwork) => {
    setEditingWork(work);
    setShowForm(true);
  };

  const handleSave = async (payload: ArtworkPayload) => {
    const response = await fetch(
      editingWork
        ? `/api/artworks/${editingWork._id}`
        : "/api/artworks",
      {
        method: editingWork ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401 || response.status === 403) {
      handleUnauthorized();

      throw new Error(
        "Your admin session has expired. Please log in again."
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to save artwork."
      );
    }

    const saved = normalizeArtwork(data);

    if (editingWork) {
      setWorks((current) =>
        current.map((item) =>
          item._id === saved._id ? saved : item
        )
      );
    } else {
      setWorks((current) => [saved, ...current]);
    }

    setShowForm(false);
    setEditingWork(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWork(null);
  };

  /**
   * LOGOUT
   */
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);

      alert("Unable to log out. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      {/* =========================
          HEADER
      ========================== */}

      <header className="border-b border-[#8C7355]/40 bg-white">
        <div className="container-gallery">

          {/* TOP HEADER */}
          <div className="flex min-h-20 items-center justify-between gap-4 md:h-24">

            <Link
              href="/"
              className="group shrink-0"
            >
              <div className="serif text-[22px] font-black tracking-[0.04em] sm:text-[26px]">
                ETHIOPIA MAPS
              </div>
            </Link>

            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center gap-6 md:flex">

              <nav className="flex items-center gap-5">

                <Link
                  href="/admin/home"
                  className="text-[12px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[var(--ochre)]"
                >
                  Home
                </Link>

                <span className="h-1 w-1 rounded-full bg-black/20" />

                <Link
                  href="/admin"
                  className="text-[12px] uppercase tracking-[0.16em] text-[var(--ochre)]"
                >
                  Collection
                </Link>

                <span className="h-1 w-1 rounded-full bg-black/20" />

                <Link
                  href="/admin/about"
                  className="text-[12px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[var(--ochre)]"
                >
                  About
                </Link>

              </nav>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="border border-black/15 px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:border-[var(--ochre)] hover:text-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? "Logging Out..." : "Log Out"}
              </button>

            </div>

            {/* MOBILE LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 border border-black/15 px-3 py-2 text-[8px] font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:border-[var(--ochre)] hover:text-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
            >
              {loggingOut ? "Logging..." : "Log Out"}
            </button>

          </div>

          {/* MOBILE NAVIGATION */}
          <nav className="flex items-center justify-center gap-0 overflow-x-auto border-t border-black/5 md:hidden">

            <Link
              href="/admin/home"
              className="flex min-h-12 items-center px-4 text-[9px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:text-[var(--ochre)]"
            >
              Home
            </Link>

            <span className="h-1 w-1 shrink-0 rounded-full bg-black/20" />

            <Link
              href="/admin"
              className="flex min-h-12 items-center px-4 text-[9px] uppercase tracking-[0.15em] text-[var(--ochre)]"
            >
              Collection
            </Link>

            <span className="h-1 w-1 shrink-0 rounded-full bg-black/20" />

            <Link
              href="/admin/about"
              className="flex min-h-12 items-center px-4 text-[9px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:text-[var(--ochre)]"
            >
              About
            </Link>

          </nav>

        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}

      <section className="container-gallery pb-24 pt-10">

        {/* PAGE INTRO */}
        <div className="flex flex-col gap-8 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
              Administration
            </p>

            <h1 className="serif mt-4 text-5xl md:text-6xl">
              Collection
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-black/50">
              Manage the artworks displayed in
              the Ethiopia Maps collection.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              setEditingWork(null);
              setShowForm(true);
            }}
            className="w-full bg-[var(--ochre)] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:opacity-85 md:w-auto"
          >
            + Add Artwork
          </button>

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-2 border-b border-black/10">

          <div className="border-r border-black/10 py-7 md:px-6">

            <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
              Total Works
            </p>

            <p className="serif mt-2 text-3xl">
              {works.length}
            </p>

          </div>

          <div className="px-3 py-7 md:px-6">

            <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
              Available
            </p>

            <p className="serif mt-2 text-3xl">
              {
                works.filter(
                  (work) => work.available
                ).length
              }
            </p>

          </div>

        </div>

        {/* SEARCH */}
        <div className="my-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:w-[300px]">

            <input
              type="text"
              placeholder="Search collection..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-sm border border-black/15 bg-white px-4 py-3 pr-10 text-xs outline-none transition-colors placeholder:text-black/35 focus:border-[var(--ochre)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-sm text-black/35 transition-colors hover:text-black"
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute right-4 top-3.5 text-black/40"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />

              <path d="m21 21-4.3-4.3" />
            </svg>

          </div>

          <p className="text-[9px] uppercase tracking-[0.18em] text-black/40">
            {filteredWorks.length}{" "}
            {filteredWorks.length === 1
              ? "work"
              : "works"}
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* COLLECTION LIST */}
        <div className="border-t border-black/10">

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-black/10 border-t-[var(--ochre)]" />

                <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[var(--ochre)]">
                  Loading Collection
                </p>

              </div>

            </div>
          ) : (
            filteredWorks.map((work) => {

              const prices = work.sizes
                .map(
                  (item) => item.price
                )
                .filter(
                  (price) =>
                    typeof price === "number" &&
                    price > 0
                );

              const startingPrice =
                prices.length > 0
                  ? Math.min(...prices)
                  : 0;

              return (
                <div
                  key={work._id}
                  className="group flex flex-col gap-5 border-b border-black/10 py-6 transition-colors hover:bg-black/[0.015] md:flex-row md:items-center"
                >

                  {/* IMAGE */}
                  <div className="relative h-28 w-full overflow-hidden rounded-sm bg-[var(--warm-paper)] md:h-24 md:w-20 md:shrink-0">

                    <Image
                      src={
                        work.images[0]?.url ||
                        work.image
                      }
                      alt={work.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>

                  {/* INFO */}
                  <div className="flex-1">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h2 className="serif text-2xl">
                          {work.title}
                        </h2>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-black/40">
                          {work.year}
                        </p>

                      </div>

                      <p className="serif text-xl">
                        ETB{" "}
                        {startingPrice.toLocaleString()}
                      </p>

                    </div>

                    <p className="mt-3 max-w-xl text-xs leading-6 text-black/45">
                      {work.description}
                    </p>

                    {/* SIZE OPTIONS */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {work.sizes.map(
                        (
                          option,
                          index
                        ) => (
                          <div
                            key={`${option.size}-${index}`}
                            className="border border-black/10 bg-white px-3 py-2"
                          >

                            <div className="flex items-center gap-2">

                              <span className="text-[8px] uppercase tracking-[0.12em] text-black/50">
                                {option.size}
                              </span>

                              <span className="text-[8px] uppercase tracking-[0.12em] text-black/70">
                                ETB{" "}
                                {option.price.toLocaleString()}
                              </span>

                            </div>

                            {option.description && (
                              <p className="mt-1 text-[8px] leading-4 text-black/35">
                                {option.description}
                              </p>
                            )}

                          </div>
                        )
                      )}

                    </div>

                    {/* STATUS */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <span
                        className={`inline-flex px-3 py-1 text-[8px] uppercase tracking-[0.15em] ${
                          work.type === "local"
                            ? "bg-[#E9E3D7] text-[#6E5A40]"
                            : "bg-[#E5E5E5] text-[#555]"
                        }`}
                      >
                        {work.type === "local"
                          ? "Local"
                          : "International"}
                      </span>

                      <span
                        className={`inline-flex px-3 py-1 text-[8px] uppercase tracking-[0.15em] ${
                          work.available
                            ? "bg-[#E9E3D7] text-[#6E5A40]"
                            : "bg-black/5 text-black/40"
                        }`}
                      >
                        {work.available
                          ? "Available"
                          : "Sold"}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 md:ml-6">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(work)
                      }
                      className="border border-black/15 px-5 py-2.5 text-[9px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteWork(work)
                      }
                      className="border border-black/15 px-5 py-2.5 text-[9px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:border-red-300 hover:text-red-600"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              );
            })
          )}

          {!loading &&
            filteredWorks.length === 0 && (
              <div className="py-20 text-center">

                <p className="serif text-2xl">
                  {search.trim()
                    ? `No artwork found for "${search.trim()}".`
                    : "No artworks found."}
                </p>

                <p className="mt-2 text-xs text-black/40">
                  {search.trim()
                    ? "Try searching for another artwork title."
                    : "Try another search or add a new artwork."}
                </p>

              </div>
            )}

        </div>
      </section>

      {/* ARTWORK FORM */}
      {showForm && (
        <ArtworkForm
          artwork={editingWork}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteWork && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-sm bg-[#FAF9F6] shadow-2xl">

            {/* Modal Header */}
            <div className="border-b border-black/10 px-6 py-5 md:px-8">

              <p className="text-[9px] uppercase tracking-[0.2em] text-red-600">
                Remove Artwork
              </p>

              <h2 className="serif mt-2 text-3xl">
                Are you sure?
              </h2>

            </div>

            {/* Modal Content */}
            <div className="px-6 py-7 md:px-8">

              <p className="text-sm leading-6 text-black/55">
                You are about to remove{" "}
                <span className="font-medium text-black">
                  {deleteWork.title}
                </span>{" "}
                from the collection.
              </p>

              <p className="mt-3 text-xs leading-5 text-black/40">
                This action cannot be undone.
                The artwork will no longer
                appear on the website.
              </p>

              {/* Modal Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setDeleteWork(null)}
                  disabled={deleting}
                  className="border border-black/15 px-6 py-3 text-[9px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:border-black/30 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 px-6 py-3 text-[9px] font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Removing..."
                    : "Yes, Remove"}
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-black/10 py-7">

        <div className="container-gallery flex flex-col items-center justify-between gap-3 md:flex-row">

          <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
            Ethiopia Maps - Administration
          </p>

          <Link
            href="/"
            className="text-[8px] uppercase tracking-[0.2em] text-black/30 transition-colors hover:text-[var(--ochre)]"
          >
            Return to Website
          </Link>

        </div>

      </footer>
    </main>
  );
}

/* =========================================================
   ARTWORK FORM
========================================================= */

function ArtworkForm({
  artwork,
  onSave,
  onCancel,
}: {
  artwork: Artwork | null;
  onSave: (
    work: ArtworkPayload
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(
    artwork?.title ?? ""
  );

  const [description, setDescription] =
    useState(
      artwork?.description ?? ""
    );

  const [year, setYear] = useState(
    artwork?.year.toString() ?? ""
  );

  const [available, setAvailable] =
    useState(
      artwork?.available ?? true
    );

  const [market, setMarket] =
    useState<ArtworkMarket>(
      artwork?.type ?? "local"
    );

  const [images, setImages] =
    useState<ArtworkImage[]>(
      artwork?.images?.length === 3
        ? artwork.images
        : emptyImages
    );

  const [uploadingImages, setUploadingImages] =
    useState([false, false, false]);

  const [sizes, setSizes] =
    useState<SizeOption[]>(
      artwork?.sizes ?? [
        {
          size: "A4",
          description: "",
          price: 0,
        },
      ]
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleAddSize = () => {
    setSizes((current) => [
      ...current,
      {
        size: "",
        description: "",
        price: 0,
      },
    ]);
  };

  const handleRemoveSize = (
    index: number
  ) => {
    if (sizes.length === 1) return;

    setSizes((current) =>
      current.filter(
        (_, sizeIndex) =>
          sizeIndex !== index
      )
    );
  };

  const handleSizeChange = (
    index: number,
    field:
      | "size"
      | "description"
      | "price",
    value: string
  ) => {
    setSizes((current) =>
      current.map(
        (item, sizeIndex) => {
          if (
            sizeIndex !== index
          ) {
            return item;
          }

          if (field === "price") {
            return {
              ...item,
              price: Number(value),
            };
          }

          return {
            ...item,
            [field]: value,
          };
        }
      )
    );
  };

  const handleImageUpload = async (
    index: number,
    file: File | null
  ) => {
    if (!file) return;

    setError("");

    setUploadingImages(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? true
              : item
        )
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href =
          "/admin/login";

        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Image upload failed."
        );
      }

      if (
        !data.url ||
        !data.publicId
      ) {
        throw new Error(
          "Upload succeeded but no image information was returned."
        );
      }

      setImages((current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  url: data.url,
                  publicId:
                    data.publicId,
                }
              : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploadingImages(
        (current) =>
          current.map(
            (item, itemIndex) =>
              itemIndex === index
                ? false
                : item
          )
      );
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const validSizes =
      sizes.filter(
        (option) =>
          option.size.trim() !==
            "" &&
          option.description.trim() !==
            "" &&
          option.price > 0
      );

    const uploadedImages =
      images.filter(
        (image) =>
          image.url.trim() !== "" &&
          image.publicId.trim() !== ""
      );

    if (
      !title.trim() ||
      !description.trim() ||
      !year ||
      validSizes.length === 0 ||
      uploadedImages.length !== 3
    ) {
      setError(
        "Please complete all fields, add at least one size, and upload exactly 3 images."
      );

      return;
    }

    if (
      uploadingImages.some(Boolean)
    ) {
      setError(
        "Please wait for all images to finish uploading."
      );

      return;
    }

    setSaving(true);

    try {
      await onSave({
        slug: slugify(title),
        title: title.trim(),
        description:
          description.trim(),
        year: Number(year),
        available,
        type: market,
        images,
        sizes: validSizes,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save artwork."
      );

      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-[#FAF9F6] shadow-2xl">

        {/* FORM HEADER */}
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5 md:px-8">

          <div>

            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--ochre)]">
              {artwork
                ? "Edit Artwork"
                : "New Artwork"}
            </p>

            <h2 className="serif mt-1 text-3xl">
              {artwork
                ? artwork.title
                : "Add to Collection"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center text-xl text-black/40 transition-colors hover:text-black"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-6 py-7 md:px-8"
        >

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* TITLE */}
          <div>

            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50">
              Artwork Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="e.g. Addis"
              className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--ochre)]"
            />

          </div>

          {/* DESCRIPTION */}
          <div>

            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe the artwork..."
              rows={4}
              className="w-full resize-none rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--ochre)]"
            />

          </div>

          {/* YEAR */}
          <div>

            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50">
              Year
            </label>

            <input
              type="number"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value
                )
              }
              placeholder="2026"
              className="w-full rounded-sm border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--ochre)]"
            />

          </div>

          {/* COLLECTION */}
          <div className="border-t border-black/10 pt-6">

            <label className="block text-[9px] uppercase tracking-[0.18em] text-black/50">
              Collection
            </label>

            <p className="mt-1 text-[10px] text-black/35">
              Select whether this artwork belongs
              to the local or international
              collection.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <label
                className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition-colors ${
                  market === "local"
                    ? "border-[var(--ochre)] bg-[#E9E3D7]/40"
                    : "border-black/10 bg-white hover:border-black/25"
                }`}
              >

                <input
                  type="radio"
                  name="market"
                  value="local"
                  checked={
                    market ===
                    "local"
                  }
                  onChange={() =>
                    setMarket(
                      "local"
                    )
                  }
                  className="h-4 w-4 accent-[var(--ochre)]"
                />

                <div>

                  <p className="text-[10px] font-medium uppercase tracking-[0.15em]">
                    Local
                  </p>

                  <p className="mt-1 text-[9px] text-black/40">
                    Ethiopian collection
                  </p>

                </div>

              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition-colors ${
                  market ===
                  "international"
                    ? "border-[var(--ochre)] bg-[#E9E3D7]/40"
                    : "border-black/10 bg-white hover:border-black/25"
                }`}
              >

                <input
                  type="radio"
                  name="market"
                  value="international"
                  checked={
                    market ===
                    "international"
                  }
                  onChange={() =>
                    setMarket(
                      "international"
                    )
                  }
                  className="h-4 w-4 accent-[var(--ochre)]"
                />

                <div>

                  <p className="text-[10px] font-medium uppercase tracking-[0.15em]">
                    International
                  </p>

                  <p className="mt-1 text-[9px] text-black/40">
                    International collection
                  </p>

                </div>

              </label>

            </div>

          </div>

          {/* IMAGES */}
          <div className="border-t border-black/10 pt-6">

            <label className="block text-[9px] uppercase tracking-[0.18em] text-black/50">
              Artwork Images
            </label>

            <p className="mt-1 text-[10px] text-black/35">
              Upload exactly three images. The
              first image is used on the shop grid.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">

              {images.map(
                (image, index) => (
                  <div
                    key={index}
                    className="border border-black/10 bg-white p-3"
                  >

                    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm-paper)]">

                      {image.url ? (
                        <Image
                          src={image.url}
                          alt={`Artwork image ${
                            index + 1
                          }`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-[0.16em] text-black/35">
                          Image{" "}
                          {index + 1}
                        </div>
                      )}

                    </div>

                    <label className="mt-3 block cursor-pointer border border-black/15 px-3 py-2 text-center text-[8px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]">

                      {uploadingImages[
                        index
                      ]
                        ? "Uploading..."
                        : image.url
                          ? "Replace"
                          : "Upload"}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={
                          uploadingImages[
                            index
                          ]
                        }
                        onChange={(
                          event
                        ) =>
                          handleImageUpload(
                            index,
                            event.target
                              .files?.[0] ??
                              null
                          )
                        }
                      />

                    </label>

                  </div>
                )
              )}

            </div>

          </div>

          {/* SIZES */}
          <div className="border-t border-black/10 pt-6">

            <div className="mb-4 flex items-end justify-between gap-4">

              <div>

                <label className="block text-[9px] uppercase tracking-[0.18em] text-black/50">
                  Size Options & Prices
                </label>

                <p className="mt-1 text-[10px] text-black/35">
                  Add the available sizes,
                  descriptions, and ETB prices.
                </p>

              </div>

              <button
                type="button"
                onClick={handleAddSize}
                className="shrink-0 border border-black/15 px-4 py-2 text-[8px] uppercase tracking-[0.15em] transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]"
              >
                + Add Size
              </button>

            </div>

            <div className="space-y-5">

              {sizes.map(
                (
                  option,
                  index
                ) => (
                  <div
                    key={index}
                    className="border border-black/10 bg-white p-4"
                  >

                    <div className="flex items-end gap-3">

                      <div className="flex-1">

                        <label className="mb-2 block text-[8px] uppercase tracking-[0.15em] text-black/40">
                          Size
                        </label>

                        <input
                          type="text"
                          value={
                            option.size
                          }
                          onChange={(e) =>
                            handleSizeChange(
                              index,
                              "size",
                              e.target.value
                            )
                          }
                          placeholder="A4 / A3 / A2"
                          className="w-full rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-3 text-sm outline-none focus:border-[var(--ochre)]"
                        />

                      </div>

                      <div className="w-[150px]">

                        <label className="mb-2 block text-[8px] uppercase tracking-[0.15em] text-black/40">
                          Price - ETB
                        </label>

                        <div className="relative">

                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-black/35">
                            ETB
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              option.price ||
                              ""
                            }
                            onChange={(e) =>
                              handleSizeChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="150"
                            className="w-full rounded-sm border border-black/15 bg-[#FAF9F6] py-3 pl-12 pr-3 text-sm outline-none focus:border-[var(--ochre)]"
                          />

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSize(
                            index
                          )
                        }
                        disabled={
                          sizes.length === 1
                        }
                        className="mb-0 flex h-[42px] w-[42px] shrink-0 items-center justify-center border border-black/10 text-lg text-black/35 transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Remove size"
                      >
                        ×
                      </button>

                    </div>

                    <div className="mt-4">

                      <label className="mb-2 block text-[8px] uppercase tracking-[0.15em] text-black/40">
                        Size Description
                      </label>

                      <textarea
                        value={
                          option.description
                        }
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 210 x 297 mm, archival paper, suitable for smaller spaces..."
                        rows={2}
                        className="w-full resize-none rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-3 text-sm outline-none focus:border-[var(--ochre)]"
                      />

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* AVAILABILITY */}
          <label className="flex cursor-pointer items-center gap-3 border-t border-black/10 pt-5">

            <input
              type="checkbox"
              checked={available}
              onChange={(e) =>
                setAvailable(
                  e.target.checked
                )
              }
              className="h-4 w-4 accent-[var(--ochre)]"
            />

            <span className="text-sm">
              Artwork is available
            </span>

          </label>

          {/* FORM ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-[9px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingImages.some(Boolean)
              }
              className="bg-[var(--ochre)] px-7 py-3 text-[9px] font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : artwork
                  ? "Save Changes"
                  : "Add Artwork"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}