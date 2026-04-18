

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'googleapis', 'google-auth-library', '@react-pdf/renderer', '@anthropic-ai/sdk'],
  },
  // Transpileer Supabase-pakketten zodat iOS 12 de moderne syntax begrijpt
  transpilePackages: [
    '@supabase/supabase-js',
    '@supabase/ssr',
    '@supabase/auth-js',
    '@supabase/postgrest-js',
    '@supabase/realtime-js',
    '@supabase/storage-api',
  ],
}

export default nextConfig
