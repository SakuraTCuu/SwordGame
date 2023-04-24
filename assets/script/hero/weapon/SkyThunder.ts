import { _decorator, Component, Node, BoxCollider2D, Animation, UITransform, Size, Contact2DType, NodePool } from 'cc';
import { em } from '../../global/EventManager';
import { groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Sword } from './Sword';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('SkyThunder')
export class SkyThunder extends Weapon {

    // _recoveryCount: number = 0;
    init(data, lv) {
        this.initWeaponInfo(lv, data);
        this.initBoxCollider(tagData.sword, { x: -50, y: -30 });
        this.node.getComponent(Animation).play();
    }
    update(dt){
        this.weaponDuration(dt);
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        if (this.isHasAttacked(other.node.uuid)) return;//已经被雷攻击过的对象 忽略后续攻击
        this.updateMonsterBlood(other);
        this._hasAttackedEnemies.push(other.node.uuid);
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool("this._canAttackTimes <= 0");
    }


}


