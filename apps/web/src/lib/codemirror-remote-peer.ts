import { RangeSetBuilder, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";

export type RemotePeerState = {
  headLine: number;
  headCol: number;
  label: string;
} | null;

export const setRemotePeer = StateEffect.define<RemotePeerState>();

class PeerLabelWidget extends WidgetType {
  constructor(private label: string) {
    super();
  }

  toDOM() {
    const node = document.createElement("span");
    node.className = "cm-remote-peer-label";
    node.textContent = this.label;
    return node;
  }

  ignoreEvent() {
    return true;
  }
}

export function remotePeerExtension() {
  const field = StateField.define<RemotePeerState>({
    create: () => null,
    update(value, tr) {
      for (const effect of tr.effects) {
        if (effect.is(setRemotePeer)) return effect.value;
      }
      return value;
    },
    provide: (f) =>
      EditorView.decorations.compute([f], (state) => {
        const peer = state.field(f);
        if (!peer) return Decoration.none;
        const lineNumber = Math.min(Math.max(peer.headLine + 1, 1), state.doc.lines);
        const line = state.doc.line(lineNumber);
        const pos = Math.min(Math.max(line.from + peer.headCol, line.from), line.to);
        const builder = new RangeSetBuilder<Decoration>();
        builder.add(
          pos,
          pos,
          Decoration.widget({
            widget: new PeerLabelWidget(peer.label),
            side: 1,
          }),
        );
        if (pos > line.from) {
          builder.add(
            pos - 1,
            pos,
            Decoration.mark({ class: "cm-remote-peer-caret" }),
          );
        }
        return builder.finish();
      }),
  });

  const theme = EditorView.baseTheme({
    ".cm-remote-peer-caret": {
      borderLeft: "2px solid var(--color-navy, #a9c5e3)",
      marginLeft: "-1px",
    },
    ".cm-remote-peer-label": {
      display: "inline-block",
      marginLeft: "2px",
      borderRadius: "2px",
      backgroundColor: "rgba(169, 197, 227, 0.22)",
      border: "1px solid rgba(169, 197, 227, 0.45)",
      color: "#f2eee5",
      fontSize: "10px",
      fontFamily: "var(--font-dm), ui-sans-serif, system-ui, sans-serif",
      lineHeight: "14px",
      padding: "0 4px",
      verticalAlign: "text-top",
      position: "relative",
      top: "-1.1em",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    },
  });

  return [field, theme];
}
