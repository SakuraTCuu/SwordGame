/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-22 16:29:49
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-04 10:03:45
 * @FilePath: \copy9train\assets\script\hero\weapon\Guard.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator , Color } from 'cc';
import { em } from '../../global/EventManager';
import { ggd , tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass } = _decorator;

@ccclass('Guard')
export class Guard extends Weapon {
    // _touchGuard:boolean = false;
    init(data,lv) { 
        this.initWeaponInfo(lv,data);
        let weaponName:string = data.name;
        this.initCircleCollider(tagData[weaponName],-10);
    }
    //guard 存在多段伤害 需要攻击间隔加入判定
    colliderMonster(other) {
        if (ggd.stopAll) {
            this.scheduleOnce(() => {
                this.colliderMonster(other);
            }, this._attackInterval);
            return;
        }
        if (!this.isTouching(other)) return;
        // let damage = em.dispatch("getHeroControlProperty","_damage") + this._damage;
        let damage = em.dispatch("usingHeroControlFun","getCurDamage") + this._damage;
        em.dispatch("createDamageTex", other.node, damage, { x: 0, y: 20 });
        other.node.getComponent("Monster").updateBlood(-damage);
        this.scheduleOnce(() => {
            this.colliderMonster(other);
        }, this._attackInterval);
    }
    //攻击怪物和boss的区别 在于击退 穿透等属性 和一些other的内部回调 暂时没写
    colliderBoss(other) {
        if (ggd.stopAll) {
            this.scheduleOnce(() => {
                this.colliderBoss(other);
            }, this._attackInterval);
            return;
        }
        if (!this.isTouching(other)) return;
        //boss节点名 必须和boss 名 相同
        em.dispatch("createDamageTex", other.node, this._damage, { x: 0, y: 20 });
        // let script = other.node.getComponent(other.node._name);
        let script = other.node.parent.components[0];
        if (script) {
            // let damage = em.dispatch("getHeroControlProperty","_damage") + this._damage;
            let damage = em.dispatch("usingHeroControlFun","getCurDamage") + this._damage;
            script.updateBlood(-damage);
            this.scheduleOnce(() => {
                this.colliderBoss(other);
            }, this._attackInterval);
        } else throw "script name is different form node name.";
    }
}

