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
    return [{
      source: '/',
      destination: '/store',
      permanent: true
    }];
  },
  async rewrites() {
    return [{
      source: '/dashboard/admin/:path*',
      destination: '/api/check-admin',
      has: [{
        type: 'header',
        key: 'x-is-admin-check'
      }]
    }, {
      source: '/dashboard/admin/:path*',
      destination: '/dashboard/admin/:path*'
    }];
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
  swcMinify: false
};

// Dynamically set the NEXT_PUBLIC_PGLITE_VERSION
module.exports = async () => {
  nextConfig.env = {
    NEXT_PUBLIC_PGLITE_VERSION: await getPackageVersion('@electric-sql/pglite')
  };
  return nextConfig;
};