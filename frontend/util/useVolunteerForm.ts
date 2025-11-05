import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { api } from './api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  constituency: string;
  interests: string[];
  volunteer: boolean;
  newsletter: boolean;
  socialMediaHandle: string;
  isBritishCitizen: boolean | undefined;
  livesInUK: boolean | undefined;
  briefBio: string;
  briefCV: string;
  otherAffiliations: string;
  interestedIn: string[];
  canContribute: string[];
  signedNDA: boolean;
  gdprConsent: boolean;
}

interface UseVolunteerFormReturn {
  // Form state
  formData: FormData;
  updateField: (field: string, value: string | boolean) => void;
  toggleVolunteerInterest: (interest: string) => void;
  toggleContribution: (contribution: string) => void;
  
  // Validation
  isFormValid: () => boolean;
  
  // Submission
  isLoading: boolean;
  isSuccess: boolean;
  successMessage: string;
  apiError: string | null;
  showApiError: boolean;
  handleJoin: (captchaToken: string | null) => Promise<void>;
  
  // NDA management
  hasSignedNDA: boolean;
  ndaSignerName: string;
  showNDASuccess: boolean;
  setShowNDASuccess: (show: boolean) => void;
  checkNDASignature: () => void;
  
  // Data persistence
  hasSavedData: boolean;
  clearCachedData: () => void;
  
  // UI controls
  dismissApiError: () => void;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  constituency: '',
  interests: [],
  volunteer: true,
  newsletter: true,
  socialMediaHandle: '',
  isBritishCitizen: undefined,
  livesInUK: undefined,
  briefBio: '',
  briefCV: '',
  otherAffiliations: '',
  interestedIn: [],
  canContribute: [],
  signedNDA: false,
  gdprConsent: false,
};

