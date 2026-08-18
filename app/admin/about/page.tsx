"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SiteContentResponse = {
  homeTagline?: string;
  aboutContent?: string;
  error?: string;
};

export default function AdminAboutPage() {
  const router = useRouter();

  const [aboutContent, setAboutContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const readResponse = async (
    response: Response
  ): Promise<SiteContentResponse> => {
    const text = await response.text();

    if (!text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "The server returned an invalid response."
      );
    }
  };

  /*
   * =========================
   * LOAD ABOUT CONTENT
   * =========================
   */
  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(
          "/api/site-content",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          router.replace("/admin/login");
          return;
        }

        const data =
          await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load About content."
          );
        }

        if (active) {
          setAboutContent(
            data.aboutContent || ""
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load About content."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      active = false;
    };
  }, [router]);

  /*
   * =========================
   * SAVE ABOUT CONTENT
   * =========================
   */
  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        "/api/site-content",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            aboutContent,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        router.replace("/admin/login");
        return;
      }

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save About content."
        );
      }

      setAboutContent(
        data.aboutContent !== undefined
          ? data.aboutContent
          : aboutContent
      );

      setSuccess(
        "About page content saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save About content."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================
   * LOG OUT
   * =========================
   */
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);

      alert(
        "Unable to log out. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      {/* =========================
          HEADER
      ========================== */}
      <header className="border-b border-[#8C7355]/40 bg-white">
        <div className="container-gallery flex min-h-24 flex-col justify-center gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0">

          {/* LOGO */}
          <Link
            href="/"
            className="group shrink-0"
          >
            <div className="serif text-[22px] font-black tracking-[0.04em] sm:text-[26px]">
              ETHIOPIA MAPS
            </div>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-6">

            {/* ADMIN NAVIGATION */}
            <nav className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-4">

              <Link
                href="/admin/home"
                className="shrink-0 px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-black/50 transition-colors hover:text-[var(--ochre)] sm:px-1 sm:text-[12px] sm:tracking-[0.16em]"
              >
                Home
              </Link>

              <span className="h-1 w-1 shrink-0 rounded-full bg-black/20" />

              <Link
                href="/admin"
                className="shrink-0 px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-black/50 transition-colors hover:text-[var(--ochre)] sm:px-1 sm:text-[12px] sm:tracking-[0.16em]"
              >
                Collection
              </Link>

              <span className="h-1 w-1 shrink-0 rounded-full bg-black/20" />

              <Link
                href="/admin/about"
                className="shrink-0 px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-[var(--ochre)] sm:px-1 sm:text-[12px] sm:tracking-[0.16em]"
              >
                About
              </Link>

            </nav>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 border border-black/15 px-3 py-2.5 text-[8px] font-medium uppercase tracking-[0.14em] transition-all duration-300 hover:border-[var(--ochre)] hover:text-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-[9px] sm:tracking-[0.18em]"
            >
              {loggingOut
                ? "Logging Out..."
                : "Log Out"}
            </button>

          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}
      <section className="container-gallery pb-24 pt-10">

        {/* PAGE INTRO */}
        <div className="border-b border-black/10 pb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
            About Page
          </p>

          <h1 className="serif mt-4 text-5xl md:text-6xl">
            Edit About
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-black/50">
            Edit the text displayed on the
            public About page. Separate paragraphs
            with a blank line.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSave}
          className="mt-10 max-w-4xl"
        >

          {/* ERROR */}
          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {success}
            </div>
          )}

          {/* CONTENT LABEL */}
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-black/50">
              About Page Content
            </label>

            <p className="mb-4 text-[11px] leading-5 text-black/35">
              Use a blank line between paragraphs.
              The public About page will automatically
              format them as separate paragraphs.
            </p>

            {/* TEXTAREA */}
            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center border border-black/10 bg-white">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--ochre)]">
                  Loading About Content...
                </p>
              </div>
            ) : (
              <textarea
                value={aboutContent}
                onChange={(event) =>
                  setAboutContent(
                    event.target.value
                  )
                }
                rows={22}
                className="w-full resize-y border border-black/15 bg-white px-5 py-5 text-sm leading-7 outline-none transition-colors focus:border-[var(--ochre)]"
                placeholder="Write your About page content here..."
              />
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href="/about"
              target="_blank"
              className="border border-black/15 px-6 py-3 text-center text-[9px] uppercase tracking-[0.18em] text-black/50 transition-colors hover:border-[var(--ochre)] hover:text-[var(--ochre)]"
            >
              Preview About Page
            </Link>

            <button
              type="submit"
              disabled={
                saving || loading
              }
              className="bg-[var(--ochre)] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-black/10 py-7">
        <div className="container-gallery flex flex-col items-center justify-between gap-3 md:flex-row">

          <p className="text-[9px] uppercase tracking-[0.2em] text-black/30">
            Ethiopia Maps - Administration
          </p>

          <Link
            href="/"
            className="text-[9px] uppercase tracking-[0.2em] text-black/30 transition-colors hover:text-[var(--ochre)]"
          >
            Return to Website
          </Link>

        </div>
      </footer>
    </main>
  );
}