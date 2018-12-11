const Router = require('koa-router');
const { config } = require('../config');
const { reply } = require('../weChat/reply');
const { wechatMiddle } = require('../wechat-lib/middleware');

exports.router = app => {
    const router = new Router();
    router.all('/wechat-hear', wechatMiddle(config.wechat, reply));
    app.use(router.routes())
        .use(router.allowedMethods());
}