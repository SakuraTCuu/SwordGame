/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 16:44:41
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 19:37:21
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss7.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss7')
export class Boss7 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 1500,
            "duration": 3,
            "moveSpeed": 400,
            "canAttackTimes": 1,
        },
    };
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 7);
        bossData.canMove = false;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleTriShot([[0, 0], [-180, 0], [180, 0]], 0.2);
        }, 0.8);
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100, 0.2);
        }, 3);
    }
}

