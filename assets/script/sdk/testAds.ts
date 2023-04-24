
/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-10-19 10:42:54
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-25 16:02:35
 * @FilePath: \copy9train\assets\script\sdk\testAds.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component} from 'cc';
import { em } from '../global/EventManager';
const { ccclass } = _decorator;

@ccclass('testAds')
export class testAds extends Component {
    start() {
        em.dispatch("createPlayADEvent",this.node,"GameMonetize");
    }
    
}

