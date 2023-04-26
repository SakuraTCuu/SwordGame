import ITicker from "./ITicker";
import { Component, error } from "cc";
import IBaseComponent from "./IBaseComponent";

export default abstract class IView extends IBaseComponent {
    /**
     * View名称
     * @type {string}
     * @memberof IView
     */
    public get alias(): string {
        return this.constructor.name
    };
    onLoad() {
        // 注册视图
        app.view.register(this);

        if (this.onRegister) {
            this.onRegister();
        }
        //父类执行
        super.onLoad();
    }

    onDestroy() {
        //父类执行
        super.onLoad();

        if (this.onUnRegister) {
            this.onUnRegister();
        }

        // 注销视图
        app.view.unregister(this);

    }

    /**
    * 供外部调用视图内的方法
    * @param funcName 
    * @param args 
    */
    public order(funcName: string, ...args: any[]): any {
        if (typeof this[funcName] === 'function') {
            return this[funcName].call(this, ...args);
        }
        else {
            error(`调用${this.alias}不存在的方法${funcName}`);
        }
    }
}
