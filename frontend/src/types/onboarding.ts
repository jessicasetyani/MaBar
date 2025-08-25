// TypeScript type definitions for onboarding components

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'player' | 'venue_owner';
  profilePicture?: string;
  onboardingCompleted: boolean;
  onboardingStep?: number;
  profileCompleteness?: number;
  location?: {
    city?: string;
    coordinates?: [number, number];
  };
  skillLevel?: number;
  playingFrequency?: 'daily' | 'weekly' | 'monthly' | 'occasionally';
  venueDetails?: {
    venueName?: string;
    venueAddress?: string;
    venuePhone?: string;
    pricePerHour?: number;
    numberOfCourts?: number;
    amenities?: string[];
    operatingHours?: Record<string, any>;
  };
  provider?: 'google' | 'facebook' | 'local';
  isEmailVerified?: boolean;
}

export interface WelcomeMessage {
  title: string;
  subtitle: string;
  features: string[];
}

export interface ProfileSummaryItem {
  label: string;
  value: string;
  icon?: string;
}

export interface Policy {
  name: string;
  required: boolean;
  id: string;
}

export interface TipData {
  title: string;
  content: string;
}

export interface OnboardingCompleteProps {
  onComplete: () => void;
  user?: User;
  loading?: boolean;
}

export interface CompletionAnimationProps {
  icon?: string;
  showCelebration?: boolean;
  animationDelay?: number;
}

export interface ProfileSummaryProps {
  user?: User;
  customItems?: ProfileSummaryItem[];
}

export interface FeaturesListProps {
  title?: string;
  features?: string[];
  icon?: string;
  animateOnMount?: boolean;
}

export interface PolicySectionProps {
  onAcceptanceChange?: (accepted: boolean) => void;
  title?: string;
  policies?: Policy[];
  additionalText?: string;
}

export interface TipCardProps {
  title?: string;
  content: string | React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  icon?: string;
  className?: string;
}
