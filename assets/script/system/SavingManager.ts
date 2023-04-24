import { _decorator, Component, Node, sys, game, director } from 'cc';
import { em } from '../global/EventManager';
import { gUrl } from '../global/GameUrl';
import { ggd } from '../global/globalData';
import { glf } from '../global/globalFun';
import { hr } from '../global/HttpRequest';
const { ccclass, property } = _decorator;
@ccclass('SavingManager')
export class SavingManager extends Component {
    _tempData = null;
    onLoad() {
        em.add("savingToTempData", this.savingToTempData.bind(this));
        em.add("getTempData", this.getTempData.bind(this));
        em.add("savingGlobalDataToTempData", this.savingGlobalDataToTempData.bind(this));
        this.initTempData();
        director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点
        console.log("========================INIT SavingManager===================");
        this.initGlobalData();
    }
    onDestroy() {
        em.remove("savingToTempData");
        em.remove("getTempData");
    }
    savingToTempData(key, data) {
        //对传入数据进行深拷贝 防止数据污染
        if (this._tempData.hasOwnProperty(key)) this._tempData[key] = JSON.parse(JSON.stringify(data));
        else {
            console.warn("添加新属性" + key);
            console.log(data);
            this._tempData[key] = JSON.parse(JSON.stringify(data));
        }
        console.log("temp data，saving key is " + key, this._tempData);
        this.savingTime();
        if (!ggd.userInfo.isVisitor) this.savingToServer();
        else sys.localStorage.setItem("saving", JSON.stringify(this._tempData));
    }
    savingToServer() {
        let url = gUrl.list.savingData;
        let data = {
            "configValue": JSON.stringify(this._tempData),
        }
        let cb = this.savingToServerComplete.bind(this);
        let eb = this.savingToServerError.bind(this);
        hr.post(url, data, cb, eb);
    }
    savingToServerComplete(res) {
        // console.log("savingToServerComplete",res);
    }
    savingToServerError() {}

    //记录时间
    savingTime() {
        let string = glf.getTimeDetail();
        this._tempData.savingInfo.curTime = string;
        this._tempData.savingInfo.curTimeStamp = new Date().getTime();
    }
    getTempData(key) {
        if (this._tempData.hasOwnProperty(key)) return this._tempData[key];
        else return null;
    }
    initTempData() {
        let data = sys.localStorage.getItem("saving");
        if(!ggd.userInfo.isVisitor) data = ggd.userInfo.accountMetadata;
        if (data) this._tempData = JSON.parse(data);
        else this._tempData = {};
        if (!this._tempData.hasOwnProperty("savingInfo")) {
            this._tempData.savingInfo = {//可能需要修改，时间戳可能存在细微误差
                "startTime": glf.getTimeDetail(),
                "timeStamp": new Date().getTime(),
                "curTime": glf.getTimeDetail(),
                "curTimeStamp": new Date().getTime()
            };
        };
    }
    // 初始化全局数据
    initGlobalData() {
        if (this._tempData.hasOwnProperty("global")) {
            let gData = this._tempData["global"];
            ggd.stageProgress = gData.stageProgress;
            if(ggd.versionCode!==gData.versionCode) {
                console.log("版本更新");
                this.savingGlobalDataToTempData();//记录版本号
                this.scheduleOnce(()=>{
                    em.dispatch("openVersionNotice");
                },0);
            }
        }
    }
    // 记录全局数据
    savingGlobalDataToTempData() {
        let key = "global";
        let data = {
            "stageProgress": ggd.stageProgress,
            "versionCode":ggd.versionCode,
        };
        this.savingToTempData(key, data);
    }
}

