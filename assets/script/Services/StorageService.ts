import { _decorator, Component, sys } from 'cc';
import { em } from '../global/EventManager';

import IService from '../Interfaces/IService';
import Singleton from '../Decorators/Singleton';
import { Constant } from '../Common/Constant';
import Utils from '../Common/Utils';
import { Api } from '../Api';

/**
 * 存储服务
 */
@Singleton
export class StorageService implements IService {

    public static readonly instance: StorageService;

    _tempData = null;

    public async initialize(): Promise<void> {
        this._tempData = {};
    }

    public async lazyInitialize() {
        this.initTempData();

        // director.addPersistRootNode(this.node);//背包物品在各个场景皆可用到 设置为常驻节点

        console.log("========================INIT SavingManager===================");
        this.initGlobalData();
    }

    savingToTempData(key, data) {
        //对传入数据进行深拷贝 防止数据污染
        if (this._tempData.hasOwnProperty(key)) {
            this._tempData[key] = JSON.parse(JSON.stringify(data));
        } else {
            console.warn("添加新属性" + key);
            console.log(data);
            this._tempData[key] = JSON.parse(JSON.stringify(data));
        }
        console.log("temp data，saving key is " + key, this._tempData);
        this.savingTime();
        if (!Constant.GlobalGameData.userInfo.isVisitor) {
            this.savingToServer();
        }
        else sys.localStorage.setItem("saving", JSON.stringify(this._tempData));
    }

    async savingToServer() {
        // let url = Constant.URL.SavingData;
        // let data = {
        //     "configValue": JSON.stringify(this._tempData),
        // }
        // let cb = this.savingToServerComplete.bind(this);
        // let eb = this.savingToServerError.bind(this);
        // hr.post(url, data, cb, eb);
        let result = await Api.SavingData(JSON.stringify(this._tempData));
    }

    savingToServerComplete(res) {
        // console.log("savingToServerComplete",res);
    }
    savingToServerError() { }

    //记录时间
    savingTime() {
        let string = Utils.getTimeDetail();
        this._tempData.savingInfo.curTime = string;
        this._tempData.savingInfo.curTimeStamp = new Date().getTime();
    }

    getTempData(key) {
        if (this._tempData.hasOwnProperty(key)) return this._tempData[key];
        else return null;
    }
    initTempData() {
        let data = sys.localStorage.getItem("saving");
        if (!Constant.GlobalGameData.userInfo.isVisitor) data = Constant.GlobalGameData.userInfo.accountMetadata;
        if (data) this._tempData = JSON.parse(data);
        else this._tempData = {};
        if (!this._tempData.hasOwnProperty("savingInfo")) {
            this._tempData.savingInfo = {//可能需要修改，时间戳可能存在细微误差
                "startTime": Utils.getTimeDetail(),
                "timeStamp": new Date().getTime(),
                "curTime": Utils.getTimeDetail(),
                "curTimeStamp": new Date().getTime()
            };
        };
    }
    // 初始化全局数据
    initGlobalData() {
        if (this._tempData.hasOwnProperty("global")) {
            let gData = this._tempData["global"];
            Constant.GlobalGameData.stageProgress = gData.stageProgress;
            if (Constant.GlobalGameData.versionCode !== gData.versionCode) {
                console.log("版本更新");
                this.savingGlobalDataToTempData();//记录版本号
                // this.scheduleOnce(() => {
                //     em.dispatch("openVersionNotice");
                // }, 0);
                setTimeout(() => {
                    em.dispatch("openVersionNotice");
                }, 0);
            }
        }
    }
    // 记录全局数据
    savingGlobalDataToTempData() {
        let key = "global";
        let data = {
            "stageProgress": Constant.GlobalGameData.stageProgress,
            "versionCode": Constant.GlobalGameData.versionCode,
        };
        this.savingToTempData(key, data);
    }
}

