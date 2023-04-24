/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-09-20 11:45:37
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-10-26 16:14:14
 * @FilePath: \copy9train\assets\script\hero\weapon\ThousandsSwordToTomb.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, Vec2, math, tween, Vec3, Sprite, Color, color, UITransform, BoxCollider2D, Contact2DType } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('ThousandsSwordToTomb')
export class ThousandsSwordToTomb extends Weapon {

    _moveDistance: number;
    _isPlayAnim: boolean;

    init(skillData) {
        this.initSkillData(skillData);
    }
    initSkillData(data) {
        this._isPlayAnim = false;
        this._damage = data.damage;
        // this._moveDistance = data.moveDistance;
        this._moveDistance = data.moveDistance - this.node.getComponent(UITransform).contentSize.x / 4;
        console.log("data.moveDistance", data.moveDistance);
        console.log("this._moveDistance", this._moveDistance);

        this._moveSpeed = 2000;
        this._canAttackTimes = Infinity;
        this._backDis = 0;
        this._attackInterval = 0.5;
        this._weaponName = data.name;
        this.node.getComponent(Sprite).color = new Color(255, 204, 0, 255);//恢复原来的颜色
        let wp = em.dispatch("getHeroWorldPos");
        let xDir = math.random() > .5 ? Math.random() : -math.random();
        xDir *= .7;
        // xDir+=(xDir/Math.abs(xDir)*0.3);
        let h = data.moveDistance;
        this.node.setWorldPosition(wp.x - (h * xDir), wp.y + h, wp.z);
        this._flyDir = new Vec2(xDir, -1);
        console.log("this._flyDir", this._flyDir);


        this.clearCacheData();
        this.initBoxCollider(tagData.sword);
        this.changeBulletRotationByFlyDir();
    }
    initBoxCollider(tag: number, changeSize: { x, y } = { x: 0, y: 0 }) {
        if (!tag) throw "tag is" + tag;
        // let collider = this.node.addComponent(BoxCollider2D);
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        collider.tag = tag;
        collider.group = groupIndex.heroWeapon;
        // console.log("collider", collider);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    weaponMove(deltaTime: number) {
        // return;
        if (ggd.stopAll) return;
        if (!this._flyDir) return;
        if (this._moveDistance <= 0) {
            this.playDestroyAnim();
            return;
        }
        if (this._moveSpeed == 0) return;

        let dis = deltaTime * this._moveSpeed;
        // let dis = deltaTime*(this._moveSpeed+bonusMS);
        let moveX = this._flyDir.x * dis;
        let moveY = this._flyDir.y * dis;
        this.node.setPosition(this.node.getPosition().x + moveX, this.node.getPosition().y + moveY, 0);
        this._moveDistance += moveY;

    }
    playDestroyAnim() {
        if (this._isPlayAnim) return;
        em.dispatch("playOneShot","battle/砸地");
        this._isPlayAnim = true;
        let color = new Color(255, 255, 255, 255);
        tween(this.node).by(.5, { position: new Vec3(0, 0, 0) }, {
            onUpdate: (target, ratio) => {
                this.node.getComponent(Sprite).color = Color.lerp(new Color(), color, new Color(color.r, color.g, color.b, 0), ratio);
            }
        }).call(() => {
            this.recoveryToPool();
        }).start();
    }
}
