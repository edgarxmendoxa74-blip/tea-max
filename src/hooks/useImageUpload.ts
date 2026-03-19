import { useState } from 'react';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      }

      // Validate file size (5MB limit for free tier usually)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      setUploadProgress(100);

      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    // Note: Deleting from Cloudinary requires a signed request (API Key + Secret)
    // which shouldn't be done on the frontend. This remains a stub for now.
    console.warn('Image deletion from Cloudinary requires backend integration or signed requests. URL not deleted:', imageUrl);
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress
  };
};