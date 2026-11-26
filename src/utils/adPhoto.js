export const MAX_AD_PHOTO_FILE_SIZE = 10 * 1024 * 1024;

// Leave room in the 1 MiB Firestore document for the ad's other fields.
export const MAX_AD_PHOTO_DATA_LENGTH = 800 * 1024;

export async function compressAdPhoto(file) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const initialScale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));

    for (const scale of [1, 0.75, 0.5, 0.25]) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * initialScale * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * initialScale * scale));
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.85, 0.7, 0.55]) {
        const encoded = canvas.toDataURL('image/jpeg', quality);
        const photoData = encoded.slice('data:image/jpeg;base64,'.length);
        if (encoded.startsWith('data:image/jpeg;base64,') && photoData.length <= MAX_AD_PHOTO_DATA_LENGTH) {
          return photoData;
        }
      }
    }

    throw new Error('Unable to compress ad photo');
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
