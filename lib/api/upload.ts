import apiClient from './client';
import type { ApiSuccess } from '@/types/api';

export interface UploadedFileDto {
  url: string;
  key?: string;
  size?: number;
  mimeType?: string;
}

/**
 * POST /admin/upload
 * Uploads a single file using multipart/form-data and returns the hosted URL.
 * The backend handles storage (Cloudinary / S3 / local) and returns { url }.
 */
export async function uploadFile(file: File, fieldName = 'file'): Promise<string> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await apiClient.post<ApiSuccess<UploadedFileDto>>(
    '/admin/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data.data.url;
}
