import { EventTarget, sys } from "cc";
import PlatformService from "../Services/PlatformService";

/**
 * 平台接口类
 */
abstract class IPlatform extends EventTarget {
	/**
	 * 用户授权信息
	 */
    protected userInfo: IPlatform.UserInfo = null;

	/**
	 * 平台初始化操作
	 */
    public abstract initialize(): Promise<void>;

    /**
     * 平台延迟初始化操作
     */
    public abstract lazyInitialize(): Promise<void>;

	/**
	 * 调用类内方法, 适合调用平台不通用的方法
	 * @param funcName
	 * @param args
	 */
    public call(funcName: string, ...args: any[]) {
        if (typeof this[funcName] == "function") {
            return this[funcName].call(this, ...args);
        }
        return null;
    }

	/**
	 * 获取本地存档
	 * @param name
	 */
    public getArchive?(name: string): string {
        return sys.localStorage.getItem(name);
    }

	/**
	 * 保存本地存档
	 * @param name
	 * @param data
	 */
    public saveArchive?(name: string, data: string) {
        sys.localStorage.setItem(name, data);
    }

	/**
	 * 检查新版本
	 */
    public checkForUpdate(): Promise<any> {
        return Promise.resolve();
    }

	/**
	 * 获取用户信息
	 */
    public getUserInfo() {
        return this.userInfo;
    }


	/**
	 * 获取启动参数
	 */
    public getLaunchOptions(): any {
        return {};
    }

	/**
	 * 发送邀请
	 */
    public sendInvite(imageUrl: string, title: string, param: any): Promise<any> {
        return Promise.resolve();
    }

	/**
	 * 设备震动
	 * @param short
	 */
    public vibrate(short: boolean = true) { }
}


namespace IPlatform {
    /**
   * 用户数据
   */
    export interface UserInfo {
        /**
         * 用户头像
         */
        avatar?: string;
        /**
         * 用户名称
         */
        nickname?: string;
        /**
         * 用户性别
         */
        gender?: number;
        /**
         * 省
         */
        province?: string;
        /**
         * 市
         */
        city?: string;
        /**
         * 国家
         */
        country?: string;
        /**
         * 平台
         */
        platform?: string;
        /**
         * 设备
         */
        device?: string;
    }


    /**
     * 内置事件
     */
    export enum EventType {
        OnShow = "OnShow",
        OpenVideo = "OpenVideo",
        CloseVideo = "CloseVideo",
        OpenBanner = "OpenBanner",
        CloseBanner = "CloseBanner",
        OpenInterstitial = "OpenInterstitial",
        CloseInterstitial = "CloseInterstitial",
        OpenShare = "OpenShare"
    }
}

export default IPlatform;
