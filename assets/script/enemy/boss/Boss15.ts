/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-08 18:06:01
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 17:53:51
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss15.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Prefab, find, instantiate, approx, Vec2, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { ggd } from '../../global/globalData';
import { glf } from '../../global/globalFun';
import { plm } from '../../global/PoolManager';
import { Queue } from '../../global/Queue';
import { BlackHole } from '../skill/BlackHole';
import { DarkMask } from '../skill/DarkMask';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss15')
export class Boss15 extends Boss {

    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 9999,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes": 1,
        },
        "maxMS": 800,
    }
    _darkMaskPrefab: Node;
    _blackHolePrefab: Node;
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",15);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this._darkMaskPrefab = find("/darkMask", this.node);
        this._blackHolePrefab = find("/blackHole", this.node);
        plm.addPoolToPools("blackHole", new NodePool(), this._blackHolePrefab);
        this.setBossStrategy();
    }
    /**
     * @description: boss3 行动策略
     * @strategy1 每4s 释放一次黑暗粒子圈
     * @strategy2 每5s 释放一次黑暗笼罩 
     * @strategy3 每5s 释放一次黑洞
     */
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100,0.5);
        }, 4);
        // this.schedule(this.usingDarkMask, 5);
        // this.schedule(this.usingBlackHole, 10);
        this.schedule(() => {
            this.usingNormalParticleTriangle(0.5);
        }, 3);
    }

    //黑暗笼罩 将玩家困在黑暗笼罩中 无法动弹
    usingDarkMask() {
        let dm: any = instantiate(this._darkMaskPrefab);
        let hwp = em.dispatch("getHeroWorldPos");
        dm.parent = find("Canvas/bulletLayer");
        dm.setWorldPosition(hwp.x, hwp.y, hwp.y);
        dm.getComponent("DarkMask").init();
        dm.active = true;
    }
    // 黑洞
    usingBlackHole() {
        let bh: any = plm.getFromPool("blackHole");
        let hwp = em.dispatch("getHeroWorldPos");
        bh.parent = find("Canvas/bulletLayer");
        bh.setWorldPosition(hwp.x, hwp.y, hwp.y);
        bh.getComponent("BlackHole").init();
        bh.active = true;
    }
    //是否加速冲向玩家
    isAccelerateToHero() {
        let dis = this.getDistanceToHero();
        if (dis > 2000) {
            this._curSpeed = this._skillData.maxMS;
            let t = dis / this._curSpeed;
            this.accelerateToHero(t);
        }
    }
}

