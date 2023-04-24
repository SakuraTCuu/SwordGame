/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-09-20 01:51:52
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-30 11:18:08
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\JustOneSwordDivideWorld.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Vec2 } from 'cc';
import { em } from '../../global/EventManager';
import { attackInterval, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('JustOneSwordDivideWorld')
export class JustOneSwordDivideWorld extends Weapon {
    init() {
        this.initSkillData();
        this.playThisWeaponAudio(3);
    }
    playThisWeaponAudio(total) {
        for (let i = 0; i < total; i++) {
            this.scheduleOnce(() => {
                em.dispatch("playOneShot", "battle/spell");
            }, i);
        }

    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "一剑隔世");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = Infinity;
        this._moveSpeed = 0;
        this._canAttackTimes = Infinity;
        this._backDis = 0;
        this._attackInterval = 0.5;
        this._weaponName = data.name2;
        this._flyDir = new Vec2(-.25, -1);
        this.clearCacheData();
        this.initBoxCollider(tagData.sword);
        this.changeBulletRotationByFlyDir();
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        if (this.isHasAttacked(other.node.uuid)) return;//已经被剑攻击过的对象 忽略后续攻击
        this.updateMonsterBlood(other);
        this._hasAttackedEnemies.push(other.node.uuid);
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool();
    }
    // 通过飞行方向修改子弹旋转方向 没有方向的子弹暂不处理
    changeBulletRotationByFlyDir() {
        if (this._flyDir.x == 0 && this._flyDir.y == 0) return;//无方向 暂不处理
        if (this._flyDir.x == 0) {//没有x方向
            if (this._flyDir.y > 0) this.node.angle = -90;
            else this.node.angle = 90;
            return;
        };
        if (this._flyDir.y == 0) {//没有y方向
            if (this._flyDir.x > 0) this.node.angle = 180;
            else this.node.angle = 0;
            return;
        };
        let bevelLen = Math.sqrt(this._flyDir.x * this._flyDir.x + this._flyDir.y * this._flyDir.y);
        // let sin = Math.sin(this._flyDir.x / bevelLen);
        let sin = Math.sin(Math.abs(this._flyDir.y) / bevelLen);
        let asin = Math.asin(sin);
        let angle = asin * 90;
        // console.log("angle", angle);
        if (this._flyDir.y > 0) {//向上飞行
            if (this._flyDir.x > 0) this.node.angle = 180 + angle;
            else this.node.angle = 360 - angle;
        } else {
            if (this._flyDir.x > 0) this.node.angle = 180 - angle;
            else this.node.angle = angle
        }
        // this.node.angle = 70;
    }
    // 回收进对象池
    recoveryToPool() {
        this.node.destroy();
    }

}

