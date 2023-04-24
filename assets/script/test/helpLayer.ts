/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-11 17:57:36
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-22 14:47:29
 * @FilePath: \to-be-immortal\assets\script\test\helpLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
import { ggd } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('helpLayer')
export class helpLayer extends Component {
    onBtnUnlockAllStages(){
        ggd.stageProgress = 80;
        em.dispatch("savingGlobalDataToTempData");
    }
    // 解锁下一关
    onBtnUnlockNextStages(){
        if(ggd.stageProgress>=80) return;
        ggd.stageProgress++;
        em.dispatch("savingGlobalDataToTempData");
    }
    onBtnOpenHelpLayer(){
        this.node.active = true;
    }
    onBtnCloseHelpLayer(){
        this.node.active = false;
    }
    onBtnOpenDamageImmunity(){  
        em.dispatch("usingHeroControlFun","openDamageImmunity");
    }
}

