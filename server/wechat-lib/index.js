const request = require('request-promise');
const formsteam = require('formstream');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { sign } = require('./util');

const base = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: base + 'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?', // 上传临时素材
        fetch: base + 'media/get?' // 过去临时素材
    },
    permanent: { // 永久素材地址
        upload: base + 'meterial/add_material?', // 上传
        uploadNews: base + 'material/add_news?', // 
        uploadNewsPic: base + 'media/uploadimg?', // 图文
        fetch: base + 'material/get_material?',
        del: base + 'material/del_material?', // 删除
        update: base + 'material/update_news?', // 修改
        count: base + 'material/get_materialcount?', // 总数
        batch: base + 'material/batchget_material?'
    },
    // 用户标签
    tag: {
        create: base + 'tags/create?',
        fetch: base + 'tags/get?',
        update: base + 'tags/update?',
        del: base + 'tags/delete?',
        fetchUsers: base + 'user/tags/get?',
        batchUpdate: base + 'tags/members/batchtagging?',
        batchUnTag: base + 'tags/members/batchuntagging?',
        fetchList: base + 'tags/getidlist?'
    },
    user: {
        remark: base + 'user/info/updateremark?',
        info: base + 'user/info?',
        batchInfo: base + 'user/info/batchget?',
        fetchUserList: base + 'user/get?',
        getBlackList: base + 'tags/members/getblacklist?',
        batchBlackUsers: base + 'tags/members/batchblacklist?',
        batchUnBlackUsers: base + 'tags/members/batchunblacklist?'
    },
    menu: {
        create: base + 'menu/create?',
        fetch: base + 'menu/get?',
        delete: base + 'menu/delete?',
        addCondition: base + 'menu/addconditional?',
        delCondition: base + 'menu/delconditional?',
        getInfo: base + 'get_current_selfmenu_info?'
    },
    ticket: {
        get: base + 'ticket/getticket?'
    }
}

function statFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.stat(filepath, (err, stat) => { // 读取文件路径
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
        this.getTicket = opts.getTicket;
        this.saveTicket = opts.saveTicket;
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

        if (!this.isValidToken(data, 'access_token')) {
            data = await this.updateAccessToken();
        }
        // if (isValid(data)) {
        //     return await this.updateAccessToken();
        // }
        await this.saveAccessToken(data);
        return data;
    }
    async fetchTicket(token) { // 首先获取token  验证token 是否有效 如果有效返回token 否则 重新刷新token
        let data = await this.getTicket();

        if (!this.isValidToken(data, 'ticket')) {
            data = await this.updateTicket(token);
        }
        // if (isValid(data)) {
        //     return await this.updateAccessToken();
        // }
        await this.saveTicket(data);
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
    async updateTicket(token) { // 重新请求 获取token 并将 过期时间写入
        const url = api.ticket.get + 'access_token=' + token + '&type=jsapi';
        let data = await this.request({
            url
        });
        const now = new Date().getTime();
        const expiresIn = now + (data.expires_in - 20) * 1000;
        data.expires_in = expiresIn;
        return data;
    }
    isValidToken(data, name) { // 验证 token 是否存在 存在则判断时间是否过期
            if (!data || !data[name] || !data.expires_in) {
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
        // 请求 携带参数的 url 
    async handle(operation, ...args) {
            const tokenData = await this.fetchAccessToken(); // 首先获取token
            const options = this[operation](tokenData.access_token, ...args); // 获取相应的参数
            const data = await this.request(options); // 请求数据
            return data;
        }
        // 上传 区分 永久和临时
    uploadMaterial(token, type, material, permanent) {
            let form = {};
            let url = api.temporary.upload;
            if (permanent) { // 永久素材
                url = api.permanent.upload;
                _.extend(form, permanent);
            }
            if (type == 'image') {
                url = api.permanent.uploadNewsPic;
            }
            if (type == 'news') {
                url = api.permanent.uploadNews;
                form = material;
            } else {
                // form = formstream();
                form.media = fs.createReadStream(material);
                // const stat = await statFile(material);
                // form.file('media', material, path.basename(material), stat.size);
            }
            let uploadUrl = url + 'access_token=' + token;
            if (!permanent) {
                uploadUrl += '&type=' + type;
            } else {
                // form.field('access+token', access_token);
                if (type != 'news') {
                    form.access_token = token;
                }
            }
            const options = {
                method: 'POST',
                url: uploadUrl,
                json: true
            }
            if (type == 'news') {
                options.body = form;
            } else {
                options.formData = form;
            }

            return options;
        }
        // 获取素材
    fetchMaterial(token, mediaId, type, permanent) {
            let form = {};
            let fetchUrl = api.temporary.fetch;

            if (permanent) {
                fetchUrl = api.permanent.fetch;
            }
            let url = fetchUrl + 'access_token=' + token;
            let options = {
                method: 'POST',
                url: url
            }
            if (permanent) {
                form.media_id = mediaId;
                form.access_token = token;
                options.body = form;
            } else {
                if (type == 'video') {
                    url = url.replace('https://', 'http://');
                }
                url += '&media_id=' + mediaId
            }
            return options;
        }
        // 删除素材
    deleteMaterial(token, mediaId) {
            const form = {
                media_id: mediaId
            }
            const url = api.permanent.del + 'access_token=' + token + '&media_id=' + mediaId;
            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        // 更新素材
    updateMaterial(token, mediaId, news) {
            const form = {
                media_id: mediaId
            }
            _.extend(form, news);
            const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId;
            return {
                method: 'POST',
                url: url,
                body: form
            }
        }
        // 计数总量
    countMaterial(token) {
        const url = api.permanent.count + 'access_token=' + token;
        return {
            method: 'GET',
            url
        }
    }

    batchMaterial(token, options) {
        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;
        const url = api.permanent.batch + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: options
        }
    }

    createTag(token, name) {
        const form = {
            name
        }
        const url = api.tag.create + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    fetchTags(token) {
        const url = api.tag.fetch + 'access_token=' + token;
        return {
            url
        }
    }

    updateTag(token, tagId, name) {
        const form = {
            tag: {
                id: tagId,
                name
            }
        }
        const url = api.tag.update + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    delateTag(token, tagId) {
        const form = {
            tag: {
                id: tagId,
            }
        }
        const url = api.tag.del + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    fetchTagUses(token, tagId, openId) {
        const form = {
            tagId,
            next_openid: openId || ''
        }

        const url = api.tag.fetchUsers + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    batchTag(token, openIdList, tagId, flag) {
        const form = {
            openid_list: openIdList,
            tagId,
        }
        const url = api.tag.batchUpdate;
        if (flag) {
            url = api.tag.batchUnTag;
        }
        url += 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    getList(token, openId) {
        const form = {
            openid: openId
        }
        const url = api.tag.getList + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    remarkUser(token, openId, remark) {
        const form = {
            openid: openId,
            remark
        }
        const url = api.user.remark + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    getUserInfo(token, openId, lang) {
        const url = `${api.user.info}access_token=${token}$next_openid=${openId}&lang=${lang || 'zh_CN'}`;
        return {
            url
        }
    }
    batchUserInfo(token, userList) {
        const url = `${api.user.batchInfo}access_token=${token}`;
        const form = {
            user_list: userList
        }
        return {
            url,
            body: form
        }
    }
    fetchUserList(token, openId) {
        const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`;
        return {
            url
        }
    }

    // 菜单
    createMenu(token, menu) {
        const url = api.menu.create + 'access_token=' + token;
        return {
            method: 'POST',
            url,
            body: menu
        }
    }

    getMenu(token) {
        const url = api.menu.getInfo + 'access_token=' + token;
        return {
            url
        }
    }

    delMenu(token) {
        const url = api.menu.delete + 'access_token=' + token;
        return {
            url
        }
    }

    addCondition(token, menu, rule) {
        const url = api.menu.addCondition + 'access_token=' + token;
        const form = {
            button: menu,
            matchrule: rule,
        }
        return {
            method: 'POST',
            url,
            body: form
        }
    }
    delConditionMenu(token, menuId) {
        const url = api.menu.delCondition + 'access_token=' + token;
        const form = {
            menuid: menuId
        }
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    getCurrentMenuInfo(token) {
        const url = api.menu.getInfo + 'access_token=' + token;
        return {
            url
        }
    }

    sign(ticket, url) {
        return sign(ticket, url);
    }
}

module.exports = Wechat;