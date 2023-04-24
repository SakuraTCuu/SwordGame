/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 23:42:08
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-15 00:01:00
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss45.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss45')
export class Boss45 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 42800000,
            "duration": 3,
            "moveSpeed": 600,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",45);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100,0.5);
        }, 4);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },1);
    }
}

