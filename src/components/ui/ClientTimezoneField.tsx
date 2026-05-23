"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_TIMEZONE, resolveDeviceTimezone } from "@/lib/dates/timezone";

export function ClientTimezoneField({ name = "timezone" }: { name?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.value = resolveDeviceTimezone();
  }, []);

  return (
    <input
      ref={ref}
      type="hidden"
      name={name}
      defaultValue={DEFAULT_TIMEZONE}
    />
  );
}
