/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-17 10:20:41
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-17 10:27:30
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\SpiritBullet.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('SpiritBullet')
export class SpiritBullet extends Weapon {
    init(data, lv, flyDir: { x: number, y: number }) {
        this.initWeaponInfo(lv, data, flyDir);
        // let weaponName: string = data.name;
        this.initCircleCollider(tagData.sword);
        // this.initBoxCollider((tagData.sword));
        this.changeBulletRotationByFlyDir();
        //em.dispatch("playOneShot","battle/bullet");
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        if (this.isHasAttacked(other.node.uuid)) return;//已经被剑攻击过的对象 忽略后续攻击
        this.updateMonsterBlood(other);
        this._hasAttackedEnemies.push(other.node.uuid);
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool();
    }
}

