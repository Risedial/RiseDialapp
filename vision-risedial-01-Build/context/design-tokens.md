# design-tokens.md — design_tokens Reference

**Role:** prevents agents from inventing arbitrary Tailwind class names or PWA manifest values that conflict with the existing UI configuration
**Status:** IMMUTABLE — do not modify during implementation phase
**Depends on:** none
**Required by:** M2
**Date:** 2026-05-04

---

## Values

**pwa_manifest_path:** `public/manifest.json`
**pwa_service_worker_path:** `public/sw.js`
**pwa_icon_sizes_required:** `['192x192', '512x512']`
**next_pwa_config.dest:** `public`
**next_pwa_config.register:** `true`
**next_pwa_config.skipWaiting:** `true`
**pwa_manifest_required_fields:** `name, short_name, start_url, display, background_color, theme_color, icons`
**layout_manifest_link:** `<link rel="manifest" href="/manifest.json" />`
**layout_theme_color_meta:** `<meta name="theme-color" ... />`
**styling_framework:** `Tailwind CSS 3`
