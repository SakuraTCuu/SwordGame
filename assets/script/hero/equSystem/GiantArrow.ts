import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { attackInterval, tagData } from '../../global/globalData';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('GiantArrow')
export class GiantArrow extends Weapon {
    init() {
        this.initEquData();
        this.clearCacheData();
        this.changeBulletRotationByFlyDir();
    }
    initEquData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        let heroDir = em.dispatch("getHeroControlProperty", "_curDirection");
        let dir = {
            x: heroDir.x,
            y: heroDir.y,
        }
        if (dir.x == 0 && dir.y == 0) dir.x = -1;
        this._damage = data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes ;
        this._duration = 3;
        this._moveSpeed = 700;
        this._backDis = 500;
        this._attackInterval = 1;
        this._canAttackTimes = Infinity;
        this._weaponName = "giantArrow";
        this._flyDir = dir;

        this.initEquDataByExtraProperties(data);
    }


}


