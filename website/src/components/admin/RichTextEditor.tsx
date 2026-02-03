"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useCallback, useEffect } from "react";
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
  const quillRef = useRef<any>(null);

  // Handle paste to preserve line breaks
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        const container = editor.root;
        
        const handlePaste = (e: ClipboardEvent) => {
          // Check if there's plain text being pasted
          const plainText = e.clipboardData?.getData('text/plain');
          const htmlText = e.clipboardData?.getData('text/html');
          
          // If no HTML but has plain text with newlines, convert to HTML
          if (plainText && !htmlText && plainText.includes('\n')) {
            e.preventDefault();
            
            // Convert plain text with newlines to HTML paragraphs
            const html = plainText
              .split('\n')
              .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
              .join('');
            
            // Insert as HTML
            const selection = editor.getSelection();
            if (selection) {
              editor.clipboard.dangerouslyPasteHTML(selection.index, html);
            } else {
              editor.clipboard.dangerouslyPasteHTML(editor.getLength() - 1, html);
            }
          }
        };
        
        container.addEventListener('paste', handlePaste);
        return () => container.removeEventListener('paste', handlePaste);
      }
    }
  }, []);

  // Handle clear all formatting
  const handleClearAll = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor) {
        const text = editor.getText();
        // Convert to plain paragraphs with line breaks preserved
        const paragraphs = text.split('\n').filter((p: string) => p.trim()).map((p: string) => `<p>${p}</p>`).join('');
        onChange(paragraphs || '<p></p>');
      }
    }
  }, [onChange]);

  // Custom image handler
  const imageHandler = useCallback(() => {
    const url = prompt('Paste image URL (from Media Library - use "Copy URL"):');
    if (url && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', url);
      editor.setSelection(range.index + 1);
    }
  }, []);

  // Custom video handler
  const videoHandler = useCallback(() => {
    const url = prompt('Paste video URL (YouTube, Vimeo, or direct MP4 from Media Library):');
    if (url && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      
      // Convert YouTube/Vimeo URLs to embed format
      let embedUrl = url;
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      
      editor.insertEmbed(range.index, 'video', embedUrl);
      editor.setSelection(range.index + 1);
    }
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ["undo", "redo"], // Undo/Redo buttons
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
      handlers: {
        undo: function() {
          // @ts-ignore
          this.quill.history.undo();
        },
        redo: function() {
          // @ts-ignore
          this.quill.history.redo();
        },
        image: imageHandler,
        video: videoHandler,
      },
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true,
    },
    clipboard: {
      matchVisual: false,
    },
  }), [imageHandler, videoHandler]);

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
          line-height: 1.5;
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
          font-size: 1.75em;
          font-weight: 700;
          margin: 0.75em 0 0.35em 0;
          line-height: 1.2;
        }
        .rich-text-editor-wrapper .ql-editor h2 {
          color: #CCAA4C;
          font-size: 1.4em;
          font-weight: 700;
          margin: 0.65em 0 0.3em 0;
          line-height: 1.2;
        }
        .rich-text-editor-wrapper .ql-editor h3 {
          color: #CCAA4C;
          font-size: 1.2em;
          font-weight: 600;
          margin: 0.5em 0 0.25em 0;
          line-height: 1.3;
        }
        .rich-text-editor-wrapper .ql-editor h4 {
          color: #CCAA4C;
          font-size: 1.05em;
          font-weight: 600;
          margin: 0.4em 0 0.2em 0;
          line-height: 1.3;
        }
        .rich-text-editor-wrapper .ql-editor h1:first-child,
        .rich-text-editor-wrapper .ql-editor h2:first-child,
        .rich-text-editor-wrapper .ql-editor h3:first-child,
        .rich-text-editor-wrapper .ql-editor h4:first-child {
          margin-top: 0;
        }
        .rich-text-editor-wrapper .ql-editor p {
          margin-bottom: 0.5em;
          margin-top: 0;
        }
        .rich-text-editor-wrapper .ql-editor p:last-child {
          margin-bottom: 0;
        }
        .rich-text-editor-wrapper .ql-editor p + p {
          margin-top: 0.5em;
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
          padding-left: 12px;
          margin: 0.5em 0;
          color: #AEACA1;
          font-style: italic;
        }
        .rich-text-editor-wrapper .ql-editor pre.ql-syntax {
          background: #353535;
          color: #E3E2D5;
          border-radius: 4px;
          padding: 10px;
          overflow-x: auto;
          font-family: monospace;
          margin: 0.5em 0;
          font-size: 13px;
        }
        .rich-text-editor-wrapper .ql-editor ul,
        .rich-text-editor-wrapper .ql-editor ol {
          padding-left: 1.25em;
          margin: 0.4em 0;
        }
        .rich-text-editor-wrapper .ql-editor li {
          margin-bottom: 0.15em;
          padding-left: 0.25em;
        }
        .rich-text-editor-wrapper .ql-editor li:last-child {
          margin-bottom: 0;
        }
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 0.75em 0;
          display: block;
        }
        .rich-text-editor-wrapper .ql-editor iframe.ql-video,
        .rich-text-editor-wrapper .ql-editor .ql-video {
          display: block;
          width: 100% !important;
          min-height: 400px;
          aspect-ratio: 16/9;
          border-radius: 4px;
          margin: 0.75em 0;
          border: 2px solid #353535;
        }
        .rich-text-editor-wrapper .ql-editor video {
          display: block;
          width: 100%;
          max-width: 100%;
          border-radius: 4px;
          margin: 0.75em 0;
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
        
        /* Undo/Redo button styling */
        .rich-text-editor-wrapper .ql-toolbar .ql-undo,
        .rich-text-editor-wrapper .ql-toolbar .ql-redo {
          width: 28px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-undo::before {
          content: '↶';
          font-size: 18px;
          color: #AEACA1;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-redo::before {
          content: '↷';
          font-size: 18px;
          color: #AEACA1;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-undo:hover::before,
        .rich-text-editor-wrapper .ql-toolbar .ql-redo:hover::before {
          color: #CCAA4C;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing your content..."}
      />
      {/* Clear All Formatting Button */}
      <div className="flex justify-end mt-2 gap-2">
        <button
          type="button"
          onClick={handleClearAll}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-[#353535] text-[#AEACA1] hover:text-[#CCAA4C] border border-[#CCAA4C]/30 hover:border-[#CCAA4C] rounded transition-colors"
        >
          Clear All Formatting
        </button>
      </div>
    </div>
  );
}
