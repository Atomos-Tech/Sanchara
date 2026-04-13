import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

/** Component that throws on render for testing ErrorBoundary */
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div data-testid="child">Working</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected error boundary logs
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Working')).toBeDefined();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('renders "Try Again" button on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try Again')).toBeDefined();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.getByText('Custom Error')).toBeDefined();
  });

  it('resets error state when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    // Verify error state
    expect(screen.getByText('Something went wrong')).toBeDefined();
    
    // Click Try Again
    fireEvent.click(screen.getByText('Try Again'));
    
    // After reset, re-render with non-throwing child
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working')).toBeDefined();
  });
});
