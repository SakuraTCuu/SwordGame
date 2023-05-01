import { _decorator, Component, Node, NodePool, find } from 'cc';
import { em } from '../../global/EventManager';
import { plm } from '../../global/PoolManager';
import { Boss5 } from './Boss5';
import { Constant } from '../../Common/Constant';
import Queue from '../../Libs/Structs/Queue';
import { EnemySkill } from '../skill/EnemySkill';
const { ccclass, property } = _decorator;

@ccclass('Boss10')
export class Boss10 extends Boss5 {

    _skillData: any = {
        "1": 299,//绿色闪电
        "2": 600,//加速
        "3": 1500,//回血量
        "4": 5000//普通攻击
    }
    onLoad() {

        // let bossData = em.dispatch("usingHeroBasePropertyFun","getBossDataById",10);
        let bossData = app.staticData.getBossDataById(10);

        bossData.canMove = true;
        this._skillData[4] = bossData.normalDamage;
        plm.addPoolToPools("greenThunder", new NodePool(), this.skillPrefab);
        this.initBossInfo(bossData);
        this.setBossStrategy();
    }
    /**
    * @description:设置boss 攻击策略
    * @Strategy1 每隔5s释放一次闪电
    * @Strategy2 血量低于1/3 时 释放一次 cd30s 持续回血15s 每秒恢复skillData[3]
    * @Strategy3 距离超过2000px 自动使用
    * @Strategy4 @function usingSkillCollectionGT 每过10s  释放一次聚集的GT
    */
    setBossStrategy() {
        this.usingSkillGreenThunderAllTheTime(2);
        this.schedule(this.isUsingSkillPhotosynthesis, 1);
        this.schedule(this.isAccelerateToHero, 1);
        this.schedule(this.usingSkillCollectionGT, 10);
    }
    //每过10s  释放一次聚集的GT
    usingSkillCollectionGT() {
        if (Constant.GlobalGameData.stopAll) return;
        let total = 20;
        if (total <= 0) throw new Error("error");
        let queue = new Queue<Node>();
        while (total > 0) {
            let prefab = plm.getFromPool("greenThunder");
            queue.enqueue(prefab)
            total--;
        }
        let createFun = () => {
            if (Constant.GlobalGameData.stopAll) return;
            let gt = queue.dequeue();
            if (gt) {
                gt.getComponent(EnemySkill).init(this._skillData[1]);
                let hwp = em.dispatch("getHeroWorldPos");
                gt.parent = find("Canvas/bulletLayer");
                gt.setWorldPosition(hwp.x, hwp.y + 100, hwp.y);
            } else this.unschedule(createFun);
        }
        this.schedule(createFun, 0.3);
    }
}

