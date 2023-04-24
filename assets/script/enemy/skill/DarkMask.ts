/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-09 14:11:31
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-09 14:46:04
 * @FilePath: \copy9train\assets\script\enemy\skill\DarkMask.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { EnemySkill } from './EnemySkill';
const { ccclass, property } = _decorator;

@ccclass('DarkMask')
export class DarkMask extends EnemySkill {
    init(){
        this.initCollider();
    }
    onBeginContact(self,other){
        if(other.tag !==tagData.hero) return;
        em.dispatch("usingHeroControlFun", "addDebuffBanMove", 2);
    }

}

