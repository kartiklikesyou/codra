"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CURRENT_USER } from "@/components/dashboard/mock-data";

export default function SettingsPage() {
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      {() => (
        <div className="space-y-6 max-w-2xl">
          <div className="border-b border-zinc-800/60 pb-5">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Settings
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Workspace and account preferences.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="rounded-xl border border-zinc-800/80 bg-[#0d0d10] p-5 space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-mono">
                Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 w-full rounded-md border border-zinc-800 bg-[#141418] px-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 w-full rounded-md border border-zinc-800 bg-[#141418] px-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white transition-colors"
              >
                {saved ? "Saved" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
