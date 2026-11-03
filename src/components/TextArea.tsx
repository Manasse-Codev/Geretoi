import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { CircleAlert } from 'lucide-react';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string;
  label: string;
  description?: string;
  error?: string;
}

export function TextArea({ id, label, description, error, className = '', ...props }: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const describedBy = [description ? descriptionId : undefined, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>{label}</label>
      <textarea
        {...props}
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`text-control text-control--area focus-ring ${className}`.trim()}
      />
      {description && <p className="field__description" id={descriptionId}>{description}</p>}
      {error && <p className="form-error" id={errorId}><CircleAlert aria-hidden="true" size={16} /><span>{error}</span></p>}
    </div>
  );
}
