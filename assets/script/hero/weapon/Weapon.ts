/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-19 11:46:40
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-12-14 11:41:43
 * @FilePath: \to-be-immortal\assets\script\hero\weapon\Weapon.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, BoxCollider2D, Size, Contact2DType, Collider2D, Color, UITransform, physics, CircleCollider2D, PolygonCollider2D, game, Animation, Intersection2D, find } from 'cc';
import { em } from '../../global/EventManager';
import { attackInterval, ggd, groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
const { ccclass } = _decorator;

@ccclass('Weapon')
export class Weapon extends Component {

    //待初始化属性
    _curLevel: number;
    _curData: any;
    _weaponId: number;
    _weaponName: string;
    _damage: number;
    _damageTimes: number = 0;
    _duration: number;
    _moveSpeed: number;
    // _total: number;
    _maxLevel: number;
    _canAttackTimes: number;
    _backDis: number;
    _attackInterval: number;

    _flyDir: { x: number, y: number };
    //自带属性
    _touchingArr: Collider2D[] = [];//碰撞中的碰撞体
    _hasAttackedEnemies: Collider2D[] = [];//碰撞过的碰撞体


    // 初始化武器信息
    initWeaponInfo(curLv, weaponData, flyDir = { x: 1, y: 1 }) {
        // console.log("初始化" + weaponData.name+this.node.uuid);
        this._curLevel = curLv;
        this._curData = weaponData;
        this._weaponId = weaponData.id;
        this._weaponName = weaponData.name;
        this._maxLevel = weaponData.maxLevel;
        this.initCurLvInfo();
        this._flyDir = flyDir;

        this.clearCacheData();
    }
    // 初始化当前等级信息
    initCurLvInfo() {
        let index = this._curLevel - 1;
        this._damage = this._curData.damage[index];
        this._damageTimes = this._curData.damageTimes.length > 0 ? this._curData.damageTimes[index] : 0;
        this._duration = this._curData.duration.length > 0 ? this._curData.duration[index] : Infinity;
        this._moveSpeed = this._curData.moveSpeed.length > 0 ? this._curData.moveSpeed[index] : 0;
        this._canAttackTimes = this._curData.canAttackTimes.length > 0 ? this._curData.canAttackTimes[index] : Infinity;
        this._backDis = this._curData.backDis.length > 0 ? this._curData.backDis[index] : 0;
        this._attackInterval = this._curData.attackInterval.length > 0 ? this._curData.attackInterval[index] : 0.5;//默认攻击间隔0.5s

        if (this._duration !== 0) {
            let bonusDuration = em.dispatch("getHeroControlProperty", "_bonusBulletDuration");
            this._duration += bonusDuration;
        }
        if (this._moveSpeed !== 0) {
            let bonusMS = em.dispatch("getHeroControlProperty", "_bonusBulletMoveSpeed");
            this._moveSpeed += bonusMS;
        }
        if (this._canAttackTimes !== 0) {
            let bonusATs = em.dispatch("getHeroControlProperty", "_bonusBulletAttackTimes");
            this._canAttackTimes += bonusATs;
        }
    }
    // 清理缓存数据
    clearCacheData() {
        // console.log("清理缓存数据"+this.node.uuid);
        this._touchingArr.length = 0;
        this._hasAttackedEnemies.length = 0;
    }
    onDisable() {
        this.unscheduleAllCallbacks();
    }
    // 初始化box碰撞器
    initBoxCollider(tag: number, changeSize: { x, y } = { x: 0, y: 0 }) {
        if (!tag) throw "tag is" + tag;
        // let collider = this.node.addComponent(BoxCollider2D);
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let weaponSize = new Size(UIT.contentSize.x + changeSize.x, UIT.contentSize.y + changeSize.y);
        collider.tag = tag;
        collider.size = weaponSize;
        collider.group = groupIndex.heroWeapon;
        // console.log("collider", collider);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // 初始化circle碰撞器
    initCircleCollider(tag: number, changeR: number = 0) {
        if (!tag) throw "tag is" + tag;
        let collider = this.node.getComponent(CircleCollider2D);
        if (!collider) collider = this.node.addComponent(CircleCollider2D);
        let UIT = this.node.getComponent(UITransform);
        collider.tag = tag;
        collider.radius = UIT.contentSize.x / 2 + changeR;
        collider.group = groupIndex.heroWeapon;
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    update(dt: number) {
        this.weaponMove(dt);
        this.weaponDuration(dt);
    }
    weaponMove(deltaTime: number) {
        if (ggd.stopAll) return;
        if (!this._flyDir) return;
        if (this._moveSpeed == 0 || this._duration == Infinity) return;

        let dis = deltaTime * this._moveSpeed;
        // let dis = deltaTime*(this._moveSpeed+bonusMS);
        let moveX = this._flyDir.x * dis;
        let moveY = this._flyDir.y * dis;
        this.node.setPosition(this.node.getPosition().x + moveX, this.node.getPosition().y + moveY, 0);
    }
    weaponDuration(deltaTime: number) {
        if (ggd.stopAll) return;
        this._duration -= deltaTime;
        if (this._duration <= 0) this.recoveryToPool("weaponDuration");
    }

    // 通过飞行方向修改子弹旋转方向 没有方向的子弹暂不处理
    changeBulletRotationByFlyDir() {
        if (this._flyDir.x == 0 && this._flyDir.y == 0) return;//无方向 暂不处理
        if (this._flyDir.x == 0) {//没有x方向
            if (this._flyDir.y > 0) this.node.angle = -90;
            else this.node.angle = 90;
            return;
        };
        if (this._flyDir.y == 0) {//没有y方向
            if (this._flyDir.x > 0) this.node.angle = 180;
            else this.node.angle = 0;
            return;
        };
        let bevelLen = Math.sqrt(this._flyDir.x * this._flyDir.x + this._flyDir.y * this._flyDir.y);
        // let sin = Math.sin(this._flyDir.x / bevelLen);
        let sin = Math.sin(Math.abs(this._flyDir.y) / bevelLen);
        let asin = Math.asin(sin);
        let angle = asin * 90;
        // console.log("angle", angle);
        if (this._flyDir.y > 0) {//向上飞行
            if (this._flyDir.x > 0) this.node.angle = 180 + angle;
            else this.node.angle = 360 - angle;
        } else {
            if (this._flyDir.x > 0) this.node.angle = 180 - angle;
            else this.node.angle = angle
        }
    }
    changeDirByAimDir(offsetAngle = 0) {
        let dir = em.dispatch("getHeroControlProperty", "_curAimDir");
        if (dir.x == 0 && dir.y == 0) return;//无方向 暂不处理
        if (dir.x == 0) {//没有x方向
            if (dir.y > 0) this.node.angle = -90 + offsetAngle;
            else this.node.angle = 90 + offsetAngle;
            return;
        };
        if (dir.y == 0) {//没有y方向
            if (dir.x > 0) this.node.angle = 180 + offsetAngle;
            else this.node.angle = offsetAngle;
            return;
        };
        let bevelLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        // let sin = Math.sin(dir.x / bevelLen);
        let sin = Math.abs(dir.y) / bevelLen;
        let asin = Math.asin(sin);
        let angle = asin / Math.PI * 180;
        if (dir.y > 0) {//向上飞行
            if (dir.x > 0) this.node.angle = 180 + angle + offsetAngle;
            else this.node.angle = 360 - angle + offsetAngle;
        } else {
            if (dir.x > 0) this.node.angle = 180 - angle + offsetAngle;
            else this.node.angle = angle + offsetAngle;
        }
    }
    changeDirByMoveDir(offsetAngle = 0) {
        let dir = em.dispatch("getHeroControlProperty", "_curDirection");
        if (dir.x == 0 && dir.y == 0) return;//无方向 暂不处理
        if (dir.x == 0) {//没有x方向
            if (dir.y > 0) this.node.angle = -90 + offsetAngle;
            else this.node.angle = 90 + offsetAngle;
            return;
        };
        if (dir.y == 0) {//没有y方向
            if (dir.x > 0) this.node.angle = 180 + offsetAngle;
            else this.node.angle = offsetAngle;
            return;
        };
        let bevelLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        let sin = Math.abs(dir.y) / bevelLen;
        let asin = Math.asin(sin);
        let angle = asin / Math.PI * 180;
        // console.log("angle", angle);
        if (dir.y > 0) {//向上飞行
            if (dir.x > 0) this.node.angle = 180 + angle + offsetAngle;
            else this.node.angle = 360 - angle + offsetAngle;
        } else {
            if (dir.x > 0) this.node.angle = 180 - angle + offsetAngle;
            else this.node.angle = angle + offsetAngle;
        }
    }
    // ==============================武器碰撞==============================
    onBeginContact(self: Collider2D, other: Collider2D) {

        switch (other.tag) {
            case tagData.wall:
                this.colliderWall(other);
                break;
            case tagData.monster:
                this._touchingArr.push(other);
                this.colliderMonster(other);
                this.scheduleOnce(() => {
                    this.removeFromTouchArr(other);
                }, this._attackInterval);

                break;
            case tagData.boss:
                this._touchingArr.push(other);
                // console.log(this.node.uuid+"添加node uuid is " + other.node.uuid);
                this.colliderBoss(other);
                this.scheduleOnce(() => {
                    this.removeFromTouchArr(other);
                }, this._attackInterval);
                break;
            default:
                break;
        }
    }
    onEndContact(self: Collider2D, other: Collider2D) {
        switch (other.tag) {
            case tagData.monster:
                this.colliderEnemyEnd(other);
                break;
            case tagData.boss:
                this.colliderEnemyEnd(other);
                break;
            default:
                break;
        }
    }
    //父类提供接口 子类实现
    colliderWall(other) {
        console.log(this._weaponName + "撞墙");
    }
    colliderMonster(other) {
        if (this.isStopRun(other)) return;
        this.updateMonsterBlood(other);
        // this._canAttackTimes--;
        // if (this._canAttackTimes <= 0) this.recoveryToPool();
        this.updateCanAttackTimes();
    }
    //攻击怪物和boss的区别 在于击退 穿透等属性 和一些other的内部回调 暂时没写
    colliderBoss(other) {
        if (this.isStopRun(other)) return;
        this.updateBossBlood(other);
        this.updateCanAttackTimes();
    }
    colliderEnemyEnd(other) {
        this.removeFromTouchArr(other);
        // let index = this._touchingArr.indexOf(other);
        // if (index > -1) {
        //     this._touchingArr.splice(index, 1)[0];
        //     // console.log(this.node.uuid+"移除node uuid is " + other.node.uuid);
        // } else {
        //     // this._touchingArr.forEach(node => {
        //     //     console.log("node.uuid is "+node.uuid);
        //     // });
        //     // console.warn(this.node.uuid+"移除node uuid is " + other.node.uuid+" error");
        //     // console.log("other.node", other.node);
        // }
    }
    //从touchArr中移除
    removeFromTouchArr(other) {
        let index = this._touchingArr.indexOf(other);
        if (index > -1) {
            this._touchingArr[index] = this._touchingArr[this._touchingArr.length - 1];
            --this._touchingArr.length;
            if (!other.node || (other.node.parent !== find("Canvas/enemyLayer") && other.node.parent !== find("Canvas/bossLayer"))) return;//不在enemyLayer  已经放入对象池 不在做判断
            let box = this.getComponent(BoxCollider2D);
            let circle = this.getComponent(CircleCollider2D);
            let self = box ? box : circle;
            let isCollide: boolean;
            if (box) isCollide = this.rectIsIntersectsRect(box.worldAABB, other.worldAABB);
            else isCollide = this.rectIsIntersectsRect(circle.worldAABB, other.worldAABB);
            if (isCollide) {
                this.onBeginContact(self, other);
            }
        }
    }
    //是否正在碰撞中
    isTouching(other) {
        return this._touchingArr.indexOf(other) > -1;
    }
    // 是否已经产生过碰撞伤害 通过uuid记录 
    isHasAttacked(uuid) {
        return this._hasAttackedEnemies.indexOf(uuid) > -1;
    }
    updateMonsterBlood(other) {
        let damage = em.dispatch("usingHeroControlFun", "getCurDamage") * (1 + this._damageTimes) + this._damage;
        damage = damage | 0;
        // let damage = em.dispatch("getHeroControlProperty","_damage") + this._damage;
        let isCriticalHit = em.dispatch("usingHeroControlFun", "isCriticalHit")
        if (isCriticalHit) {
            damage *= em.dispatch("usingHeroControlFun", "getCurCriticalHitDamage");
            damage = damage | 0;
            em.dispatch("createDamageTex", other.node, damage, { x: 0, y: 20 }, "criticalHit");
        } else em.dispatch("createDamageTex", other.node, damage, { x: 0, y: 20 });
        let bonusBackDis = em.dispatch("getHeroControlProperty","_bonusBackDis");
        other.node.getComponent("Monster").updateBlood(-damage, this._backDis+bonusBackDis);
    }
    updateBossBlood(other) {
        //boss节点名 必须和boss 名 相同
        let damage = em.dispatch("usingHeroControlFun", "getCurDamage") + this._damage;
        em.dispatch("createDamageTex", other.node, damage, { x: 0, y: 20 });
        let script = other.node.parent.components[0];
        if (script) {
            script.updateBlood(-damage);
        } else {
            throw "script is not init";
        }
    }
    isStopRun(other) {
        // return ggd.stopAll && !this.isTouching(other);
        return ggd.stopAll || !this.isTouching(other);
    }
    // 回收进对象池
    recoveryToPool(type = "unknown") {
        // console.log("回调类型："+type);
        plm.putToPool(this._weaponName, this.node);
        // plm.putToPool(this._weaponName, this.node, true);
    }
    // 刷新穿透次数
    updateCanAttackTimes() {
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryToPool("updateCanAttackTimes");
    }
    addToAnimManger() {
        let anim = this.node.getComponent(Animation);
        em.dispatch("usingGameAnimManagerFun", "addAnimToList", anim);
    }
    removeAnimFromList() {
        let anim = this.node.getComponent(Animation);
        em.dispatch("usingGameAnimManagerFun", "removeAnimFromList", anim);
    }
    //判断矩形是否相交
    rectIsIntersectsRect(rect1, rect2) {
        return rect1.intersects(rect2);
    }
    // 检查是否超过最远距离
    isExceedMaxDistance(dis: number, interval: number) {
        let fun = () => {
            let flag = this.recoveryToPoolWhenWeaponIsDistant(dis);
            if (flag) {
                this.unschedule(fun);
                this.recoveryToPool("isExceedMaxDistance");
            }
        }
        this.schedule(fun, interval);
    }
    recoveryToPoolWhenWeaponIsDistant(dis: number) {
        if (ggd.stopAll) return false;
        if (this.getDistanceToHero() > dis) return true;
    }
    getDistanceToHero() {
        let targetPos = em.dispatch("getTargetWorldPos");
        let curPos = this.node.getWorldPosition();
        return this.getTwoPointDistance(targetPos, curPos);
    }
    //获取两点的距离
    getTwoPointDistance(pos1, pos2) {
        let x = pos1.x - pos2.x;
        let y = pos1.y - pos2.y;
        return Math.sqrt(x * x + y * y);
    }

    //=====================法器专用=====================
    //初始化法器碰撞器 区别在于 法器碰撞器大小和偏移预先设置好 无需变化 只需要设置碰撞回调等...
    initEquBoxCollider(tag: number) {
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) throw "未初始化法器碰撞器";
        collider.tag = tag;
        collider.group = groupIndex.heroWeapon;
        // console.log("collider", collider);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    //初始化装备额外属性
    initEquDataByExtraProperties(data) {
        if (data.qData.effect.indexOf(1) > -1) this._damage = 0;
        if (data.qData.effect.indexOf(3) > -1) {
            this._damage *= 0.7;
            this._damageTimes *= 0.8;
        }
        if (data.qData.effect.indexOf(1002) > -1) this._damageTimes *= 0.1;
        if (data.qData.effect.indexOf(1003) > -1) this._damageTimes *= 0.3;
        if (data.qData.effect.indexOf(1004) > -1) this._damageTimes *= 0.5;
        if (data.qData.effect.indexOf(1008) > -1) this.node.setScale(1.5, 1.5, 2);
        if (data.qData.effect.indexOf(1009) > -1) this.node.setScale(2, 2, 2);
        if (data.qData.effect.indexOf(1010) > -1) this._canAttackTimes++;
        if (data.qData.effect.indexOf(1005) > -1) this.initEquBoxCollider(tagData.destroyWeapon);
        else this.initEquBoxCollider(tagData.sword);
        if (data.qData.effect.indexOf(5001) > -1) this._duration *= 2;
        if (data.qData.effect.indexOf(5002) > -1) this._duration = Infinity;
    }
}

