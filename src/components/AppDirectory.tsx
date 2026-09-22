"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppIcon from "@/components/AppIcon";
import { apps, type AppCategory } from "@/lib/apps";

const filters: Array<"All" | AppCategory> = ["All", "Productivity", "Finance", "Health"];

export default function AppDirectory() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const filteredApps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesFilter = activeFilter === "All" || app.category === activeFilter;
      const matchesQuery = !normalizedQuery || `${app.name} ${app.packageName} ${app.shortDescription}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="app-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search apps</label>
          <input id="app-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or use case" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72" />
        </div>
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Filter by</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter apps by category">
            {filters.map((filter) => (
              <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === filter ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} aria-pressed={activeFilter === filter}>{filter}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(0,1fr)_140px_120px] gap-6 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
          <span>App</span><span>Category</span><span>Platform</span>
        </div>
        {filteredApps.map((app) => (
          <Link key={app.slug} href={`/apps/${app.slug}`} className="grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-4 transition last:border-0 hover:bg-blue-50/40 sm:grid-cols-[minmax(0,1fr)_140px_120px] sm:items-center sm:gap-6 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <AppIcon accent={app.accent} icon={app.icon} iconUrl={app.iconUrl} />
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-gray-900">{app.name}</h2>
                <p className="truncate text-sm text-gray-500">{app.packageName}</p>
                <p className="mt-1 text-sm text-gray-600 sm:hidden">{app.shortDescription}</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">{app.category}</span>
            <span className="flex items-center justify-between text-sm text-gray-600 sm:block">{app.platform}<span className={`ml-2 rounded-full px-2 py-1 text-xs ${app.status === "Available" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{app.status}</span></span>
          </Link>
        ))}
        {filteredApps.length === 0 && <p className="px-6 py-12 text-center text-sm text-gray-500">No apps match that search yet.</p>}
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">{filteredApps.length} {filteredApps.length === 1 ? "app" : "apps"}</p>
    </div>
  );
}
