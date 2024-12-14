import { put } from '@vercel/blob';

export async function uploadImageToBlob(file: File): Promise<string> {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const { url } = await put(filename, file, {
      access: 'public',
    });
    return url;
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    throw error;
  }
}

export async function uploadMultipleImagesToBlob(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImageToBlob(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images to Vercel Blob:', error);
    throw error;
  }
}

