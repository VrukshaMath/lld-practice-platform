import React from 'react';

interface TextareaFieldProps {
  id: string;
  label: string;
  explanation: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  explanation,
  placeholder,
  value,
  onChange,
  error,
  required = true,
  rows = 5,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-ink">
          {label}
          {required && <span className="text-ink-tertiary ml-1 font-normal">*</span>}
        </label>
        <span className="text-[11px] text-ink-tertiary font-mono">
          {value.length} chars
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed">{explanation}</p>

      <div className="relative mt-1.5">
        <textarea
          id={id}
          name={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-md bg-surface border px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-faint font-mono leading-relaxed transition focus:outline-none ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
              : 'border-edge focus:border-ink focus:ring-1 focus:ring-ink/10'
          }`}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-tag-roseText mt-1">
          {error}
        </p>
      )}
    </div>
  );
};