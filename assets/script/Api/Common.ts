/**
 * 第三方请求相关
 */
import { Constant } from '../Common/Constant'
import request from './Request'

//广告点击
export function SavingData(data: string) {
    return request({
        url: Constant.URL.SavingData,
        method: 'post',
        params: {
            "configValue": data,
        }
    })
}

//cdk 兑换
export function cdkExchange(data: string) {
    return request({
        url: Constant.URL.GetPrize,
        method: 'post',
        params: {
            "cdk": data,
        }
    })
}