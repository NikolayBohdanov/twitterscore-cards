"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  style?: CSSProperties;
  tag?: "span" | "div";
}

export default function EditableText({ value, onChange, style = {}, tag: Tag = "span" }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim());
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        style={{
          ...style,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(5,68,253,0.5)",
          borderRadius: 4,
          outline: "none",
          padding: "1px 4px",
          margin: "-2px -5px",
          width: "calc(100% + 10px)",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
    );
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        ...style,
        cursor: "text",
        borderBottom: "1px dashed rgba(255,255,255,0.15)",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "rgba(5,68,253,0.5)")}
      onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
    >
      {value}
    </Tag>
  );
}
