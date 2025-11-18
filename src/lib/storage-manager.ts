/**
 * Supabase Storage Manager
 * Handles uploading and retrieving large files (audio, images) from Supabase Storage
 * instead of storing them as Base64 in localStorage
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'truecrime-assets';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Initialize storage bucket (create if doesn't exist)
 */
export async function initializeBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Error creating bucket:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

/**
 * Convert Base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  // Remove data URI prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Upload Base64 data to Supabase Storage
 */
export async function uploadBase64(
  base64Data: string,
  fileName: string,
  mimeType: string = 'audio/mpeg'
): Promise<UploadResult> {
  try {
    // Convert Base64 to Blob
    const blob = base64ToBlob(base64Data, mimeType);

    // Generate unique file path
    const timestamp = Date.now();
    const filePath = `${timestamp}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      size: blob.size
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Upload audio data (Base64 or Blob)
 */
export async function uploadAudio(
  audioData: string | Blob,
  projectName: string
): Promise<UploadResult> {
  const fileName = `${projectName}-voiceover.mp3`;

  if (typeof audioData === 'string') {
    return uploadBase64(audioData, fileName, 'audio/mpeg');
  } else {
    // Direct blob upload
    const timestamp = Date.now();
    const filePath = `${timestamp}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, audioData, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      size: audioData.size
    };
  }
}

/**
 * Upload image data (Base64 or Blob)
 */
export async function uploadImage(
  imageData: string | Blob,
  fileName: string
): Promise<UploadResult> {
  const mimeType = 'image/png';

  if (typeof imageData === 'string') {
    return uploadBase64(imageData, fileName, mimeType);
  } else {
    // Direct blob upload
    const timestamp = Date.now();
    const filePath = `${timestamp}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageData, {
        contentType: mimeType,
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      size: imageData.size
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(filePaths: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) throw error;
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}

/**
 * Check if data is Base64 encoded
 */
export function isBase64Data(data: string): boolean {
  return data.startsWith('data:') || /^[A-Za-z0-9+/]+=*$/.test(data.substring(0, 100));
}

/**
 * Estimate size of Base64 string in bytes
 */
export function getBase64Size(base64: string): number {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  return Math.ceil((base64Data.length * 3) / 4);
}
