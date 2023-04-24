/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 23:44:42
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-15 00:04:18
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss71.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss71')
export class Boss71 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 230000000,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes":1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",71);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(this.usingNormalParticleOneShot, 1);
    }
}

