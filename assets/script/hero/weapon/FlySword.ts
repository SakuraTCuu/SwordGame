import { _decorator, Component, Node, BoxCollider2D, find } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('FlySword')
export class FlySword extends Weapon {

    _curTargetRect = null;
    _flyState: number = 0;//0：无状态，初始状态。 1：飞向目标点。 2：飞回玩家身边。
    start() {
        let data = em.dispatch("getWeaponDataByIdOrName", "flySword");
        this.init(data, 2);
        this.schedule(() => {
            this.seekNearestEnemy();
        }, 0.5);
    }
    init(data, lv) {
        this.initWeaponInfo(lv, data);
        let weaponName: string = data.name;
        // this.initBoxCollider(tagData.sword);
        let changeSize = {
            x:-20,
            y:-20
        }
        this.initBoxCollider(tagData.sword,changeSize);
    }
    seekNearestEnemy() {

        if (ggd.stopAll) return;
        if (this._flyState !== 0) return;
        let tree = em.dispatch("getCurMonsterQuadtree");
        let collider = this.node.getComponent(BoxCollider2D);
        let rect = collider.worldAABB;
        let res = tree.retrieve(rect);
        if (res.length) {
            // this._curTargetRect = res.shift();
            this._curTargetRect = res[Math.random()*res.length|0];
            // this.node.parent = find("Canvas/bulletLayer");
            this._flyState = 1;
        }
    }
    update(dt) {
        if (this._flyState == 0) return;
        if (this._flyState == 1) this.flyToTp(dt);
        else if (this._flyState == 2) this.flyToHero(dt);
    }
    flyToTp(dt) {
        if (ggd.stopAll) return;
        // let dis = dt*this._moveSpeed;
        let cp = this.node.getWorldPosition();
        //四叉树位置锁定修正
        let x = this._curTargetRect.x+this._curTargetRect.width/2 - cp.x;
        let y = this._curTargetRect.y+this._curTargetRect.height/2 - cp.y;
        // let x = this._curTargetRect.x - cp.x;
        // let y = this._curTargetRect.y - cp.y;
        let flyDis = dt * this._moveSpeed;
        //可以到达目标点
        if (flyDis * flyDis >= x * x + y * y) {
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y + y, 0);
            this._curTargetRect = null;
            this._flyState = 2;
        } else {//未到达目标点
            let rate = flyDis / Math.sqrt(x * x + y * y);
            x *= rate;
            y *= rate;
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y + y, 0);
        }
    }
    flyToHero(dt) {
        if (ggd.stopAll) return;
        let cp = this.node.getWorldPosition();
        let hwp = em.dispatch("getHeroWorldPos");
        let x = hwp.x - cp.x;
        let y = hwp.y - cp.y;
        // let flyDis = dt * this._moveSpeed;
        let flyDis = dt * this._moveSpeed*2;//返回速度是正常速度的两倍
        //可以到达目标点
        if (flyDis * flyDis >= x * x + y * y) {
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y + y, 0);
            this._flyState = 0;
        } else {//未到达目标点
            let rate = flyDis / Math.sqrt(x * x + y * y);
            x *= rate;
            y *= rate;
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y + y, 0);
        }
    }

}

