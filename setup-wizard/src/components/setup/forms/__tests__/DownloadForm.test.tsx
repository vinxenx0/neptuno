
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadForm from '../DownloadForm';
import { downloadFile } from '@/utils/download';
import { generateEnvFile, downloadEnvFile } from '@/utils/config';
import { 
  generateDockerCompose, 
  generateNginxConfig, 
  generateReadme 
} from '@/utils/configGenerators';

// Mock the necessary dependencies
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

// Mock URL.createObjectURL and related methods
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn().mockReturnValue('mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn()
});

describe('DownloadForm', () => {
  const mockConfig = {
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
    
    // Mock document.createElement for the zip download function
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    };
    document.createElement = vi.fn().mockReturnValue(mockAnchor);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  it('renders ConfigFileList and DownloadButtons', () => {
    render(<DownloadForm config={mockConfig as any} />);
    
    // Check ConfigFileList is rendered
    expect(screen.getByText(/\.env - Environment variables/i)).toBeInTheDocument();
    
    // Check DownloadButtons are rendered
    expect(screen.getByText(/Download \.env/i)).toBeInTheDocument();
    expect(screen.getByText(/Download README\.md/i)).toBeInTheDocument();
    
    // Check "Download All as ZIP" button is rendered
    expect(screen.getByText(/Download All as ZIP/i)).toBeInTheDocument();
  });

  it('calls downloadEnvFile when Download .env button is clicked', () => {
    render(<DownloadForm config={mockConfig as any} />);
    
    fireEvent.click(screen.getByText(/Download \.env/i));
    
    expect(generateEnvFile).toHaveBeenCalledWith(mockConfig);
    expect(downloadEnvFile).toHaveBeenCalledWith('mock-env-content');
  });

  it('calls downloadFile with correct parameters when Download README.md button is clicked', () => {
    render(<DownloadForm config={mockConfig as any} />);
    
    fireEvent.click(screen.getByText(/Download README\.md/i));
    
    expect(generateReadme).toHaveBeenCalledWith(mockConfig);
    expect(downloadFile).toHaveBeenCalledWith('mock-readme', 'README.md', 'text/markdown');
  });

  it('calls downloadFile with correct parameters when Download docker-compose.yml button is clicked', () => {
    render(<DownloadForm config={mockConfig as any} />);
    
    fireEvent.click(screen.getByText(/Download docker-compose\.yml/i));
    
    expect(generateDockerCompose).toHaveBeenCalledWith(mockConfig);
    expect(downloadFile).toHaveBeenCalledWith('mock-docker-compose', 'docker-compose.yml', 'text/yaml');
  });

  it('calls downloadFile with correct parameters when Download nginx.conf button is clicked', () => {
    render(<DownloadForm config={mockConfig as any} />);
    
    fireEvent.click(screen.getByText(/Download nginx\.conf/i));
    
    expect(generateNginxConfig).toHaveBeenCalledWith(mockConfig);
    expect(downloadFile).toHaveBeenCalledWith('mock-nginx-config', 'nginx.conf', 'text/plain');
  });
});
