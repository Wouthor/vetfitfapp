const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'googleapis', 'google-auth-library', '@react-pdf/renderer', '@anthropic-ai/sdk'],
    // Lettertypen voor de PDF worden via een bestandspad geladen; zorg dat ze mee gaan naar Vercel
    outputFileTracingIncludes: {
      '/api/pdf': ['./node_modules/@fontsource/anton/files/*.woff', './node_modules/@fontsource/archivo/files/archivo-latin-*-normal.woff', './node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-*-normal.woff'],
    },
  },

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
