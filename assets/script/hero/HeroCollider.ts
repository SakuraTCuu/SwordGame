/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-08-13 11:48:15
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-28 13:49:58
 * @FilePath: \to-be-immortal\assets\script\hero\HeroCollider.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Contact2DType, Collider2D, BoxCollider2D, UITransform, Size, Sprite, UI } from 'cc';
import { em } from '../global/EventManager';
import { ggd, groupIndex, tagData } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('HeroCollider')
export class HeroCollider extends Component {

    _touchFireBallFire = false;
    _isInsideObs = false;

    start() {
        this.openCollider();

    }
    openCollider() {
        let collider = this.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let monsterSize = new Size(UIT.contentSize.x/2, UIT.contentSize.y);
        collider.tag = tagData.hero;
        collider.size = monsterSize;
        collider.group = groupIndex.self;
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    onBeginContact(self: Collider2D, other: Collider2D) {
        switch (other.tag) {
            case tagData.fireBall:
                this.fireBallAttackHero();
                break;
            case tagData.fireBallFire:
                this._touchFireBallFire = true;
                this.fireBallFireAttackHero();
                break;
            case tagData.obstacle:
                this._isInsideObs = true;
                em.dispatch("usingHeroControlFun", "changeMoveState",false);
                let fun = ()=>{
                    if(this._isInsideObs) em.dispatch("usingHeroControlFun", "ejectFormObs");
                    else this.unschedule(fun);
                }
                this.schedule(fun,0.01);
                break;
            case tagData.randomSkillReward:
                other.node.destroy();
                em.dispatch("usingHeroControlFun","selectUpgradeReward");
                break;
            default:
                let ignore = [tagData.boss, tagData.monster, tagData.enemySkill];//在其他碰撞脚本中已经做过处理 再此忽略
                if (ignore.indexOf(other.tag) > -1) break;
                throw new Error("未处理的碰撞开始：" + self.tag + "与" + other.tag + "发生碰撞");
        }
    }

    onEndContact(self: Collider2D, other: Collider2D) {
        switch (other.tag) {
            case tagData.fireBallFire:
                this._touchFireBallFire = false;
                break;
            case tagData.obstacle:
                console.log("碰撞障碍物 未处理");
                this._isInsideObs = false;
                em.dispatch("usingHeroControlFun", "changeMoveState",true);
                break;
            default:
                break;
        }
    }
    // 火球攻击玩家
    fireBallAttackHero() {
        if (ggd.stopAll) return;
        let damage = 10;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -damage);
    }
    //火球爆炸后的火攻击玩家
    fireBallFireAttackHero() {
        if (ggd.stopAll) return;
        if (!this._touchFireBallFire) return;
        let damage = 8;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -damage);
        let attackInterval = 0.5;
        this.scheduleOnce(() => {
            this.fireBallFireAttackHero();
        }, attackInterval);
    }


}

