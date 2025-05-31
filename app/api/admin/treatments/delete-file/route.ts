import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Get the bucket name from environment variable or use default
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'treatment-files';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }
    
    // Get the file record to obtain the storage path
    const { data: fileRecord, error: fetchError } = await supabase
      .from('treatment_files')
      .select('file_path')
      .eq('id', fileId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching file record:', fetchError);
      return NextResponse.json(
        { error: 'Error fetching file record' },
        { status: 500 }
      );
    }
    
    if (!fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileRecord.file_path]);
      
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue to delete the DB record even if storage deletion fails
    }
    
    // Delete the file record from database
    const { error: dbError } = await supabase
      .from('treatment_files')
      .delete()
      .eq('id', fileId);
      
    if (dbError) {
      console.error('Error deleting file record:', dbError);
      return NextResponse.json(
        { error: 'Error deleting file record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in delete file API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}