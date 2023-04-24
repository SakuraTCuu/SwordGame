import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss4')
export class Boss4 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 600,
            "duration": 3,
            "moveSpeed": 400,
            "canAttackTimes": 1,
        },
        "sprint": {
            "speed": 500,
        }
    };

    onLoad() {
        this.initSprintData();
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",4);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleCircle(20, 100,0.5);
        }, 10);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },1);
        this.schedule(() => {
            this.isToSprintHero(0,() => {
                // this.usingNormalParticleTriShot([[0, 0], [-160, 0], [160, 0]],0.4);
                this.usingNormalParticleCircle(20, 100,0.5);
            });
        }, 7);
    }
}