export const useVolunteerForm = (): UseVolunteerFormReturn => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [ndaSignerName, setNdaSignerName] = useState('');
  const [showNDASuccess, setShowNDASuccess] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiError, setShowApiError] = useState(false);

  // Memoized form handlers
  const updateField = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleVolunteerInterest = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(interest)
        ? prev.interestedIn.filter(i => i !== interest)
        : [...prev.interestedIn, interest]
    }));
  }, []);

  const toggleContribution = useCallback((contribution: string) => {
    setFormData(prev => ({
      ...prev,
      canContribute: prev.canContribute.includes(contribution)
        ? prev.canContribute.filter(c => c !== contribution)
        : [...prev.canContribute, contribution]
    }));
  }, []);

  // Validation
  const isFormValid = useCallback((): boolean => {
    const {
      firstName,
      lastName,
      email,
      constituency,
      socialMediaHandle,
      isBritishCitizen,
      livesInUK,
      briefBio,
      briefCV,
      signedNDA,
      gdprConsent
    } = formData;

    if (!firstName || !lastName || !email || !constituency) {
      return false;
    }

    if (!socialMediaHandle ||
      isBritishCitizen === undefined ||
      livesInUK === undefined ||
      !briefBio ||
      !briefCV ||
      !signedNDA ||
      !hasSignedNDA ||
      !gdprConsent) {
      return false;
    }

    return true;
  }, [formData, hasSignedNDA]);

  // Data persistence
  const saveFormData = useCallback(() => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('progressFormData', JSON.stringify({
          ...formData,
          volunteer: true,
        }));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [formData]);

  const restoreFormData = useCallback(() => {
    if (Platform.OS === 'web') {
      try {
        const savedData = localStorage.getItem('progressFormData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData({
            ...parsed,
            volunteer: true,
          });
          setHasSavedData(true);
        } else {
          setHasSavedData(false);
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
        setHasSavedData(false);
      }
    }
  }, []);

  const clearCachedData = useCallback(() => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('progressFormData');
        localStorage.removeItem('NDASignature');
        setHasSavedData(false);
        console.log('Cached application data cleared');
      } catch (error) {
        console.error('Error clearing cached data:', error);
      }
    }
  }, []);

  // NDA management
  const checkNDASignature = useCallback(() => {
    if (Platform.OS === 'web') {
      try {
        const ndaData = localStorage.getItem('NDASignature');
        if (ndaData) {
          const parsed = JSON.parse(ndaData);
          if (parsed.agreed && parsed.name) {
            const wasAlreadySigned = hasSignedNDA;
            setHasSignedNDA(true);
            setNdaSignerName(parsed.name);
            setFormData(prev => ({ ...prev, signedNDA: true }));

            if (!wasAlreadySigned) {
              setShowNDASuccess(true);
              if (Platform.OS === 'web') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setTimeout(() => {
                setShowNDASuccess(false);
              }, 5000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking NDA signature:', error);
      }
    }
  }, [hasSignedNDA]);

  // Form submission
  const handleJoin = useCallback(async (captchaToken: string | null) => {
    const { firstName, lastName, email, constituency } = formData;

    if (!firstName || !lastName || !email || !constituency) {
      setApiError('Please fill in all required fields: First Name, Last Name, Email Address, and Constituency.');
      setShowApiError(true);
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setShowApiError(false), 6000);
      return;
    }

    if (!captchaToken) {
      setApiError('Please complete the security verification to continue.');
      setShowApiError(true);
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setShowApiError(false), 6000);
      return;
    }

    const {
      socialMediaHandle,
      isBritishCitizen,
      livesInUK,
      briefBio,
      briefCV,
      signedNDA,
      gdprConsent
    } = formData;

    const missingFields = [];
    if (!socialMediaHandle) missingFields.push('Social media handle');
    if (isBritishCitizen === undefined) missingFields.push('British citizenship status');
    if (livesInUK === undefined) missingFields.push('UK residence status');
    if (!briefBio) missingFields.push('Brief bio');
    if (!briefCV) missingFields.push('Brief CV');
    if (!signedNDA || !hasSignedNDA) {
      setApiError('You must sign the Progress NDA before submitting your volunteer application. Please use the "View and sign NDA" link below.');
      setShowApiError(true);
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setShowApiError(false), 8000);
      return;
    }
    if (!gdprConsent) missingFields.push('GDPR consent');

    if (missingFields.length > 0) {
      setApiError(`Please complete the following volunteer fields: ${missingFields.join(', ')}`);
      setShowApiError(true);
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setShowApiError(false), 8000);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setShowApiError(false);

    try {
      const response = await api.submitApplication({
        ...formData,
        volunteer: true,
        captchaToken
      });

      if (response.success) {
        clearCachedData();
        setSuccessMessage(response.message || 'Your volunteer application has been submitted successfully. An admin will review your application and you\'ll receive an access code via email if approved.');
        setIsSuccess(true);
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setApiError(response.message || 'Failed to submit application. Please try again.');
        setShowApiError(true);
        if (Platform.OS === 'web') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => setShowApiError(false), 10000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setApiError(errorMessage);
      setShowApiError(true);
      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setShowApiError(false), 10000);
    } finally {
      setIsLoading(false);
    }
  }, [formData, hasSignedNDA, clearCachedData]);

  // Auto-save form data whenever it changes
  useEffect(() => {
    saveFormData();
  }, [saveFormData]);

  // Initial setup
  useEffect(() => {
    checkNDASignature();
    restoreFormData();
  }, [checkNDASignature, restoreFormData]);

  // Listen for focus events to check NDA status when returning from NDA page
  useEffect(() => {
    const handleFocus = () => {
      checkNDASignature();
      restoreFormData();
    };

    if (Platform.OS === 'web') {
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [checkNDASignature, restoreFormData]);

  // UI control functions
  const dismissApiError = useCallback(() => {
    setShowApiError(false);
  }, []);

  return {
    formData,
    updateField,
    toggleVolunteerInterest,
    toggleContribution,
    isFormValid,
    isLoading,
    isSuccess,
    successMessage,
    apiError,
    showApiError,
    handleJoin,
    hasSignedNDA,
    ndaSignerName,
    showNDASuccess,
    setShowNDASuccess,
    checkNDASignature,
    hasSavedData,
    clearCachedData,
    dismissApiError,
  };
};