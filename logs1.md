19:57:31.072 Running build in Washington, D.C., USA (East) – iad1
19:57:31.073 Build machine configuration: 4 cores, 8 GB
19:57:31.167 Cloning github.com/Risedial/RiseDialapp (Branch: main, Commit: 60c4bba)
19:57:31.168 Previous build caches not available.
19:57:31.701 Cloning completed: 534.000ms
19:57:31.966 Running "vercel build"
19:57:32.611 Vercel CLI 51.6.1
19:57:33.284 Installing dependencies...
19:57:35.722 npm warn deprecated whatwg-encoding@3.1.1: Use @exodus/bytes instead for a more spec-conformant and faster implementation
19:57:36.107 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
19:57:36.123 npm warn deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
19:57:36.218 npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
19:57:36.792 npm warn deprecated workbox-cacheable-response@6.6.0: workbox-background-sync@6.6.0
19:57:36.903 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
19:57:37.041 npm warn deprecated workbox-google-analytics@6.6.0: It is not compatible with newer versions of GA starting with v4, as long as you are using GAv3 it should be ok, but the package is not longer being maintained
19:57:38.304 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
19:57:38.484 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
19:57:38.857 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
19:57:38.959 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:39.109 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:39.193 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:39.265 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
19:57:39.275 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:39.570 npm warn deprecated source-map@0.8.0-beta.0: The work that was done in this beta branch won't be included in future versions
19:57:40.384 npm warn deprecated glob@10.3.10: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:40.622 npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
19:57:42.405 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
19:57:46.953 
19:57:46.953 added 900 packages in 13s
19:57:46.953 
19:57:46.953 222 packages are looking for funding
19:57:46.953   run `npm fund` for details
19:57:47.017 Running "npm run build"
19:57:47.116 
19:57:47.116 > risedial@0.1.0 build
19:57:47.116 > next build
19:57:47.116 
19:57:47.987 Attention: Next.js now collects completely anonymous telemetry regarding usage.
19:57:47.987 This information is used to shape Next.js' roadmap and prioritize features.
19:57:47.987 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:57:47.987 https://nextjs.org/telemetry
19:57:47.987 
19:57:48.034   ▲ Next.js 14.2.35
19:57:48.034 
19:57:48.051    Creating an optimized production build ...
19:57:48.354 > [PWA] Compile server
19:57:48.355 > [PWA] Compile server
19:57:48.355 > [PWA] Compile client (static)
19:57:48.356 > [PWA] Auto register service worker with: /vercel/path0/node_modules/next-pwa/register.js
19:57:48.356 > [PWA] Service worker: /vercel/path0/public/sw.js
19:57:48.357 > [PWA]   url: /sw.js
19:57:48.357 > [PWA]   scope: /
19:57:56.194 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (128kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
19:58:00.963  ✓ Compiled successfully
19:58:00.963    Linting and checking validity of types ...
19:58:06.569    Collecting page data ...
19:58:07.684    Generating static pages (0/28) ...
19:58:07.873    Generating static pages (7/28) 
19:58:08.146    Generating static pages (14/28) 
19:58:08.378    Generating static pages (21/28) 
19:58:08.492  ✓ Generating static pages (28/28)
19:58:08.900    Finalizing page optimization ...
19:58:08.901    Collecting build traces ...
19:58:12.690 
19:58:12.697 Route (app)                              Size     First Load JS
19:58:12.697 ┌ ○ /                                    142 B          87.4 kB
19:58:12.697 ├ ○ /_not-found                          873 B          88.1 kB
19:58:12.698 ├ ƒ /api/auth/reset-confirm              0 B                0 B
19:58:12.698 ├ ƒ /api/auth/reset-request              0 B                0 B
19:58:12.698 ├ ƒ /api/auth/signin                     0 B                0 B
19:58:12.698 ├ ƒ /api/auth/signout                    0 B                0 B
19:58:12.698 ├ ƒ /api/auth/signup                     0 B                0 B
19:58:12.698 ├ ƒ /api/chat/[chatId]/message           0 B                0 B
19:58:12.698 ├ ƒ /api/chats                           0 B                0 B
19:58:12.698 ├ ƒ /api/chats/[chatId]                  0 B                0 B
19:58:12.698 ├ ƒ /api/chats/[chatId]/messages         0 B                0 B
19:58:12.698 ├ ƒ /api/chats/[chatId]/title            0 B                0 B
19:58:12.698 ├ ƒ /api/subscription/checkout           0 B                0 B
19:58:12.698 ├ ƒ /api/subscription/portal             0 B                0 B
19:58:12.698 ├ ƒ /api/subscription/premium-toggle     0 B                0 B
19:58:12.698 ├ ƒ /api/subscription/status             0 B                0 B
19:58:12.698 ├ ƒ /api/user/delete-account             0 B                0 B
19:58:12.698 ├ ƒ /api/user/export-data                0 B                0 B
19:58:12.698 ├ ƒ /api/user/initialize                 0 B                0 B
19:58:12.698 ├ ƒ /api/user/memory                     0 B                0 B
19:58:12.698 ├ ƒ /api/user/preferred-name             0 B                0 B
19:58:12.698 ├ ƒ /api/user/profile                    0 B                0 B
19:58:12.698 ├ ƒ /api/webhooks/stripe                 0 B                0 B
19:58:12.699 ├ ƒ /chat/[chatId]                       6.39 kB        93.7 kB
19:58:12.699 ├ ○ /checkout-success                    1.57 kB        88.8 kB
19:58:12.699 ├ ○ /onboarding                          1.92 kB        89.2 kB
19:58:12.699 ├ ○ /plan-selection                      2.01 kB        89.3 kB
19:58:12.699 ├ ○ /reset-password                      1.33 kB        88.6 kB
19:58:12.699 ├ ○ /settings                            5.57 kB        92.8 kB
19:58:12.699 ├ ○ /signin                              11.2 kB        98.5 kB
19:58:12.699 └ ○ /subscription-locked                 1.31 kB        88.6 kB
19:58:12.699 + First Load JS shared by all            87.3 kB
19:58:12.699   ├ chunks/117-1b5f7aa6067c1ebc.js       31.7 kB
19:58:12.699   ├ chunks/fd9d1056-0a73e5988bda9cb2.js  53.6 kB
19:58:12.699   └ other shared chunks (total)          1.89 kB
19:58:12.699 
19:58:12.699 
19:58:12.699 ƒ Middleware                             40.1 kB
19:58:12.699 
19:58:12.700 ○  (Static)   prerendered as static content
19:58:12.700 ƒ  (Dynamic)  server-rendered on demand
19:58:12.700 
19:58:13.031 Using TypeScript 5.9.3 (local user-provided)
19:58:16.260 Build Completed in /vercel/output [43s]
19:58:16.324 Deploying outputs...
19:58:16.537 The Edge Function "middleware" is referencing unsupported modules:
19:58:16.537 	- __vc__ns__/0/middleware.js: @/lib/auth/session