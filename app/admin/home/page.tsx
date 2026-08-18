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

export default function AdminHomePage() {
  const router = useRouter();

  const [tagline, setTagline] = useState("");
  const [aboutContent, setAboutContent] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
              "Unable to load homepage content."
          );
        }

        if (active) {
          setTagline(
            data.homeTagline || ""
          );

          setAboutContent(
            data.aboutContent || ""
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load homepage content."
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
            homeTagline: tagline,
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
            "Unable to save homepage content."
        );
      }

      setTagline(
        data.homeTagline !== undefined
          ? data.homeTagline
          : tagline
      );

      setAboutContent(
        data.aboutContent !== undefined
          ? data.aboutContent
          : aboutContent
      );

      setSuccess(
        "Homepage content saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save homepage content."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data =
          await readResponse(response);

        throw new Error(
          data.error || "Logout failed."
        );
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setLoggingOut(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to log out. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      {/* =========================
          ADMIN HEADER
      ========================== */}
      <header className="border-b border-[#8C7355]/40 bg-white">
        <div className="container-gallery py-5">
          {/* TOP ROW */}
          <div className="flex min-h-14 items-center justify-between gap-4">
            {/* LOGO */}
            <Link
              href="/"
              className="group shrink-0"
            >
              <div className="serif text-[22px] font-black tracking-[0.04em] sm:text-[26px]">
                ETHIOPIA MAPS
              </div>
            </Link>

            {/* DESKTOP NAV + LOGOUT */}
            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center gap-5">
                <Link
                  href="/admin/home"
                  className="text-[12px] uppercase tracking-[0.16em] text-[var(--ochre)]"
                >
                  Home
                </Link>

                <span className="h-1 w-1 rounded-full bg-black/20" />

                <Link
                  href="/admin"
                  className="text-[12px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[var(--ochre)]"
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
                {loggingOut
                  ? "Logging Out..."
                  : "Log Out"}
              </button>
            </div>

            {/* MOBILE LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 border border-black/15 px-4 py-2.5 text-[8px] font-medium uppercase tracking-[0.16em] transition-all duration-300 hover:border-[var(--ochre)] hover:text-[var(--ochre)] disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
            >
              {loggingOut
                ? "Logging Out..."
                : "Log Out"}
            </button>
          </div>

          {/* MOBILE NAV */}
          <nav className="mt-5 flex items-center justify-center gap-4 border-t border-black/10 pt-4 md:hidden">
            <Link
              href="/admin/home"
              className="text-[9px] uppercase tracking-[0.16em] text-[var(--ochre)]"
            >
              Home
            </Link>

            <span className="h-1 w-1 rounded-full bg-black/20" />

            <Link
              href="/admin"
              className="text-[9px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[var(--ochre)]"
            >
              Collection
            </Link>

            <span className="h-1 w-1 rounded-full bg-black/20" />

            <Link
              href="/admin/about"
              className="text-[9px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[var(--ochre)]"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}
      <section className="container-gallery pb-24 pt-12">
        <div className="border-b border-black/10 pb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ochre)]">
            Homepage
          </p>

          <h1 className="serif mt-4 text-5xl md:text-6xl">
            Edit Home
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-black/50">
            Manage the main tagline displayed
            on the Ethiopia Maps homepage.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="mt-10 max-w-3xl"
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

          <label className="mb-2 block text-[14px] uppercase tracking-[0.18em] text-black/50">
            Homepage Tagline
          </label>

          <p className="mb-4 text-[12px] leading-5 text-black/35">
            Use a new line where you want the
            tagline to break into another line.
          </p>

          {loading ? (
            <div className="flex h-48 items-center justify-center border border-black/10 bg-white">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--ochre)]">
                Loading...
              </p>
            </div>
          ) : (
            <textarea
              value={tagline}
              onChange={(event) =>
                setTagline(
                  event.target.value
                )
              }
              rows={5}
              className="w-full resize-none border border-black/15 bg-white px-5 py-4 text-base leading-7 outline-none transition-colors focus:border-[var(--ochre)]"
              placeholder={`Beautifully crafted maps celebrating
Ethiopia & Africa's cities.`}
            />
          )}

          <div className="mt-6 flex justify-end">
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">
            Ethiopia Maps -
            Administration
          </p>

          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.2em] text-black/30 transition-colors hover:text-[var(--ochre)]"
          >
            Return to Website
          </Link>
        </div>
      </footer>
    </main>
  );
}