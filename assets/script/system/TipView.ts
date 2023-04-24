/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-11 09:31:53
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-09-08 14:21:13
 * @FilePath: \copy9train\assets\script\system\TipView.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, tween, Sprite, Color, Vec3, Label } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('TipView')
export class TipView extends Component {

    onLoad() {
        em.add("tipsViewShow",this.tipsViewShow.bind(this));
    }
    onDestroy(){
        em.remove("tipsViewShow");
    }

    //显示信息
    tipsViewShow(string:string="请传参", time:number = 1) {
        this.node.children[0].getComponent(Label).string = string;
        let animT = .5;
        let t1 = tween().to(animT, { scale: new Vec3(1,1,1) },{
            onUpdate: (target:any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 255), ratio);
            }
        });
        let t2 =  tween().to(animT, { scale: new Vec3(1,1,1) },{
            onUpdate: (target:any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let wait = tween().delay(time);
        let t = tween(this.node).sequence(t1,wait,t2);
        t.start();
    }

}

