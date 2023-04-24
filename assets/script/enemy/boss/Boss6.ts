/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 16:44:35
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 19:34:40
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss6.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-12-14 16:44:35
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 17:57:17
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss6.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { ggd } from '../../global/globalData';
import { glf } from '../../global/globalFun';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss6')
export class Boss6 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 1000,
            "duration": 3,
            "moveSpeed": 800,
            "canAttackTimes": 1,
        },
        "sprint": {
            "speed": 500,
        }
    };

    onLoad() {
        this.initSprintData();
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 6);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100,0.2);
        }, 8);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.2);
        },1);
        // this.schedule(()=>{
        //     this.usingNormalParticleOneShot(0.5);
        // },2);

        this.schedule(() => {
            if (ggd.stopAll) return;
            let targetPos = em.dispatch("getHeroWorldPos");
            let curPos = this.node.getWorldPosition();
            if (!glf.towPointDisGreaterThanValue(targetPos, curPos, 300)) return;//不大于200的距离不释放该技能
            this.isToSprintHero(200, null, () => {
                // console.log("向两边发射子弹");
                this.usingNormalParticleWithDoubleDir(this._sprintDir);
            }, 0.5);
        }, 3);
    }
}

