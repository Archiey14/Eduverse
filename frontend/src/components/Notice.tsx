import type { ReactNode } from "react";
import "./shared.css";

interface NoticeProps {
  kind?: "error" | "info" | "success";
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** Visible banner so API failures are never hidden behind fake data. */
export function Notice({ kind = "error", title, message, onRetry }: NoticeProps) {
  const cls =
    kind === "info"
      ? "ev-notice ev-notice-info"
      : kind === "success"
      ? "ev-notice ev-notice-success"
      : "ev-notice";

  return (
    <div className={cls} role={kind === "error" ? "alert" : "status"}>
      <div className="ev-notice-body">
        {title && <strong>{title}</strong>}
        <span>{message}</span>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="ev-loading" role="status">
      <span className="ev-spinner"></span>
      <span>{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyState({ icon = "📭", title, message, children }: EmptyStateProps) {
  return (
    <div className="ev-empty">
      <span>{icon}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
