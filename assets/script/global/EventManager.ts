import { ggd } from "./globalData";
export { em }

class EventManager {
    event: object = {};
    add(type, callback) {

        if (!type || !callback) throw new Error("事件名称或回调函数未定义");
        if (this.event[type]) throw new Error(type + ",该事件名称已使用 请使用其它名称");
        // if (this.event.hasOwnProperty(type)) return console.log("该事件名称已使用 请使用其它名称");
        else {
            this.event[type] = {}
            this.event[type].callback = callback;
            // console.log("事件" + type + "添加成功");
        }
    }
    dispatch(type, ...params) {
        if (!type) throw new Error("事件名称参数为空");
        if (!this.event[type]) throw new Error("事件" + type + "未注册");
        let callback = this.event[type].callback;
        return callback(...params);
    }
    //事件是否定义
    eventIsDefined(type) {
        if (!this.event[type]) return false;
        else return true;
    }
    remove(type) {
        if (!type) throw new Error("事件名称参数为空");
        if (!this.event[type]) throw new Error("移除的事件不存在:"+type);
        delete this.event[type].callback;
        delete this.event[type];
    }
    showAllEvents() {
        console.log(this.event);
    }
}

// console.log("修了个仙 Google Play version-beta-1.0.3");
console.log(ggd.versionCode);

const em = new EventManager();