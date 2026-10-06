"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function StaffSubmitButton({ children, busyLabel, link = false, cooldown = 0 }: {
  children: string; busyLabel: string; link?: boolean; cooldown?: number;
}) {
  const { pending } = useFormStatus();
  const [seconds, setSeconds] = useState(cooldown);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);
  return <button className={link ? "staff-text-link" : "button"} type="submit" disabled={pending || seconds > 0}>
    {pending ? busyLabel : seconds > 0 ? `Resend available in ${seconds}s` : children}
  </button>;
}
