"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Block, BlockType } from "@/lib/summaryBlocks";
import {
  DEFAULT_TABLE_TEXT,
  parseTableRows,
  serializeTableRows,
} from "@/lib/summaryBlocks";

export interface EditorBlockHandle {
  focus: (caret?: "start" | "end") => void;
  getRect: () => DOMRect | null;
}

interface EditorBlockProps {
  block: Block;
  numberedIndex?: number;
  isFocused: boolean;
  onChangeText: (text: string) => void;
  onChangeLang: (lang: string) => void;
  onEnterCreate: () => void;
  onDeleteEmpty: () => void;
  onMoveFocus: (direction: -1 | 1) => void;
  onFocus: () => void;
  onSlashTrigger: (rect: DOMRect) => void;
  onTypeHandleClick: (rect: DOMRect) => void;
  onConvertFromShortcut?: (type: BlockType, restText: string) => void;
}

// ── TableBlockEditor ──────────────────────────────────────────────────────────

interface TableEditorHandle {
  focusFirst: () => void;
}

interface TableBlockEditorProps {
  text: string;
  isFocused: boolean;
  onChangeText: (text: string) => void;
  onMoveFocus: (dir: -1 | 1) => void;
  onDeleteEmpty: () => void;
  onFocus: () => void;
}

