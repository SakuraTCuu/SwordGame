import { Component } from "cc";
import ITicker from "../Interfaces/ITicker";


/**
 * 定时器装饰器
 * @param commandName 
 */

export default function Ticker(target: typeof ITicker & typeof Component) {
    let prototype = target.prototype
    let onLoad = Reflect.get(prototype, "onLoad")
    let onDestroy = Reflect.get(prototype, "onDestroy")
    Reflect.set(prototype, "onLoad", function () {
        app.ticker.register(this)
        if (onLoad) {
            onLoad();
        }
    })
    Reflect.set(prototype, "onDestroy", function () {
        if (onDestroy) {
            onDestroy();
        }
        app.ticker.unregister(this)
    })
}