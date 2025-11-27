import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(path, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}