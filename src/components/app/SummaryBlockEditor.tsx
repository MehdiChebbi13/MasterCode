"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type Block,
  type BlockType,
  DEFAULT_TABLE_TEXT,
  emptyBlocks,
  makeBlock,
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
} from "@/lib/summaryBlocks";
import {
  useCreateSummary,
  useSummaries,
  useUpdateSummary,
} from "@/hooks";
import { useFormatSummary } from "@/hooks/useFormatSummary";
import {
  ServiceError,
  type Summary,
  type SummaryInput,
} from "@/types";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { EditorBlock, type EditorBlockHandle } from "./EditorBlock";

interface SummaryBlockEditorProps {
  courseId: string;
  /** When provided, edit mode. */
  summary?: Summary;
  courseName?: string;
}

export function SummaryBlockEditor({
  courseId,
  summary,
  courseName = "Course",
}: SummaryBlockEditorProps) {
  const isEdit = Boolean(summary);
  const router = useRouter();

  const createMutation = useCreateSummary();
  const updateMutation = useUpdateSummary();
  const formatMutation = useFormatSummary();
  const pending = createMutation.isPending || updateMutation.isPending;

  const { data: existingSummaries } = useSummaries(courseId);

  const [title, setTitle] = useState(summary?.title ?? "");
  const [chapter, setChapter] = useState<string>(
    summary ? String(summary.chapter) : "",
  );
  const [blocks, setBlocks] = useState<Block[]>(() =>
    summary ? parseMarkdownToBlocks(summary.contentMarkdown) : emptyBlocks(),
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  // Auto-default chapter for new summaries once we know existing chapters.
  useEffect(() => {
    if (isEdit) return;
    if (chapter !== "") return;
    if (!existingSummaries) return;
    const max = existingSummaries.reduce((m, s) => Math.max(m, s.chapter), 0);
    setChapter(String(max + 1));
  }, [isEdit, chapter, existingSummaries]);

  // Slash menu (typed '/' in an empty paragraph).
  const [slashState, setSlashState] = useState<{
    blockId: string;
    position: { top: number; left: number };
    query: string;
  } | null>(null);

  // Per-block type-handle menu.
  const [handleMenuState, setHandleMenuState] = useState<{
    blockId: string;
    position: { top: number; left: number };
  } | null>(null);

  // Refs to each EditorBlock instance for focus management.
  const blockRefs = useRef<Map<string, EditorBlockHandle>>(new Map());
  const setBlockRef = (id: string) => (handle: EditorBlockHandle | null) => {
    if (handle) blockRefs.current.set(id, handle);
    else blockRefs.current.delete(id);
  };

  // Apply pending focus after a render that inserts/changes blocks.
  useEffect(() => {
    if (!pendingFocusId) return;
    const handle = blockRefs.current.get(pendingFocusId);
    if (handle) {
      handle.focus("end");
      setFocusedId(pendingFocusId);
      setPendingFocusId(null);
    }
  }, [pendingFocusId, blocks]);

  // Cmd/Ctrl+S to save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, chapter, blocks]);

  // Compute numbered-list indices per run (1, 2, 3, then reset).
  const numberedIndices = useMemo(() => {
    const out: Record<string, number> = {};
    let run = 0;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "numbered") {
        const prev = blocks[i - 1];
        if (!prev || prev.type !== "numbered") run = 0;
        run += 1;
        out[b.id] = run;
      }
    }
    return out;
  }, [blocks]);

  // ── Block ops ──────────────────────────────────────────────────────────────
  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function insertBlockAfter(id: string, type: BlockType = "paragraph"): string {
    const newBlock = makeBlock(type, "");
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return [...prev, newBlock];
      return [...prev.slice(0, idx + 1), newBlock, ...prev.slice(idx + 1)];
    });
    return newBlock.id;
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      // Never allow zero blocks — keep a single empty paragraph.
      if (prev.length === 1) return [makeBlock("paragraph", "")];
      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      const focusTarget = prev[idx - 1] ?? prev[idx + 1];
      if (focusTarget) setPendingFocusId(focusTarget.id);
      return next;
    });
  }

  function moveFocus(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const target = blocks[idx + dir];
    if (target) {
      const handle = blockRefs.current.get(target.id);
      handle?.focus(dir < 0 ? "end" : "start");
      setFocusedId(target.id);
    }
  }

  function changeBlockType(id: string, type: BlockType, replaceText?: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const next: Block = { ...b, type };
        if (replaceText !== undefined) next.text = replaceText;
        if (type === "code" && next.lang === undefined) next.lang = "";
        if (type === "table") next.text = DEFAULT_TABLE_TEXT;
        if (type === "divider") next.text = "";
        return next;
      }),
    );
    setPendingFocusId(id);
  }

  // ── Slash menu wiring ──────────────────────────────────────────────────────
  // Whenever the active slash block's text changes, recompute the query or close.
  useEffect(() => {
    if (!slashState) return;
    const b = blocks.find((x) => x.id === slashState.blockId);
    if (!b || b.type !== "paragraph") {
      setSlashState(null);
      return;
    }
    if (!b.text.startsWith("/")) {
      setSlashState(null);
      return;
    }
    const query = b.text.slice(1);
    if (query !== slashState.query) {
      setSlashState({ ...slashState, query });
    }
  }, [blocks, slashState]);

  function handleSlashSelect(type: BlockType) {
    if (!slashState) return;
    changeBlockType(slashState.blockId, type, "");
    setSlashState(null);
  }

  function handleHandleSelect(type: BlockType) {
    if (!handleMenuState) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== handleMenuState.blockId) return b;
        const next: Block = { ...b, type };
        if (type === "code" && next.lang === undefined) next.lang = "";
        if (type === "table") next.text = DEFAULT_TABLE_TEXT;
        if (type === "divider") next.text = "";
        return next;
      }),
    );
    setPendingFocusId(handleMenuState.blockId);
    setHandleMenuState(null);
  }

  // ── AI format ──────────────────────────────────────────────────────────────
  async function handleAIFormat() {
    if (formatMutation.isPending || pending) return;
    if (!blocks.length) return;
    try {
      const next = await formatMutation.mutateAsync(blocks);
      if (!next.length) {
        toast.error("AI returned no blocks");
        return;
      }
      setBlocks(next);
      setFocusedId(null);
      toast.success("Formatted with AI ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI format failed");
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    const t = title.trim();
    if (!t) {
      toast.error("Title is required");
      return;
    }
    const ch = Number(chapter);
    if (!Number.isFinite(ch) || ch < 0) {
      toast.error("Chapter must be a non-negative number");
      return;
    }
    const contentMarkdown = serializeBlocksToMarkdown(blocks);
    try {
      if (isEdit && summary) {
        const patch: Partial<SummaryInput> = { chapter: ch, title: t, contentMarkdown };
        await updateMutation.mutateAsync({ id: summary.id, patch });
        toast.success("Summary updated");
        router.replace(`/courses/${courseId}?tab=summaries&read=${summary.id}`);
      } else {
        const input: SummaryInput = { courseId, chapter: ch, title: t, contentMarkdown };
        const created = await createMutation.mutateAsync(input);
        toast.success(`"${t}" added`);
        router.replace(`/courses/${courseId}?tab=summaries&read=${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof ServiceError ? err.message : "Failed to save summary.");
    }
  }

  function handleCancel() {
    const dirty = isEdit
      ? summary &&
        (title !== summary.title ||
          Number(chapter) !== summary.chapter ||
          serializeBlocksToMarkdown(blocks).trim() !== summary.contentMarkdown.trim())
      : title.trim() ||
        blocks.some((b) => b.type === "divider" || b.text.trim() !== "");
    if (dirty && !confirm("Discard your changes?")) return;
    router.push(`/courses/${courseId}`);
  }

  return (
    <>
      <style>{`
        .sbe-page {
          max-width: 880px;
          margin: 0 auto;
          padding: 36px 40px 120px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          color: var(--ink);
        }
        .sbe-topbar {
          position: sticky; top: 0; z-index: 10;
          margin: -36px -40px 24px;
          padding: 14px 40px;
          background: rgba(247, 240, 224, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 2.5px solid var(--ink);
          display: flex; align-items: center; gap: 14px;
          justify-content: space-between;
        }
        .sbe-back {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--paper); color: var(--ink-soft);
          font-weight: 600; font-size: 13px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .sbe-back:hover { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 var(--ink); }
        .sbe-crumb {
          font-family: var(--font-jetbrains, monospace);
          font-size: 11.5px; color: var(--ink-soft);
          letter-spacing: 0.04em;
        }
        .sbe-crumb .here { color: var(--ink); font-weight: 700; }
        .sbe-actions { display: inline-flex; align-items: center; gap: 10px; }
        .sbe-save-btn {
          padding: 9px 22px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--ink); color: var(--paper);
          font-weight: 700; font-size: 14px; cursor: pointer;
          box-shadow: var(--shadow);
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sbe-save-btn:hover:not(:disabled) {
          transform: translate(-2px,-2px);
          box-shadow: 7px 7px 0 var(--ink);
          background: var(--algo-deep);
        }
        .sbe-save-btn:disabled { opacity: 0.6; cursor: wait; }
        .sbe-cancel-btn {
          padding: 9px 18px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--paper); color: var(--ink-soft);
          font-weight: 600; font-size: 13px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .sbe-cancel-btn:hover { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 var(--ink); }
        .sbe-ai-btn {
          padding: 9px 16px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--algo-light); color: var(--ink);
          font-weight: 700; font-size: 13px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sbe-ai-btn:hover:not(:disabled) {
          transform: translate(-2px,-2px);
          box-shadow: 5px 5px 0 var(--ink);
          background: var(--algo);
        }
        .sbe-ai-btn:disabled { opacity: 0.6; cursor: wait; }
        .sbe-meta {
          display: flex; gap: 18px; align-items: flex-end; flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .sbe-chapter-wrap {
          display: flex; flex-direction: column; gap: 6px;
        }
        .sbe-chapter-label {
          font-family: var(--font-jetbrains, monospace);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ink-soft);
        }
        .sbe-chapter-input {
          width: 76px; padding: 8px 12px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          font-family: var(--font-jetbrains, monospace);
          font-size: 14px; font-weight: 700;
          background: var(--paper); color: var(--ink);
          outline: none;
          box-shadow: 2px 2px 0 transparent;
          transition: box-shadow 0.15s ease;
        }
        .sbe-chapter-input:focus { box-shadow: 3px 3px 0 var(--ink); }
        .sbe-title-wrap { flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 6px; }
        .sbe-title-input {
          width: 100%;
          background: transparent; border: none; outline: none;
          padding: 0;
          font-family: var(--font-bricolage, 'Bricolage Grotesque'), serif;
          font-weight: 700; font-size: 44px; line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--ink);
        }
        .sbe-title-input::placeholder { color: var(--ink-faint); }
        .sbe-divider {
          height: 2.5px; background: var(--ink); border: 0;
          margin: 0 0 18px;
          opacity: 0.18;
        }
        .sbe-blocks { display: flex; flex-direction: column; gap: 4px; }
        .sbe-hint {
          margin-top: 16px; padding: 10px 14px;
          border: 2px dashed var(--ink-faint); border-radius: 10px;
          font-size: 12px; color: var(--ink-soft);
          background: var(--cream-deep);
        }
        .sbe-hint kbd {
          font-family: var(--font-jetbrains, monospace);
          font-size: 10.5px; font-weight: 700;
          background: var(--paper); border: 1.5px solid var(--ink);
          padding: 1px 6px; border-radius: 5px; margin: 0 3px;
          color: var(--ink);
        }
      `}</style>

      <div className="sbe-page">
        <div className="sbe-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button type="button" className="sbe-back" onClick={handleCancel}>
              ← Back
            </button>
            <div className="sbe-crumb">
              {courseName} <span style={{ margin: "0 6px" }}>›</span>
              <span className="here">{isEdit ? "Edit summary" : "New summary"}</span>
            </div>
          </div>
          <div className="sbe-actions">
            <button
              type="button"
              className="sbe-ai-btn"
              onClick={handleAIFormat}
              disabled={formatMutation.isPending || pending}
              title="Reformat the page with AI"
            >
              {formatMutation.isPending ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                  Formatting…
                </>
              ) : (
                <>✨ AI Format</>
              )}
            </button>
            <button
              type="button"
              className="sbe-cancel-btn"
              onClick={handleCancel}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="sbe-save-btn"
              onClick={handleSave}
              disabled={pending || !title.trim()}
            >
              {pending ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                  Saving…
                </>
              ) : isEdit ? (
                <>✓ Save changes</>
              ) : (
                <>✦ Publish summary</>
              )}
            </button>
          </div>
        </div>

        <div className="sbe-meta">
          <div className="sbe-chapter-wrap">
            <label htmlFor="sbe-chapter" className="sbe-chapter-label">Chapter</label>
            <input
              id="sbe-chapter"
              className="sbe-chapter-input"
              type="number"
              min={0}
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="sbe-title-wrap">
            <input
              className="sbe-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled summary"
              autoFocus={!isEdit}
            />
          </div>
        </div>

        <hr className="sbe-divider" />

        <div className="sbe-blocks">
          {blocks.map((block) => (
            <EditorBlock
              key={block.id}
              ref={setBlockRef(block.id)}
              block={block}
              numberedIndex={numberedIndices[block.id]}
              isFocused={focusedId === block.id}
              onChangeText={(text) => updateBlock(block.id, { text })}
              onChangeLang={(lang) => updateBlock(block.id, { lang })}
              onEnterCreate={() => {
                const newId = insertBlockAfter(block.id, "paragraph");
                setPendingFocusId(newId);
              }}
              onDeleteEmpty={() => deleteBlock(block.id)}
              onMoveFocus={(dir) => moveFocus(block.id, dir)}
              onFocus={() => setFocusedId(block.id)}
              onSlashTrigger={(rect) => {
                setSlashState({
                  blockId: block.id,
                  position: {
                    top: rect.bottom + 6,
                    left: Math.min(rect.left + 32, window.innerWidth - 280),
                  },
                  query: "",
                });
              }}
              onTypeHandleClick={(rect) => {
                setHandleMenuState({
                  blockId: block.id,
                  position: {
                    top: rect.bottom + 4,
                    left: Math.min(rect.right, window.innerWidth - 280),
                  },
                });
              }}
              onConvertFromShortcut={(type, restText) => {
                changeBlockType(block.id, type, restText);
              }}
            />
          ))}
        </div>

        <div className="sbe-hint">
          Press <kbd>/</kbd> to open the block menu · <kbd>Enter</kbd> for a new block ·
          <kbd>⌘</kbd>+<kbd>S</kbd> to save · click the <kbd>⋮⋮</kbd> handle to change a block&apos;s type
        </div>
      </div>

      <BlockTypeMenu
        open={Boolean(slashState)}
        position={slashState?.position ?? { top: 0, left: 0 }}
        query={slashState?.query ?? ""}
        currentType={
          slashState
            ? blocks.find((b) => b.id === slashState.blockId)?.type
            : undefined
        }
        onSelect={handleSlashSelect}
        onClose={() => setSlashState(null)}
      />

      <BlockTypeMenu
        open={Boolean(handleMenuState)}
        position={handleMenuState?.position ?? { top: 0, left: 0 }}
        currentType={
          handleMenuState
            ? blocks.find((b) => b.id === handleMenuState.blockId)?.type
            : undefined
        }
        onSelect={handleHandleSelect}
        onClose={() => setHandleMenuState(null)}
      />
    </>
  );
}
