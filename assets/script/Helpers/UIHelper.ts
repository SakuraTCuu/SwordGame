import IUI from "../Interfaces/IUI";

import { Component, Node, Tween, _decorator } from "cc";
import ITicker from "../Interfaces/ITicker";
import IBaseComponent from "../Interfaces/IBaseComponent";

namespace UIHelper {
    export const UIMaskColorGray: number = 160;
    /**
     * 窗口类型
     */
    export enum DMT {
        Normal = 0,             // 普通窗口
        Model = 1,              // 模态窗口
        Transparent = 2,       // 透明窗口
    }
    /**
     * 窗口层级
     */
    export enum LayerZOrder {
        UI = 100,
        EFFECT = 3000,
        TOP = 8000,
        TIPS = 10000,
    }
    /**
     * 动画子类实现
     */
    export abstract class UIAniBase {
        abstract Actions(node: Node): Tween<Node>;
    }
    /**
     * 配置的UI信息
     */
    export interface IUIInfo {
        id: string;                                 // id
        path?: string;                              // resource path
        script?: string | { prototype: IUI };       // resource path
        signScene?: string;                         // 是否标记处理一个新的scene
        preload?: boolean;                          // 是否执行预加载
        clone?: () => void;
    }
    class UIInfo implements IUIInfo {
        id: string = null;
        path: string = null;
        signScene: string = null;
        script: string | { prototype: IUI };
        preload: boolean = false;

        getParam(value, defaultValue) {
            return value == undefined ? defaultValue : value;
        }
        constructor(paramObj) {
            this.id = paramObj.id;
            this.path = paramObj.path;
            this.script = paramObj.script;
            this.signScene = paramObj.signScene;
            this.preload = this.getParam(paramObj.preload, false);
        }

        clone() {
            return new UIInfo(this);
        }
    }
    export type DefType = {
        [index: string]: IUIInfo
    };
    /**
     * UI配置管理
     */
    export class DefStack {
        private static _mainInstance: DefStack = null;
        public static get(x: string): IUIInfo {
            if (!this._mainInstance) {
                return null;
            }
            return this._mainInstance.mAll.get(x);
        }
        public static get PublicPrefab(): string {
            if (!this._mainInstance) {
                return undefined;
            }
            return this._mainInstance.PublicPrefab;
        }
        public static create(PublicPrefab: string) {
            if (this._mainInstance) return this._mainInstance;

            this._mainInstance = new DefStack(PublicPrefab);
            return this._mainInstance;
        }
        //------------------------------------------------------------------------------------------------------------
        private mAll: Map<string, IUIInfo> = new Map<string, IUIInfo>();
        protected constructor(
            public PublicPrefab: string) {
        }
        add(id: number, path: string, preload?: boolean): this;
        add(cfg: IUIInfo): this;
        add() {
            let args = Array.prototype.slice.call(arguments);
            let cfg = args[0];
            if (typeof (args[0]) == "string" && typeof (args[0]) == "string") {
                cfg = {
                    id: args[0],
                    path: args[1],
                    preload: args[2],
                }
            }
            if (cfg && cfg.id) {
                this.mAll.set(cfg.id, new UIInfo(cfg));
            }
            return this;
        }
    }
    export abstract class IUIOption {
        /**
         * 自动释放(默认自动释放)
         * 对于多次频繁被打开的UI可以设置此属性为false
         */
        isAutoRelease?: boolean;
        /**
         * 可以自定义窗口层 默认最高层
         */
        zOrder?: LayerZOrder;
        /**
         * 自定义父节点
         */
        parent?: Node;
        /**
         * 窗口模态类型
         */
        uiModelType?: DMT;
        /**
         * 点击空白处隐藏
         */
        isClickOutClose?: boolean;
        /**
         * 自动隐藏延迟时间 默认不自动隐藏
         */
        autoHideTime?: number;
        /**
         * 显示打开动画
         */
        uiShowAni?: string;
        /**
         * 关闭的时候动画
         */
        uiHideAni?: string;

        /**
         * 动态更新编辑器中用的枚举
         */
        abstract updateUiAniEnumInEditor(): void;
    }

    export abstract class IUIBase extends IBaseComponent {
        mIsShow: boolean;

        uiOpt: UIHelper.IUIOption;
        /**
         * 参见prefab实例的时候调用  （被加入到节点前调用）
         * @param id 
         */
        abstract create(id: string): void;

        /**
         * 初始化create结束前调用 （被加入到节点前调用）
         * @param r 参数列表
         */
        abstract createFinish(...r): void;
        /**
         * 重置UI配置参数
         * @param p
         */
        abstract resetOption(p: UIHelper.IUIOption);
        /**
         * 获得焦点 失去焦点前的一次调用
         * 多次触发多次被调用
         * @param r
         */
        abstract show(...r): void;

        /**
         * 显示UI 从UI栈内从新弹出
         * @param params
         */
        abstract open(params): void;
        /**
         * 关闭UI
         * @param backUI
         */
        abstract close(delayTime?: number): void;
        /**
         * 移除，真正从  渲染队列 -  时间观察中  里移除
         * @param claen 
         * @returns 
         */
        abstract remove(claen?: boolean): void;
        /**
         * 设置UI显示隐藏
         * @param flag 
         */
        abstract setVisible(flag: boolean): void;
        abstract isVisible();
        /**
         * 如果是Model层UI 那么可以设置Model层节点的显示隐藏
         * @param v 
         */
        abstract resetModel(v: boolean);
    }
}
export default UIHelper;