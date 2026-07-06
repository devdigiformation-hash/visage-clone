import { createFileRoute } from "@tanstack/react-router";
import DigiApp from "@/components/digi/DigiApp";

export const Route = createFileRoute("/")({
  component: DigiApp,
});
