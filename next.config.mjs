const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'googleapis', 'google-auth-library', '@react-pdf/renderer', '@anthropic-ai/sdk'],
  },
  transpilePackages: [
    '@supabase/supabase-js',
    '@supabase/ssr',
    '@supabase/auth-js',
    '@supabase/postgrest-js',
    '@supabase/realtime-js',
    '@supabase/storage-api',
    'jose',
    '@panva/hkdf',
    '@noble/hashes',
    '@noble/curves',
    'nanoid',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Transpileer alle node_modules voor iOS 12 (optional chaining, nullish coalescing, etc.)
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            compact: false,
            presets: [
              ['@babel/preset-env', {
                targets: { ios: '12' },
                exclude: ['transform-typeof-symbol'],
              }],
            ],
          },
        },
      })
    }
    return config
  },
}

export default nextConfig
