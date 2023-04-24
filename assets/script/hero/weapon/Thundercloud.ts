import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('Thundercloud')
export class Thundercloud extends Weapon {
    init() {
        this._moveSpeed = em.dispatch("usingHeroControlFun", "getCurMoveSpeed") * 0.9;
        this.addToAnimManger();
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thundercloud");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.3;
        this._weaponName = data.name2;
        // this.clearCacheData();
        let changeSize = {
            x: -30,
            y: -50
        }
        this.initBoxCollider(tagData.sword, changeSize);
    }
    recoveryToPool() {
        this.removeAnimFromList();
        this.node.destroy();
    }
    weaponMove(dt) {
        // return
        if (ggd.stopAll) return;
        let targetPos = em.dispatch("getTargetWorldPos");
        let curPos = this.node.getWorldPosition();
        let x = targetPos.x - curPos.x;
        let y = targetPos.y - curPos.y;
        let dis = Math.sqrt(x * x + y * y);
        let time = this._moveSpeed == 0 ? 0 : dis / this._moveSpeed;
        let moveDisX = (time == 0 ? 0 : dt / time * x);
        let moveDisY = (time == 0 ? 0 : dt / time * y);
        this.node.setWorldPosition(curPos.x + moveDisX, curPos.y + moveDisY, 0);
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        this.updateMonsterBlood(other);
        if (Math.random() < 0.2) {
            let script = other.node.getComponent("Monster");
            if (script) script.addDebuffParalysis(5);
        }

    }
}

