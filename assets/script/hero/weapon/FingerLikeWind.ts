/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-23 22:06:51
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-24 11:08:25
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\FingerLikeWind.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('FingerLikeWind')
export class FingerLikeWind extends Weapon {
    init() {
        this.addToAnimManger();
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "fingerLikeWind");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.5;
        this._weaponName = data.name;
        this.node.parent = em.dispatch("getHeroControlProperty", "node").getChildByName("skillParent");
        this.initBoxCollider(tagData.sword);
    }
    update(deltaTime: number) {
        this.weaponMove(deltaTime);
        this.weaponDuration(deltaTime);
        // this.changeDirByAimDir(90);
        this.changeDirByMoveDir(90);
    }
    //自我销毁
    recoveryToPool() {
        this.removeAnimFromList();
        this.node.destroy();
    }
    addToAnimManger() {
        let anim = this.node.getComponent(Animation);
        em.dispatch("usingGameAnimManagerFun", "addAnimToList", anim);
    }
    removeAnimFromList() {
        let anim = this.node.getComponent(Animation);
        em.dispatch("usingGameAnimManagerFun", "removeAnimFromList", anim);
    }
}

