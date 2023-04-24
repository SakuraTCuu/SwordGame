/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 20:40:33
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 22:40:13
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss35.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss35')
export class Boss35 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 6727500,
            "duration": 3,
            "moveSpeed": 600,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",35);
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

