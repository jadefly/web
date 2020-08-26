module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 要求箭头函数的参数使用圆括号
    'arrow-parens': 2,
    // 要求在注释周围有空行( 要求在块级注释之前有一空行)
    'lines-around-comment': [
      1,
      {
        beforeBlockComment: true,
      },
    ],
    // 强制 generator 函数中 * 号周围使用一致的空格
    'generator-star-spacing': [
      2,
      {
        before: true,
        after: true,
      },
    ],
    // 强制在 function的左括号之前使用一致的空格
    'space-before-function-paren': [0, 'always'],
    // 允许构造函数首字母非大写
    'new-cap': 0,
    'semi': 0, // 不检查分号这一项
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
