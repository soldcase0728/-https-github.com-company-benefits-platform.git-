#!/bin/bash

echo "🚀 Setting up Complete Benefits Platform..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p services/api-gateway/src
mkdir -p apps/web-employee/src/{pages,styles,components}
mkdir -p apps/web-admin/src/{pages,styles,components}
mkdir -p deploy/docker-compose
mkdir -p scripts

# Create API Gateway files
echo "📄 Creating API Gateway files..."

# Create admin portal styles
cat > apps/web-admin/src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
EOF

# Create admin tailwind config
cat > apps/web-admin/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create admin postcss config
cat > apps/web-admin/postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create admin next config
cat > apps/web-admin/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
EOF

echo "✅ Setup complete!"
echo ""
echo "Now copy all the artifacts from the conversation into their respective files:"
echo ""
echo "Required files to create manually:"
echo "1. deploy/docker-compose/compose.yml"
echo "2. services/api-gateway/Dockerfile"
echo "3. services/api-gateway/package.json"
echo "4. services/api-gateway/tsconfig.json"
echo "5. services/api-gateway/src/index.ts"
echo "6. apps/web-employee/Dockerfile"
echo "7. apps/web-employee/package.json"
echo "8. apps/web-employee/next.config.js"
echo "9. apps/web-employee/src/pages/index.tsx"
echo "10. apps/web-employee/src/pages/_app.tsx"
echo "11. apps/web-employee/src/styles/globals.css"
echo "12. apps/web-employee/tailwind.config.js"
echo "13. apps/web-employee/postcss.config.js"
echo "14. apps/web-admin/Dockerfile"
echo "15. apps/web-admin/package.json"
echo "16. apps/web-admin/src/pages/index.tsx"
echo "17. apps/web-admin/src/pages/_app.tsx"
echo "18. Makefile"
echo "19. .env"
echo ""
echo "After creating all files, run:"
echo "make dev-up"