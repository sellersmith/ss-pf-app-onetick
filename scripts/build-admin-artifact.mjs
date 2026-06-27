import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const onetickPackageJson = path.join(repoRoot, 'apps/onetick/package.json')

if (!fs.existsSync(onetickPackageJson)) {
  process.stderr.write(
    [
      'OneTick source has not been migrated into this repo yet.',
      '',
      'Expected source layout:',
      '  apps/onetick/package.json',
      '  apps/onetick/dist/admin/runtime after build',
    ].join('\n')
  )
  process.stderr.write('\n')
  process.exit(1)
}

const result = spawnSync('npm', ['--workspace', '@pagefly/app-onetick', 'run', 'build:admin-artifact'], {
  cwd: repoRoot,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)

