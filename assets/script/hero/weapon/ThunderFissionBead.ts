import { _decorator, Component, Node, find, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('ThunderFissionBead')
export class ThunderFissionBead extends Weapon {

    _canSplitTimes: number = 0;

    init(splitTimes:number, dir) {
        this._canSplitTimes = splitTimes;
        this._flyDir = dir;
        this.initSkillData();
        //em.dispatch("playOneShot","battle/bullet");
        //每秒检测一次是否超过距离
        this.isExceedMaxDistance(500, 1);
        this.node.getComponent(Animation).play();
        this.addToAnimManger();
    }

    // 初始化武器信息
    initSkillData() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderFissionBead");
        this._curData = data;
        this._weaponId = data.id;
        this._weaponName = data.name2;
        this._maxLevel = data.maxLevel;
        // this._duration = data.duration;
        this._duration = 10;
        this._damage = data.baseDamage;
        this._damageTimes = data.damageTimes;
        // this._moveSpeed = 600;
        this._moveSpeed = 60;
        this._attackInterval = 0.5;
        this.initBoxCollider(tagData.sword);
        this.clearCacheData();
    }
    update(deltaTime: number) {
        this.weaponMove(deltaTime);
        this.weaponDuration(deltaTime);
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        this.updateMonsterBlood(other);
        this.changeFlyDir();
    }
    colliderBoss(other) {
        if (this.isStopRun(other)) return;
        this.updateBossBlood(other);
        this.changeFlyDir();
    }
    changeFlyDir() {
        --this._canSplitTimes;
        // let radian = Math.sin(Math.random() * 30);
        let radian = Math.sin(30 + Math.random() * 30);
        //反向向量
        this._flyDir.x = -this._flyDir.x;
        this._flyDir.y = -this._flyDir.y;
        let dir1 = this.getRotationDir(this._flyDir, radian);
        this._flyDir = dir1;
        if (this._canSplitTimes > 0) {
            let dir2 = this.getRotationDir(this._flyDir, -radian);
            this.createSplitTFB(dir2);
        }

    }
    // 获取旋转后的方向
    getRotationDir(dir, radian) {
        //向量旋转指定弧度的角度
        let x = dir.x;
        let y = dir.y;
        let x2 = x * Math.cos(radian) - y * Math.sin(radian);
        let y2 = x * Math.sin(radian) + y * Math.cos(radian);
        return { x: x2, y: y2 };
    }
    // 创建分裂珠子
    createSplitTFB(dir) {
        let TFB = plm.getFromPool("thunderFissionBead");
        let layer = find("Canvas/bulletLayer");
        TFB.parent = layer;
        let wp = this.node.getWorldPosition();
        let unit = 50;
        TFB.setWorldPosition(wp.x + dir.x * unit, wp.y + dir.y * unit, wp.z);
        // TFB.setWorldPosition(wp);
        TFB.getComponent("ThunderFissionBead").init(this._canSplitTimes, dir);
    }
    //自我销毁
    recoveryToPool() {
        this.removeAnimFromList();
        plm.putToPool(this._weaponName, this.node);
    }
}

