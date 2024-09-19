const {
  createRequire
} = require('module');
const {
  readFile
} = require('node:fs/promises');
const {
  join
} = require('node:path');

/** @type {import('next').NextConfig} */

async function getPackageJson(module) {
  const entryPoint = require.resolve(module);
  const [nodeModulePath] = entryPoint.split(module);
  const packagePath = join(nodeModulePath, module, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  return packageJson;
}
async function getPackageVersion(module) {
  const packageJson = await getPackageJson(module);
  return packageJson.version;
}
const nextConfig = {
  images: {
    domains: ['mfyamxpbtxomfcputjzs.supabase.co']
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/store',
        permanent: true
      },
      // 如果有其他重定向规则，请保留它们
    ];
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/admin/:path*',
        destination: '/api/check-admin',
        has: [{
          type: 'header',
          key: 'x-is-admin-check'
        }]
      },
      {
        source: '/dashboard/admin/:path*',
        destination: '/dashboard/admin/:path*'
      },
      // 添加以下规则以确保 /api 路由正常工作
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  env: {
    // We'll set this dynamically
  },
  webpack: config => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        module: false,
        'stream/promises': false
      }
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false
    };
    return config;
  },
  swcMinify: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

// Dynamically set the NEXT_PUBLIC_PGLITE_VERSION
module.exports = async () => {
  nextConfig.env = {
    NEXT_PUBLIC_PGLITE_VERSION: await getPackageVersion('@electric-sql/pglite')
  };
  return nextConfig;
};