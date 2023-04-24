/*
 * @Author: li_jiang_wei 739671694@qq.com
 * @Date: 2022-08-22 22:03:51
 * @LastEditors: li_jiang_wei 739671694@qq.com
 * @LastEditTime: 2022-11-27 16:28:21
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\Darts.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei 739671694@qq.com, All Rights Reserved. 
 */
import { Color, find, Vec2, _decorator } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from './Weapon';
const { ccclass } = _decorator;

@ccclass('Darts')
export class Darts extends Weapon {

    _isCanSplit = false;//是否可分裂
    _isCanSplitTimes = 0;//可分裂次数

    init(data, lv, flyDir: { x: number, y: number }, isCanSplit: boolean = false) {
        this.initWeaponInfo(lv, data, flyDir);
        let weaponName: string = data.name;
        this.initBoxCollider(tagData[weaponName]);
        this._isCanSplit = isCanSplit;
        //em.dispatch("playOneShot","battle/bullet");
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        this.updateMonsterBlood(other);
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool();
        else this.changeFlyDir();
    }
    colliderBoss(other) {
        if (this.isStopRun(other)) return;
        this.updateBossBlood(other);
        if (this._canAttackTimes <= 0) this.recoveryToPool();
        else this.changeFlyDir();
    }
    changeFlyDir() {
        let radian = Math.sin(Math.random() * 30);
        //反向向量
        this._flyDir.x = -this._flyDir.x;
        this._flyDir.y = -this._flyDir.y;
        let dir1 = this.getRotationDir(this._flyDir, radian);
        let dir2 = this.getRotationDir(this._flyDir, -radian);
        this._flyDir = dir1;
        if (this._isCanSplit) {
            this.createSplitDarts(dir2);
            this._isCanSplit = false;//只可分裂一次
        };
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
    // 创建分裂飞镖
    createSplitDarts(dir) {
        let data = em.dispatch("getWeaponDataByIdOrName", "darts");
        let darts = plm.getFromPool("darts");
        let layer = find("Canvas/bulletLayer");
        darts.parent = layer;
        let wp = this.node.getWorldPosition();
        darts.setWorldPosition(wp);
        darts.getComponent("Darts").init(data, data.maxLevel, dir);
    }
}

