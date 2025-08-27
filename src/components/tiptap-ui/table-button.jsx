"use client"

import * as React from "react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

export function TableButton() {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }

  return (
    <Button
      data-style="ghost"
      onClick={insertTable}
      title="Insert Table"
    >
      <svg
        className="tiptap-button-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M21 9H3" />
        <path d="M21 15H3" />
        <path d="M12 3v18" />
      </svg>
    </Button>
  )
}