// src/cli/utils/progress.ts
import ora from 'ora';

export class ProgressIndicator {
  private spinner: ReturnType<typeof ora>;

  constructor() {
    this.spinner = ora({
      spinner: 'dots',
      color: 'cyan'
    });
  }

  start(text: string): void {
    this.spinner.start(text);
  }

  succeed(text: string): void {
    this.spinner.succeed(text);
  }

  fail(text: string): void {
    this.spinner.fail(text);
  }
}
