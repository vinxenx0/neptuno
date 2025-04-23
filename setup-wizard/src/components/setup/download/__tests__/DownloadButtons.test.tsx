
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadButtons from '../DownloadButtons';

describe('DownloadButtons', () => {
  const mockHandlers = {
    onDownloadEnv: vi.fn(),
    onDownloadReadme: vi.fn(),
    onDownloadDockerCompose: vi.fn(),
    onDownloadNginx: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all download buttons correctly', () => {
    render(<DownloadButtons {...mockHandlers} />);
    
    expect(screen.getByText(/Download \.env/i)).toBeInTheDocument();
    expect(screen.getByText(/Download README\.md/i)).toBeInTheDocument();
    expect(screen.getByText(/Download docker-compose\.yml/i)).toBeInTheDocument();
    expect(screen.getByText(/Download nginx\.conf/i)).toBeInTheDocument();
  });

  it('calls the correct handlers when buttons are clicked', () => {
    render(<DownloadButtons {...mockHandlers} />);
    
    fireEvent.click(screen.getByText(/Download \.env/i));
    expect(mockHandlers.onDownloadEnv).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText(/Download README\.md/i));
    expect(mockHandlers.onDownloadReadme).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText(/Download docker-compose\.yml/i));
    expect(mockHandlers.onDownloadDockerCompose).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText(/Download nginx\.conf/i));
    expect(mockHandlers.onDownloadNginx).toHaveBeenCalledTimes(1);
  });

  it('renders with Download icons', () => {
    render(<DownloadButtons {...mockHandlers} />);
    
    // Find icons inside buttons
    const icons = document.querySelectorAll('.w-4.h-4.mr-2');
    expect(icons.length).toBe(4);
  });
});
