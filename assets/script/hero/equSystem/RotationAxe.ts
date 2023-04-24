import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('RotationAxeChild')
export class RotationAxeChild extends Weapon {
    init() {
        this.initEquData();
        this.clearCacheData();
    }
    initEquData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        this._damage = data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes;
        this._duration = Infinity;
        this._moveSpeed = 100;
        this._backDis = 50;
        this._attackInterval = 2;
        this._canAttackTimes = Infinity;
        this._weaponName = "rotationAxeChild";

        this.initEquDataByExtraProperties(data);
    }

}


