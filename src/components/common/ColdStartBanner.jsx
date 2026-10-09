import { useEffect, useState } from "react";
import { isServerCurrentlyWaking, onServerWakeStatusChange } from "../../utils/serverWakeBus";

export default function ColdStartBanner() {
  const [waking, setWaking] = useState(isServerCurrentlyWaking);

  useEffect(() => onServerWakeStatusChange(setWaking), []);

  if (!waking) return null;

  return (
    <div className="cold-start-banner" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>Waking up the server — this can take a couple of minutes on the free plan…</span>
    </div>
  );
}
