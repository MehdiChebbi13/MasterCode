"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BLOCK_DEFINITIONS,
  type BlockDefinition,
  type BlockType,
} from "@/lib/summaryBlocks";

interface BlockTypeMenuProps {
  open: boolean;
  query?: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  /** Anchor coordinates in viewport (top-left of the menu). */
  position: { top: number; left: number };
  /** Block type to highlight as the current selection. */
  currentType?: BlockType;
}

export function BlockTypeMenu({
  open,
  query = "",
  onSelect,
  onClose,
  position,
  currentType,
}: BlockTypeMenuProps) {
  const [highlight, setHighlight] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = useMemo<BlockDefinition[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCK_DEFINITIONS;
    return BLOCK_DEFINITIONS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.keywords.some((k) => k.includes(q)),
    );
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  // Scroll highlighted item into view when arrow keys change it.
  useEffect(() => {
    itemRefs.current[highlight]?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setHighlight((h) => (h + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const def = filtered[highlight];
        if (def) onSelect(def.type);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, filtered, highlight, onSelect, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Block type menu"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 80,
        width: 268,
        maxHeight: 340,
        overflowY: "auto",
        background: "var(--paper)",
        border: "2.5px solid var(--ink)",
        borderRadius: 14,
        boxShadow: "var(--shadow-lg)",
        padding: 6,
        fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
      }}
    >
      <div
        style={{
          padding: "6px 10px 8px",
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono'), monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
        }}
      >
        Turn into
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding: "10px 12px", fontSize: 13, color: "var(--ink-faint)" }}>
          No matching block type.
        </div>
      ) : (
        filtered.map((def, idx) => {
          const isHighlighted = idx === highlight;
          const isCurrent = def.type === currentType;
          return (
            <button
              key={def.type}
              ref={(el) => { itemRefs.current[idx] = el; }}
              type="button"
              role="menuitem"
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => onSelect(def.type)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "9px 10px",
                border: "none",
                borderRadius: 10,
                background: isHighlighted ? "var(--ds-yellow)" : "transparent",
                color: "var(--ink)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid var(--ink)",
                  borderRadius: 8,
                  background: "var(--paper)",
                  fontFamily:
                    def.icon.length > 1
                      ? "var(--font-jetbrains, 'JetBrains Mono'), monospace"
                      : "var(--font-bricolage, serif)",
                  fontSize: def.icon.length > 1 ? 12 : 16,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {def.icon}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {def.label}
                  {isCurrent && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 9.5,
                        letterSpacing: "0.1em",
                        background: "var(--ds-mint)",
                        border: "1.5px solid var(--ink)",
                        padding: "1px 6px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      current
                    </span>
                  )}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    color: "var(--ink-soft)",
                    marginTop: 1,
                  }}
                >
                  {def.hint}
                </span>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains, monospace)",
                  fontSize: 10.5,
                  color: "var(--ink-faint)",
                  flexShrink: 0,
                }}
              >
                {def.shortcut}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
