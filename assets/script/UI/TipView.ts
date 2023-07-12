
import { _decorator, Component, Node, tween, Sprite, Color, Vec3, Label } from 'cc';
import IView from '../Interfaces/IView';
import { Constant } from '../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('TipView')
export class TipView extends IView {

    protected onRegister?(...r: any[]): void {
        this.subscribe(Constant.EventId.tipsViewShow, this.showTips, this);
    }

    protected onUnRegister?(...r: any[]): void {
        this.unsubscribe(Constant.EventId.tipsViewShow, this.showTips, this)
    }

    onTick(delta: number): void {
        // throw new Error('Method not implemented.');
    }

    //显示信息
    showTips(string: string = "请传参", time: number = 1): void {
        this.node.children[0].getComponent(Label).string = string;
        let animT = .5;
        let t1 = tween().to(animT, { scale: new Vec3(1, 1, 1) }, {
            onUpdate: (target: any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 255), ratio);
            }
        });
        let t2 = tween().to(animT, { scale: new Vec3(1, 1, 1) }, {
            onUpdate: (target: any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        });
        let wait = tween().delay(time);
        let t = tween(this.node).sequence(t1, wait, t2);
        t.start();
    }

}

