import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('ShockWave')
export class ShockWave extends Weapon {
    init(dir) {
        this.initEquData(dir);
        this.clearCacheData();
        this.changeBulletRotationByFlyDir();
    }
    initEquData(dir) {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        this._damage = data.lData.baseDamage;
        this._damageTimes = 0;

        this._duration = 2;
        this._moveSpeed = 700;
        this._backDis = 50;
        this._attackInterval = 2;
        this._canAttackTimes = Infinity;
        this._weaponName = "shockWave";
        // this._flyDir.x = dir.x;
        // this._flyDir.y = 0;
        this._flyDir = {
            x:dir.x/Math.abs(dir.x),
            y:0
        }
        if(data.qData.effect.indexOf(1006) > -1) this._damage*=0.5;
        this.initEquDataByExtraProperties(data);

    }
}


