const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
let FileStore;
try {
  FileStore = require('metro-cache').FileStore;
} catch {
  // Expo getDefaultConfig handles caching by default if metro-cache is not found
}

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

const exclusionPattern =
  /[/\\](DaloaDelivery|DaloaMarket-v2|partners\.daloamarket\.com|docs\.daloamarket\.ci|status\.daloamarket\.ci|tuto\.daloamarket\.com|screeshots_app|docs|apps[/\\]daloamarket)([/\\]|$)/;

const currentBlockList = config.resolver.blockList;
config.resolver.blockList = Array.isArray(currentBlockList)
  ? [...currentBlockList, exclusionPattern]
  : currentBlockList
    ? [currentBlockList, exclusionPattern]
    : [exclusionPattern];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@daloa/types': path.resolve(projectRoot, 'packages/types/src/index.ts'),
  '@daloa/config': path.resolve(projectRoot, 'packages/config/src/index.ts'),
  '@daloa/utils': path.resolve(projectRoot, 'packages/utils/src/index.ts'),
  '@daloa/api': path.resolve(projectRoot, 'packages/api/src/index.ts'),
  '@daloa/ui': path.resolve(projectRoot, 'packages/ui/src/index.ts'),
  stream: path.resolve(projectRoot, 'src/shims/stream.js'),
  ws: path.resolve(projectRoot, 'src/shims/ws.js'),
  zlib: path.resolve(projectRoot, 'src/shims/zlib.js'),
};

const localPackageMap = {
  '@daloa/types': path.resolve(projectRoot, 'packages/types/src/index.ts'),
  '@daloa/config': path.resolve(projectRoot, 'packages/config/src/index.ts'),
  '@daloa/utils': path.resolve(projectRoot, 'packages/utils/src/index.ts'),
  '@daloa/api': path.resolve(projectRoot, 'packages/api/src/index.ts'),
  '@daloa/ui': path.resolve(projectRoot, 'packages/ui/src/index.ts'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (localPackageMap[moduleName]) {
    return {
      filePath: localPackageMap[moduleName],
      type: 'sourceFile',
    };
  }
  if (moduleName === 'ws') {
    return {
      filePath: path.resolve(projectRoot, 'src/shims/ws.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'zlib') {
    return {
      filePath: path.resolve(projectRoot, 'src/shims/zlib.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'stream') {
    return {
      filePath: path.resolve(projectRoot, 'src/shims/stream.js'),
      type: 'sourceFile',
    };
  }
  try {
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  } catch (err) {
    try {
      const resolved = require.resolve(moduleName, { paths: [projectRoot] });
      return {
        filePath: resolved,
        type: 'sourceFile',
      };
    } catch {
      throw err;
    }
  }
};

if (FileStore) {
  config.cacheStores = [
    new FileStore({
      root: path.join(projectRoot, '.metro-cache'),
    }),
  ];
}

module.exports = config;
