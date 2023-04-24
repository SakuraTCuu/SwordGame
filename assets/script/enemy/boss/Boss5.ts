/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-11 09:52:21
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 11:48:24
 * @FilePath: \to-be-immortal\assets\script\enemy\boss\Boss1.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
//需要添加两个最终技能 1 藤蔓（控制） 2 高伤害技能
import { _decorator, Component, Node, Size, UITransform, Prefab, instantiate, Vec2, tween, Vec3, Material, Animation, Sprite, find, BoxCollider2D, math, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss5')
export class Boss5 extends Boss {
    @property(Prefab)
    skillPrefab;

    _skillData = {
        "1": 15,//绿色闪电
        "2": 300,//加速
        "3": 500,//回血量
        "4": 50,//普通攻击
        "normalParticle": {
            "name": "normalParticle",
            "damage": 200,
            "duration": 3,
            "moveSpeed": 300,
            "canAttackTimes":1,
        },
    }

    _photosynthesisTimes = 2;//光合作用可使用次数
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 5);
        bossData.canMove = true;
        this._skillData[4] = bossData.normalDamage;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        plm.addPoolToPools("greenThunder", new NodePool(), this.skillPrefab);
        this.initBossInfo(bossData);
        // 连续多道闪电
        // this.usingSkillGreenThunderAllTheTime(3);
        // this.scheduleOnce(this.usingSkillPhotosynthesis, 5);
        this.setBossStrategy();
    }

    //==============boss技能当前=====================


    // 绿色闪电
    usingSkillGreenThunder() {
        let gt = plm.getFromPool("greenThunder");
        gt.getComponent("GreenThunder").init(this._skillData[1]);
        let hwp = em.dispatch("getHeroWorldPos");
        gt.parent = find("Canvas/bulletLayer");
        gt.setWorldPosition(hwp.x, hwp.y + 100, hwp.y);
    }
    // 光合作用
    usingSkillPhotosynthesis(t) {
        console.log("开启光合作用");
        this._photosynthesisTimes--;
        if (this._photosynthesisTimes < 0) return;
        this.node.getChildByName("photosynthesis").active = true;
        this.unschedule(this.recoveryHealthy);
        this.schedule(this.recoveryHealthy, 1, t);
        this.scheduleOnce(() => {
            this.node.getChildByName("photosynthesis").active = false;
        }, t);
    }
    recoveryHealthy() {
        this.updateBlood(this._skillData[3]);
    }

    //重写
    bossAttackHeroByCollider(self, other) {
        if (ggd.stopAll) return;
        if (!this._isTouchHero) return;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -this._skillData[4]);
        this.usingNormalAttack();
        let t: number = 2;
        this.scheduleOnce(() => {
            this.bossAttackHeroByCollider(self, other);
        }, t);

    }
    // 普通攻击
    usingNormalAttack() {
        this._curSpeed = this._rawSpeed;
        let hwp = em.dispatch("getHeroWorldPos");
        let bwp = this.node.getWorldPosition();
        let x = hwp.x - bwp.x;
        let y = hwp.y - bwp.y;
        let unitDis = 50;
        let angle = 0;
        let offset = { x: unitDis, y: 0 }
        let xScale = 1;
        if (Math.abs(x) > Math.abs(y)) {
            if (x < 0) {
                angle = 180;
                offset.x = -unitDis;
                xScale = -1;
            }
        } else {
            if (y > 0) {
                angle = 90;
                offset.x = 0;
                offset.y = unitDis;
            }
            else {
                angle = 270;
                offset.x = 0;
                offset.y = -unitDis;
            }
        }
        let attack = this.node.getChildByName("attack");
        attack.angle = angle;
        attack.setPosition(offset.x, offset.y);
        attack.setScale(1, xScale);
        let anim = attack.getComponent(Animation);
        anim.play();
    }
    //一直释放闪电
    usingSkillGreenThunderAllTheTime(t) {
        this.schedule(() => {
            this.usingSkillGreenThunder();
        }, t);
    }

    /**
     * @description:设置boss 攻击策略
     * @Strategy1 每隔5s释放一次闪电
     * @Strategy2 血量低于1/3 时 释放一次 cd30s 持续回血15s 每秒恢复200
     * @Strategy3 距离超过2000px 自动使用
     */
    setBossStrategy() {
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.4);
        }, 1);
        this.usingSkillGreenThunderAllTheTime(5);
        this.schedule(this.isUsingSkillPhotosynthesis, 1);
        this.schedule(this.isAccelerateToHero, 1);
    }
    //是否开启光合作用
    isUsingSkillPhotosynthesis() {
        let percentage = this.getBloodPercentage();
        if (percentage < 0.33) {
            this.usingSkillPhotosynthesis(15);
            this.unschedule(this.isUsingSkillPhotosynthesis);
            this.scheduleOnce(() => {
                this.schedule(this.isUsingSkillPhotosynthesis, 1);
            }, 30);
        }
    }
    //是否加速冲向玩家
    isAccelerateToHero() {
        let dis = this.getDistanceToHero();
        if (dis > 2000) {
            this._curSpeed = this._skillData[2];
            let t = dis / this._curSpeed;
            this.accelerateToHero(t);
        }
    }
    // pauseAnim(){
    //     this.node.getChildByName("sprite").getComponent(Animation).stop();
    // }
    // resumeAnim() {
    //     this.node.getChildByName("sprite").getComponent(Animation).resume();
    // }
}

