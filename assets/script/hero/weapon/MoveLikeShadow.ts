/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-11-23 10:27:57
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-23 11:15:09
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\MoveLikeShadow.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node } from 'cc';
import { Puppet } from '../Puppet';
import { Weapon } from './Weapon';
import { Constant } from '../../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('MoveLikeShadow')
export class MoveLikeShadow extends Puppet {
    init(maxBlood){
        this._maxBlood = maxBlood;
        this._curBlood = maxBlood;
        this.initNodeCallBack();
        this.initBoxCollider(Constant.Tag.puppet,Constant.GroupIndex.self);
    }
    
}

