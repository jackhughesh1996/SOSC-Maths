import { VisibilityEvent, TabTrackingSummary } from "../schema/DynamicTestTypes";

/**
 * Tracks tab visibility and focus events for audit purposes.
 * Provides a summary of time spent away from the test.
 */
export class TabTracker {
  private events: VisibilityEvent[] = [];
  private hiddenStartedAt: number | null = null;
  private startedAt: number = Date.now();
  private isActive: boolean = false;

  constructor(
    private config: {
      maxHiddenSecondsBeforeFlag?: number;
      maxHiddenEventsBeforeFlag?: number;
    } = {}
  ) {}

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.startedAt = Date.now();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);

    // Initial state check
    if (document.visibilityState === "hidden") {
      this.hiddenStartedAt = Date.now();
      this.logEvent("visibilitychange", "hidden");
    }
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    // Close any pending hidden interval
    if (this.hiddenStartedAt !== null) {
      this.logEvent("visibilitychange", "visible");
      this.hiddenStartedAt = null;
    }

    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
  }

  private handleVisibilityChange = () => {
    const state = document.visibilityState === "hidden" ? "hidden" : "visible";
    const now = Date.now();

    if (state === "hidden") {
      this.hiddenStartedAt = now;
    } else if (this.hiddenStartedAt !== null) {
      this.hiddenStartedAt = null;
    }

    this.logEvent("visibilitychange", state);
  };

  private handleBlur = () => {
    this.logEvent("blur", "blurred");
  };

  private handleFocus = () => {
    this.logEvent("focus", "focused");
  };

  private logEvent(type: VisibilityEvent["type"], state: VisibilityEvent["state"]) {
    const now = Date.now();
    this.events.push({
      type,
      state,
      timestamp: now,
      elapsedSeconds: Math.floor((now - this.startedAt) / 1000)
    });
  }

  getEvents(): VisibilityEvent[] {
    return [...this.events];
  }

  summarize(): TabTrackingSummary {
    let totalHiddenSeconds = 0;
    let longestHiddenSeconds = 0;
    let hiddenEventCount = 0;
    let currentHiddenStart: number | null = null;

    for (const event of this.events) {
      if (event.type === "visibilitychange") {
        if (event.state === "hidden") {
          hiddenEventCount++;
          currentHiddenStart = event.timestamp;
        } else if (event.state === "visible" && currentHiddenStart !== null) {
          const duration = (event.timestamp - currentHiddenStart) / 1000;
          totalHiddenSeconds += duration;
          longestHiddenSeconds = Math.max(longestHiddenSeconds, duration);
          currentHiddenStart = null;
        }
      }
    }

    // Handle case where test is submitted while still hidden
    if (currentHiddenStart !== null) {
      const duration = (Date.now() - currentHiddenStart) / 1000;
      totalHiddenSeconds += duration;
      longestHiddenSeconds = Math.max(longestHiddenSeconds, duration);
    }

    const focusLostCount = this.events.filter(e => e.type === "blur").length;

    const flags: string[] = [];
    
    if (this.config.maxHiddenSecondsBeforeFlag && totalHiddenSeconds > this.config.maxHiddenSecondsBeforeFlag) {
      flags.push(`Suspicious: Total time hidden (${Math.round(totalHiddenSeconds)}s) exceeded limit.`);
    }
    
    if (this.config.maxHiddenEventsBeforeFlag && hiddenEventCount >= this.config.maxHiddenEventsBeforeFlag) {
      flags.push(`Suspicious: Tab switched ${hiddenEventCount} times.`)
    }

    return {
      hiddenEventCount,
      totalHiddenSeconds: Math.round(totalHiddenSeconds),
      longestHiddenSeconds: Math.round(longestHiddenSeconds),
      focusLostCount,
      flags
    };
  }
}
