import { useEffect } from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

export default function TiptapEditor({ value, onChange }) {
  return (
    <div className="tiptap-editor-container">
      <SimpleEditor
        content={value}
        onUpdate={({ editor }) => onChange(editor.getHTML())}
      />
    </div>
  );
} 