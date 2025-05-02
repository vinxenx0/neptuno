
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Add global setup for testing
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
