"use client";
import { useFormStatus } from "react-dom";
export function SubmitReviewButton() {
  const { pending } = useFormStatus();
  return <button className="button" type="submit" disabled={pending} aria-disabled={pending}>{pending ? "Submitting…" : "Submit application"}</button>;
}
