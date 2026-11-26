import { firebaseConfig } from '../src/services/firebase.js';
import { MAX_AD_PHOTO_DATA_LENGTH } from '../src/utils/adPhoto.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }

  const id = new URL(req.url, 'http://localhost').searchParams.get('id');
  if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
    res.statusCode = 400;
    return res.end();
  }

  try {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/ads/${id}`);
    url.searchParams.set('key', firebaseConfig.apiKey);
    url.searchParams.set('mask.fieldPaths', 'photoData');
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      res.statusCode = response.status === 404 ? 404 : 502;
      return res.end();
    }

    const { fields } = await response.json();
    const photoData = fields?.photoData?.stringValue;
    if (!photoData || photoData.length > MAX_AD_PHOTO_DATA_LENGTH || !photoData.startsWith('/9j/')) {
      res.statusCode = 404;
      return res.end();
    }

    const photo = Buffer.from(photoData, 'base64');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', photo.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.end(req.method === 'HEAD' ? undefined : photo);
  } catch {
    res.statusCode = 502;
    return res.end();
  }
}
