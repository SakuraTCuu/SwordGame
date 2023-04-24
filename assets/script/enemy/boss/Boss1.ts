/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-13 21:13:30
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 16:13:46
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss1.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find, NodePool, Prefab, assert, instantiate, UITransform, Animation, NodeEventType, __private } from 'cc';
import { em } from '../../global/EventManager';
import { ggd } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Queue } from '../../global/Queue';
import { glf } from '../../global/globalFun';
import { monsterData } from '../monster/MonsterData';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss1')
export class Boss1 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 200,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes": 1,
        },
        "sprint": {
            "speed": 600,
        }
    };
    onLoad() {
        this.initSprintData();
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 1);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        // this.schedule(this.usingNormalParticleOneShot, 1);
        this.schedule(()=>{
            this.isToSprintHero(200);
        }, 3);
    }
}

