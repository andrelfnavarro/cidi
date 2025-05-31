import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Get the bucket name from environment variable or use default
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'treatment-files';

export async function POST(request: Request) {
  console.log('File upload request received');
  
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('Authentication failed: No user found');
    return NextResponse.json(
      { error: 'Unauthorized: You must be logged in' },
      { status: 401 }
    );
  }
  
  console.log('User authenticated:', user.id);

  try {
    console.log('Parsing formData...');
    const formData = await request.formData();
    const treatmentId = formData.get('treatmentId') as string;
    const file = formData.get('file') as File;
    
    console.log('FormData received:', { 
      treatmentId,
      fileReceived: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type 
    });
    
    const fileName = formData.get('fileName') as string || file.name;

    if (!treatmentId || !file) {
      console.log('Validation failed: Missing treatmentId or file');
      return NextResponse.json(
        { error: 'Treatment ID and file are required' },
        { status: 400 }
      );
    }

    // 1. Upload file to storage
    console.log(`Uploading to bucket: ${BUCKET_NAME}, path: ${treatmentId}/${Date.now()}-${file.name}`);
    
    const { data: fileData, error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${treatmentId}/${Date.now()}-${file.name}`, file);

    if (storageError) {
      console.error('Error uploading file to storage:', storageError);
      return NextResponse.json(
        { error: `Error uploading file to storage: ${storageError.message}` },
        { status: 500 }
      );
    }
    
    console.log('File uploaded successfully:', fileData);

    // 2. Create record in treatment_files table
    console.log('Creating database record...');
    const { data: recordData, error: dbError } = await supabase
      .from('treatment_files')
      .insert({
        treatment_id: treatmentId,
        file_path: fileData.path,
        file_name: fileName || file.name, 
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id,
      })
      .select();

    if (dbError) {
      console.error('Error saving file record to database:', dbError);
      // If DB insert fails, try to delete the file from storage
      await supabase.storage.from(BUCKET_NAME).remove([fileData.path]);
      return NextResponse.json(
        { error: `Error saving file record: ${dbError.message}` },
        { status: 500 }
      );
    }
    
    console.log('Database record created successfully:', recordData);

    return NextResponse.json({ success: true, file: recordData[0] });
  } catch (error) {
    console.error('Exception in upload file API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}