import axios from 'axios';

const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';

export interface SendMessageRequest {
  chatId: string;
  text: string;
  session: string;
  wahaUrl?: string;
  wahaApiKey?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Format phone number to WhatsApp format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove unnecessary characters
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // Add 968 prefix if not present (Oman country code)
  if (!cleaned.startsWith('968')) {
    cleaned = '968' + cleaned;
  }
  
  // Add @c.us if not present
  if (!cleaned.includes('@')) {
    return `${cleaned}@c.us`;
  }
  
  return cleaned;
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const apiUrl = data.wahaUrl || WAHA_API_URL;
    const apiKey = data.wahaApiKey || WAHA_API_KEY;
    
    const response = await axios.post(
      `${apiUrl}/api/sendText`,
      {
        chatId: formatPhoneNumber(data.chatId),
        text: data.text,
        session: data.session,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
      }
    );

    return {
      success: true,
      message: 'Message sent successfully',
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error sending message:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error sending message',
      data: null,
    };
  }
}

/**
 * Validate phone number
 * Accepts both Omani numbers (8 digits) and international format (11+ digits with 968)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  // Accept 8 digits (local Omani number) or 10-15 digits (international format)
  return cleaned.length === 8 || (cleaned.length >= 10 && cleaned.length <= 15);
}

/**
 * Send bulk WhatsApp messages
 */
export async function sendBulkWhatsAppMessages(
  recipients: Array<{ phoneNumber: string; name: string }>,
  message: string,
  session: string,
  wahaUrl?: string,
  wahaApiKey?: string
): Promise<{
  success: number;
  failed: number;
  results: Array<{ phoneNumber: string; name: string; success: boolean; error?: string }>;
}> {
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    try {
      const result = await sendWhatsAppMessage({
        chatId: recipient.phoneNumber,
        text: message,
        session,
        wahaUrl,
        wahaApiKey,
      });

      if (result.success) {
        successCount++;
        results.push({
          phoneNumber: recipient.phoneNumber,
          name: recipient.name,
          success: true,
        });
      } else {
        failedCount++;
        results.push({
          phoneNumber: recipient.phoneNumber,
          name: recipient.name,
          success: false,
          error: result.message,
        });
      }

      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      failedCount++;
      results.push({
        phoneNumber: recipient.phoneNumber,
        name: recipient.name,
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    results,
  };
}
