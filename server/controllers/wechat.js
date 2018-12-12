const api = require('../api');

exports.signature = async(ctx, next) => {
    const url = ctx.query.url;
    console.log(url);
    if (!url) ctx.throw(404);
    const params = await api.getSignatureAsync(url);
    console.log(params);
    ctx.body = {
        success: true,
        params
    }
}