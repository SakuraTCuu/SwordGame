import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('DoomsdayStorm')
export class DoomsdayStorm extends Weapon {
    _moveDistance: number;
    init(flyDir) {
        this._moveSpeed = 1000;
        this._moveDistance = 300;
        this.addToAnimManger();
        this._flyDir = {
            x: flyDir[0],
            y: flyDir[1]
        }
        this.initSkillData();
    }
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "doomsdayStorm");
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        this._duration = data.duration;
        this._backDis = 0;
        this._canAttackTimes = Infinity;
        this._attackInterval = 0.3;
        this._weaponName = data.name2;
        // this.clearCacheData();
        this.initBoxCollider(tagData.sword);
    }
    weaponMove(deltaTime: number) {
        // return;
        if (ggd.stopAll) return;
        if (!this._flyDir) return;
        if (this._moveDistance <= 0) {
            // this.playDestroyAnim();
            // 进入停留5s后消失
            return;
        }
        if (this._moveSpeed == 0) return;
        let dis = deltaTime * this._moveSpeed;
        // let dis = deltaTime*(this._moveSpeed+bonusMS);
        let moveX = this._flyDir.x * dis;
        let moveY = this._flyDir.y * dis;
        this.node.setPosition(this.node.getPosition().x + moveX, this.node.getPosition().y + moveY, 0);
        this._moveDistance -= dis;
    }
}

