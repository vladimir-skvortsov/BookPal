const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  modifyVars: { '@primary-color': '#cb997e' },
})