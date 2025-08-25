import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CompletionAnimation from '../CompletionAnimation';

// Mock CSS imports
vi.mock('../CompletionAnimation.css', () => ({}));

describe('CompletionAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders with default icon', () => {
    render(<CompletionAnimation />);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<CompletionAnimation icon="🎉" />);
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('shows animation after delay', () => {
    render(<CompletionAnimation animationDelay={500} />);
    
    const icon = screen.getByText('✅');
    expect(icon).not.toHaveClass('animate-in');
    
    vi.advanceTimersByTime(500);
    expect(icon).toHaveClass('animate-in');
  });

  it('shows confetti when celebration is enabled', () => {
    render(<CompletionAnimation showCelebration={true} />);
    
    vi.advanceTimersByTime(300); // Animation delay + confetti delay
    
    const confettiContainer = document.querySelector('.confetti-container');
    expect(confettiContainer).toBeInTheDocument();
  });

  it('does not show confetti when celebration is disabled', () => {
    render(<CompletionAnimation showCelebration={false} />);
    
    vi.advanceTimersByTime(1000);
    
    const confettiContainer = document.querySelector('.confetti-container');
    expect(confettiContainer).not.toBeInTheDocument();
  });

  it('renders correct number of confetti pieces', () => {
    render(<CompletionAnimation showCelebration={true} />);
    
    vi.advanceTimersByTime(300);
    
    const confettiPieces = document.querySelectorAll('.confetti-piece');
    expect(confettiPieces).toHaveLength(12);
  });
});
