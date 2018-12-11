const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const R = require('ramda');
const { resolve } = require('path');
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

// Import and Set Nuxt.js options
const r = path => resolve(__dirname, path);
let config = require('../nuxt.config.js')
const MIDDLEWARES = ['database', 'router'];

class Server {
    constructor() {
        this.app = new Koa();
        this.useMiddleWares(this.app)(MIDDLEWARES);
        config.dev = !(this.app.env === 'production')

    }
    useMiddleWares(app) {
        return R.map(R.compose(
            R.map(i => i(app)),
            require,
            i => `${r('./middlewares')}/${i}`
        ))
    }
    async start() {
        // Instantiate nuxt.js
        const nuxt = new Nuxt(config)
            // Build in development
        if (config.dev) {
            const builder = new Builder(nuxt)
            await builder.build()
        }
        this.app.use(ctx => {
            ctx.status = 200 // koa defaults to 404 when it sees that status is unset
            return new Promise((resolve, reject) => {
                ctx.res.on('close', resolve)
                ctx.res.on('finish', resolve)
                nuxt.render(ctx.req, ctx.res, promise => {
                    // nuxt.render passes a rejected promise into callback on error.
                    promise.then(resolve).catch(reject)
                })
            })
        })

        this.app.listen(port, host)
        consola.ready({
            message: `Server listening on http://${host}:${port}`,
            badge: true
        })
    }
}

const app = new Server();
app.start();