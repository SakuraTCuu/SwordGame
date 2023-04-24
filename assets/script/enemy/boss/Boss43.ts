/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 23:41:53
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-15 00:00:37
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss43.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss43')
export class Boss43 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 284000000,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",43);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(this.usingNormalParticleOneShot, 1);
        this.schedule(()=>{
            this.usingNormalParticleTriangle(0.5);
        }, 5);
    }   
    
}

