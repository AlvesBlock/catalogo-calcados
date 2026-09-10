const fallbackCloudName = 'chqz5dga'

export function buildCloudinaryUrl(publicId: string, width = 600): string {
  if (!publicId.trim()) throw new Error('Cloudinary public ID is required')
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || fallbackCloudName
  const safeWidth = Math.max(1, Math.round(width))
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${safeWidth},c_limit/${encodeURI(publicId)}`
}
