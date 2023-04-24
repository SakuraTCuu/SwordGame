import { _decorator, Component, Node, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { plm } from '../../global/PoolManager';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('GiantAxe')
export class GiantAxe extends Weapon {

    init() {
        this.initEquData();
        this.clearCacheData();
        this.addToAnimManger();
        let heroDir = em.dispatch("getHeroControlProperty", "_curDirection");
        console.log("heroDir", heroDir);
        let dir = {
            x: heroDir.x,
            y: heroDir.y,
        }
        this._flyDir = dir;
        // this._flyDir.x = dir.x;
        // this._flyDir.y = dir.y;
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        if (this._flyDir.x > 0) {
            if (data.qData.effect.indexOf(5005) > -1) this.node.getComponent(Animation).play("giantAxeR2");
            else this.node.getComponent(Animation).play("giantAxeR");
        }else{
            if (data.qData.effect.indexOf(5005) > -1) this.node.getComponent(Animation).play("giantAxeL2");
            else this.node.getComponent(Animation).play("giantAxeL");
        } 

    }
    initEquData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        this._damage = data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes;

        this._duration = Infinity;
        this._moveSpeed = 0;
        this._backDis = 150;
        this._attackInterval = 2;
        this._canAttackTimes = Infinity;
        this._weaponName = "rotationAxe";

        this.initEquDataByExtraProperties(data);

    }
    recoveryToPool() {
        this.removeAnimFromList();
        plm.putToPool(this._weaponName, this.node);
    }
    // 创建冲击波 通过1006和1007词条
    createShockWaveBy1006or1007() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        if (data.qData.effect.indexOf(1006) > -1 || data.qData.effect.indexOf(1007) > -1) {
            let wp = this.node.getWorldPosition();
            em.dispatch("usingWeaponManagerFun", "createShockWave", wp, this._flyDir);
        }
    }
    //创建冲击波
    createShockWaveBy5005(type) {
        let wp = this.node.getWorldPosition();
        if (type == 1) {
            em.dispatch("usingWeaponManagerFun", "createShockWave", wp, this._flyDir);
        } else {
            em.dispatch("usingWeaponManagerFun", "createShockWave", wp, { x: -this._flyDir.x, y: this._flyDir.y });
        }

    }

}


