import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss53')
export class Boss53 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 100400000,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",53);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(this.usingNormalParticleOneShot, 1);
        this.schedule(()=>{
            this.usingNormalParticleTriangle(0.5);
        }, 5);
    }   
}

