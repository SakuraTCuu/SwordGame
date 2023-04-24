import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('LongSword')
export class LongSword extends Weapon {
    init(dir) {
        this.initEquData(dir);
        this.clearCacheData();
        this.changeBulletRotationByFlyDir();
    }
    initEquData(dir) {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        this._damage = data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes;

        this._duration = 2;
        this._moveSpeed = 700;
        this._backDis = 50;
        this._attackInterval = 2;
        this._canAttackTimes = Infinity;
        this._weaponName = "longSword";
        this._flyDir = dir;
        
        this.initEquDataByExtraProperties(data);

    }
}


