import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-black uppercase tracking-widest text-[#AEACA1]">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 px-4 py-3 text-white font-medium focus:border-[#CCAA4C] focus:ring-0 focus:outline-none placeholder:text-[#AEACA1]/50 ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 px-4 py-3 text-white font-medium focus:border-[#CCAA4C] focus:ring-0 focus:outline-none placeholder:text-[#AEACA1]/50 resize-none ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 px-4 py-3 text-white font-medium focus:border-[#CCAA4C] focus:ring-0 focus:outline-none ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, placeholder = "Enter image URL or upload" }: ImageUploadProps) {
  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <div className="relative w-full h-48 bg-[#1f1c13] border-2 border-[#AEACA1]/30 overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <p className="text-[10px] text-[#AEACA1]">
        Tip: Upload images to Supabase Storage and paste the URL here
      </p>
    </div>
  );
}
