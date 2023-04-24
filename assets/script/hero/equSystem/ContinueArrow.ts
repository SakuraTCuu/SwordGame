import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from '../weapon/Weapon';
const { ccclass, property } = _decorator;

@ccclass('ContinueArrow')
export class ContinueArrow extends Weapon {
    init() {
        this.initEquData();
        this.clearCacheData();
        this.initEquBoxCollider(tagData.sword);
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
        this._damage = data.qData.effect.indexOf(1) > -1 ? 0 : data.lData.baseDamage;
        this._damageTimes = data.lData.damageTimes ;
        this._duration = 3;
        this._moveSpeed = 700;
        this._backDis = 10;
        this._attackInterval = 2;
        this._canAttackTimes = 1;
        this._weaponName = "continueArrow";
        this._flyDir = dir;

        this.initEquDataByExtraProperties(data);
    }
}


