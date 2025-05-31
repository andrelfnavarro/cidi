import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Get the bucket name from environment variable or use default
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'treatment-files';

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
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
    
    // Create a signed URL that's valid for 60 minutes
    const { data: url, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60); // 60 minutes
      
    if (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json(
        { error: 'Error generating signed URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ signedUrl: url.signedUrl });
  } catch (error) {
    console.error('Exception in presigned URL API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}