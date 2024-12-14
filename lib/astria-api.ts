import { uploadMultipleImagesToBlob } from './blob-upload';

const ASTRIA_API_URL = 'https://api.astria.ai';
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY;
const FLUX_BASE_TUNE_ID = 1504944; // Flux1.dev tune ID

if (!ASTRIA_API_KEY) {
  throw new Error('ASTRIA_API_KEY is not set in environment variables');
}

export async function createAstriaModel(title: string, type: 'man' | 'woman', images: File[]) {
  try {
    // Upload images to Vercel Blob and get URLs
    const imageUrls = await uploadMultipleImagesToBlob(images);

    const response = await fetch(`${ASTRIA_API_URL}/tunes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tune: {
          title,
          base_tune_id: FLUX_BASE_TUNE_ID,
          model_type: 'lora',
          name: `ohwx ${type}`,
          image_urls: imageUrls,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error in createAstriaModel:', error);
    throw error;
  }
}

export async function getAstriaModelStatus(tuneId: string) {
  try {
    const response = await fetch(`${ASTRIA_API_URL}/tunes/${tuneId}`, {
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Error in getAstriaModelStatus:', error);
    throw error;
  }
}

export async function generateAstriaImage(tuneId: string, prompt: string) {
  try {
    const response = await fetch(`${ASTRIA_API_URL}/tunes/${FLUX_BASE_TUNE_ID}/prompts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: `<lora:${tuneId}:1> ${prompt}`,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return data.images[0].url;
  } catch (error) {
    console.error('Error in generateAstriaImage:', error);
    throw error;
  }
}

