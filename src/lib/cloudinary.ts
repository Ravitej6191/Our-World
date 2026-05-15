const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const cloudinaryConfigured = !!(CLOUD_NAME && UPLOAD_PRESET);

export async function uploadToCloudinary(dataUri: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary not configured');
  // Images use 'image', audio and video both use 'video' resource type
  const resourceType = dataUri.startsWith('data:image/') ? 'image' : 'video';
  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error?.message ?? 'Upload failed');
  }
  const data = await res.json();
  return (data as any).secure_url as string;
}
