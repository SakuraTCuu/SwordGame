/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-11 17:57:36
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-28 10:01:59
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\Sword.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('Sword')
export class Sword extends Weapon {


    init(data, lv, flyDir: { x: number, y: number }) {
        this.initWeaponInfo(lv, data, flyDir);
        let weaponName: string = data.name;
        // this.initBoxCollider(tagData[weaponName]);
        this.initBoxCollider(tagData[weaponName],{x:-7,y:-8});
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

