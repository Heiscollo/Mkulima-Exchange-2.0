// ============================================================================
// Safaricom Daraja M-Pesa Integration
// OAuth token generation, STK Push, and B2C payment handling
// Used for the Mkulima Exchange Escrow Payment System
// ============================================================================

import axios from 'axios';

// Daraja sandbox URLs
const OAUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const B2C_URL = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get OAuth token from Daraja API
 * Required for all other M-Pesa API calls
 * @returns {Promise<string>} - Bearer token for M-Pesa API
 */
export const getDarajaToken = async () => {
  try {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 300000) {
      console.log('✓ Using cached Daraja token');
      return cachedToken;
    }

    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;

    if (!key || !secret) {
      throw new Error('Missing M-Pesa consumer credentials in environment');
    }

    // Create Basic Auth header: base64(key:secret)
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    console.log('🔐 Requesting new Daraja token...');
    const response = await axios.get(OAUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    });

    cachedToken = response.data.access_token;
    // Token expires in 3600 seconds, store expiry time
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

    console.log('✓ Daraja token received successfully');
    return cachedToken;
  } catch (error) {
    console.error('❌ Daraja OAuth Error:', error.message);
    
    // More specific error messages for debugging
    if (error.response?.status === 401) {
      throw new Error('Invalid M-Pesa credentials. Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Daraja API timeout. Check internet connection.');
    }
    throw error;
  }
};

/**
 * Generate STK Push password
 * Format: Base64(ShortCode + Passkey + Timestamp)
 * Timestamp format: YYYYMMDDHHmmss
 * @returns {object} - { password, timestamp }
 */
const generateStkPassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    throw new Error('Missing MPESA_SHORTCODE or MPESA_PASSKEY in environment');
  }

  // Base64 encode: shortcode + passkey + timestamp
  const stringToEncode = `${shortcode}${passkey}${timestamp}`;
  const password = Buffer.from(stringToEncode).toString('base64');

  return { password, timestamp };
};

/**
 * Initiate STK Push (prompt customer to enter M-Pesa PIN)
 * This is the entry point for payment - buyer's phone will prompt for PIN
 * 
 * @param {object} paymentData - Payment details
 *   - phone: Buyer's phone number in +254XXXXXXXXX format
 *   - amount: Total amount to charge (in KES)
 *   - orderId: Order ID for tracking
 *   - cropName: Name of crop being purchased (for SMS reference)
 * @returns {Promise<object>} - { CheckoutRequestID, merchantRequestId, responseCode, message }
 */
