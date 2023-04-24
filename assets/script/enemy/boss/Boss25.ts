import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss25')
export class Boss25 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 2415000,
            "duration": 3,
            "moveSpeed": 600,
            "canAttackTimes": 1,
        },
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",25);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100,0.5);
        }, 4);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },1);
    }
}

