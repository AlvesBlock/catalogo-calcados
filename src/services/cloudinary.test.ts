import { describe, expect, it } from 'vitest'
import { buildCloudinaryUrl } from './cloudinary'

describe('buildCloudinaryUrl', () => {
  it('builds an optimized URL without folder prefix, version or extension', () => {
    expect(buildCloudinaryUrl('SAP000001-1', 400)).toBe(
      'https://res.cloudinary.com/chqz5dga/image/upload/f_auto,q_auto,w_400,c_limit/SAP000001-1',
    )
  })
  it('rejects an empty public ID', () => expect(() => buildCloudinaryUrl('')).toThrow())
})
