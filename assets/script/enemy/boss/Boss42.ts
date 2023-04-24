/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 23:41:44
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 23:58:09
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss42.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss42')
export class Boss42 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 21200000,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes":1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",42);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(()=>{
            this.usingNormalParticleTriShot([[0, 0], [-160, 0], [160, 0]],0.5);
        }, 1);
    }
}

