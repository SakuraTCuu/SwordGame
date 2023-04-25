import { EventId, ViewId, MapId, EditId, NetId } from '../global/GameEvent';

export { em }


export type EventKey = EventId | ViewId | MapId | EditId | NetId | string;

interface EventObj {
    target: any
    callback: Function,
}

class EventManager {

    _eventMap: Record<EventKey, EventObj[]> = Object.create(null);

    public add(type: EventKey, callback: Function, target?: any): void {

        if (!this._eventMap[type]) {
            this._eventMap[type] = [];
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
    public dispatchs(type: EventKey, ...params: any[]) {
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
    public dispatch(type: EventKey, ...params: any[]) {
        if (!type) throw new Error("事件名称参数为空");
        if (!this._eventMap[type]) throw new Error("事件" + type + "未注册");

        let callback = this._eventMap[type][0].callback;
        return callback(...params);
    }

    /**
     * 事件是否定义
     * @deprecated
     * @param type EventKey
     * @returns 
     */
    public eventIsDefined(type: EventKey): boolean {
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
    public has(type: EventKey): boolean {
        if (!this._eventMap[type] || this._eventMap[type].length <= 0) {
            return false;
        }
        return true;
    }

    /**
     * 移除指定事件
     * @param type 
     * @param callback 
     * @param target 
     */
    public remove(type: EventKey, callback?: Function, target?: any): void {

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
        this._eventMap = Object.create(null);
    }

    showAllEvents() {
        console.log(this._eventMap);
    }
}

// console.log("修了个仙 Google Play version-beta-1.0.3");
// console.log(ggd.versionCode);

const em = new EventManager();