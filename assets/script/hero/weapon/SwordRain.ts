/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-26 14:06:40
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-26 16:18:56
 * @FilePath: \copy9train\assets\script\hero\weapon\SwordRain.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Vec2 } from 'cc';
import { em } from '../../global/EventManager';
import { attackInterval, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('SwordRain')
export class SwordRain extends Weapon {

    init(skillData) {
        this.initSkillData(skillData);
        //em.dispatch("playOneShot","battle/bullet");
    }
    initSkillData(data) {
        this._damage = data.damage;
        this._duration = data.duration;
        this._moveSpeed = 500;
        this._canAttackTimes = Infinity;
        this._backDis = 0;
        this._attackInterval = 0.5;
        this._weaponName = data.name;
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
}

