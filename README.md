# ss-pf-app-onetick

OneTick admin artifact producer for PageFly app-platform.

This repo exists to split OneTick admin build/deploy from the PageFly Core Jenkins build.

## Status

Build-ready OneTick admin artifact repo.

OneTick admin source is present under `apps/onetick`. CI can build and package the admin static artifact without PageFly Core.

## Target Flow

```txt
ss-pf-app-onetick CI
  -> build OneTick admin static artifact
  -> package artifacts/onetick-admin-static
  -> deploy to env static path
  -> promote current
```

Avoid:

```txt
PageFly CI
  -> checkout OneTick source
  -> build OneTick inside PageFly Core build
```

## Branch Flow

```txt
wip -> beta -> rc -> main
```

Channel mapping:

```txt
wip  -> onetick-wip
beta -> onetick-beta
rc   -> onetick-rc
main -> onetick-live
```

## Commands

Verify repo contract:

```bash
npm run ci:contract
```

Build admin artifact:

```bash
npm run build:admin-artifact
```

Deploy artifact:

```bash
npm run deploy:admin-artifact -- \
  --artifact artifacts/onetick-admin-static \
  --target-app-root "$TARGET_APP_ROOT"
```

Dry-run deploy:

```bash
npm run deploy:admin-artifact:dry-run -- \
  --artifact artifacts/onetick-admin-static \
  --target-app-root "$TARGET_APP_ROOT"
```

## Artifact Layout

```txt
artifacts/onetick-admin-static/
  artifact-manifest.json
  admin/runtime/manifest.json
  admin/runtime/*
```

## Deploy Layout

```txt
$TARGET_APP_ROOT/
  releases/<artifact-id>/
  current/
  releases/ledger.jsonl
```

Default promote strategy is copy. Symlink can be enabled with `--strategy symlink` if static hosting supports it.

