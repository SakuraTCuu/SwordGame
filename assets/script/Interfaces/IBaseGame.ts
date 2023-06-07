import { Constant } from "../Common/Constant";
import ITicker from "./ITicker";

export default abstract class IBaseGame extends ITicker {

    abstract onTick(delta: number): void

    abstract onGameEnter(id: number): void

    abstract onGameStart(): void

    abstract onGameExit(): void

    abstract onGamePause(): void

    abstract onGameResume(): void

    /**订阅一个消息 */
    subscribe(eventName: Constant.EventId, cb: Function, target?: any, isOnce?: boolean): void {
        app.notice.on(eventName, cb as any, target, isOnce);
    }

    dispatch(eventName: Constant.EventId, ...args: any): void {
        app.notice.emit(eventName, ...args);
    }

    unsubscribe(eventName: Constant.EventId, cb?: Function, target?: any): void {
        app.notice.off(eventName, cb as any, target);
    }

}