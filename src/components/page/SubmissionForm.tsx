"use client";

import { FormEvent, useId, useState } from "react";
import { postPublicApi } from "@/lib/publicApi";

export interface SubmissionFormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "textarea" | "select" | "checkbox" | "number";
  required?: boolean;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  fullWidth?: boolean;
}

interface SubmissionFormProps {
  fields: SubmissionFormField[];
  submitLabel: string;
  successMessage: string;
  apiPath: string;
  className?: string;
  initialValues?: Record<string, string>;
  toPayload?: (values: Record<string, string>) => unknown;
}

export function SubmissionForm({ fields, submitLabel, successMessage, apiPath, className, initialValues = {}, toPayload = (values) => values }: SubmissionFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map((field) => [field.name, field.type === "checkbox" ? (form.get(field.name) ? "true" : "") : String(form.get(field.name) ?? "")]));
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) nextErrors[field.name] = field.label + " is required.";
      if (field.type === "email" && values[field.name] && !/^\S+@\S+\.\S+$/.test(values[field.name])) nextErrors[field.name] = "Enter a valid email address.";
    });
    setErrors(nextErrors);
    setSubmissionError("");
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      await postPublicApi(apiPath, toPayload(values));
      setIsSubmitted(true);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "We could not send this form just now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) return <div className="notice notice--success" role="status">{successMessage}</div>;

  return (
    <form className={["form-grid", className].filter(Boolean).join(" ")} noValidate onSubmit={handleSubmit}>
      {fields.map((field) => {
        const id = formId + "-" + field.name;
        const error = errors[field.name];
        const type = field.type ?? "text";
        return (
          <div key={field.name} className={["form-field", field.fullWidth || type === "textarea" ? "form-field--full" : ""].filter(Boolean).join(" ")}>
            {type === "checkbox" ? (
              <label htmlFor={id} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 8 }}>
                <input id={id} name={field.name} type="checkbox" defaultChecked={initialValues[field.name] === "true"} />
                <span><strong style={{ fontSize: ".9rem" }}>{field.label}{field.required ? " *" : ""}</strong>{field.help ? <span className="field-help" style={{ display: "block" }}>{field.help}</span> : null}</span>
              </label>
            ) : (
              <>
                <label className="field-label" htmlFor={id}>{field.label}{field.required ? " *" : ""}</label>
                {type === "textarea" ? <textarea id={id} name={field.name} className="field" defaultValue={initialValues[field.name]} placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? id + "-error" : undefined} /> : type === "select" ? <select id={id} name={field.name} className="field" defaultValue={initialValues[field.name] ?? ""} aria-invalid={Boolean(error)} aria-describedby={error ? id + "-error" : undefined}><option value="">Select an option</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={id} name={field.name} className="field" type={type} defaultValue={initialValues[field.name]} placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? id + "-error" : undefined} />}
                {field.help ? <p className="field-help">{field.help}</p> : null}
              </>
            )}
            {error ? <p id={id + "-error"} className="field-error">{error}</p> : null}
          </div>
        );
      })}
      {submissionError ? <p className="field-error form-field--full" role="alert">{submissionError}</p> : null}
      <div className="form-field form-field--full"><button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : submitLabel}</button></div>
    </form>
  );
}
