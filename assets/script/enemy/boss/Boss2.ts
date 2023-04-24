/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 13:09:16
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 16:16:43
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss2.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { ggd } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss2')
export class Boss2 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 200,
            "duration": 3,
            "moveSpeed": 300,
            "canAttackTimes":1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",2);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        // this.schedule(()=>{
        //     this.usingNormalParticleTriShot([[0, 0], [-160, 0], [160, 0]],0.5);
        // }, 1);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.4);
        }, 1);
    }
}

