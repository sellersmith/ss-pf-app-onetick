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
  'scripts/deploy-app-platform-admin-artifact.mjs',
  'apps/onetick/package.json',
  'apps/onetick/src/admin/runtime-entry.tsx',
  'apps/onetick/src/admin/runtime-loader.tsx',
  'apps/onetick/vite.admin-runtime.config.mts',
]

const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const onetickPackageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'apps/onetick/package.json'), 'utf8'))
const requiredScripts = [
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

if (onetickPackageJson.scripts?.['package:admin-artifact'] !== 'node ../../scripts/package-app-platform-admin-artifact.mjs --app onetick') {
  throw new Error('OneTick package is missing package:admin-artifact contract')
}

process.stdout.write('ci-contract-ok\n')

