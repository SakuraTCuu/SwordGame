/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 22:24:50
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 22:40:42
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss36.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-12-14 22:24:50
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-12-14 22:38:51
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss36.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss36')
export class Boss36 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 7158750,
            "duration": 3,
            "moveSpeed": 590,
            "canAttackTimes":1,
        },
    };
    
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",36);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        // this.schedule(() => {
        //     this.usingNormalParticleCircle(20, 100);
        // }, 4);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },2);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },2);
    }
}

