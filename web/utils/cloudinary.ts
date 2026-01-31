export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing. Please check CLOUD_NAME and UPLOAD_PRESET in .env file');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
            method: "POST",
            body: formData,
        }
        );


        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error instanceof Error 
            ? error 
            : new Error('Failed to upload file to Cloudinary');
    }
}
