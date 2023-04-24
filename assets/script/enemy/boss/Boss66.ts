import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss66')
export class Boss66 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 194000000,
            "duration": 3,
            "moveSpeed": 590,
            "canAttackTimes":1,
        },
    };
    
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",66);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        // this.schedule(() => {
        //     this.usingNormalParticleCircle(20, 100);
        // }, 4);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },2);
        this.schedule(()=>{
            this.usingNormalParticleOneShot(0.5);
        },2);
    }
}

