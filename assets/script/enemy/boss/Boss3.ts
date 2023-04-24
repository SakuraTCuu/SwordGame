/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 14:08:02
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 17:53:23
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss3.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss3')
export class Boss3 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 300,
            "duration": 3,
            "moveSpeed": 250,
            "canAttackTimes": 1,
        },
        "sprint": {
            "speed": 500,
        }
    };

    onLoad() {
       this.initSprintData();
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 3);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        // this.schedule(this.usingNormalParticleOneShot, 3);
        // this.schedule(()=>{
        //     this.usingNormalParticleTriangle(0.4);
        // }, 5);
        this.schedule(() => {
            this.isToSprintHero(0,() => {
                this.usingNormalParticleTriShot([[0, 0], [-160, 0], [160, 0]],0.4);
            });
        }, 7);
    }

}

