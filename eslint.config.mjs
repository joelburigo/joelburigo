import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'scripts/**', 'dist/**', 'docs/**', 'public/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/no-unescaped-entities': 'off',
      // Terminal Growth usa `// KICKER` como padrão visual de texto; não são comentários
      'react/jsx-no-comment-textnodes': 'off',
    },
  },
];

export default config;
