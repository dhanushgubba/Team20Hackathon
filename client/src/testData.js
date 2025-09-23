// Test Data for Fraud Detection System
// Copy and paste these into the transaction form to test different scenarios

export const testTransactions = [
  // Test Case 1: Low Risk Transaction
  {
    transactionAmount: 25.99,
    accountBalance: 2500.0,
    transactionType: 'Purchase',
    deviceType: 'Web Browser',
    merchantCategory: 'Online Shopping',
  },

  // Test Case 2: Medium Risk Transaction
  {
    transactionAmount: 850.0,
    accountBalance: 1200.0,
    transactionType: 'Transfer',
    deviceType: 'Mobile App',
    merchantCategory: 'Financial Services',
  },

  // Test Case 3: High Risk Transaction (Large Amount)
  {
    transactionAmount: 7500.0,
    accountBalance: 8000.0,
    transactionType: 'Withdrawal',
    deviceType: 'ATM',
    merchantCategory: 'Banking',
  },

  // Test Case 4: Very High Risk Transaction (Exceeds Balance Ratio)
  {
    transactionAmount: 12000.0,
    accountBalance: 5000.0,
    transactionType: 'Transfer',
    deviceType: 'Other',
    merchantCategory: 'Other',
  },

  // Test Case 5: Moderate Risk Evening Transaction
  {
    transactionAmount: 3200.0,
    accountBalance: 4500.0,
    transactionType: 'Purchase',
    deviceType: 'Web Browser',
    merchantCategory: 'Electronics',
  },

  // Test Case 6: Regular Transaction
  {
    transactionAmount: 45.5,
    accountBalance: 1850.0,
    transactionType: 'Purchase',
    deviceType: 'Mobile App',
    merchantCategory: 'Groceries',
  },

  // Test Case 7: Suspicious Pattern
  {
    transactionAmount: 999.99,
    accountBalance: 1000.0,
    transactionType: 'Transfer',
    deviceType: 'Web Browser',
    merchantCategory: 'Gambling',
  },

  // Test Case 8: International Transaction
  {
    transactionAmount: 2200.0,
    accountBalance: 6500.0,
    transactionType: 'Purchase',
    deviceType: 'Mobile App',
    merchantCategory: 'Travel',
  },
];

// Quick Fill Instructions:
// 1. Open the Transaction Form
// 2. Copy the values from any test case above
// 3. Paste them into the corresponding form fields
// 4. Submit to see the fraud prediction

// Expected Results:
// - Test Case 1: Should be classified as "Safe" or "Low Risk"
// - Test Case 2: Should be classified as "Low to Medium Risk"
// - Test Case 3: Should be classified as "High Risk"
// - Test Case 4: Should be classified as "High Risk" or "Fraudulent"
// - Test Case 5: Should be classified as "Medium Risk"
// - Test Case 6: Should be classified as "Safe"
// - Test Case 7: Should be classified as "High Risk" (close to balance limit)
// - Test Case 8: Should be classified as "Medium Risk"