const TableBlockEditor = forwardRef<TableEditorHandle, TableBlockEditorProps>(
  function TableBlockEditor(
    { text, isFocused, onChangeText, onMoveFocus, onDeleteEmpty, onFocus },
    ref,
  ) {
    const rows = parseTableRows(text || DEFAULT_TABLE_TEXT);
    const colCount = rows[0]?.length ?? 2;
    const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    useImperativeHandle(ref, () => ({
      focusFirst: () => cellRefs.current.get("0-0")?.focus(),
    }));

    function cellKey(r: number, c: number) {
      return `${r}-${c}`;
    }

    function setCell(rowIdx: number, colIdx: number, value: string) {
      const next = rows.map((r, ri) =>
        r.map((c, ci) => (ri === rowIdx && ci === colIdx ? value : c)),
      );
      onChangeText(serializeTableRows(next));
    }

    function addRow() {
      const newRow = Array(colCount).fill("");
      onChangeText(serializeTableRows([...rows, newRow]));
      // focus first cell of new row after render
      setTimeout(() => {
        cellRefs.current.get(cellKey(rows.length, 0))?.focus();
      }, 0);
    }

    function addCol() {
      const next = rows.map((r) => [...r, ""]);
      onChangeText(serializeTableRows(next));
    }

    function deleteRow(rowIdx: number) {
      if (rows.length <= 2) {
        // Only header + 1 body row: clear body row instead of removing
        const next = rows.map((r, ri) => (ri === rowIdx ? r.map(() => "") : r));
        onChangeText(serializeTableRows(next));
        return;
      }
      const next = rows.filter((_, ri) => ri !== rowIdx);
      onChangeText(serializeTableRows(next));
    }

    function handleCellKeyDown(
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIdx: number,
      colIdx: number,
    ) {
      const isFirstCell = rowIdx === 0 && colIdx === 0;
      const isLastRow = rowIdx === rows.length - 1;
      const isLastCol = colIdx === colCount - 1;
      const val = (e.target as HTMLInputElement).value;

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Move backwards
          if (colIdx > 0) {
            cellRefs.current.get(cellKey(rowIdx, colIdx - 1))?.focus();
          } else if (rowIdx > 0) {
            cellRefs.current.get(cellKey(rowIdx - 1, colCount - 1))?.focus();
          } else {
            onMoveFocus(-1);
          }
        } else {
          // Move forwards
          if (!isLastCol) {
            cellRefs.current.get(cellKey(rowIdx, colIdx + 1))?.focus();
          } else if (!isLastRow) {
            cellRefs.current.get(cellKey(rowIdx + 1, 0))?.focus();
          } else {
            addRow();
          }
        }
        return;
      }

      if (e.key === "ArrowUp" && rowIdx === 0) {
        e.preventDefault();
        onMoveFocus(-1);
        return;
      }
      if (e.key === "ArrowDown" && isLastRow) {
        e.preventDefault();
        onMoveFocus(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        cellRefs.current.get(cellKey(rowIdx - 1, colIdx))?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        cellRefs.current.get(cellKey(rowIdx + 1, colIdx))?.focus();
        return;
      }

      if (e.key === "Backspace" && isFirstCell && val === "") {
        e.preventDefault();
        onDeleteEmpty();
      }
    }

    const borderColor = "var(--ink)";
    const headerBg = "rgba(0,0,0,0.06)";

    return (
      <div style={{ width: "100%" }}>
        <div
          style={{
            border: `2.5px solid ${borderColor}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {rows[0]?.map((cell, ci) => (
                  <th
                    key={ci}
                    style={{
                      background: headerBg,
                      borderRight:
                        ci < colCount - 1 ? `1.5px solid ${borderColor}` : undefined,
                      borderBottom: `1.5px solid ${borderColor}`,
                      padding: 0,
                    }}
                  >
                    <input
                      ref={(el) => {
                        if (el) cellRefs.current.set(cellKey(0, ci), el);
                        else cellRefs.current.delete(cellKey(0, ci));
                      }}
                      value={cell}
                      placeholder={`Header ${ci + 1}`}
                      onChange={(e) => setCell(0, ci, e.target.value)}
                      onKeyDown={(e) => handleCellKeyDown(e, 0, ci)}
                      onFocus={onFocus}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        padding: "8px 12px",
                        fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    />
                  </th>
                ))}
                {isFocused && (
                  <th
                    style={{
                      background: headerBg,
                      borderBottom: `1.5px solid ${borderColor}`,
                      padding: "4px 6px",
                      width: 32,
                      textAlign: "center",
                    }}
                  >
                    <button
                      type="button"
                      title="Add column"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={addCol}
                      style={{
                        width: 22,
                        height: 22,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 5,
                        background: "var(--paper)",
                        color: "var(--ink-soft)",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      +
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, bodyRowIdx) => {
                const rowIdx = bodyRowIdx + 1;
                return (
                  <tr key={rowIdx}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          borderRight:
                            ci < colCount - 1
                              ? `1px solid rgba(0,0,0,0.1)`
                              : undefined,
                          borderBottom:
                            rowIdx < rows.length - 1
                              ? `1px solid rgba(0,0,0,0.08)`
                              : undefined,
                          padding: 0,
                        }}
                      >
                        <input
                          ref={(el) => {
                            if (el) cellRefs.current.set(cellKey(rowIdx, ci), el);
                            else cellRefs.current.delete(cellKey(rowIdx, ci));
                          }}
                          value={cell}
                          placeholder="—"
                          onChange={(e) => setCell(rowIdx, ci, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIdx, ci)}
                          onFocus={onFocus}
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            padding: "7px 12px",
                            fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                            fontSize: 14,
                            color: "var(--ink)",
                          }}
                        />
                      </td>
                    ))}
                    {isFocused && (
                      <td
                        style={{
                          padding: "4px 6px",
                          textAlign: "center",
                          width: 32,
                        }}
                      >
                        <button
                          type="button"
                          title="Delete row"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => deleteRow(rowIdx)}
                          style={{
                            width: 20,
                            height: 20,
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: 4,
                            background: "var(--paper)",
                            color: "var(--ink-soft)",
                            cursor: "pointer",
                            fontSize: 12,
                            lineHeight: 1,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isFocused && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={addRow}
              style={{
                padding: "4px 14px",
                border: `1.5px solid var(--ink)`,
                borderRadius: 7,
                background: "var(--paper)",
                color: "var(--ink-soft)",
                fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              + Add row
            </button>
          </div>
        )}
      </div>
    );
  },
);

// ── DividerBlock ──────────────────────────────────────────────────────────────

interface DividerBlockProps {
  isFocused: boolean;
  onFocus: () => void;
  onEnterCreate: () => void;
  onDeleteEmpty: () => void;
  onMoveFocus: (dir: -1 | 1) => void;
}

const DividerBlock = forwardRef<HTMLDivElement, DividerBlockProps>(
  function DividerBlock(
    { isFocused, onFocus, onEnterCreate, onDeleteEmpty, onMoveFocus },
    ref,
  ) {
    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (e.key === "Enter") { e.preventDefault(); onEnterCreate(); }
      if (e.key === "Backspace") { e.preventDefault(); onDeleteEmpty(); }
      if (e.key === "ArrowUp") { e.preventDefault(); onMoveFocus(-1); }
      if (e.key === "ArrowDown") { e.preventDefault(); onMoveFocus(1); }
    }

    return (
      <div
        ref={ref}
        tabIndex={0}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        style={{
          padding: "10px 0",
          outline: "none",
          borderRadius: 4,
          boxShadow: isFocused ? "0 0 0 2px var(--algo-deep)" : undefined,
          cursor: "default",
        }}
      >
        <hr
          style={{
            height: 2.5,
            background: "var(--ink)",
            border: 0,
            borderRadius: 2,
            opacity: 0.25,
            margin: 0,
          }}
        />
      </div>
    );
  },
);

// ── EditorBlock ───────────────────────────────────────────────────────────────

export const EditorBlock = forwardRef<EditorBlockHandle, EditorBlockProps>(
  function EditorBlock(props, ref) {
    const {
      block,
      numberedIndex,
      isFocused,
      onChangeText,
      onChangeLang,
      onEnterCreate,
      onDeleteEmpty,
      onMoveFocus,
      onFocus,
      onSlashTrigger,
      onTypeHandleClick,
      onConvertFromShortcut,
    } = props;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLButtonElement>(null);
    const dividerFocusRef = useRef<HTMLDivElement>(null);
    const tableEditorRef = useRef<TableEditorHandle | null>(null);

    useImperativeHandle(ref, () => ({
      focus: (caret = "end") => {
        if (block.type === "divider") { dividerFocusRef.current?.focus(); return; }
        if (block.type === "table")   { tableEditorRef.current?.focusFirst(); return; }
        const t = textareaRef.current;
        if (!t) return;
        t.focus();
        const pos = caret === "start" ? 0 : t.value.length;
        try { t.setSelectionRange(pos, pos); } catch { /* noop */ }
      },
      getRect: () => wrapperRef.current?.getBoundingClientRect() ?? null,
    }));

    // Auto-resize textarea (no-op for divider/table since textareaRef is null)
    useLayoutEffect(() => {
      const t = textareaRef.current;
      if (!t) return;
      t.style.height = "0px";
      t.style.height = `${t.scrollHeight}px`;
    }, [block.text, block.type]);

    useEffect(() => {
      if (!isFocused) return;
    }, [isFocused]);

    const isCode = block.type === "code";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const t = e.currentTarget;

      if (isCode && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onEnterCreate();
        return;
      }

      if (!isCode && e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onEnterCreate();
        return;
      }

      if (e.key === "Backspace" && t.value === "" && t.selectionStart === 0) {
        e.preventDefault();
        onDeleteEmpty();
        return;
      }

      if (e.key === "ArrowUp") {
        const upToCaret = t.value.slice(0, t.selectionStart);
        if (!upToCaret.includes("\n")) {
          e.preventDefault();
          onMoveFocus(-1);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        const fromCaret = t.value.slice(t.selectionEnd);
        if (!fromCaret.includes("\n")) {
          e.preventDefault();
          onMoveFocus(1);
        }
        return;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (
        block.type === "paragraph" &&
        value === "/" &&
        block.text === "" &&
        wrapperRef.current
      ) {
        const rect = wrapperRef.current.getBoundingClientRect();
        onChangeText(value);
        onSlashTrigger(rect);
        return;
      }

      if (block.type === "paragraph" && onConvertFromShortcut) {
        const shortcuts: { match: RegExp; type: BlockType }[] = [
          { match: /^# (.*)$/,       type: "h1" },
          { match: /^## (.*)$/,      type: "h2" },
          { match: /^### (.*)$/,     type: "h3" },
          { match: /^- (.*)$/,       type: "bullet" },
          { match: /^\* (.*)$/,      type: "bullet" },
          { match: /^1\. (.*)$/,     type: "numbered" },
          { match: /^> (.*)$/,       type: "quote" },
        ];
        for (const sc of shortcuts) {
          const m = value.match(sc.match);
          if (m) {
            onConvertFromShortcut(sc.type, m[1]);
            return;
          }
        }
      }

      onChangeText(value);
    };

    const showHandle = isFocused;
    const prefix = renderPrefix(block, numberedIndex);

    return (
      <div
        ref={wrapperRef}
        className="sbe-block"
        data-block-type={block.type}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "32px 1fr",
          alignItems: "start",
          gap: 4,
          padding: "2px 0",
        }}
      >
        {/* Type handle (left gutter) */}
        <button
          ref={handleRef}
          type="button"
          aria-label="Change block type"
          onClick={() => {
            const rect =
              handleRef.current?.getBoundingClientRect() ??
              wrapperRef.current?.getBoundingClientRect();
            if (rect) onTypeHandleClick(rect);
          }}
          style={{
            opacity: showHandle ? 0.7 : 0,
            transition: "opacity 0.15s ease",
            width: 24,
            height: 24,
            marginTop: marginTopForType(block.type),
            display: "grid",
            placeItems: "center",
            border: "1.5px solid var(--ink)",
            borderRadius: 6,
            background: "var(--paper)",
            color: "var(--ink-soft)",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            justifySelf: "center",
          }}
          tabIndex={-1}
        >
          ⋮⋮
        </button>

        {/* Block content */}
        <div style={{ minWidth: 0 }}>
          {block.type === "divider" ? (
            <DividerBlock
              ref={dividerFocusRef}
              isFocused={isFocused}
              onFocus={onFocus}
              onEnterCreate={onEnterCreate}
              onDeleteEmpty={onDeleteEmpty}
              onMoveFocus={onMoveFocus}
            />
          ) : block.type === "table" ? (
            <TableBlockEditor
              ref={tableEditorRef}
              text={block.text}
              isFocused={isFocused}
              onChangeText={onChangeText}
              onMoveFocus={onMoveFocus}
              onDeleteEmpty={onDeleteEmpty}
              onFocus={onFocus}
            />
          ) : isCode ? (
            <CodeBlock
              text={block.text}
              lang={block.lang ?? ""}
              textareaRef={textareaRef}
              onChange={handleChange}
              onChangeLang={onChangeLang}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              {prefix && (
                <div
                  style={{
                    flexShrink: 0,
                    marginTop: prefixMarginTop(block.type),
                    fontFamily: prefixFontFamily(block.type),
                    fontSize: prefixFontSize(block.type),
                    fontWeight: 700,
                    color: "var(--ink-soft)",
                    minWidth: prefixMinWidth(block.type),
                    userSelect: "none",
                  }}
                >
                  {prefix}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={block.text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={onFocus}
                rows={1}
                spellCheck
                placeholder={placeholderForType(block.type, isFocused)}
                style={{
                  flex: 1,
                  width: "100%",
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: paddingForType(block.type),
                  borderRadius: borderRadiusForType(block.type),
                  fontFamily: fontFamilyForType(block.type),
                  fontSize: fontSizeForType(block.type),
                  fontWeight: fontWeightForType(block.type),
                  fontStyle: block.type === "quote" ? "italic" : "normal",
                  letterSpacing: letterSpacingForType(block.type),
                  lineHeight: lineHeightForType(block.type),
                  color: "var(--ink)",
                  ...extraStyleForType(block.type),
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

function CodeBlock({
  text,
  lang,
  textareaRef,
  onChange,
  onChangeLang,
  onKeyDown,
  onFocus,
}: {
  text: string;
  lang: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeLang: (lang: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
}) {
  return (
    <div
      style={{
        border: "2.5px solid var(--ink)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#1a1612",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        <input
          value={lang}
          onChange={(e) => onChangeLang(e.target.value)}
          placeholder="language (java, python…)"
          spellCheck={false}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#9be8f5",
            fontFamily: "var(--font-jetbrains, monospace)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "lowercase",
            width: 200,
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff6b9d", "#fcc419", "#66d9a6"].map((c) => (
            <span
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                border: "1.5px solid rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        spellCheck={false}
        placeholder="// type your code…"
        rows={1}
        style={{
          width: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          padding: "14px 16px",
          color: "#f5f1e9",
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: 13.5,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function renderPrefix(block: Block, numberedIndex?: number): string | null {
  if (block.type === "bullet") return "•";
  if (block.type === "numbered") return `${numberedIndex ?? 1}.`;
  if (block.type === "quote") return "❝";
  return null;
}

function prefixFontFamily(type: BlockType): string {
  if (type === "numbered") return "var(--font-jetbrains, monospace)";
  return "var(--font-bricolage, serif)";
}
function prefixFontSize(type: BlockType): number {
  if (type === "numbered") return 15;
  if (type === "quote") return 22;
  return 18;
}
function prefixMinWidth(type: BlockType): number {
  if (type === "numbered") return 24;
  return 18;
}
function prefixMarginTop(type: BlockType): number {
  if (type === "numbered") return 9;
  if (type === "quote") return 4;
  return 6;
}

function marginTopForType(type: BlockType): number {
  switch (type) {
    case "h1": return 14;
    case "h2": return 10;
    case "h3": return 8;
    case "code": return 12;
    case "highlight": return 10;
    case "table": return 10;
    case "divider": return 16;
    default: return 6;
  }
}

function paddingForType(type: BlockType): string {
  if (type === "highlight") return "12px 16px";
  if (type === "quote") return "4px 0 4px 4px";
  return "4px 0";
}

function borderRadiusForType(type: BlockType): number {
  if (type === "highlight") return 12;
  return 0;
}

function fontFamilyForType(type: BlockType): string {
  if (type === "h1" || type === "h2" || type === "h3" || type === "quote") {
    return "var(--font-bricolage, 'Bricolage Grotesque'), serif";
  }
  return "var(--font-dm-sans, 'DM Sans'), sans-serif";
}

function fontSizeForType(type: BlockType): number {
  switch (type) {
    case "h1": return 34;
    case "h2": return 26;
    case "h3": return 21;
    case "quote": return 18;
    case "highlight": return 15.5;
    default: return 16;
  }
}

function fontWeightForType(type: BlockType): number {
  if (type === "h1" || type === "h2" || type === "h3") return 700;
  if (type === "highlight") return 600;
  return 500;
}

function letterSpacingForType(type: BlockType): string {
  if (type === "h1" || type === "h2" || type === "h3") return "-0.025em";
  return "normal";
}

function lineHeightForType(type: BlockType): number {
  if (type === "h1") return 1.1;
  if (type === "h2" || type === "h3") return 1.18;
  return 1.55;
}

function extraStyleForType(type: BlockType): React.CSSProperties {
  if (type === "highlight") {
    return {
      background: "var(--ds-yellow)",
      border: "2.5px solid var(--ink)",
      boxShadow: "3px 3px 0 var(--ink)",
    };
  }
  if (type === "quote") {
    return {
      borderLeft: "3px solid var(--algo-deep)",
      paddingLeft: 14,
      color: "var(--ink-soft)",
    };
  }
  return {};
}

function placeholderForType(type: BlockType, focused: boolean): string {
  if (!focused) return "";
  switch (type) {
    case "h1": return "Heading 1";
    case "h2": return "Heading 2";
    case "h3": return "Heading 3";
    case "bullet": return "List item";
    case "numbered": return "List item";
    case "quote": return "Quote";
    case "highlight": return "Highlighted note";
    case "code": return "Code";
    default: return "Type '/' for commands…";
  }
}
