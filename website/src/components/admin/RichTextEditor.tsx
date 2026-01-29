"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-[#1f1c13] border-2 border-[#AEACA1]/30 flex items-center justify-center">
      <span className="text-[#AEACA1]">Loading editor...</span>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  }), []);

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          background: #252219;
          border: 2px solid rgba(174, 172, 161, 0.3);
          border-bottom: none;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #AEACA1;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #AEACA1;
        }
        .rich-text-editor .ql-toolbar .ql-picker {
          color: #AEACA1;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #CCAA4C;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #CCAA4C;
        }
        .rich-text-editor .ql-container {
          background: #1f1c13;
          border: 2px solid rgba(174, 172, 161, 0.3);
          min-height: 250px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          color: #E3E2D5;
          font-size: 14px;
          line-height: 1.7;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgba(174, 172, 161, 0.5);
          font-style: normal;
        }
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          color: #CCAA4C;
        }
        .rich-text-editor .ql-editor a {
          color: #CCAA4C;
        }
        .rich-text-editor .ql-editor blockquote {
          border-left-color: #CCAA4C;
          color: #AEACA1;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
