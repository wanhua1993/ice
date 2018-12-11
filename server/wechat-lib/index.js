const request = require('request-promise');
const formsteam = require('formsteam');
const base = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: base + 'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?',
        fetch: base + 'media/get?'
    },
    permanent: {
        upload: base + 'meterial/add_material?',
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'media/uploadimg?',
        fetch: base + 'material/get_material?',
        del: base + 'material/del_material?',
        update: base + 'material/update_news?',
        count: base + 'material/get_materialcount?',
        batch: base + 'material/batchget_material?'
    }
}

function statFile(filepath) {
    return new Promise((resolve, reject) => {
        false.stat(filepath, (err, stat) => {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    })
}
class Wechat {
    constructor(opts) {
        this.opts = Object.assign({}, opts);
        this.appID = opts.appID;
        this.appSecret = opts.appSecret;
        this.getAccessToken = opts.getAccessToken;
        this.saveAccessToken = opts.saveAccessToken;

        this.fetchAccessToken();
    }
    async request(options) {
        options = Object.assign({}, options, { json: true });
        try {
            const response = await request(options);
            return response;
        } catch (e) {
            console.log(e);
        }

    }
    async fetchAccessToken() { // 首先获取token  验证token 是否有效 如果有效返回token 否则 重新刷新token
        let data = await this.getAccessToken();

        if (!this.isValidAccessToken(data)) {
            data = await this.updateAccessToken();
        }
        // if (isValid(data)) {
        //     return await this.updateAccessToken();
        // }
        await this.saveAccessToken(data);
        return data;
    }
    async updateAccessToken() { // 重新请求 获取token 并将 过期时间写入
        const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret;
        const data = await this.request({
            url
        })
        const now = new Date().getTime();
        const expiresIn = now + (data.expires_in - 20) * 1000;
        data.expires_in = expiresIn;
        return data;
    }
    isValidAccessToken(data) { // 验证 token 是否存在 存在则判断时间是否过期
        if (!data || !data.access_token || !data.expires_in) {
            return false
        }
        const expiresIn = data.expires_in;
        const now = new Date().getTime();
        if (now < expiresIn) {
            return true
        } else {
            return false
        }
    }

    uploadMaterial(token, type, material, permanent) {
        let form = {};
        let url = api.terporary.upload;
        if (permanent) {
            url = api.permanent.upload
        }
        if (type == 'pic') {
            url = api.permanent.uploadNewsPic;
        }
        if (type == 'news') {
            url = api.permanent.upoadNews;
        } else {
            form = formsteam();
            const stat = await statFile(material);
            form.file('media', material, path.basename(material), stat.size);
        }
    }
}

module.exports = Wechat;