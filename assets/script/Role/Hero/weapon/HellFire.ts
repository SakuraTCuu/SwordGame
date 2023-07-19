import { _decorator, Component, Node } from 'cc';
import { Weapon } from './Weapon';
import { Constant } from '../../../Common/Constant';
import { em } from '../../../Common/EventManager';
const { ccclass, property } = _decorator;

@ccclass('HellFire')
export class HellFire extends Weapon {
    init(){
        this.initSkillData();
    }
    initSkillData(){
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "hellFire");
        this._damage = data.baseDamage+(em.dispatch("usingHeroControlFun","getCurDamage")*data.damageTimes|0);
        this._moveSpeed = 0;
        this._canAttackTimes = Infinity;
        this._backDis = 0;
        this._attackInterval = 1;
        this._weaponName = data.name2;
        this.clearCacheData();
        this.initBoxCollider(Constant.Tag.sword);
    }
}

