import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing policy acceptance validation
 * @param {Object} user - User object to determine if policies are required
 * @param {Array} requiredPolicies - Array of required policy names
 * @returns {Object} Policy validation state and handlers
 */
export const usePolicyValidation = (user, requiredPolicies = []) => {
  const [acceptedPolicies, setAcceptedPolicies] = useState(new Set());
  const [allPoliciesAccepted, setAllPoliciesAccepted] = useState(false);

  const isVenueOwner = user?.role === 'venue_owner';
  const policiesRequired = isVenueOwner && requiredPolicies.length > 0;

  const defaultPolicies = useMemo(() => [
    { name: 'Terms of Service', required: true, id: 'terms' },
    { name: 'Privacy Policy', required: true, id: 'privacy' },
    { name: 'Venue Owner Guidelines', required: isVenueOwner, id: 'venue_guidelines' }
  ], [isVenueOwner]);

  const policies = requiredPolicies.length > 0 ? requiredPolicies : defaultPolicies;
  const requiredPolicyIds = policies.filter(p => p.required).map(p => p.id);

  const handlePolicyAcceptance = useCallback((policyId, accepted) => {
    setAcceptedPolicies(prev => {
      const newSet = new Set(prev);
      if (accepted) {
        newSet.add(policyId);
      } else {
        newSet.delete(policyId);
      }
      return newSet;
    });
  }, []);

  const handleAllPoliciesAcceptance = useCallback((accepted) => {
    setAllPoliciesAccepted(accepted);
    if (accepted) {
      setAcceptedPolicies(new Set(requiredPolicyIds));
    } else {
      setAcceptedPolicies(new Set());
    }
  }, [requiredPolicyIds]);

  const isValidForCompletion = useMemo(() => {
    if (!policiesRequired) return true;
    
    // Check if all required policies are accepted
    return requiredPolicyIds.every(policyId => acceptedPolicies.has(policyId)) || allPoliciesAccepted;
  }, [policiesRequired, requiredPolicyIds, acceptedPolicies, allPoliciesAccepted]);

  const validationMessage = useMemo(() => {
    if (!policiesRequired) return '';
    if (isValidForCompletion) return '';
    
    const missingPolicies = requiredPolicyIds.filter(id => !acceptedPolicies.has(id));
    const policyNames = missingPolicies.map(id => 
      policies.find(p => p.id === id)?.name || id
    );
    
    if (policyNames.length === 1) {
      return `Please accept the ${policyNames[0]} to continue`;
    } else if (policyNames.length === 2) {
      return `Please accept the ${policyNames[0]} and ${policyNames[1]} to continue`;
    } else {
      return `Please accept all required policies to continue`;
    }
  }, [policiesRequired, isValidForCompletion, requiredPolicyIds, acceptedPolicies, policies]);

  return {
    policies,
    acceptedPolicies,
    allPoliciesAccepted,
    isValidForCompletion,
    validationMessage,
    policiesRequired,
    handlePolicyAcceptance,
    handleAllPoliciesAcceptance
  };
};

/**
 * Custom hook for managing form completion validation
 * @param {Object} user - User object
 * @param {boolean} policiesAccepted - Whether policies are accepted
 * @returns {Object} Completion validation state
 */
export const useCompletionValidation = (user, policiesAccepted = true) => {
  const canComplete = useMemo(() => {
    if (!user) return false;
    
    const isVenueOwner = user.role === 'venue_owner';
    
    // For venue owners, policies must be accepted
    if (isVenueOwner && !policiesAccepted) {
      return false;
    }
    
    // Basic validation - user must have required fields
    const hasRequiredFields = user.firstName && user.email && user.role;
    
    return hasRequiredFields;
  }, [user, policiesAccepted]);

  const completionMessage = useMemo(() => {
    if (!user) return 'User information is required';
    
    const isVenueOwner = user.role === 'venue_owner';
    
    if (isVenueOwner && !policiesAccepted) {
      return 'Please accept the terms and policies to continue';
    }
    
    if (!user.firstName || !user.email) {
      return 'Please complete your profile information';
    }
    
    return '';
  }, [user, policiesAccepted]);

  return {
    canComplete,
    completionMessage
  };
};
