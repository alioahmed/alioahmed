import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '_legacy/**',
    'next-env.d.ts',
    // SEO ops tooling: TypeScript run via tsx, excluded from tsconfig too.
    // Console-heavy Node scripts with their own conventions — linted by intent,
    // not by the app's React/Next ruleset.
    'scripts/**',
  ]),
  ...nextCoreWebVitals,
  ...nextTypescript,
])
