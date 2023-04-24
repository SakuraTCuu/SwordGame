/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-02 15:27:33
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-02 16:08:28
 * @FilePath: \copy9train\assets\script\hero\weapon\FireBloom.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('FireBloom')
export class FireBloom extends Weapon {
    init(){
        this.initSkillData();
    }
    initSkillData(){
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "fireBloom");
        this._damage = data.baseDamage;
        this._moveSpeed = 0;
        this._canAttackTimes = Infinity;
        this._backDis = 0;
        this._attackInterval = 1;
        this._weaponName = data.name2;
        this.clearCacheData();
        this.initBoxCollider(tagData.sword);
    }
}

