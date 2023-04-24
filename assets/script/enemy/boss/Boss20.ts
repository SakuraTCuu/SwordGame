/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-11 17:57:36
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-14 11:17:33
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss4.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, find, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { plm } from '../../global/PoolManager';
import { Boss15 } from './Boss15';
const { ccclass, property } = _decorator;

@ccclass('Boss20')
export class Boss20 extends Boss15 {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 22222,
            "duration": 4,
            "moveSpeed": 600,
            "canAttackTimes":1,
        },
        "maxMS": 1000,
    }
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",20);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this._darkMaskPrefab = find("/darkMask", this.node);
        this._blackHolePrefab = find("/blackHole", this.node);
        plm.addPoolToPools("blackHole", new NodePool(), this._blackHolePrefab);
        this.setBossStrategy();
    }
}

