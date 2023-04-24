import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('IceSpiritNeedle')
export class IceSpiritNeedle extends Weapon {
    init(data, lv, flyDir: { x: number, y: number }) {
        this.initWeaponInfo(lv, data, flyDir);
        this.initBoxCollider(tagData.sword);
        this.changeBulletRotationByFlyDir();
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        if (this.isHasAttacked(other.node.uuid)) return;//已经被剑攻击过的对象 忽略后续攻击
        this.updateMonsterBlood(other);
        this._hasAttackedEnemies.push(other.node.uuid);
        this._canAttackTimes--;
        let script = other.node.getComponent("Monster");
        if(script) script.addDebuffFrozen(5);
        if (this._canAttackTimes <= 0) this.recoveryToPool();
    }
}


