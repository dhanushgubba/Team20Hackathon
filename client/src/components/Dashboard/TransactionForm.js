import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  CreditCard,
  User,
  DollarSign,
  Smartphone,
  Building,
  Shield,
  AlertTriangle,
  Save,
  RotateCcw,
  Loader2,
  Navigation,
  Clock,
} from 'lucide-react';
import './TransactionForm.css';

const schema = yup.object({
  transactionId: yup.string().required('Transaction ID is required'),
  userId: yup.string().required('User ID is required'),
  transactionAmount: yup
    .number()
    .positive('Amount must be positive')
    .required('Transaction amount is required'),
  transactionType: yup.string().required('Transaction type is required'),
  timestamp: yup.string(), // Auto-populated, so not required from user
  accountBalance: yup
    .number()
    .min(0, 'Account balance cannot be negative')
    .required('Account balance is required'),
  deviceType: yup.string().required('Device type is required'),
  location: yup.string(), // Auto-populated via GPS, so not required from user
  merchantCategory: yup.string().required('Merchant category is required'),
  ipAddressFlag: yup.string().required('IP Address flag is required'),
  previousFraudulentActivity: yup
    .string()
    .required('Previous fraudulent activity status is required'),
});

const transactionTypes = [
  'Purchase',
  'Withdrawal',
  'Transfer',
  'Deposit',
  'Refund',
  'Payment',
  'Other',
];

const deviceTypes = [
  'Mobile',
  'Desktop',
  'Tablet',
  'ATM',
  'POS Terminal',
  'Web Browser',
  'Other',
];

const merchantCategories = [
  'Grocery',
  'Gas Station',
  'Restaurant',
  'Retail',
  'Online Shopping',
  'Entertainment',
  'Healthcare',
  'Travel',
  'Utilities',
  'Financial Services',
  'Other',
];

const ipAddressFlags = [
  'Safe',
  'Suspicious',
  'High Risk',
  'Blacklisted',
  'Unknown',
];

const fraudulentActivityOptions = [
  'None',
  'Low Risk',
  'Medium Risk',
  'High Risk',
  'Previously Flagged',
];

const TransactionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Helper function to get local datetime string
  const getLocalDateTime = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      timestamp: getLocalDateTime(),
      location: 'Detecting location...',
    },
  });

  // Auto-update timestamp every 30 seconds for better performance
  useEffect(() => {
    const updateTimestamp = () => {
      setValue('timestamp', getLocalDateTime());
    };

    // Initial timestamp
    updateTimestamp();

    // Update timestamp every 30 seconds instead of every second
    const intervalId = setInterval(updateTimestamp, 30000);

    return () => clearInterval(intervalId);
  }, [setValue, getLocalDateTime]);

  // Get GPS location on component mount
  useEffect(() => {
    const getLocation = async () => {
      setIsGettingLocation(true);
      setLocationError('');

      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        setValue('location', 'Unknown Location');
        setIsGettingLocation(false);
        return;
      }

      // Set immediate fallback to reduce perceived loading time
      const fallbackTimer = setTimeout(() => {
        setValue('location', 'Current Location');
        setIsGettingLocation(false);
      }, 3000); // 3 second fallback

      const options = {
        enableHighAccuracy: false, // Use less accurate but faster GPS
        timeout: 5000, // Reduce timeout to 5 seconds
        maximumAge: 300000, // Accept cached location up to 5 minutes old
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(fallbackTimer); // Clear fallback timer if GPS succeeds
          const { latitude, longitude } = position.coords;

          try {
            // Try to get readable address using reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response.ok) {
              const data = await response.json();
              // Only use city name for cleaner display
              const cityName =
                data.city ||
                data.locality ||
                data.principalSubdivision ||
                'Unknown City';
              setValue('location', cityName);
            } else {
              throw new Error('Geocoding failed');
            }
          } catch (error) {
            // Fallback to just "Current Location" for simplicity
            setValue('location', 'Current Location');
          }

          setIsGettingLocation(false);
        },
        (error) => {
          clearTimeout(fallbackTimer); // Clear fallback timer on error
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }

          setLocationError(errorMessage);
          setValue('location', 'Location unavailable');
          setIsGettingLocation(false);
        },
        options
      );
    };

    getLocation();
  }, [setValue]);

  const refreshLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: false, // Use less accurate but faster GPS
      timeout: 5000, // Reduce timeout to 5 seconds
      maximumAge: 300000, // Accept cached location up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (response.ok) {
            const data = await response.json();
            // Only use city name for cleaner display
            const cityName =
              data.city ||
              data.locality ||
              data.principalSubdivision ||
              'Unknown City';
            setValue('location', cityName);
          } else {
            throw new Error('Geocoding failed');
          }
        } catch (error) {
          // Fallback to just "Current Location" for simplicity
          setValue('location', 'Current Location');
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError('Failed to get location');
        setIsGettingLocation(false);
      },
      options
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Transaction submitted:', data);
      setSubmitMessage('Transaction submitted successfully!');

      // Reset form after successful submission
      setTimeout(() => {
        reset();
        setSubmitMessage('');
      }, 3000);
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitMessage('Failed to submit transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitMessage('');
  };

  return (
    <div className="transaction-form-container">
      <div className="transaction-form-wrapper">
        {/* Header */}
        <div className="transaction-form-header">
          <div className="header-icon">
            <CreditCard className="icon-large" />
          </div>
          <h1 className="form-title">Transaction Analysis Form</h1>
          <p className="form-subtitle">
            Enter transaction details for fraud detection analysis
          </p>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
            {/* Transaction ID and User ID */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <CreditCard className="label-icon" />
                  Transaction ID
                </label>
                <input
                  {...register('transactionId')}
                  type="text"
                  className={`form-input ${
                    errors.transactionId ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter transaction ID"
                />
                {errors.transactionId && (
                  <p className="error-message">
                    {errors.transactionId.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  User ID
                </label>
                <input
                  {...register('userId')}
                  type="text"
                  className={`form-input ${
                    errors.userId ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter user ID"
                />
                {errors.userId && (
                  <p className="error-message">{errors.userId.message}</p>
                )}
              </div>
            </div>

            {/* Transaction Amount and Type */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign className="label-icon" />
                  Transaction Amount
                </label>
                <input
                  {...register('transactionAmount')}
                  type="number"
                  step="0.01"
                  className={`form-input ${
                    errors.transactionAmount ? 'form-input-error' : ''
                  }`}
                  placeholder="0.00"
                />
                {errors.transactionAmount && (
                  <p className="error-message">
                    {errors.transactionAmount.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CreditCard className="label-icon" />
                  Transaction Type
                </label>
                <select
                  {...register('transactionType')}
                  className={`form-select ${
                    errors.transactionType ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select transaction type</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.transactionType && (
                  <p className="error-message">
                    {errors.transactionType.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamp and Account Balance */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Timestamp (Auto-updated)
                </label>
                <div className="auto-field-container">
                  <input
                    {...register('timestamp')}
                    type="datetime-local"
                    className="form-input auto-field"
                    readOnly
                    title="Automatically updated every second"
                  />
                  <div className="auto-indicator">
                    <Clock className="auto-icon spinning" />
                    <span className="auto-text">Live</span>
                  </div>
                </div>
                {errors.timestamp && (
                  <p className="error-message">{errors.timestamp.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <DollarSign className="label-icon" />
                  Account Balance
                </label>
                <input
                  {...register('accountBalance')}
                  type="number"
                  step="0.01"
                  className={`form-input ${
                    errors.accountBalance ? 'form-input-error' : ''
                  }`}
                  placeholder="0.00"
                />
                {errors.accountBalance && (
                  <p className="error-message">
                    {errors.accountBalance.message}
                  </p>
                )}
              </div>
            </div>

            {/* Device Type and Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Smartphone className="label-icon" />
                  Device Type
                </label>
                <select
                  {...register('deviceType')}
                  className={`form-select ${
                    errors.deviceType ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select device type</option>
                  {deviceTypes.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
                {errors.deviceType && (
                  <p className="error-message">{errors.deviceType.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Navigation className="label-icon" />
                  Location (GPS Auto-detected)
                </label>
                <div className="auto-field-container">
                  <input
                    {...register('location')}
                    type="text"
                    className="form-input auto-field"
                    readOnly
                    title="Automatically detected using GPS"
                  />
                  <div className="auto-indicator">
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="auto-icon spinning" />
                        <span className="auto-text">Getting GPS...</span>
                      </>
                    ) : locationError ? (
                      <>
                        <AlertTriangle className="auto-icon error" />
                        <span className="auto-text error">Error</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="auto-icon success" />
                        <span className="auto-text success">GPS</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="refresh-btn"
                    onClick={refreshLocation}
                    disabled={isGettingLocation}
                    title="Refresh location"
                  >
                    <RotateCcw
                      className={`refresh-icon ${
                        isGettingLocation ? 'spinning' : ''
                      }`}
                    />
                  </button>
                </div>
                {locationError && (
                  <p className="error-message">{locationError}</p>
                )}
                {errors.location && (
                  <p className="error-message">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Merchant Category */}
            <div className="form-group">
              <label className="form-label">
                <Building className="label-icon" />
                Merchant Category
              </label>
              <select
                {...register('merchantCategory')}
                className={`form-select ${
                  errors.merchantCategory ? 'form-input-error' : ''
                }`}
              >
                <option value="">Select merchant category</option>
                {merchantCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.merchantCategory && (
                <p className="error-message">
                  {errors.merchantCategory.message}
                </p>
              )}
            </div>

            {/* IP Address Flag and Previous Fraudulent Activity */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Shield className="label-icon" />
                  IP Address Flag
                </label>
                <select
                  {...register('ipAddressFlag')}
                  className={`form-select ${
                    errors.ipAddressFlag ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select IP address flag</option>
                  {ipAddressFlags.map((flag) => (
                    <option key={flag} value={flag}>
                      {flag}
                    </option>
                  ))}
                </select>
                {errors.ipAddressFlag && (
                  <p className="error-message">
                    {errors.ipAddressFlag.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <AlertTriangle className="label-icon" />
                  Previous Fraudulent Activity
                </label>
                <select
                  {...register('previousFraudulentActivity')}
                  className={`form-select ${
                    errors.previousFraudulentActivity ? 'form-input-error' : ''
                  }`}
                >
                  <option value="">Select activity level</option>
                  {fraudulentActivityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.previousFraudulentActivity && (
                  <p className="error-message">
                    {errors.previousFraudulentActivity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`submit-message ${
                  submitMessage.includes('successfully') ? 'success' : 'error'
                }`}
              >
                {submitMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="reset-button"
                disabled={isSubmitting}
              >
                <RotateCcw className="button-icon" />
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="button-icon loading-spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Save className="button-icon" />
                    Submit for Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
