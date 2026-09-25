import { NextResponse } from 'next/server';
import { sendGrievanceStatusEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hazardId,
      hazardTitle,
      newStatus,
      citizenEmail,
      citizenName,
      locationAddress,
      ward,
      contractorTeam,
      scheduledDispatch,
      workOrderId
    } = body;

    const cleanEmail = (citizenEmail || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'No citizen email associated with this grievance report. Skipping email notification.'
      });
    }

    const cleanName = (citizenName || 'Civic Scout')
      .replace(/commissioner\s*/gi, '')
      .trim();

    const result = await sendGrievanceStatusEmail({
      toEmail: cleanEmail,
      hazardId: hazardId || 'HZ-REPORT',
      hazardTitle: hazardTitle || 'Infrastructure Defect',
      newStatus: newStatus || 'In progress',
      citizenName: cleanName,
      locationAddress: locationAddress || 'City Location',
      ward: ward || 'Ward Admin',
      contractorTeam,
      scheduledDispatch,
      workOrderId
    });

    return NextResponse.json({
      success: result.success,
      emailSent: result.success,
      recipient: cleanEmail,
      error: result.error,
      message: result.success
        ? `Official status update dispatched to ${cleanEmail} via Gmail SMTP.`
        : 'Status email could not be delivered.'
    });
  } catch (error: any) {
    console.error('Error in status-update notification API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch status notification.' },
      { status: 500 }
    );
  }
}
