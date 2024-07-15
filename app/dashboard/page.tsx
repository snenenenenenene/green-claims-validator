"use client";
import { useEffect } from "react";
import { chartInstances } from "@/app/data/charts";
export default function Page() {
  useEffect(() => {
    if (window.location.href.endsWith("/dashboard")) {
      window.location.href = `/dashboard/${chartInstances[0].name}`;
    }
  }, []);
  return <></>;
}
