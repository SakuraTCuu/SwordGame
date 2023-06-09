/**
 * Http助手
 */
class HttpHelper {

    /**
    * 格式化为地址栏参数
    * @param params 
    * @param withQuest 是否包含问号
    */
    public static formatParams(params: {}, withQuest: boolean = false) {
        const keys = Object.keys(params);
        return keys.length > 0 ? (withQuest ? '?' : '') + Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&') : '';
    }

    /**
     * 格式化键值对为FormData
     * @param params 
     */
    public static formatParams2FromData(params: {}): FormData {
        const formData = new FormData();
        for (const k in params) {
            formData.append(k, params[k]);
        }
        return formData;
    }

    /**
    * 获取地址栏指定参数
    * @param name 
    */
    public static getUrlParam(name: string) {
        if (typeof window != undefined) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
        }
        return null;
    }

    /**
     * 获取地址栏所有启动参数
     */
    public static getQueryParams() {
        if (typeof window != undefined) {
            let qs = window.location.search || '';
            qs = qs.split('+').join(' ');

            const params = {};
            const re = /[?&]?([^=]+)=([^&]*)/g;
            let tokens;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }

            return params;
        }
        return {};
    }


    /**
     * 编码UTF-8
     *
     * @static
     * @param {*} s
     * @returns
     * @memberof HttpHelper
     */
    public static encodeUTF8(s) {
        var i, r = [], c, x;
        for (i = 0; i < s.length; i++)
            if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
            else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
            else {
                if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
                    c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
                        r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
                else r.push(0xE0 + (c >> 12 & 0xF));
                r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
            };
        return r;
    }

    /**
     * SHA1计算
     * @param content 
     */
    public static sha1(content) {
        let data = new Uint8Array(this.encodeUTF8(content))
        let i, j, t;
        let l = ((data.length + 8) >>> 6 << 4) + 16, s: any = new Uint8Array(l << 2);
        s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
        for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
        s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
        s[l - 1] = data.length << 3;
        let w = [], f = [
            function () { return m[1] & m[2] | ~m[1] & m[3]; },
            function () { return m[1] ^ m[2] ^ m[3]; },
            function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
            function () { return m[1] ^ m[2] ^ m[3]; }
        ], rol = function (n, c) { return n << c | n >>> (32 - c); },
            k = [1518500249, 1859775393, -1894007588, -899497514],
            m = [1732584193, -271733879, null, null, -1009589776];
        m[2] = ~m[0], m[3] = ~m[1];
        for (i = 0; i < s.length; i += 16) {
            let o = m.slice(0);
            for (j = 0; j < 80; j++)
                w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
                    t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
                    m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
            for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
        };
        t = new DataView(new Uint32Array(m).buffer);
        for (let i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

        let hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
            return (e < 16 ? "0" : "") + e.toString(16);
        }).join("");
        return hex;
    }

}

export default HttpHelper;
