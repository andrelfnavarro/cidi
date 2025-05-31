import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the treatment id from params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Treatment ID is required' },
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

    // Fetch files related to the treatment
    const { data: files, error } = await supabase
      .from('treatment_files')
      .select('*')
      .eq('treatment_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching treatment files:', error);
      return NextResponse.json(
        { error: 'Error fetching treatment files' },
        { status: 500 }
      );
    }

    // If files exist, fetch uploader details separately
    if (files && files.length > 0) {
      // Get unique uploader IDs
      const uploaderIds = [...new Set(files.map(file => file.uploaded_by))];

      // Fetch user details
      const { data: dentists, error: dentistError } = await supabase
        .from('dentists') // Assuming you have a dentists table that maps to auth.users
        .select('id, name')
        .in('id', uploaderIds);

      if (dentistError) {
        console.error('Error fetching dentist details:', dentistError);
      } else if (dentists) {
        // Create a map of dentist IDs to their details
        const dentistMap = dentists.reduce((map, dentist) => {
          map[dentist.id] = dentist;
          return map;
        }, {});

        // Add dentist details to each file
        files.forEach(file => {
          file.uploaded_by_dentist = dentistMap[file.uploaded_by] || null;
        });
      }
    }

    return NextResponse.json({ files: files || [] });
  } catch (error) {
    console.error('Exception in fetch treatment files API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
