/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-02 11:40:55
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-11-30 22:22:44
 * @FilePath: \to-be-immortal\assets\script\game\GameAnimManager.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('GameAnimManager')
export class GameAnimManager extends Component {

    _animList = [];
    onDestroy() {
        em.remove("usingGameAnimManagerFun");
    }
    onLoad() {
        em.add("usingGameAnimManagerFun", this.usingGameAnimManagerFun.bind(this));
    }
    usingGameAnimManagerFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //添加动画组件到list
    addAnimToList(anim: Animation) {
        if(ggd.stopAll) anim.pause();
        this._animList.push(anim);
    }
    // 从list 移除anim
    removeAnimFromList(anim: Animation) {
        // console.log("移除anim：",anim.node.uuid);
        let index = this._animList.indexOf(anim);
        if (index > -1) this._animList.splice(index, 1);
        else throw "anim is not in list.";
    }
    //暂停list中所有的动画
    pauseAllAnim() {
        // console.log("暂停list中所有的动画");
        this._animList.forEach(anim => {
            anim.pause();
        });
    }
    //恢复所有list中的动画
    resumeAllAnim() {
        console.log("恢复所有list中的动画");
        this._animList.forEach(anim => {
            anim.resume();
        });
    }



}