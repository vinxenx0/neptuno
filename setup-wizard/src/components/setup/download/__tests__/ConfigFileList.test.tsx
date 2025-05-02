
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigFileList from '../ConfigFileList';

describe('ConfigFileList', () => {
  it('renders all configuration files correctly', () => {
    render(<ConfigFileList />);
    
    // Check that all expected files are present
    expect(screen.getByText(/\.env - Environment variables/i)).toBeInTheDocument();
    expect(screen.getByText(/README\.md - Project documentation/i)).toBeInTheDocument();
    expect(screen.getByText(/docker-compose\.yml - Docker configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/nginx\.conf - Nginx configuration/i)).toBeInTheDocument();
    
    // There should be exactly 4 list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(4);
  });

  it('renders with bullet points and styling', () => {
    render(<ConfigFileList />);
    
    // Check styling elements exist
    const bullets = document.querySelectorAll('.w-4.h-4.mr-2.rounded-full.bg-blue-100');
    expect(bullets.length).toBe(4);
    
    // All items should have slate-600 text color
    const textItems = document.querySelectorAll('.text-slate-600');
    expect(textItems.length).toBe(4);
  });
});
