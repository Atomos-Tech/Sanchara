import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

/** Component that can be toggled to throw or not */
function ToggleThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
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
        <ToggleThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Working')).toBeDefined();
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ToggleThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('resets error state when Try Again is clicked', async () => {
    // 1. Initial render with error
    const { rerender } = render(
      <ErrorBoundary>
        <ToggleThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeDefined();
    
    // 2. Prepare the child to NOT throw on the next render cycle 
    // In a real app, this happens because the user fixed the cause of the error
    // or we're rendering a different component now.
    await act(async () => {
      rerender(
        <ErrorBoundary>
          <ToggleThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );
    });
    
    // Still in error state because ErrorBoundary state hasn't changed yet
    expect(screen.getByText('Something went wrong')).toBeDefined();
    
    // 3. Click Try Again. This resets ErrorBoundary state, and it tries to render its children again.
    // Since shouldThrow is now false, it should work.
    await act(async () => {
      fireEvent.click(screen.getByText('Try Again'));
    });
    
    expect(screen.getByText('Working')).toBeDefined();
  });
});
