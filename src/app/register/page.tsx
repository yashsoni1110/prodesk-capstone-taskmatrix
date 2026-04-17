/**
 * /register — canonical registration URL.
 * Redirects to the root auth page with the register tab pre-selected.
 */
import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/?mode=register");
}
