import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss26')
export class Boss26 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 2846250,
            "duration": 3,
            "moveSpeed": 590,
            "canAttackTimes":1,
        },
    };
    
    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",26);
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

