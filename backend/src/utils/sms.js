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

// ============================================================================
// ESCROW PAYMENT SYSTEM - SMS NOTIFICATIONS IN SWAHILI
// These SMS messages guide users through the payment and delivery confirmation
// ============================================================================

/**
 * Payment received and held in escrow
 * Sent to FARMER after buyer pays successfully
 */
export const sendPaymentHeldToFarmer = async (farmerPhone, farmerName, amount, cropName) => {
  const message = `Habari ${farmerName}! Mnunuzi amelipa KES ${amount} kwa ${cropName} yako. Pesa imehifadhiwa salama. Tuma mazao ili kupokea malipo yako. - Mkulima Exchange`;
  console.log(`📩 [FARMER] Payment held notification: ${farmerPhone}`);
  return sendSMS(farmerPhone, message);
};

/**
 * Payment received successfully
 * Sent to BUYER after M-Pesa confirms payment
 */
export const sendPaymentSuccessTobuyer = async (buyerPhone, amount, mpesaReceiptNumber) => {
  const message = `Malipo ya KES ${amount} yamefanikiwa. Nambari ya risiti: ${mpesaReceiptNumber}. Subiri mkulima atume mazao yako. - Mkulima Exchange`;
  console.log(`📩 [BUYER] Payment success notification: ${buyerPhone}`);
  return sendSMS(buyerPhone, message);
};

/**
 * Payment failed
 * Sent to BUYER if M-Pesa transaction fails
 */
export const sendPaymentFailureTobuyer = async (buyerPhone) => {
  const message = `Malipo hayakufanikiwa. Tafadhali jaribu tena. - Mkulima Exchange`;
  console.log(`📩 [BUYER] Payment failure notification: ${buyerPhone}`);
  return sendSMS(buyerPhone, message);
};

/**
 * Buyer confirmed delivery
 * Sent to FARMER after buyer confirms they received goods
 * Farmer needs to also confirm to release payment
 */
export const sendBuyerConfirmedDeliveryToFarmer = async (farmerPhone) => {
  const message = `Mnunuzi amethibitisha kupokea mazao. Thibitisha wewe pia ili kupokea malipo yako. - Mkulima Exchange`;
  console.log(`📩 [FARMER] Buyer delivery confirmation: ${farmerPhone}`);
  return sendSMS(farmerPhone, message);
};

/**
 * Farmer confirmed delivery
 * Sent to BUYER after farmer confirms they sent goods
 */
export const sendFarmerConfirmedDeliveryTobuyer = async (buyerPhone) => {
  const message = `Mkulima amethibitisha kutuma mazao. - Mkulima Exchange`;
  console.log(`📩 [BUYER] Farmer delivery confirmation: ${buyerPhone}`);
  return sendSMS(buyerPhone, message);
};

/**
 * Payment released to farmer
 * Sent to FARMER after both parties confirm delivery (escrow released)
 */
export const sendPaymentReleasedToFarmer = async (farmerPhone, farmerName, amount, mpesaNumber) => {
  const message = `Hongera ${farmerName}! KES ${amount} imetumwa kwenye M-Pesa yako ${mpesaNumber}. Asante kwa kutumia Mkulima Exchange! - Mkulima Exchange`;
  console.log(`📩 [FARMER] Payment released notification: ${farmerPhone}`);
  return sendSMS(farmerPhone, message);
};

/**
 * Order completed
 * Sent to BUYER after escrow is released and delivery is confirmed
 */
export const sendOrderCompletedTobuyer = async (buyerPhone) => {
  const message = `Manunuzi yamekamilika. Asante kwa kutumia Mkulima Exchange! Tafadhali acha ukaguzi kwa mkulima. - Mkulima Exchange`;
  console.log(`📩 [BUYER] Order completed notification: ${buyerPhone}`);
  return sendSMS(buyerPhone, message);
};

/**
 * Payment refunded
 * Sent to BUYER when admin refunds a disputed payment
 */
export const sendPaymentRefundedTobuyer = async (buyerPhone, amount) => {
  const message = `Malipo yako ya KES ${amount} yatarudishwa ndani ya siku 3-5. Pole kwa usumbufu. - Mkulima Exchange`;
  console.log(`📩 [BUYER] Payment refunded notification: ${buyerPhone}`);
  return sendSMS(buyerPhone, message);
};

/**
 * Dispute reported
 * Sent to FARMER when a dispute is filed (payment refunded)
 */
export const sendDisputeReportedToFarmer = async (farmerPhone) => {
  const message = `Agizo limeripotiwa. Timu yetu itawasiliana nawe hivi karibuni. - Mkulima Exchange`;
  console.log(`📩 [FARMER] Dispute reported notification: ${farmerPhone}`);
  return sendSMS(farmerPhone, message);
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

