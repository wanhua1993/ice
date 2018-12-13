const Router = require('koa-router');
const { config } = require('../config');
const { reply } = require('../weChat/reply');
const { wechatMiddle } = require('../wechat-lib/middleware');
const { resolve } = require('path');
const { signature, redirect, oauth } = require('../controllers/wechat');

exports.router = app => {
    const router = new Router();
    router.all('/wechat-hear', wechatMiddle(config.wechat, reply));

    router.get('/wechat-signature', signature);

    router.get('/wechat-redirect', redirect);
    router.get('/wechat-oauth', oauth);

    app.use(router.routes())
        .use(router.allowedMethods());
}