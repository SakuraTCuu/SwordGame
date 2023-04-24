import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('GiantSword')
export class GiantSword extends Weapon {
    init() {
        this.initEquData();
        this.clearCacheData();
        this.addToAnimManger();
    }
    initEquData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        this._damage = data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes;

        this._duration = 2;
        this._moveSpeed = 700;
        this._backDis = 50;
        this._attackInterval = 2;
        this._canAttackTimes = Infinity;
        this._weaponName = "giantSword";

        this.initEquDataByExtraProperties(data);

    }
    //自我销毁
    recoveryToPool() {
        this.removeAnimFromList();
        plm.putToPool(this._weaponName, this.node);
    }
}


