/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-09 14:24:37
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-29 11:00:37
 * @FilePath: \to-be-immortal\assets\script\hero\gameUI\GameSettings.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, instantiate, Prefab, Sprite, Label, find } from 'cc';
import { em } from '../../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('GameSettings')
export class GameSettings extends Component {
    @property(Label)
    contentLabel;
    @property(Label)
    lvLabel;

    onEnable() {
        this.updateHeroPropertiesView();
    }
    updateHeroPropertiesView() {
        // let string: string = "反馈邮箱：739671694@qq.com"+"\n";
        let string: string = "";
        // let string: string = "";
        let lv = em.dispatch("usingHeroBasePropertyFun","getTrainingData","name");
        let weaponDes = em.dispatch("usingWeaponManagerFun","getWeaponDes");
        let heroPropertiesDes = em.dispatch("usingHeroControlFun","getHeroPropertiesDes");
        let SSDes = em.dispatch("usingSkillManagerFun","getSSDes");
        string =  string+weaponDes + heroPropertiesDes+SSDes;
        this.contentLabel.string = string;
        this.lvLabel.string = lv;
    }
    //点击设置  打开设置界面
    onBtnSettings() {
        this.node.active = true;
        em.dispatch("usingHeroControlFun", "pauseGame");
    }
    closeSetting() {
        this.node.active = false;
        em.dispatch("usingHeroControlFun", "resumeGame");
    }

}

