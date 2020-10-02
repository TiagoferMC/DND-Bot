module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        semi: [1, "always"],
        quotes: 0,
        "comma-dangle": ["error", "never"],
        indent: ["error", 4, { SwitchCase: 1 }]
    }
};
