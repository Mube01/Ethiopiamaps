"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Where the user originally wanted to go
      const from = searchParams.get("from");

      router.push(from || "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]">
      <div className="flex min-h-screen flex-col">

        {/* Brand */}
        <header className="border-b border-[#8C7355]/40 bg-white">
          <div className="container-gallery flex h-24 items-center justify-center">
            <Link
              href="/"
              className="serif text-[26px] font-black tracking-[0.04em]"
            >
              ETHIOPIA MAPS
            </Link>
          </div>
        </header>

        {/* Login */}
        <section className="flex flex-1 items-center justify-center px-5 py-16">

          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <div className="mb-10 text-center">

              <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--ochre)]">
                Administration
              </p>

              <h1 className="serif mt-4 text-4xl md:text-5xl">
                Welcome back
              </h1>

              <p className="mt-4 text-xs leading-6 text-black/45">
                Sign in to manage the Ethiopia Maps collection.
              </p>

            </div>

            {/* Card */}
            <div className="border border-black/10 bg-white p-7 md:p-9">

              <form onSubmit={handleSubmit}>

                {/* Email */}
                <div className="mb-6">

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-black/50"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-3 text-xs outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                  />

                </div>

                {/* Password */}
                <div className="mb-5">

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-[9px] uppercase tracking-[0.18em] text-black/50"
                    >
                      Password
                    </label>

                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-sm border border-black/15 bg-[#FAF9F6] px-3 py-3 pr-16 text-xs outline-none transition-colors placeholder:text-black/30 focus:border-[var(--ochre)]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.12em] text-black/40 transition-colors hover:text-black"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--ochre)] px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

              </form>

            </div>

            {/* Back */}
            <div className="mt-7 text-center">

              <Link
                href="/"
                className="text-[9px] uppercase tracking-[0.18em] text-black/40 transition-colors hover:text-[var(--ochre)]"
              >
                ← Back to Ethiopia Maps
              </Link>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="border-t border-black/10 py-6 text-center">
          <p className="text-[8px] uppercase tracking-[0.2em] text-black/30">
            Ethiopia Maps · Administration
          </p>
        </footer>

      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF9F6] text-[var(--charcoal)]" />
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
