/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-22 14:23:18
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-03 10:24:38
 * @FilePath: \copy9train\assets\script\hero\weapon\Spell.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass } = _decorator;

@ccclass('Spell')
export class Spell extends Weapon {
    init(data,lv) {
        this.initWeaponInfo(lv,data);
        let weaponName:string = data.name;
        this.initBoxCollider(tagData[weaponName]);
        // this.schedule(this.playSpellAudio,1);
    }
    playSpellAudio(){
        em.dispatch("playOneShot","battle/spell");
    }
}

