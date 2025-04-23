
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile } from '../download';

describe('downloadFile', () => {
  // Mock DOM elements and functions
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();
  const mockClick = vi.fn();
  const mockCreateElement = vi.fn();
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    // Setup mocks
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    
    mockCreateElement.mockReturnValue({
      click: mockClick,
      href: '',
      download: ''
    });
    
    document.createElement = mockCreateElement;
    
    global.URL.createObjectURL = mockCreateObjectURL.mockReturnValue('mock-url');
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and download a file with the correct content', () => {
    const content = 'test content';
    const filename = 'test.txt';
    const type = 'text/plain';

    downloadFile(content, filename, type);

    // Check Blob creation
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    
    // Check anchor element creation
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    
    // Check link properties
    const linkElement = mockCreateElement.mock.results[0].value;
    expect(linkElement.href).toBe('mock-url');
    expect(linkElement.download).toBe(filename);
    
    // Check DOM operations
    expect(mockAppendChild).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRemoveChild).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
  });
});
