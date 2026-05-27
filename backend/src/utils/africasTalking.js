import axios from 'axios';

const AFRICASTALKING_API_URL = 'https://api.sandbox.africastalking.com/version1/messaging';

/**
 * Send OTP via SMS using Africa's Talking API
 * @param {string} phoneNumber - Phone number in 254XXXXXXXXX format
 * @param {string} otp - 6-digit OTP
 */
export async function sendOTPSMS(phoneNumber, otp) {
  try {
    const message = `Your Mkulima Exchange verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    const response = await axios.post(
      AFRICASTALKING_API_URL,
      {
        username: process.env.AFRICASTALKING_USERNAME,
        message: message,
        to: phoneNumber,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey: process.env.AFRICASTALKING_API_KEY,
        },
      }
    );

    if (response.data.SMSMessageData) {
      const recipients = response.data.SMSMessageData.Recipients;
      
      if (recipients && recipients.length > 0) {
        const recipient = recipients[0];
        
        if (recipient.status === 'Success' || recipient.statusCode === 101) {
          console.log(`✓ OTP sent to ${phoneNumber}`);
          return {
            success: true,
            messageId: recipient.messageId,
            phoneNumber: phoneNumber,
          };
        } else {
          console.error(`✗ SMS failed to ${phoneNumber}: ${recipient.statusMessage}`);
          return {
            success: false,
            error: recipient.statusMessage,
          };
        }
      }
    }

    return {
      success: false,
      error: 'No recipients in response',
    };
  } catch (error) {
    console.error('SMS Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Send generic SMS message
 */
export async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post(
      AFRICASTALKING_API_URL,
      {
        username: process.env.AFRICASTALKING_USERNAME,
        message: message,
        to: phoneNumber,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          apiKey: process.env.AFRICASTALKING_API_KEY,
        },
      }
    );

    if (response.data.SMSMessageData?.Recipients?.length > 0) {
      const recipient = response.data.SMSMessageData.Recipients[0];
      return recipient.status === 'Success' || recipient.statusCode === 101;
    }

    return false;
  } catch (error) {
    console.error('SMS Error:', error.message);
    return false;
  }
}

export default {
  sendOTPSMS,
  sendSMS,
};
