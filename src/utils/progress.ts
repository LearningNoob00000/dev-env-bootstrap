// src/cli/utils/progress.ts
import ora from 'ora';

export class ProgressIndicator {
  private spinner = ora();

  /**
   * Starts the progress indicator
   * @param text - Text to display
   */
  start(text: string): void {
    this.spinner.start(text);
  }

  /**
   * Stops the progress indicator with success
   * @param text - Success message
   */
  succeed(text: string): void {
    this.spinner.succeed(text);
  }

  /**
   * Stops the progress indicator with failure
   * @param text - Error message
   */
  fail(text: string): void {
    this.spinner.fail(text);
  }
}
