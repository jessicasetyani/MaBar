import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OnboardingComplete from '../../OnboardingComplete';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock the custom hooks
vi.mock('../../../hooks/useWelcomeMessage', () => ({
  useWelcomeMessage: vi.fn(),
  useRoleTip: vi.fn()
}));

vi.mock('../../../hooks/useProfileSummary', () => ({
  useProfileSummary: vi.fn()
}));

vi.mock('../../../hooks/usePolicyValidation', () => ({
  usePolicyValidation: vi.fn(),
  useCompletionValidation: vi.fn()
}));

describe('OnboardingComplete', () => {
  const mockOnComplete = vi.fn();
  
  const mockPlayerUser = {
    id: '1',
    email: 'player@test.com',
    firstName: 'John',
    role: 'player',
    skillLevel: 7,
    location: { city: 'Jakarta' },
    profileCompleteness: 85
  };

  const mockVenueOwnerUser = {
    id: '2',
    email: 'venue@test.com',
    firstName: 'Jane',
    role: 'venue_owner',
    venueDetails: {
      venueName: 'Test Venue',
      numberOfCourts: 3,
      pricePerHour: 150000
    },
    location: { city: 'Bandung' },
    profileCompleteness: 90
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({ loading: false });
    
    require('../../../hooks/useWelcomeMessage').useWelcomeMessage.mockReturnValue({
      title: 'Welcome to MaBar, John! 🏓',
      subtitle: 'You\'re all set to start playing',
      features: ['Find players', 'Book courts', 'Track progress']
    });
    
    require('../../../hooks/useWelcomeMessage').useRoleTip.mockReturnValue({
      title: '🏓 Player Tip',
      content: 'Complete your first match!'
    });
    
    require('../../../hooks/useProfileSummary').useProfileSummary.mockReturnValue([
      { label: 'Role', value: 'Player', icon: '🏓' },
      { label: 'Location', value: 'Jakarta', icon: '📍' }
    ]);
    
    require('../../../hooks/usePolicyValidation').usePolicyValidation.mockReturnValue({
      isValidForCompletion: true,
      validationMessage: '',
      policiesRequired: false,
      handleAllPoliciesAcceptance: vi.fn()
    });
    
    require('../../../hooks/usePolicyValidation').useCompletionValidation.mockReturnValue({
      canComplete: true
    });
  });

  it('renders welcome message for player', () => {
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    expect(screen.getByText('Welcome to MaBar, John! 🏓')).toBeInTheDocument();
    expect(screen.getByText('You\'re all set to start playing')).toBeInTheDocument();
  });

  it('renders features list', () => {
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    expect(screen.getByText('Find players')).toBeInTheDocument();
    expect(screen.getByText('Book courts')).toBeInTheDocument();
    expect(screen.getByText('Track progress')).toBeInTheDocument();
  });

  it('renders profile summary', () => {
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
  });

  it('renders tip card', () => {
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    expect(screen.getByText('🏓 Player Tip')).toBeInTheDocument();
    expect(screen.getByText('Complete your first match!')).toBeInTheDocument();
  });

  it('calls onComplete when button is clicked and user can complete', () => {
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    const completeButton = screen.getByText('Enter MaBar Dashboard');
    fireEvent.click(completeButton);
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete when user cannot complete', () => {
    require('../../../hooks/usePolicyValidation').useCompletionValidation.mockReturnValue({
      canComplete: false
    });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    const completeButton = screen.getByText('Enter MaBar Dashboard');
    fireEvent.click(completeButton);
    
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    expect(screen.getByText('Setting up...')).toBeInTheDocument();
  });

  it('shows policy section for venue owners', () => {
    require('../../../hooks/usePolicyValidation').usePolicyValidation.mockReturnValue({
      isValidForCompletion: false,
      validationMessage: 'Please accept policies',
      policiesRequired: true,
      handleAllPoliciesAcceptance: vi.fn()
    });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockVenueOwnerUser} />);
    
    expect(screen.getByText('Terms and Policies')).toBeInTheDocument();
  });

  it('shows validation message when policies not accepted', () => {
    require('../../../hooks/usePolicyValidation').usePolicyValidation.mockReturnValue({
      isValidForCompletion: false,
      validationMessage: 'Please accept the terms and policies to continue',
      policiesRequired: true,
      handleAllPoliciesAcceptance: vi.fn()
    });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockVenueOwnerUser} />);
    
    expect(screen.getByText('Please accept the terms and policies to continue')).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    mockUseAuth.mockReturnValue({ loading: true });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    const completeButton = screen.getByText('Setting up...');
    expect(completeButton).toBeDisabled();
  });

  it('disables button when user cannot complete', () => {
    require('../../../hooks/usePolicyValidation').useCompletionValidation.mockReturnValue({
      canComplete: false
    });
    
    render(<OnboardingComplete onComplete={mockOnComplete} user={mockPlayerUser} />);
    
    const completeButton = screen.getByText('Enter MaBar Dashboard');
    expect(completeButton).toBeDisabled();
  });
});
