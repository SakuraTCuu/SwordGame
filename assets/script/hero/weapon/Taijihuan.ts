import { _decorator, Component, Node, random } from 'cc';
import { ggd, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('Taijihuan')
export class Taijihuan extends Weapon {

    _fallDuration: number;
    _rawDuration: number;
    _randomDir: number;
    init(data, lv, flyDir: { x: number, y: number }) {
        this.initWeaponInfo(lv, data, flyDir);
        if (lv >= 5) {
            this.node.setScale(2, 2, 1);
        }
        this.initBoxCollider(tagData.sword, { x: -40, y: -40 });
        // if(lv>=5){
        //     this.node.setScale(2,2,1);
        //     this.initBoxCollider(tagData.sword, { x: -80, y: -80 });
        // }else this.initBoxCollider(tagData.sword, { x: -40, y: -40 });

        this._fallDuration = this._duration * 3 / 4;
        this._rawDuration = this._duration;
        if (Math.random() > 0.5) this._randomDir = 1;
        else this._randomDir = -1;
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        if (this.isHasAttacked(other.node.uuid)) return;//已经被剑攻击过的对象 忽略后续攻击
        this.updateMonsterBlood(other);
        this._hasAttackedEnemies.push(other.node.uuid);
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool();
    }
    weaponMove(deltaTime) {
        if (ggd.stopAll) return;
        if (!this._flyDir) return;
        let y = deltaTime * this._moveSpeed;
        let b = 1.2;

        if (this._duration > this._fallDuration) {//上升
            let rate = (this._duration - this._fallDuration) / (this._rawDuration - this._fallDuration);
            // console.log("rate up", rate);
            y = rate * y;
            let x = Math.sqrt(y) * this._randomDir * b;
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y + y, 0);
        } else {
            let rate = (this._fallDuration - this._duration) / this._fallDuration;
            if (rate > 1) rate = 1;
            // console.log("rate fall", rate);
            y = rate * y * 2;
            let x = Math.sqrt(y) * this._randomDir * b;
            this.node.setPosition(this.node.getPosition().x + x, this.node.getPosition().y - y, 0);
        }
    }
}


