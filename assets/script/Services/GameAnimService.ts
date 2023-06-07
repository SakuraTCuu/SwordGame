import { Animation } from 'cc';
import { Constant } from "../Common/Constant";
import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";

@Singleton
export class GameAnimService implements IService {

    public static readonly instance: GameAnimService;

    private _animList = [];

    //提供网络服务?
    //提供 外部接口功能调用的服务

    public async initialize() {
        console.log("GameAnimService initialize");
    }

    public async lazyInitialize() {
        console.log("GameAnimService lazyInitialize");
    }

    //添加动画组件到list
    public addAnimToList(anim: Animation): void {
        if (Constant.GlobalGameData.stopAll) {
            anim.pause();
        }
        this._animList.push(anim);
    }

    // 从list 移除anim
    public removeAnimFromList(anim: Animation): void {
        // console.log("移除anim：",anim.node.uuid);
        let index = this._animList.indexOf(anim);
        if (index > -1) {
            this._animList.splice(index, 1);
        } else {
            throw "anim is not in list.";
        }
    }

    //暂停list中所有的动画
    public pauseAllAnim(): void {
        // console.log("暂停list中所有的动画");
        this._animList.forEach(anim => {
            anim.pause();
        });
    }

    //恢复所有list中的动画
    public resumeAllAnim(): void {
        console.log("恢复所有list中的动画");
        this._animList.forEach(anim => {
            anim.resume();
        });
    }

}