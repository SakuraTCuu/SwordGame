import { _decorator, Component, Node, tween, Vec3, Sprite, Color } from 'cc';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('LandFire')
export class LandFire extends Weapon {
    _canMove = false;
    init(data, lv, flyDir: { x: number, y: number }) {
        this.initWeaponInfo(lv, data, flyDir);
        this.initBoxCollider(tagData.sword, { x: -20, y: -20 });
        this.playShotAnim();
    }
    onDisable(){
        this.node.setScale(new Vec3(1,1,1));
        // this.node.getComponent(Sprite).color = new Color(255,255,255,0);
    }
    update(dt){
        this.weaponDuration(dt);
    }
    playShotAnim(){
        let animT = 0.5;
        let dis = 280;
        let scale = 1.5;
        let t1 = tween(this.node).by(animT,{scale:new Vec3(scale,scale,1),
            eulerAngles:new Vec3(0,0,360),
            position:new Vec3(this._flyDir.x*dis,this._flyDir.y*dis,0)},{
            onUpdate: (target: any, ratio) => {
                let color = target.getComponent(Sprite).color;
                target.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 255), ratio);
            }
        });
        t1.start();
        // let t2 = tween().to(animT,{rotation:new Vec3(0,0,360)});
        // let t = tween(this.node).parallel(t1,t2);
        // t.start();
    }
}


