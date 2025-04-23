
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstallProgressDialog from '../InstallProgressDialog';
import { executeInstallation } from '@/utils/install';

// Mock the installation utility
vi.mock('@/utils/install', () => ({
  executeInstallation: vi.fn(),
  runDockerContainers: vi.fn()
}));

// Mock the InstallConfirmDialog component
vi.mock('../InstallConfirmDialog', () => ({
  default: vi.fn(({ open, onClose, config, installSuccess, onCompleteInstall }) => {
    if (!open) return null;
    return (
      <div data-testid="install-confirm-dialog">
        <button onClick={() => onCompleteInstall(true, 'https://test.com')}>
          Complete Install
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  })
}));

describe('InstallProgressDialog', () => {
  const mockConfig = {
    project: { name: 'Test Project' },
    environment: { installDirectory: '/path/to/install' }
  };

  it('renders correctly when open', () => {
    render(
      <InstallProgressDialog
        open={true}
        onOpenChange={() => {}}
        config={mockConfig as any}
        onInstallComplete={() => {}}
      />
    );

    expect(screen.getByText('Installing Neptuno')).toBeInTheDocument();
    expect(screen.getByText('Installing Neptuno, please wait...')).toBeInTheDocument();
    expect(executeInstallation).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(
      <InstallProgressDialog
        open={false}
        onOpenChange={() => {}}
        config={mockConfig as any}
        onInstallComplete={() => {}}
      />
    );

    expect(screen.queryByText('Installing Neptuno')).not.toBeInTheDocument();
  });

  it('calls executeInstallation with correct parameters', () => {
    render(
      <InstallProgressDialog
        open={true}
        onOpenChange={() => {}}
        config={mockConfig as any}
        onInstallComplete={() => {}}
      />
    );

    expect(executeInstallation).toHaveBeenCalledWith(
      mockConfig,
      expect.any(Function), // setInstallStatus
      expect.any(Function), // setInstallProgress
      expect.any(Function), // setInstallLog
      expect.any(Function)  // handleInstallComplete
    );
  });
});
