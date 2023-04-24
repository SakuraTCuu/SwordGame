/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-02 18:09:21
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-04 14:30:14
 * @FilePath: \copy9train\assets\script\hero\weapon\MoveLikeFire.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('MoveLikeFire')
export class MoveLikeFire extends Weapon {
    init(){
        this.initSkillData();
        
    }
    initSkillData(){
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "moveLikeFire");
        this._damage = data.baseDamage;
        // this._duration = data.duration;
        this._moveSpeed = 0;
        this._canAttackTimes = Infinity;
        this._backDis = 10;
        this._attackInterval = 0.3;//
        this._weaponName = data.name2;
        this.clearCacheData();
        this.initBoxCollider(tagData.sword);
        let anim = this.node.getComponent(Animation);
        anim.play();
    }
}

