import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss27')
export class Boss27 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 3277500,
            "duration": 3,
            "moveSpeed": 550,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",27);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleOneShot(0.5);
        }, 0.8);
        this.schedule(() => {
            this.usingNormalParticleTriShot([[0, 0], [-180, 0], [180, 0]],0.5);
        }, 3);
    }
}

