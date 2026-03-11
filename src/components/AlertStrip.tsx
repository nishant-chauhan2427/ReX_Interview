interface AlertStripProps {
  visible: boolean;
  onDismiss: () => void;
}

export function AlertStrip({ visible, onDismiss }: AlertStripProps) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[rgba(20,22,30,0.92)] backdrop-blur-sm ${
        !visible ? "hidden" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">ℹ️</span>
          <span>
            Ensure you are in a well-lit, quiet environment for the best interview experience. Your
            session is private and secure.
          </span>
        </div>
        <button
          className="rounded-md border border-white/15 px-2 py-1 text-xs text-foreground transition-colors hover:bg-white/10"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
