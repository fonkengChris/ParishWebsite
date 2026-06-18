# Donations Feature Setup Guide

This guide will help you set up the donations feature with PayPal and MTN Mobile Money payment methods.

## Overview

The donations feature allows parishioners to make donations through two payment methods:
1. **PayPal** - For international payments (USD, EUR)
2. **MTN Mobile Money** - For local payments in Cameroon (XAF)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install axios
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

#### PayPal Configuration

```env
# PayPal Settings
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # Use 'sandbox' for testing, 'live' for production

# Frontend URL (for PayPal redirects)
FRONTEND_URL=http://localhost:3000  # Update for production (e.g., https://yourdomain.com)
```

#### MTN Mobile Money Configuration

```env
# MTN Mobile Money API Settings (Cameroon)
MTN_API_KEY=your_mtn_api_key
MTN_API_SECRET=your_mtn_api_secret
MTN_SUBSCRIPTION_KEY=your_mtn_subscription_key
MTN_API_USER_UUID=your_api_user_uuid  # Optional: API User UUID from MTN developer portal
MTN_ENVIRONMENT=sandbox  # Use 'sandbox' for testing, 'production' for production
MTN_CURRENCY=XAF  # Currency code (default: XAF for Cameroon). For sandbox, check MTN documentation for supported currencies

# Backend URL (for MTN callbacks)
BACKEND_URL=http://localhost:5000  # Update for production
```

**Note:** The `MTN_API_USER_UUID` is optional. If you've created an API User in the MTN developer portal, include the UUID here. Otherwise, the system will use the standard token endpoint.

#### General Settings

```env
# Parish Information (used in receipts)
PARISH_NAME=Your Parish Name
PARISH_CONTACT_EMAIL=info@yourparish.cm
```

### 3. PayPal Setup

1. **Create a PayPal Business Account**
   - Go to https://www.paypal.com/business
   - Sign up for a business account

2. **Get API Credentials**
   - Log in to PayPal Developer Dashboard: https://developer.paypal.com/
   - **For Sandbox**: Go to "My Apps & Credentials" → "Sandbox" tab
   - **For Production**: Go to "My Apps & Credentials" → "Live" tab
   - Create a new app (choose "Merchant" type)
   - Copy the Client ID and Secret
   - **IMPORTANT**: 
     - Sandbox credentials are for testing only
     - Production/Live credentials are for real payments
     - Never mix sandbox and live credentials

3. **Create Test Accounts for Sandbox Testing**
   - In PayPal Developer Dashboard, go to "Accounts" section
   - Click "Create Account" to create test accounts
   - **IMPORTANT**: You need TWO separate test accounts:
     - **Business/Seller Account**: This is the account that receives payments (your parish account)
     - **Personal/Buyer Account**: This is the account you'll use to test making payments
   - **CRITICAL**: Never use the same account for both seller and buyer. PayPal will show an error: "You are logging in to the account of the seller for this purchase"
   - When testing, log in with the **buyer account** to make donations
   - The **seller account** credentials are what you put in your `.env` file

4. **Configure Webhooks (Optional)**
   - In PayPal Developer Dashboard, set up webhooks
   - Point to: `https://yourdomain.com/api/donations/paypal/webhook`

### 4. MTN Mobile Money Setup

1. **Register for MTN Mobile Money API**
   - Visit MTN Mobile Money Developer Portal: https://momodeveloper.mtn.com/
   - Create an account and register your application
   - **Get your Subscription Key**:
     - Go to your Product/API in the developer portal
     - Navigate to the "Subscriptions" or "Keys" section
     - Copy the **Primary Key** or **Secondary Key** for the **Collection API**
     - This is your `MTN_SUBSCRIPTION_KEY` - make sure it's for Collection API (not Disbursement)
   - **Get your API Key and Secret**:
     - These are created when you set up your API User (see step 2)

2. **Create API User (REQUIRED)**
   - In the MTN developer portal, you MUST create an API User first
   - Go to "API Users" section in the developer portal
   - Create a new API User for your product
   - Copy the API User UUID (this is different from your API Key)
   - Add it to your `.env` file as `MTN_API_USER_UUID`
   - **Important**: The token endpoint requires the API User UUID in the path: `/collection/token/?{apiUserUuid}`
   - Without the API User UUID, authentication will fail

3. **Sandbox Testing**
   - Use sandbox credentials for testing
   - Test phone numbers are provided in the MTN developer portal
   - Ensure your reference IDs are in UUID v4 format (the system handles this automatically)

4. **Production Setup**
   - Complete MTN's verification process
   - Switch to production credentials
   - Update `MTN_ENVIRONMENT` to `production`

## Frontend Setup

No additional dependencies are required for the frontend. The donations page is already integrated.

## Testing

### PayPal Testing

1. **Create Test Accounts**
   - Go to https://developer.paypal.com/dashboard/accounts
   - Create at least TWO test accounts:
     - One **Business/Seller** account (receives payments)
     - One **Personal/Buyer** account (makes payments)
   - **IMPORTANT**: Use DIFFERENT accounts for seller and buyer
   - The seller account credentials go in your `.env` file
   - Use the buyer account to test making donations

2. **Testing Steps**
   - Start your application
   - Go to the donations page
   - Fill out the donation form
   - Click "Pay with PayPal"
   - **Log in with your BUYER test account** (NOT the seller account)
   - Complete the payment
   - You should be redirected back to the success page