export const initiateStkPush = async ({ phone, amount, orderId, cropName }) => {
  try {
    console.log(`📱 Initiating STK Push for order ${orderId}...`);

    // Validate inputs
    if (!phone || !amount || !orderId) {
      throw new Error('Missing required parameters: phone, amount, orderId');
    }

    // 🔍 DEBUG: Check environment variables are loaded
    console.log('ENV Check:', {
      shortcode: process.env.MPESA_SHORTCODE ? 'SET' : 'MISSING',
      passkey: process.env.MPESA_PASSKEY ? 'SET' : 'MISSING',
      callback: process.env.MPESA_CALLBACK_URL ? 'SET' : 'MISSING',
    });

    // Get fresh OAuth token
    const token = await getDarajaToken();
    
    // 🔍 DEBUG: Check if token was received
    console.log('Daraja Token:', token ? 'RECEIVED' : 'MISSING');
    
    const { password, timestamp } = generateStkPassword();

    // Normalize phone to 254XXXXXXXXX format
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = '254' + phone.slice(1);
    } else if (phone.startsWith('+')) {
      normalizedPhone = phone.slice(1);
    }
    phone = normalizedPhone;

    const shortcode = process.env.MPESA_SHORTCODE;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !callbackUrl) {
      throw new Error('Missing MPESA_SHORTCODE or MPESA_CALLBACK_URL in environment');
    }

    // Prepare STK Push request
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phone, // Buyer's phone
      PartyB: shortcode, // Mkulima shortcode
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: 'MkulimaExchange',
      TransactionDesc: `Payment for ${cropName || 'farm produce'}`,
    };

    // 🔍 DEBUG: Log all STK Push parameters before sending
    console.log('STK Push Parameters:', {
      BusinessShortCode: payload.BusinessShortCode,
      Timestamp: payload.Timestamp,
      Password: payload.Password ? `${payload.Password.substring(0, 10)}...` : 'MISSING',
      Amount: payload.Amount,
      PartyA: payload.PartyA,
      PartyB: payload.PartyB,
      PhoneNumber: payload.PhoneNumber,
      CallBackURL: payload.CallBackURL,
      AccountReference: payload.AccountReference,
      TransactionDesc: payload.TransactionDesc,
    });

    console.log('📤 Sending STK Push request to Daraja...');
    console.log(`   Phone: ${phone}, Amount: ${amount} KES, Order: ${orderId}`);

    const response = await axios.post(STK_PUSH_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✓ STK Push initiated successfully - CheckoutRequestID: ${response.data.CheckoutRequestID}`);

    return {
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      message: response.data.ResponseDescription,
    };
  } catch (error) {
    console.error('❌ STK Push Error:', error.message);
    
    // Handle specific Daraja errors
    if (error.response?.data) {
      const darajaError = error.response.data;
      return {
        success: false,
        error: darajaError.errorMessage || darajaError.ResponseDescription || error.message,
        errorCode: darajaError.errorCode || darajaError.ResponseCode,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * B2C Payment - Transfer money to farmer (simulated for now)
 * For go-live: This will actually transfer money to farmer's M-Pesa account
 * Currently: We record it as transferred and send SMS confirmation
 * 
 * @param {object} paymentData - Payment details
 *   - phone: Farmer's phone number
 *   - amount: Amount to transfer (in KES)
 *   - farmerName: Farmer's name for SMS
 *   - cropName: Crop name for SMS
 * @returns {Promise<object>} - { success: true/false, transactionId, message }
 */
export const releasePaymentB2C = async ({ phone, amount, farmerName, cropName }) => {
  try {
    console.log(`💳 [SIMULATED B2C] Releasing KES ${amount} to farmer ${farmerName}...`);

    if (!phone || !amount || !farmerName) {
      throw new Error('Missing required parameters: phone, amount, farmerName');
    }

    // Validate phone format
    if (!phone.includes('254') && !phone.startsWith('+')) {
      throw new Error('Invalid phone format. Use +254XXXXXXXXX');
    }

    // In sandbox/simulation: Generate a fake transaction ID
    const transactionId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    console.log(`✓ [SIMULATION] B2C Transaction recorded: ${transactionId}`);
    console.log(`   Recipient: ${phone}, Amount: ${amount} KES`);
    console.log(`   Note: Actual M-Pesa transfer will be implemented at go-live`);

    return {
      success: true,
      transactionId,
      message: `Simulated B2C transfer of KES ${amount} to ${farmerName}`,
      statusDescription: 'Transferred successfully',
    };
  } catch (error) {
    console.error('❌ B2C Payment Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Parse Daraja Callback Response
 * Handles the webhook data from M-Pesa after payment attempt
 * @param {object} callbackBody - Full callback body from Daraja
 * @returns {object} - Parsed callback data
 */
export const parseDarajaCallback = (callbackBody) => {
  try {
    if (!callbackBody.stkCallback) {
      throw new Error('Invalid callback structure');
    }

    const callback = callbackBody.stkCallback;
    const resultCode = callback.ResultCode;
    const success = resultCode === 0;

    let mpesaReceiptNumber = null;
    let amount = null;
    let timestamp = null;
    let phoneNumber = null;

    if (success && callback.CallbackMetadata?.Item) {
      // Extract metadata from callback
      const items = callback.CallbackMetadata.Item;
      const itemMap = {};

      items.forEach((item) => {
        itemMap[item.Name] = item.Value;
      });

      mpesaReceiptNumber = itemMap.MpesaReceiptNumber;
      amount = itemMap.Amount;
      timestamp = itemMap.TransactionDate;
      phoneNumber = itemMap.PhoneNumber;
    }

    return {
      success,
      resultCode,
      resultDescription: callback.ResultDesc,
      checkoutRequestId: callback.CheckoutRequestID,
      merchantRequestId: callback.MerchantRequestID,
      mpesaReceiptNumber,
      amount,
      timestamp,
      phoneNumber,
    };
  } catch (error) {
    console.error('Error parsing Daraja callback:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getDarajaToken,
  initiateStkPush,
  releasePaymentB2C,
  parseDarajaCallback,
};
