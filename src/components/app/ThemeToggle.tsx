"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const next = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={mounted ? `Switch to ${next} mode` : "Toggle theme"}
      onClick={() => setTheme(next)}
      className="size-8"
    >
      <Sun className={`size-4 transition-all ${isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
      <Moon className={`absolute size-4 transition-all ${isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
    </Button>
  );
}
