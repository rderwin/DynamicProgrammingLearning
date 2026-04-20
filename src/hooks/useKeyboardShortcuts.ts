import { useEffect } from "react";

export interface Shortcut {
  /** Key combo description e.g. "?", "g h", "ArrowLeft". */
  keys: string;
  description: string;
  /** Called when the combo fires. */
  handler: () => void;
  /** If true, also fire when a form input is focused. Default false. */
  allowInInput?: boolean;
}

/**
 * Global keyboard shortcut hook. Supports single-key ("?"), modifier-keyed
 * ("shift+/"), and two-key sequences ("g h"). Swallows the key event to
 * prevent default browser behavior when a shortcut fires.
 *
 * Shortcuts are skipped when focus is inside a text input, textarea, or
 * contentEditable element, unless `allowInInput: true`.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // For two-key sequences like "g h", remember the first key and wait
    // up to 1200ms for the second.
    let pending: string | null = null;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    function clearPending() {
      pending = null;
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
    }

    function isEditingContext(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      const inputFocused = isEditingContext(e.target);

      // Build the current key combo string: lowercase, with prefixes.
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("mod");
      if (e.shiftKey && e.key.length > 1) parts.push("shift"); // only add shift for non-printable
      parts.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      const combo = parts.join("+");

      // Handle sequence (e.g. "g h"): if a pending first-key exists, try to
      // match the combined "g h" first.
      if (pending) {
        const sequence = `${pending} ${combo}`;
        const match = shortcuts.find((s) => s.keys === sequence);
        clearPending();
        if (match && (!inputFocused || match.allowInInput)) {
          e.preventDefault();
          match.handler();
          return;
        }
      }

      // Single-key match.
      const direct = shortcuts.find((s) => s.keys === combo);
      if (direct && (!inputFocused || direct.allowInInput)) {
        e.preventDefault();
        direct.handler();
        return;
      }

      // Start a new sequence if any registered shortcut starts with this combo.
      const startsSequence = shortcuts.some((s) => s.keys.startsWith(`${combo} `));
      if (startsSequence && !inputFocused) {
        pending = combo;
        pendingTimer = setTimeout(clearPending, 1200);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearPending();
    };
  }, [shortcuts, enabled]);
}
