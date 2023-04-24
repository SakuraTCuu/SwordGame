/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-30 14:45:03
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-01 15:53:43
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\ThunderRunning.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find } from 'cc';
import { em } from '../../global/EventManager';
import { attackInterval, ggd, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('ThunderRunning')
export class ThunderRunning extends Weapon {
    _startP = null;
    _maxMoveDistance = 0;
    _curMoveDistance = 0;
    init(flyDir) {
        this._flyDir = flyDir;
        this._moveSpeed = 100;
        this._maxMoveDistance = 2000;
        this._curMoveDistance = 0;
        this.addToAnimManger();
        this.initSkillData();
        let p = this.node.getWorldPosition();
        // let dir = em.dispatch("getHeroControlProperty", "_curAimDir");

        this._startP = {
            x: p.x,
            y: p.y
        };
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderRunning");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.5;
        this._weaponName = data.name2;
        this.initBoxCollider(tagData.sword);
    }
    weaponMove(deltaTime) {
        if (ggd.stopAll || !this._startP) return;
        let wp = this.node.getWorldPosition();
        if (this._flyDir.y == 0) {
            let x = deltaTime * this._moveSpeed;
            let y = this.getPathLikeSin(wp.x + x - this._startP.x);
            this._curMoveDistance += x;
            this.node.setWorldPosition(wp.x + x*this._flyDir.x, this._startP.y + y, 0);
        } else {
            let y = deltaTime * this._moveSpeed;
            let x = this.getPathLikeSin(wp.y + y - this._startP.y);
            this._curMoveDistance += y;
            this.node.setWorldPosition(this._startP.x + x, wp.y + y*this._flyDir.y, 0);
        }
    }
    getPathLikeSin(x) {
        x = x * Math.PI / 100;//每50个单位 转为π
        return 100 * Math.sin(x);
    }
}

