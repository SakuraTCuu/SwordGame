/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-23 10:38:29
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-23 16:22:23
 * @FilePath: \to-be-immortal\assets\script\hero\Puppet.ts
 * @Description:
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, BoxCollider2D, Contact2DType, Sprite, find } from 'cc';
import { em } from '../global/EventManager';
import { groupIndex } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('Puppet')
export class Puppet extends Component {

    _maxBlood:number;
    _curBlood:number;
    //在node上直接添加回调，方便调用
    initNodeCallBack(){
        this.node.updateBloodProgress = this.updateBloodProgress.bind(this);
        // this.node.updateBloodProgress = this.updateBloodProgress;
        this.updateBloodProgress(0);
    }
    initBoxCollider(tag: number, group:number) {
        if (!tag) throw "tag is" + tag;
        // let collider = this.node.addComponent(BoxCollider2D);
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        collider.tag = tag;
        collider.group = group;
        // console.log("collider", collider);
        // collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    //刷新血条
    updateBloodProgress(changeValue: number) {
        // console.log("刷新血条，changeValue", changeValue);
        console.log("刷新傀儡血条",changeValue);
        this._curBlood += changeValue;
        if (this._curBlood < 0) {
            this._curBlood = 0;
            this.puppetDied();
        };
        if (this._curBlood > this._maxBlood) this._curBlood = this._maxBlood;
        let sprite = find("bloodProgressBg/bloodProgress",this.node).getComponent(Sprite);
        sprite.fillRange = this._curBlood / this._maxBlood;
        console.log("this._curBlood",this._curBlood);
        console.log("this._maxBlood",this._maxBlood);
    }
    // 傀儡死亡
    puppetDied(){
        console.log("傀儡死亡");
        em.dispatch("usingHeroControlFun","resetHeroPuppet");
        this.node.destroy();
    }
}

