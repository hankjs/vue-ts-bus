var typescript = require('rollup-plugin-typescript2');

var pkg = require('../package.json');

var version = pkg.version;

var banner = 
`/*!
 * ${pkg.name} ${version} (https://github.com/zjhcn/vue-event-bus)
 * API https://github.com/zjhcn/vue-event-bus/blob/master/doc/api.md
 * Copyright 2017-${(new Date).getFullYear()} zjhcn. All Rights Reserved
 * Licensed under MIT (https://github.com/zjhcn/vue-event-bus/blob/master/LICENSE)
 */
`;

function getCompiler(opt) {
    opt = opt || {
        tsconfigOverride: { compilerOptions : { module: 'ES2015' } }
    }

    return typescript(opt);
}

exports.name = 'vue-event-bus';
exports.banner = banner;
exports.getCompiler = getCompiler;
