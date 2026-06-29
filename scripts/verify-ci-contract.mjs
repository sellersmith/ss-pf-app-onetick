import fs from 'fs'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requiredFiles = [
  'README.md',
  'Jenkinsfile',
  'docs/devops-handoff.md',
  'scripts/build-admin-artifact.mjs',
  'scripts/package-app-platform-admin-artifact.mjs',
  'scripts/package-app-platform-artifact.mjs',
  'scripts/deploy-app-platform-admin-artifact.mjs',
  '.github/workflows/app-platform-artifact.yml',
  'apps/onetick/package.json',
  'apps/onetick/src/admin/runtime-entry.tsx',
  'apps/onetick/src/admin/runtime-loader.tsx',
  'apps/onetick/vite.admin-runtime.config.mts',
]

const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const onetickPackageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'apps/onetick/package.json'), 'utf8'))
const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/app-platform-artifact.yml'), 'utf8')
const packageArtifactScript = fs.readFileSync(path.join(repoRoot, 'scripts/package-app-platform-artifact.mjs'), 'utf8')
const adminRuntimeEntry = fs.readFileSync(path.join(repoRoot, 'apps/onetick/src/admin/runtime-entry.tsx'), 'utf8')
const requiredScripts = [
  'build:artifact',
  'package:artifact',
  'build:admin-artifact',
  'package:admin-artifact',
  'deploy:admin-artifact',
  'deploy:admin-artifact:dry-run',
]

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(repoRoot, file))) {
    throw new Error(`Missing CI contract file: ${file}`)
  }
}

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`Missing package script: ${script}`)
  }
}

if (onetickPackageJson.scripts?.['build:admin-artifact'] !== 'npm run build:admin-runtime && npm run package:admin-artifact') {
  throw new Error('OneTick package is missing build:admin-artifact contract')
}

if (onetickPackageJson.scripts?.['build:artifact'] !== 'npm run build:admin-runtime && npm run package:artifact') {
  throw new Error('OneTick package is missing build:artifact contract')
}

if (onetickPackageJson.scripts?.['package:artifact'] !== 'node ../../scripts/package-app-platform-artifact.mjs') {
  throw new Error('OneTick package is missing package:artifact contract')
}

if (!workflow.includes('dist/artifacts/*.tgz.release.json')) {
  throw new Error('OneTick artifact workflow must upload release metadata')
}

if (!workflow.includes('APP_PLATFORM_ARTIFACT_VERSION') || !workflow.includes('${GITHUB_REF_NAME#onetick-v}')) {
  throw new Error('OneTick artifact workflow must derive artifact version from release tag')
}

if (!workflow.includes('Notify artifact failure')) {
  throw new Error('OneTick artifact workflow must include failure notification hook')
}

if (!packageArtifactScript.includes('writeReleaseMetadata')) {
  throw new Error('OneTick artifact package script must write release metadata')
}

if (!packageArtifactScript.includes('process.env.APP_PLATFORM_ARTIFACT_VERSION')) {
  throw new Error('OneTick artifact package script must accept APP_PLATFORM_ARTIFACT_VERSION')
}

if (!packageArtifactScript.includes("const adminEntrySource = 'src/admin/runtime-entry.tsx'") || !packageArtifactScript.includes('entrySource: adminEntrySource')) {
  throw new Error('OneTick artifact package script must publish admin.entrySource')
}

if (
  !adminRuntimeEntry.includes('AppProvider as PolarisAppProvider') ||
  !adminRuntimeEntry.includes('@shopify/polaris/locales/en.json') ||
  !adminRuntimeEntry.includes('<PolarisAppProvider i18n={polarisTranslations}>')
) {
  throw new Error('OneTick admin runtime must wrap its remote React root with Polaris AppProvider i18n')
}

if (onetickPackageJson.scripts?.['package:admin-artifact'] !== 'node ../../scripts/package-app-platform-admin-artifact.mjs --app onetick') {
  throw new Error('OneTick package is missing package:admin-artifact contract')
}

const requiredRootExports = {
  '.': './apps/onetick/src/index.ts',
  './manifest': './apps/onetick/manifest.ts',
  './admin-runtime-loader': './apps/onetick/src/admin/runtime-loader.tsx',
  './backend/plugin': './apps/onetick/src/backend/plugin.ts',
  './storefront/runtime-contract': './apps/onetick/src/storefront/runtime-contract.ts',
  './storefront/runtime-installer': './apps/onetick/src/storefront/runtime-installer.ts',
}

for (const [exportName, target] of Object.entries(requiredRootExports)) {
  if (packageJson.exports?.[exportName] !== target) {
    throw new Error(`OneTick root package export ${exportName} must point to ${target}`)
  }

  if (!fs.existsSync(path.join(repoRoot, target.replace(/^\.\//, '')))) {
    throw new Error(`OneTick root package export ${exportName} points to missing file ${target}`)
  }
}

process.stdout.write('ci-contract-ok\n')
