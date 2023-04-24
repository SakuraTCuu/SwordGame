import { _decorator, Component, Node, find, instantiate, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { Boss } from './Boss';
const { ccclass, property } = _decorator;

@ccclass('Boss9')
export class Boss9 extends Boss {
    _skillData = {
        "normalParticle": {
            "name": "normalParticle",
            "damage": 2500,
            "duration": 3,
            "moveSpeed": 500,
            "canAttackTimes": 1,
        },
        "ice": {
            "name": "ice",
            "damage": 10,
            "duration": 5,
            "moveSpeed": 0,
            "canAttackTimes": Infinity,
            "attackInterval": 1,
            "effects": ["slow"]
        }
    };

    onLoad() {
        let bossData = em.dispatch("usingHeroBasePropertyFun", "getBossDataById", 9);
        bossData.canMove = true;
        this._skillData.normalParticle.damage = bossData.normalDamage;
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    setBossStrategy() {
        this.schedule(() => {
            this.usingNormalParticleOneShot(0.5);
        }, 1);
        // this.schedule(() => {
        //     this.usingNormalParticleCircle(12, 50, 0.5);
        // }, 2);
        this.schedule(() => {
            this.usingNormalParticleTriangle(0.5);
        }, 5);

        this.schedule(() => {
            this.createTipsPrefab();
        }, 6);
    }
    createTipsPrefab() {
        let prefab = find("tips", this.node);
        let targetPos = em.dispatch("getHeroWorldPos");
        // let posArr = [[-200, 0], [200, 0], [0, -200], [0, 200]];
        let posArr = [[-200, 0], [200, 0], [0, -200], [0, 200],
        [-200,-200],[200,-200],[-200,200],[200,200],];
        for (const pos of posArr) {
            let tips = instantiate(prefab);
            tips.parent = find("Canvas/bulletLayer");
            tips.setWorldPosition(targetPos.x + pos[0], targetPos.y + pos[1], targetPos.z);
            tips.active = true;
            let anim: any = tips.getComponent(Animation);
            anim.on("finished", () => {
                if (!anim) return;
                tips.destroy();
                this.createIce([targetPos.x + pos[0], targetPos.y + pos[1]]);
            });
        }
    }
    // 创建冰块
    createIce(pos) {
        let prefab = find("icePrefab", this.node);
        let ice: any = instantiate(prefab);
        ice.parent = find("Canvas/bulletLayer");
        ice.setWorldPosition(pos[0], pos[1], 0);
        ice.active = true;
        ice.getComponent("EnemySkill").init(this._skillData.ice);
    }
}

