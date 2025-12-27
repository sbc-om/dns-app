import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getCurrentUser } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extensionFromMime = (mime: string): string => {
      switch (mime) {
        case 'image/jpeg':
          return 'jpg';
        case 'image/png':
          return 'png';
        case 'image/webp':
          return 'webp';
        case 'image/gif':
          return 'gif';
        default:
          return 'bin';
      }
    };

    const sanitizeBaseName = (name: string): string =>
      name
        .trim()
        .replace(/\.[^/.]+$/, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .slice(0, 80) || 'image';

    // Create unique filename (ensure extension matches actual MIME)
    const timestamp = Date.now();
    const safeBase = sanitizeBaseName(file.name);
    const ext = extensionFromMime(file.type);
    const filename = `${user.id}-${timestamp}-${safeBase}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'data', 'uploads', 'images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/images/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
