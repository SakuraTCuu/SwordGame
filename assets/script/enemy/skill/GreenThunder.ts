/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-09 13:24:43
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-09 15:18:16
 * @FilePath: \copy9train\assets\script\enemy\skill\GreenThunder.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { EnemySkill } from './EnemySkill';
const { ccclass, property } = _decorator;

@ccclass('GreenThunder')
export class GreenThunder extends EnemySkill {
    init(damage) {
        this._skillName = "greenThunder";
        this._damage = damage;
        this.initCollider();
    }
}

