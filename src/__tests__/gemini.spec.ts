import { describe, expect, it, vi } from 'vitest'

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor() {}
  },
}))

describe('gemini helper', () => {
  it('can be imported without an active pinia instance', async () => {
    await expect(import('../utils/gemini')).resolves.toBeDefined()
  })
})
