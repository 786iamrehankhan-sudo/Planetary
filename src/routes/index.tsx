import { createFileRoute, redirect } from "@tanstack/react-router";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Find Earth's Next Frontier", "Rank Earth locations that best analog Moon base and Mars settlement sites."),
  beforeLoad: () => { throw redirect({ to: "/dashboard" }); },
});
