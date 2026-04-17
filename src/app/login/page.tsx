/**
 * /login — canonical login URL.
 * Immediately redirects to the root auth page (which handles both login &
 * register in a single split-panel layout).
 */
import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/");
}
