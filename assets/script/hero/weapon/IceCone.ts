/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-20 10:15:07
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-26 15:58:44
 * @FilePath: \copy9train\assets\script\hero\weapon\IceCone.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Vec2 } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Sword } from './Sword';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('IceCone')
export class IceCone extends Weapon {
    init(skillData,flyDir) {
        this.initSkillData(skillData,flyDir);
        em.dispatch("playOneShot","battle/frozen");
    }
    initSkillData(data, flyDir) {
        this._damage = data.damage;
        this._duration = data.duration;
        this._moveSpeed = data.moveSpeed;
        this._canAttackTimes = data.canAttackTimes;
        this._backDis = 0;
        this._attackInterval = 0.5;
        this._weaponName = data.name;
        // this._flyDir = new Vec2(-.25, -1);
        this._flyDir = flyDir;
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
        let script = other.node.getComponent("Monster");
        if(script) script.addDebuffFrozen(5);
        if (this._canAttackTimes <= 0) this.recoveryToPool();
    }
}

