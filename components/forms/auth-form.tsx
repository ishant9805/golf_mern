"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CharityOption = {
  id: string;
  name: string;
};

export function AuthForm({
  mode,
  charities = []
}: {
  mode: "login" | "signup";
  charities?: CharityOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload =
      mode === "signup"
        ? {
            fullName: String(formData.get("fullName") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            selectedCharityId: String(formData.get("selectedCharityId") ?? ""),
            charityPercentage: Number(formData.get("charityPercentage") ?? 10)
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to continue.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="section-shell grid min-h-screen place-items-center py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Card className="space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              {mode === "login" ? "Welcome back" : "Join the platform"}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">
              {mode === "login" ? "Log in to your dashboard" : "Create your impact membership"}
            </h1>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            {mode === "signup" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium">Full name</span>
                <input name="fullName" required className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3" />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
              />
            </label>

            {mode === "signup" ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Choose charity</span>
                  <select
                    name="selectedCharityId"
                    required
                    className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                    defaultValue={charities[0]?.id}
                  >
                    {charities.map((charity) => (
                      <option key={charity.id} value={charity.id}>
                        {charity.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Charity contribution %</span>
                  <input
                    name="charityPercentage"
                    type="number"
                    min={10}
                    max={100}
                    defaultValue={10}
                    required
                    className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3"
                  />
                </label>
              </>
            ) : null}

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-[var(--muted)]">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <Link href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-[var(--secondary)]">
              {mode === "login" ? "Create one" : "Log in"}
            </Link>
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
