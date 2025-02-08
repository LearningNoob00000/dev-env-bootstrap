// tests/cli/utils/progress.test.ts
import { ProgressIndicator } from '../../../src/cli/utils/progress';

// Mock ora
jest.mock('ora', () => {
  return jest.fn().mockReturnValue({
    start: jest.fn(),
    succeed: jest.fn(),
    fail: jest.fn()
  });
});

describe('ProgressIndicator', () => {
  let progress: ProgressIndicator;

  beforeEach(() => {
    progress = new ProgressIndicator();
  });

  it('should start spinner with text', () => {
    progress.start('Loading...');
    expect(progress['spinner'].start).toHaveBeenCalledWith('Loading...');
  });

  it('should show success message', () => {
    progress.succeed('Done!');
    expect(progress['spinner'].succeed).toHaveBeenCalledWith('Done!');
  });

  it('should show failure message', () => {
    progress.fail('Error!');
    expect(progress['spinner'].fail).toHaveBeenCalledWith('Error!');
  });
});
