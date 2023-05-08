/**
 * 第三方请求相关
 */
import { Constant } from '../Common/Constant'
import request from './Request'

//广告点击
export function AdClickCount() {
    return request({
        url: Constant.URL.AdClickCount,
        method: 'get',
        params: {}
    })
}
