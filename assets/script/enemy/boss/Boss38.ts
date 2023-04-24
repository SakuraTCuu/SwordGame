/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 22:24:50
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 22:41:34
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss38.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss38')
export class Boss38 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 9158750,
            "duration": 3,
            "moveSpeed": 600,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",38);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleOneShot(0.5);
        }, 0.8);
        this.schedule(() => {
            this.usingNormalParticleCircle(12, 50, 0.5);
        }, 2);
    }
}

