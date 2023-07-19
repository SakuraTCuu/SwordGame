import { _decorator, Component, Node, Animation } from 'cc';
import { Weapon } from './Weapon';
import { Constant } from '../../../Common/Constant';
import { em } from '../../../Common/EventManager';
const { ccclass, property } = _decorator;

@ccclass('FingerLikeWind')
export class FingerLikeWind extends Weapon {
    init() {
        this.addToAnimManger();
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "fingerLikeWind");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.5;
        this._weaponName = data.name;
        this.node.parent = em.dispatch("getHeroControlProperty", "node").getChildByName("skillParent");
        this.initBoxCollider(Constant.Tag.sword);
    }
    update(deltaTime: number) {
        this.weaponMove(deltaTime);
        this.weaponDuration(deltaTime);
        // this.changeDirByAimDir(90);
        this.changeDirByMoveDir(90);
    }
    //自我销毁
    recoveryToPool() {
        this.removeAnimFromList();
        this.node.destroy();
    }
    addToAnimManger() {
        let anim = this.node.getComponent(Animation);
        app.anim.addAnimToList(anim);
    }
    removeAnimFromList() {
        let anim = this.node.getComponent(Animation);
        app.anim.removeAnimFromList(anim);
    }
}

