import { NextResponse } from 'next/server';
import {
  getAllHazards,
  addNewHazard,
  updateExistingHazard,
  deleteExistingHazard
} from '@/lib/hazardStore';
import { HazardReport } from '@/types/hazard';

export async function GET() {
  try {
    const hazards = getAllHazards();
    return NextResponse.json(
      {
        success: true,
        hazards,
        timestamp: Date.now()
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error: any) {
    console.error('Error fetching hazards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve hazards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hazard = body.hazard as HazardReport;

    if (!hazard || !hazard.id || !hazard.title) {
      return NextResponse.json(
        { success: false, error: 'Invalid hazard payload' },
        { status: 400 }
      );
    }

    const updatedList = addNewHazard(hazard);
    return NextResponse.json({
      success: true,
      hazards: updatedList,
      createdId: hazard.id,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error creating hazard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hazard' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const hazard = body.hazard as HazardReport;

    if (!hazard || !hazard.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid hazard update payload' },
        { status: 400 }
      );
    }

    const updatedList = updateExistingHazard(hazard);
    return NextResponse.json({
      success: true,
      hazards: updatedList,
      updatedId: hazard.id,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error updating hazard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hazard' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Hazard ID is required' },
        { status: 400 }
      );
    }

    const updatedList = deleteExistingHazard(id);
    return NextResponse.json({
      success: true,
      hazards: updatedList,
      deletedId: id,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error deleting hazard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hazard' },
      { status: 500 }
    );
  }
}
