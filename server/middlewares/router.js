const Router = require('koa-router');
const { config } = require('../config');
const { reply } = require('../weChat/reply');
const { wechatMiddle } = require('../wechat-lib/middleware');
const { resolve } = require('path');
const { signature } = require('../controllers/wechat');

exports.router = app => {
    const router = new Router();
    router.all('/wechat-hear', wechatMiddle(config.wechat, reply));

    router.get('/wechat-signature', signature);

    app.use(router.routes())
        .use(router.allowedMethods());
}