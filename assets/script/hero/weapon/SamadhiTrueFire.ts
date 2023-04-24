/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-11 17:57:36
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-30 17:44:37
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\SamadhiTrueFire.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-02 11:35:35
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-25 10:58:36
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\SamadhiTrueFire.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('SamadhiTrueFire')
export class SamadhiTrueFire extends Weapon {
    onDestroy() {

    }
    init() {
        this.addToAnimManger();
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "samadhiTrueFire");
        this._damage = data.baseDamage;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.5;
        this._weaponName = data.name2;
        this.node.parent = em.dispatch("getHeroControlProperty", "node").getChildByName("sprite");
        // this.clearCacheData();
        this.initBoxCollider(tagData.sword);
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

