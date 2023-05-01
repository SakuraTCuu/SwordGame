import { Constant } from "../Common/Constant";
import Utils from "../Common/Utils";
import { hr } from "./HttpRequest";


(window as any).javaToJs = {
    //安卓通过桥调用js 方法
    javaUsingJsFunByBridge(){
        // switch (Constant.GlobalGameData.curAdRewardType) {
        //     case "getItems":
        //         em.dispatch("getItemsRewardByAds");
        //         break;
        //     case "rebirthHero":
        //         em.dispatch("rebirthHero");
        //         break;
        //     case "getDoubleReward":
        //         em.dispatch("getDoubleReward");
        //         break;
        //     default:
        //         em.dispatch("tipsViewShow", "参数类型错误："+Constant.GlobalGameData.curAdRewardType);
        //         break;
        // }
        Utils.afterPlayAdComplete();
        // //记录观看广告次数
        let url = Constant.URL.AdClickCount;
        let data = null;
        hr.post(url,data,()=>{});
    },
    initPhoneImei(imei:string){
        Constant.GlobalGameData.phoneInfo.imei = imei;
    }
}