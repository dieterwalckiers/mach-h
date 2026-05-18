/* eslint-disable @typescript-eslint/no-var-requires */
// Note: CommonJS style is required for this file to work with Vercel edge function runtime
import { createClient } from '@sanity/client'

export default createClient({
    projectId: 'x6sfouap',
    dataset: 'production',
    useCdn: true, // set to `false` to bypass the edge cache
    apiVersion: '2023-10-14', // use current date (YYYY-MM-DD) to target the latest API version
    // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
});