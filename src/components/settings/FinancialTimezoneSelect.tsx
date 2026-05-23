"use client";

import { useMemo } from "react";
import { Field, selectClass } from "@/components/ui/Field";
import { buildProfileTimezoneOptions, resolveDeviceTimezone } from "@/lib/dates/timezone";

export function FinancialTimezoneSelect({
  value,
}: {
  value: string;
}) {
  const options = useMemo(
    () => buildProfileTimezoneOptions(value, resolveDeviceTimezone()),
    [value]
  );

  return (
    <Field
      label="Financial timezone"
      hint="Used to decide when each spending day starts."
    >
      <select className={selectClass} name="timezone" defaultValue={value}>
        {options.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
    </Field>
  );
}
