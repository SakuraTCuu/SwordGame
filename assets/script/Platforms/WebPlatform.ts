import IPlatform from "../Interfaces/IPlatform";
import HttpHelper from "../Helpers/HttpHelper";
import PromiseHelper from "../Helpers/PromiseHelper";

/**
 * 网页
 */
export default class WebPlatform extends IPlatform {

    public async initialize(){
        this.userInfo = {
            avatar: 'https://img.readygo.yunyungquan.com/common/default_avatar.png',
            nickname: '测试用户',
            platform: 'WEB',
            gender: 1,
            device: "PC",
            country: "China",
            province: "GuangDong",
            city: "GuangZhou"
        };
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
