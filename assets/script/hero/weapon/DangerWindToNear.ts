/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-25 10:52:48
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-25 13:31:57
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\DangerWindToNear.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('DangerWindToNear')
export class DangerWindToNear extends Weapon {
    _moveDistance: number;
    init(flyDir) {
        this._moveSpeed = 200;
        this._moveDistance = 300;
        this.addToAnimManger();
        this._flyDir = {
            x: flyDir[0],
            y: flyDir[1]
        }
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "八面危风");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 1;
        this._weaponName = data.name2;
        // this.clearCacheData();
        this.initBoxCollider(tagData.sword);
    }
    weaponMove(deltaTime: number) {
        // return;
        if (ggd.stopAll) return;
        if (!this._flyDir) return;
        if (this._moveDistance <= 0) {
            // this.playDestroyAnim();
            // 进入停留5s后消失
            return;
        }
        if (this._moveSpeed == 0) return;
        let dis = deltaTime * this._moveSpeed;
        // let dis = deltaTime*(this._moveSpeed+bonusMS);
        let moveX = this._flyDir.x * dis;
        let moveY = this._flyDir.y * dis;
        this.node.setPosition(this.node.getPosition().x + moveX, this.node.getPosition().y + moveY, 0);
        this._moveDistance -= dis;
    }
    //自我销毁
    recoveryToPool() {
        this.removeAnimFromList();
        plm.putToPool(this._weaponName, this.node);
        // this.node.destroy();
    }

}

