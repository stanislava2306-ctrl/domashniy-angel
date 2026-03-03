"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "senior_large_font";

export function SeniorSettingsClient() {
  const [largeFont, setLargeFont] = useState(false);

  useEffect(() => {
    const current = window.localStorage.getItem(STORAGE_KEY);
    const enabled = current === "1";
    setLargeFont(enabled);

    if (enabled) {
      document.documentElement.classList.add("senior-large-font");
    }
  }, []);

  useEffect(() => {
    if (largeFont) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      document.documentElement.classList.add("senior-large-font");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      document.documentElement.classList.remove("senior-large-font");
    }
  }, [largeFont]);

  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3">
      <span className="text-base">Крупный шрифт</span>
      <input
        type="checkbox"
        checked={largeFont}
        onChange={(event) => setLargeFont(event.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}
