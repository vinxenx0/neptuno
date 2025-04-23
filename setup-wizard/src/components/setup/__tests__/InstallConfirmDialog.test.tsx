
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstallConfirmDialog from '../InstallConfirmDialog';
import { runDockerContainers } from '@/utils/install';

// Mock the runDockerContainers function
vi.mock('@/utils/install', () => ({
  runDockerContainers: vi.fn().mockImplementation((dir, setLog) => {
    setLog('Docker containers started');
    return Promise.resolve();
  })
}));

describe('InstallConfirmDialog', () => {
  const mockConfig = {
    project: { 
      name: 'Test Project',
      domain: 'test-project.com'
    },
    environment: {
      installDirectory: '/path/to/install'
    },
    frontend: {
      port: 3000
    }
  };
  
  const mockOnClose = vi.fn();
  const mockOnCompleteInstall = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success message when installation is successful', () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={true}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    expect(screen.getByText('Installation Complete!')).toBeInTheDocument();
    expect(screen.getByText(/The Neptuno project has been successfully installed/)).toBeInTheDocument();
    expect(screen.getByText('Start Docker Containers')).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('renders failure message when installation fails', () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={false}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    expect(screen.getByText('Installation Failed')).toBeInTheDocument();
    expect(screen.getByText(/The installation process encountered an error/)).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={false}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls runDockerContainers when Start Docker Containers button is clicked', async () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={true}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    fireEvent.click(screen.getByText('Start Docker Containers'));
    
    expect(runDockerContainers).toHaveBeenCalledTimes(1);
    expect(runDockerContainers).toHaveBeenCalledWith('/path/to/install', expect.any(Function));
    
    // Wait for state to update
    await vi.waitFor(() => {
      expect(screen.getByText('Docker containers started')).toBeInTheDocument();
    });
    
    // After running Docker containers, the Complete Installation button should be shown
    expect(screen.getByText('Complete Installation')).toBeInTheDocument();
    expect(screen.queryByText('Start Docker Containers')).not.toBeInTheDocument();
  });

  it('displays thank you message and application URL after docker containers start', async () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={true}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    fireEvent.click(screen.getByText('Start Docker Containers'));
    
    // Wait for state to update
    await vi.waitFor(() => {
      expect(screen.getByText('Thank you for installing Neptuno!')).toBeInTheDocument();
      expect(screen.getByText('Your application is now available at:')).toBeInTheDocument();
      expect(screen.getByText('https://test-project.com')).toBeInTheDocument();
    });
  });

  it('uses localhost URL when domain is not provided', async () => {
    const configWithoutDomain = {
      ...mockConfig,
      project: { ...mockConfig.project, domain: undefined },
    };

    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={configWithoutDomain as any}
        installSuccess={true}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    fireEvent.click(screen.getByText('Start Docker Containers'));
    
    // Wait for state to update
    await vi.waitFor(() => {
      expect(screen.getByText('http://localhost:3000')).toBeInTheDocument();
    });
  });

  it('calls onCompleteInstall when Complete Installation button is clicked', async () => {
    render(
      <InstallConfirmDialog
        open={true}
        onClose={mockOnClose}
        config={mockConfig as any}
        installSuccess={true}
        onCompleteInstall={mockOnCompleteInstall}
      />
    );
    
    // First click Start Docker Containers
    fireEvent.click(screen.getByText('Start Docker Containers'));
    
    // Wait for the docker container to "start"
    await vi.waitFor(() => {
      expect(screen.getByText('Complete Installation')).toBeInTheDocument();
    });
    
    // Now click Complete Installation
    fireEvent.click(screen.getByText('Complete Installation'));
    
    expect(mockOnCompleteInstall).toHaveBeenCalledTimes(1);
    expect(mockOnCompleteInstall).toHaveBeenCalledWith(true, 'https://test-project.com');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
