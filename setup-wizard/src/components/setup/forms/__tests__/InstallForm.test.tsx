
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstallForm from '../InstallForm';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/utils/download', () => ({
  downloadFile: vi.fn()
}));

vi.mock('@/utils/config', () => ({
  generateEnvFile: vi.fn().mockReturnValue('mock-env-content'),
  downloadEnvFile: vi.fn()
}));

vi.mock('@/utils/configGenerators', () => ({
  generateDockerCompose: vi.fn().mockReturnValue('mock-docker-compose'),
  generateNginxConfig: vi.fn().mockReturnValue('mock-nginx-config'),
  generateReadme: vi.fn().mockReturnValue('mock-readme')
}));

vi.mock('jszip', () => {
  const mockFile = vi.fn();
  const mockGenerateAsync = vi.fn().mockResolvedValue(new Blob());
  
  return {
    default: vi.fn().mockImplementation(() => ({
      file: mockFile,
      generateAsync: mockGenerateAsync
    }))
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('InstallForm', () => {
  const validConfig = {
    project: { name: 'Test Project' },
    server: {},
    auth: {},
    frontend: {},
    docker: {},
    environment: {
      gitRepoUrl: 'https://github.com/test/repo.git',
      installDirectory: '/path/to/install'
    },
    redis: {}
  };
  
  const invalidConfig = {
    project: { name: 'Test Project' },
    server: {},
    auth: {},
    frontend: {},
    docker: {},
    environment: {},
    redis: {}
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ConfigFileList and download buttons', () => {
    render(<InstallForm config={validConfig as any} />);
    
    expect(screen.getByText(/\.env - Environment variables/i)).toBeInTheDocument();
    expect(screen.getByText(/Download \.env/i)).toBeInTheDocument();
    expect(screen.getByText(/Download README\.md/i)).toBeInTheDocument();
    expect(screen.getByText(/Download All as ZIP/i)).toBeInTheDocument();
  });

  it('renders the Install button', () => {
    render(<InstallForm config={validConfig as any} />);
    
    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('shows error toast when installDirectory is missing and Install is clicked', () => {
    const configWithoutDir = {
      ...validConfig,
      environment: {
        ...validConfig.environment,
        installDirectory: ''
      }
    };
    
    render(<InstallForm config={configWithoutDir as any} />);
    
    fireEvent.click(screen.getByText('Install'));
    
    expect(toast.error).toHaveBeenCalledWith("Installation Directory is required");
  });

  it('shows error toast when gitRepoUrl is missing and Install is clicked', () => {
    const configWithoutRepo = {
      ...validConfig,
      environment: {
        ...validConfig.environment,
        gitRepoUrl: ''
      }
    };
    
    render(<InstallForm config={configWithoutRepo as any} />);
    
    fireEvent.click(screen.getByText('Install'));
    
    expect(toast.error).toHaveBeenCalledWith("Git Repository URL is required");
  });
});
