import IPlatform from "../Interfaces/IPlatform";
import HttpHelper from "../Helpers/HttpHelper";
import Utils from "../Common/Utils";
import { Constant } from "../Common/Constant";
import { Api } from "../Api";

/**
 * 网页
 */
export default class AndroidPlatform extends IPlatform {

    public async initialize() {
        this.userInfo = {
            avatar: 'https://img.readygo.yunyungquan.com/common/default_avatar.png',
            nickname: '测试用户',
            platform: 'Android',
            gender: 1,
            device: "PC",
            country: "China",
            province: "GuangDong",
            city: "GuangZhou"
        };

        (window as any).javaToJs = {
            //安卓通过桥调用js 方法
            javaUsingJsFunByBridge() {
                // switch (Constant.GlobalGameData.curAdRewardType) {
                //     case "getItems":
                //         em.dispatch("getItemsRewardByAds");
                //         break;
                //     case "rebirthHero":
                //         em.dispatch("rebirthHero");
                //         break;
                //     case Constant.EventId.getDoubleReward:
                //         em.dispatch(Constant.EventId.getDoubleReward);
                //         break;
                //     default:
                //         em.dispatch("tipsViewShow", "参数类型错误："+Constant.GlobalGameData.curAdRewardType);
                //         break;
                // }
                Utils.afterPlayAdComplete();
                // //记录观看广告次数
                Api.AdClickCount()
            },
            initPhoneImei(imei: string) {
                Constant.GlobalGameData.phoneInfo.imei = imei;
            }
        }

    }

    public async lazyInitialize() {

    }

    public getLaunchOptions(): any {
        return HttpHelper.getQueryParams();
    }

    public sendInvite(imageUrl: string, title: string, param: any): Promise<any> {
        this.emit(IPlatform.EventType.OpenShare)
        return Promise.resolve();
    }
}
