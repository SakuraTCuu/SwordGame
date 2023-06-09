import IService from "../Interfaces/IService";
import Singleton from "../Decorators/Singleton";
import IPlatform from "../Interfaces/IPlatform";

import WebPlatform from "../Platforms/WebPlatform";

import TimerService from "./TimerService";

import { log, sys, warn } from "cc";
import AndroidPlatform from "../Platforms/AndroidPlatform";

@Singleton
class PlatformService implements IService {

    public static readonly instance: PlatformService;

    // 当前平台
    private platform: IPlatform;

    // 数据
    private data: any = null;

    private autoSaveSecond: number = 3;
    private autoSyncSecond: number = 5;

    private autoSave: TimerService.Timer = null;
    private autoSyncSave: TimerService.Timer = null;

    public async initialize() {
        switch (this.getType()) {
            default:
                this.platform = new WebPlatform();
                break;
            case PlatformService.PlatformType.ANDROID: 
               this.platform = new AndroidPlatform();
               break;
        }

        await this.platform.initialize();
        // 同步数据
        this.data = this.loadLocal()
        log("游戏数据：", this.data);

        // 定时保存
        if (this.autoSave) {
            app.timer.stopTimer(this.autoSave)
        }
        this.autoSave = app.timer.startTimer(this.autoSaveSecond, () => {
            this.saveLocal(this.data);
        }, this);

        if (this.autoSyncSave) {
            app.timer.stopTimer(this.autoSyncSave)
        }
        this.autoSyncSave = app.timer.startTimer(this.autoSyncSecond, () => {
            // if (this.saveRemote != null && this.localRemote != null) {
            //     this.sync(this.localRemote, this.saveRemote)
            // }
            if (this.saveRemote != null) {
                this.saveRemote(this.data);
            }
        }, this);
    }

    public async lazyInitialize() {
        await this.platform.lazyInitialize();
    }

    /**
     * 获取平台类型
     *
     * @readonly
     * @type {PlatformService.PlatformType}
     * @memberof PlatformService
     */
    public getType(): PlatformService.PlatformType {
        if (sys.platform == sys.Platform.ANDROID) {
            // Android
            return PlatformService.PlatformType.ANDROID;
        } else if (sys.platform == sys.Platform.IOS) {
            // iOS
            return PlatformService.PlatformType.IOS
        } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            if (window["qq"] != null) {
                // 手Q
                return PlatformService.PlatformType.QQ
            } if (window["tt"] != null) {
                // 抖音
                return PlatformService.PlatformType.BYTEDANCE
            } else {
                // 微信小游戏
                return PlatformService.PlatformType.WX
            }
        } if (sys.platform === sys.Platform.BYTEDANCE_MINI_GAME) {
            return PlatformService.PlatformType.BYTEDANCE
        } else if (window["FBInstant"] != null) {
            // Facebook instant game
            return PlatformService.PlatformType.FACEBOOK
        } else if (sys.platform == sys.Platform.OPPO_MINI_GAME) {
            // OPPO 小游戏
            return PlatformService.PlatformType.OPPO
        } else {
            // web
            return PlatformService.PlatformType.WEB
        }
    }


    /**
     * 获取当前平台对象
     */
    getPlatform(): IPlatform {
        return this.platform;
    }

    /**
    * 从本地读取存档
    */
    loadLocal() {
        try {
            const result = JSON.parse(app.platform.getPlatform().getArchive('Archive'));
            if (result != null) {
                return result;
            } else {
                return { alterTime: app.timer.getTime() };
            }
        } catch (e) {
            return { alterTime: app.timer.getTime() };
        }
    }

    /**
     * 保存数据到本地
     */
    async saveLocal(data: any) {
        // 通过调用平台本地存档接口进行保存
        try {
            this.data.alterTime = app.timer.getTime();
            app.platform.getPlatform().saveArchive('Archive', JSON.stringify(data));
        } catch (error) {
        }
    }

    private localRemote: () => Promise<any> = null
    private saveRemote: (data: any) => void = null;

    /**
   * 本地和网络存档进行同步
   */
    public async sync(localRemote: () => Promise<any>, saveRemote: (data: any) => void) {
        this.localRemote = localRemote;
        this.saveRemote = saveRemote;

        const remoteData = await localRemote();
        const localData = this.data;
        //本地无存档
        if (localData == null) {
            log("本地无存档!")
            this.data = remoteData;
            return;
        }

        const localTime = localData.alterTime || 0;
        const remoteTime = remoteData && remoteData.alterTime || 0;
        if (localTime < remoteTime) {
            // 网络覆盖本地
            log("更新本地存档")
            this.data = remoteData;
            await this.saveLocal(this.data)
        }
        else {
            log("更新云存档")
            this.data.alterTime = app.timer.getTime();
            // 本地覆盖网络
            saveRemote(this.data);
        }
    }


    /**
 * 获取指定键对应的值
 * 如果存档中找不到, 则返回默认值
 * @param key 
 */
    public get<T>(key: string): T {
        if (this.data == null) {
            this.data = this.loadLocal();
        }
        return this.data[key] == null ? null : this.data[key];
    }

    /**
     * 修改存到指定键名的值
     * @param key 
     * @param newValue 
     */
    public set(key: string, newValue: any) {
        if (this.data == null) {
            this.data = this.loadLocal();
        }
        const oldValue = this.data[key];
        // if (oldValue && typeof oldValue != typeof newValue) {
        //     throw new Error('存档新值和旧值类型不一致, 忽略存入');
        // }
        // 旧值和新值不是同一个
        if (oldValue !== newValue) {
            this.data[key] = newValue;
        }
    }


    public clear() {
        warn("存档已经重置");
        this.data = {};
        this.data.alterTime = app.timer.getTime();
        this.saveLocal(this.data);
    }

}


namespace PlatformService {
    export enum PlatformType {
        WX,
        QQ,
        FACEBOOK,
        ANDROID,
        IOS,
        WEB,
        BYTEDANCE,
        OPPO
    }

    /**
    * 内置事件
    */
    export type EventType = IPlatform.EventType

}

export default PlatformService;
