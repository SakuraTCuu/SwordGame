import { ggd } from "./globalData";
export { em }

enum EventKey {
    tipsViewShow = 'tipsViewShow',
}

type EventId = EventKey | any;

interface EventObj {
    target: any
    callback: Function,
}

class EventManager {

    _eventMap: Record<EventId, EventObj[]> = Object.create(null);

    public add(type: EventId, callback: Function, target?: any): void {

        if (!this._eventMap[type]) {
            this._eventMap[type] = [];
        }

        if (this.has(type, callback, target)) {
            throw new Error(`重复定义 ${type}`);
        }

        this._eventMap[type].push({ target, callback });

        console.log("事件" + type + "添加成功");

        // if (!type || !callback) throw new Error("事件名称或回调函数未定义");
        // if (this._eventMap[type]) throw new Error(type + ",该事件名称已使用 请使用其它名称");
        // if (this._eventMap.hasOwnProperty(type)) return console.log("该事件名称已使用 请使用其它名称");
        // else {
        //     this._eventMap[type] = {}
        //     this._eventMap[type].callback = callback;
        // console.log("事件" + type + "添加成功");
        // }
    }

    /**
     * 同步方法?
     */
    public dispaths(type: EventId, ...params: any[]) {
        if (!type) throw new Error("事件名称参数为空");
        if (!this._eventMap[type]) throw new Error("事件" + type + "未注册");

        this._eventMap[type].forEach((eventObj) => {
            if (!eventObj.target) {
                eventObj.callback && eventObj.callback(...params);
                return;
            }
            eventObj.callback.apply(eventObj.target, ...params);
        });
    }

    /**
     * 兼容老版本, 竟然有返回值...😅
     * @deprecated
     * @param type 
     * @param params 
     * @returns 
     */
    public dispatch(type: EventId, ...params: any[]) {
        if (!type) throw new Error("事件名称参数为空");
        if (!this._eventMap[type]) throw new Error("事件" + type + "未注册");

        let callback = this._eventMap[type][0].callback;
        return callback(...params);
    }

    /**
     * 事件是否定义
     * @deprecated
     * @param type EventId
     * @returns 
     */
    public eventIsDefined(type: EventId): boolean {
        if (!this._eventMap[type] || this._eventMap[type].length <= 0) {
            return false;
        }

        return true;
    }

    /**
     * 是否已存在重复的监听
     * @param type 
     * @param callback 
     * @param target 
     * @returns 
     */
    public has(type: EventId, callback: Function, target?: any): boolean {
        if (!this._eventMap[type] || this._eventMap[type].length <= 0) {
            return false;
        }

        let hasEvent = false;

        this._eventMap[type].forEach(eventObj => {
            if (target && target === eventObj.target) {
                hasEvent = true
            }
            if (callback && callback === eventObj.callback) {
                hasEvent = true
            }
        });

        return hasEvent;
    }

    /**
     * 移除指定事件
     * @param type 
     * @param callback 
     * @param target 
     */
    public remove(type: EventId, callback?: Function, target?: any): void {

        if (!type) throw new Error("事件名称参数为空");
        if (!this._eventMap[type] || this._eventMap[type].length <= 0) {
            throw new Error("移除的事件不存在:" + type);
        }

        for (let i = 0; i < this._eventMap[type].length; i++) {
            if ((target && target === this._eventMap[type][i].target) ||
                callback && callback === this._eventMap[type][i].callback) {
                this._eventMap[type].splice(i, 1);
                i--;
            }
        }

        if (this._eventMap[type].length <= 0) {
            delete this._eventMap[type];
        }
    }

    public removeAll() {
        this._eventMap = {};
    }

    showAllEvents() {
        console.log(this._eventMap);
    }
}

// console.log("修了个仙 Google Play version-beta-1.0.3");
// console.log(ggd.versionCode);

const em = new EventManager();