3. **Common Error: "You are logging in to the account of the seller"**
   - This happens when you try to pay with the same account that's configured as the seller
   - **Root Cause**: The PayPal app credentials in your `.env` file are tied to a specific account. If you try to pay with that same account, PayPal blocks it.
   - **Solution Steps for Sandbox (Testing in Production or Local)**:
     1. Go to https://developer.paypal.com/dashboard/applications/sandbox
     2. Check which account your app is associated with (click on your app to see details)
     3. Make sure your app is created under a **Business/Seller** account
     4. In your `.env` file, use the **Sandbox** Client ID and Secret from this Business account's app
     5. Set `PAYPAL_MODE=sandbox` in your environment (even in production if testing)
     6. Go to https://developer.paypal.com/dashboard/accounts (Sandbox tab)
     7. Create a **separate Personal/Buyer** test account (different email, different account)
     8. When testing, **always log in with the Buyer account** (NOT the seller account)
     9. **Important**: Even in production, if using sandbox mode, you must use sandbox test accounts
   - **Solution Steps for Production (Live Mode)**:
     1. Go to https://developer.paypal.com/dashboard/applications/live
     2. Verify your production app is created under your **Business/Seller** account
     3. In your production `.env` file, use the **Live** Client ID and Secret from this Business account
     4. Set `PAYPAL_MODE=live` in your production environment
     5. **For Testing in Production**: Use a completely different PayPal account (not the business account) to test payments
     6. **For Real Users**: Real users will use their own PayPal accounts, so this error won't occur
   - **Important**: 
     - The app credentials in `.env` = Seller account (receives payments)
     - The account you log in with to pay = Buyer account (must be different!)
     - **Sandbox mode in production**: You must use sandbox test accounts, not real PayPal accounts
     - **Live mode**: Real users will use their own accounts, so this is only an issue when testing with your own account
   - **If you created a new app**: Make sure it's created under a Business account, not a Personal account
   - **Testing Checklist**:
     - ✅ `PAYPAL_MODE=sandbox` in your environment
     - ✅ Using Sandbox Client ID and Secret (not Live)
     - ✅ Created separate Buyer test account in sandbox
     - ✅ Logging in with Buyer account (not Seller account)

4. **Test with Different Scenarios**
   - Test with different amounts
   - Test with different currencies (USD, EUR)
   - Test cancellation flow
   - Test error scenarios

### MTN Mobile Money Testing

1. Use sandbox environment
2. Use test phone numbers provided by MTN
3. Test payment approval flow

## Payment Flow

### PayPal Flow

1. User fills donation form and selects PayPal
2. System creates PayPal order
3. User is redirected to PayPal for payment
4. After payment, user is redirected back to success page
5. Backend captures payment and sends receipt email

### MTN Mobile Money Flow

1. User fills donation form and selects MTN Mobile Money
2. User provides MTN phone number
3. System creates payment request
4. User receives payment request on their phone
5. User approves payment on phone
6. System polls payment status
7. On success, receipt email is sent

## API Endpoints

### Create PayPal Order
```
POST /api/donations/paypal/create-order
```

### Capture PayPal Payment
```
POST /api/donations/paypal/capture
```

### Create MTN Payment Request
```
POST /api/donations/mtn/create-request
```

### Check MTN Payment Status
```
POST /api/donations/mtn/check-status
```

### MTN Callback (Webhook)
```
POST /api/donations/mtn/callback
```

## Security Notes

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production
4. **Validate all inputs** on both frontend and backend
5. **Use rate limiting** to prevent abuse
6. **Monitor payment logs** for suspicious activity

## Troubleshooting

### PayPal Issues

- **"PayPal credentials not configured"**: Check environment variables
- **"Failed to authenticate"**: Verify Client ID and Secret
- **Redirect not working**: Check FRONTEND_URL setting

### MTN Mobile Money Issues

- **"MTN Mobile Money credentials not configured"**: Check environment variables
- **"Failed to authenticate"**: 
  - Verify API Key, Secret, and Subscription Key are correct
  - **Most common issue**: Make sure you've created an API User in the MTN developer portal and added the `MTN_API_USER_UUID` to your `.env` file
  - Check that your Subscription Key matches the API product you're using (Collection API)
  - Verify you're using sandbox credentials for sandbox environment
- **"Invalid subscription key"** or **"Access denied due to invalid subscription key"**:
  - **This is a subscription key issue, not authentication**
  - Go to your MTN developer portal: https://momodeveloper.mtn.com/
  - Navigate to your Product/API
  - Copy the **Primary Key** or **Secondary Key** from the **Subscription Keys** section
  - Make sure you're using the key for the **Collection API** (not Disbursement or Remittance)
  - Verify the subscription is **Active** in the portal
  - The subscription key should be a long alphanumeric string
  - Double-check for any extra spaces or characters when copying
- **"Resource not found"**: 
  - Check that the API User UUID is correct
  - Verify the endpoint URL matches the MTN API documentation
- **"Currency not supported"**:
  - **Sandbox Issue**: MTN sandbox might not support XAF. Check your MTN developer portal for supported sandbox currencies
  - **Solution**: Set `MTN_CURRENCY` environment variable to a supported currency code
  - For Cameroon production, use 'XAF' (Central African CFA franc)
  - For sandbox testing, you might need to use a different currency code (check MTN documentation)
  - Common sandbox currencies: 'UGX' (Uganda), 'ZMW' (Zambia), or check your MTN developer portal
  - Verify the currency is supported in your MTN API product settings
- **Payment not completing**: Check callback URL configuration
- **Test your connection**: Use `GET /api/donations/mtn/test-connection` to diagnose authentication issues

## Support

For issues or questions:
- PayPal Support: https://developer.paypal.com/support/
- MTN Mobile Money Support: https://momodeveloper.mtn.com/support

