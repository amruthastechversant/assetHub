import React from "react";
import ThemeLoader from "@/components/common/ThemeLoader";

export default function Loading() {
  return (
    <ThemeLoader
      variant="page"
      message="Loading Instant..."
      submessage="Preparing your secure environment"
    />
  );
}
