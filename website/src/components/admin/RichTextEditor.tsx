"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-[#1f1c13] border-2 border-[#AEACA1]/30 flex items-center justify-center rounded">
      <span className="text-[#AEACA1]">Loading editor...</span>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "250px" }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "indent",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <style>{`
        /* Wrapper styling */
        .rich-text-editor-wrapper {
          border-radius: 4px;
          overflow: hidden;
        }
        
        /* Toolbar styling */
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          background: #353535;
          border: 2px solid #CCAA4C;
          border-bottom: 1px solid #CCAA4C;
          padding: 12px;
          border-radius: 4px 4px 0 0;
        }
        
        /* Toolbar buttons */
        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #AEACA1;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #AEACA1;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker {
          color: #AEACA1;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label {
          color: #AEACA1;
          border-color: transparent;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover {
          color: #CCAA4C;
        }
        
        /* Active/hover states */
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: #CCAA4C;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-fill {
          fill: #CCAA4C;
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          background: rgba(204, 170, 76, 0.2);
          border-radius: 4px;
        }
        
        /* Dropdown menus */
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-options {
          background: #353535;
          border: 1px solid #CCAA4C;
          border-radius: 4px;
          padding: 8px;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item {
          color: #AEACA1;
          padding: 4px 8px;
          border-radius: 2px;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item:hover {
          color: #CCAA4C;
          background: rgba(204, 170, 76, 0.1);
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-item.ql-selected {
          color: #CCAA4C;
        }
        
        /* Header dropdown specific */
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          content: 'Normal';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
          content: 'Heading 1';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
          content: 'Heading 2';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
          content: 'Heading 3';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
          content: 'Heading 4';
        }
        
        /* Size dropdown */
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: 'Normal';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
          content: 'Small';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
          content: 'Large';
        }
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
        .rich-text-editor-wrapper .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
          content: 'Huge';
        }
        
        /* Editor container */
        .rich-text-editor-wrapper .ql-container.ql-snow {
          background: #1f1c13;
          border: 2px solid #CCAA4C;
          border-top: none;
          min-height: ${minHeight};
          font-family: inherit;
          border-radius: 0 0 4px 4px;
        }
        
        /* Editor content area */
        .rich-text-editor-wrapper .ql-editor {
          color: #E3E2D5;
          font-size: 15px;
          line-height: 1.8;
          padding: 16px;
          min-height: ${minHeight};
        }
        
        /* Placeholder */
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(174, 172, 161, 0.5);
          font-style: normal;
          left: 16px;
          right: 16px;
        }
        
        /* Content styling */
        .rich-text-editor-wrapper .ql-editor h1 {
          color: #CCAA4C;
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }
        .rich-text-editor-wrapper .ql-editor h2 {
          color: #CCAA4C;
          font-size: 1.5em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }
        .rich-text-editor-wrapper .ql-editor h3 {
          color: #CCAA4C;
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }
        .rich-text-editor-wrapper .ql-editor h4 {
          color: #CCAA4C;
          font-size: 1.1em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }
        .rich-text-editor-wrapper .ql-editor p {
          margin-bottom: 1em;
        }
        .rich-text-editor-wrapper .ql-editor a {
          color: #CCAA4C;
          text-decoration: underline;
        }
        .rich-text-editor-wrapper .ql-editor a:hover {
          color: #E3E2D5;
        }
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #CCAA4C;
          padding-left: 16px;
          margin: 1em 0;
          color: #AEACA1;
          font-style: italic;
        }
        .rich-text-editor-wrapper .ql-editor pre.ql-syntax {
          background: #353535;
          color: #E3E2D5;
          border-radius: 4px;
          padding: 12px;
          overflow-x: auto;
          font-family: monospace;
        }
        .rich-text-editor-wrapper .ql-editor ul,
        .rich-text-editor-wrapper .ql-editor ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .rich-text-editor-wrapper .ql-editor li {
          margin-bottom: 0.5em;
        }
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          border-radius: 4px;
        }
        
        /* Tooltip styling */
        .rich-text-editor-wrapper .ql-tooltip {
          background: #353535;
          border: 1px solid #CCAA4C;
          color: #E3E2D5;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .rich-text-editor-wrapper .ql-tooltip input[type="text"] {
          background: #1f1c13;
          border: 1px solid #CCAA4C;
          color: #E3E2D5;
          border-radius: 4px;
          padding: 4px 8px;
        }
        .rich-text-editor-wrapper .ql-tooltip a.ql-action,
        .rich-text-editor-wrapper .ql-tooltip a.ql-remove {
          color: #CCAA4C;
        }
        .rich-text-editor-wrapper .ql-tooltip a.ql-action:hover,
        .rich-text-editor-wrapper .ql-tooltip a.ql-remove:hover {
          color: #E3E2D5;
        }
        
        /* Scrollbar styling */
        .rich-text-editor-wrapper .ql-editor::-webkit-scrollbar {
          width: 8px;
        }
        .rich-text-editor-wrapper .ql-editor::-webkit-scrollbar-track {
          background: #1f1c13;
        }
        .rich-text-editor-wrapper .ql-editor::-webkit-scrollbar-thumb {
          background: #CCAA4C;
          border-radius: 4px;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing your content..."}
      />
    </div>
  );
}
