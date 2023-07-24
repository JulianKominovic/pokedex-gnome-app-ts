module.exports = {
    extends: ['eslint:recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
    },
    rules: {
        '@typescript-eslint/restrict-template-expressions': [
            'error',
            { allowNullish: true },
        ],
        'prettier/prettier': 'error',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    root: true,
};
