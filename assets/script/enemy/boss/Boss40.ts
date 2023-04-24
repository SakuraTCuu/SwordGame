/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 22:24:50
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 22:48:06
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss40.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss40')
export class Boss40 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 12158750,
            "duration": 3,
            "moveSpeed": 600,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",40);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleOneShot(0.5);
        }, 1);
        this.schedule(() => {
            this.usingNormalParticleCircle(12, 50, 0.5);
        }, 2);
        this.schedule(()=>{
            this.usingNormalParticleTriangle(0.5);
        }, 5);
        // this.schedule(this.usingNormalParticleTriShot,2);
    }
}

