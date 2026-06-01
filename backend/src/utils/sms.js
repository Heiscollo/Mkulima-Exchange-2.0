import pkg from 'africastalking';

const AfricasTalking = pkg({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME
});

const sms = AfricasTalking.SMS;

/**
 * Send SMS message
 * @param {string} phone - Phone number in +254... format
 * @param {string} message - SMS message text
 */
export const sendSMS = async (phone, message) => {
  try {
    if (!phone || !message) {
      console.warn('SMS: Missing phone or message');
      return { success: false, error: 'Missing phone or message' };
    }

    const result = await sms.send({
      to: [phone],
      message: message,
    });

    console.log(`SMS sent to ${phone}: ${result}`);
    return { success: true, result };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order created notification to farmer in Swahili
 */
export const sendOrderCreatedNotification = async (farmerPhone, farmerName, quantity, unit, cropName, totalPrice) => {
  const message = `Habari ${farmerName}! Mnunuzi ameweka agizo la ${quantity} ${unit} ya ${cropName} yako kwa KES ${totalPrice}. Jibu ndani ya masaa 48. - Mkulima Exchange`;
  return sendSMS(farmerPhone, message);
};

/**
 * Send order accepted notification to buyer in Swahili
 */
export const sendOrderAcceptedNotification = async (buyerPhone, farmerName, quantity, unit, cropName, totalPrice) => {
  const message = `Habari! Mkulima ${farmerName} amekubali agizo lako la ${quantity} ${unit} ya ${cropName}. Tafadhali lipa KES ${totalPrice} kuendelea. - Mkulima Exchange`;
  return sendSMS(buyerPhone, message);
};

/**
 * Send order rejected notification to buyer in Swahili
 */
export const sendOrderRejectedNotification = async (buyerPhone, farmerName, cropName, reason) => {
  const message = `Pole! Mkulima ${farmerName} amekataa agizo lako la ${cropName}. Sababu: ${reason}. Tafadhali tafuta orodha nyingine. - Mkulima Exchange`;
  return sendSMS(buyerPhone, message);
};

/**
 * Send counter offer notification to buyer in Swahili
 */
export const sendCounterOfferNotification = async (buyerPhone, farmerName, counterPrice, unit, totalPrice, counterRound) => {
  const message = `Habari! Mkulima ${farmerName} amependekeza bei mpya: KES ${counterPrice} kwa ${unit}. Jumla: KES ${totalPrice}. Raundi ${counterRound} ya 3. Jibu kupitia Mkulima Exchange. - Mkulima Exchange`;
  return sendSMS(buyerPhone, message);
};

/**
 * Send counter accepted notification to farmer in Swahili
 */
export const sendCounterAcceptedNotification = async (farmerPhone, farmerName, counterPrice, unit, totalPrice) => {
  const message = `Habari ${farmerName}! Mnunuzi amekubali bei yako ya KES ${counterPrice} kwa ${unit}. Jumla: KES ${totalPrice}. Subiri malipo. - Mkulima Exchange`;
  return sendSMS(farmerPhone, message);
};

/**
 * Send counter rejected notification to farmer in Swahili
 */
export const sendCounterRejectedNotification = async (farmerPhone, farmerName, counterRound, hasMoreRounds) => {
  const roundsMessage = hasMoreRounds ? 'Bado una raundi moja ya mazungumzo.' : 'Mazungumzo yameisha.';
  const message = `Habari ${farmerName}! Mnunuzi amekataa bei yako. ${roundsMessage} - Mkulima Exchange`;
  return sendSMS(farmerPhone, message);
};

/**
 * Send buyer counter offer notification to farmer in Swahili
 */
export const sendBuyerCounterNotification = async (farmerPhone, farmerName, offeredPrice, unit, totalPrice, counterRound) => {
  const message = `Habari ${farmerName}! Mnunuzi amependekeza bei mpya: KES ${offeredPrice} kwa ${unit}. Jumla: KES ${totalPrice}. Raundi ${counterRound} ya 3. - Mkulima Exchange`;
  return sendSMS(farmerPhone, message);
};

/**
 * Send expired order notification to farmer in Swahili
 */
export const sendOrderExpiredFarmerNotification = async (farmerPhone, cropName) => {
  const message = `Agizo la ${cropName} limeisha muda wake bila jibu. Orodha yako iko hai. - Mkulima Exchange`;
  return sendSMS(farmerPhone, message);
};

/**
 * Send expired order notification to buyer in Swahili
 */
export const sendOrderExpiredBuyerNotification = async (buyerPhone, cropName) => {
  const message = `Agizo lako la ${cropName} limeisha muda wake. Tafadhali jaribu tena. - Mkulima Exchange`;
  return sendSMS(buyerPhone, message);
};

