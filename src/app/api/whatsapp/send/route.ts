import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendBulkWhatsAppMessages, validatePhoneNumber } from '@/lib/whatsapp/whatsapp';
import { getCurrentUser } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission (only admin and coach can send WhatsApp messages)
    if (currentUser.role !== 'admin' && currentUser.role !== 'coach') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permission to send WhatsApp messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phoneNumber, phoneNumbers, message, session, wahaUrl, wahaApiKey } = body;

    // Validate required fields
    if (!message || !session) {
      return NextResponse.json(
        { success: false, message: 'Message and session are required' },
        { status: 400 }
      );
    }

    // Handle single message
    if (phoneNumber) {
      if (!validatePhoneNumber(phoneNumber)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number' },
          { status: 400 }
        );
      }

      const result = await sendWhatsAppMessage({
        chatId: phoneNumber,
        text: message,
        session,
        wahaUrl,
        wahaApiKey,
      });

      if (result.success) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json(result, { status: 500 });
      }
    }

    // Handle bulk messages
    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      // Validate all phone numbers
      for (const recipient of phoneNumbers) {
        if (!recipient.phoneNumber || !validatePhoneNumber(recipient.phoneNumber)) {
          return NextResponse.json(
            { success: false, message: `Invalid phone number: ${recipient.phoneNumber || 'empty'}` },
            { status: 400 }
          );
        }
      }

      const result = await sendBulkWhatsAppMessages(phoneNumbers, message, session, wahaUrl, wahaApiKey);
      
      return NextResponse.json(
        {
          success: true,
          message: `Messages sent: ${result.success} successful, ${result.failed} failed`,
          data: result,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Either phoneNumber or phoneNumbers array is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in WhatsApp send API:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
