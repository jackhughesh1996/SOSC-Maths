/**
 * Manages the authoritative test timer.
 * Provides ticking and expiration events.
 */
export class TimerController {
  private intervalId: number | null = null;
  private isExpired: boolean = false;

  constructor(
    private durationSeconds: number,
    private onTick: (remainingSeconds: number) => void,
    private onExpire: () => void
  ) {}

  /**
   * Starts the timer relative to a specific start time.
   * Useful for resuming tests or syncing with server start.
   */
  start(startedAtIso: string) {
    if (this.intervalId !== null) return;

    const startedAt = new Date(startedAtIso).getTime();

    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      const remaining = Math.max(0, this.durationSeconds - elapsed);

      this.onTick(remaining);

      if (remaining <= 0 && !this.isExpired) {
        this.isExpired = true;
        this.stop();
        this.onExpire();
      }
    }, 250); // High frequency check for fluid UI and accurate expiration
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getIsExpired(): boolean {
    return this.isExpired;
  }
}
