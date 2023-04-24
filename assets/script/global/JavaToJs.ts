import { em } from "./EventManager";
import { gUrl } from "./GameUrl";
import { ggd } from "./globalData";
import { hr } from "./HttpRequest";
import { glf } from "./globalFun";

/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-06 19:33:02
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-06 19:36:31
 * @FilePath: \to-be-immortal\assets\script\global\JavaToJs.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
(window as any).javaToJs = {
    //安卓通过桥调用js 方法
    javaUsingJsFunByBridge(){
        // switch (ggd.curAdRewardType) {
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
        //         em.dispatch("tipsViewShow", "参数类型错误："+ggd.curAdRewardType);
        //         break;
        // }
        glf.afterPlayAdComplete();
        // //记录观看广告次数
        let url = gUrl.list.adClickCount;
        let data = null;
        hr.post(url,data,()=>{});
    },
    initPhoneImei(imei:string){
        ggd.phoneInfo.imei = imei;
    }
}