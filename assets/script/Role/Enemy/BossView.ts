
import { _decorator, Component, Node, Collider2D, BoxCollider2D, Button, Size, Contact2DType, Color, Sprite, Animation, UITransform, Vec2, find, NodePool, instantiate, Prefab } from 'cc';
import { em } from '../../global/EventManager';
import { plm } from '../../global/PoolManager';
import { Constant } from '../../Common/Constant';
import Utils from '../../Common/Utils';
import Queue from '../../Libs/Structs/Queue';
import IView from '../../Interfaces/IView';
import BossLogic from './BossLogic';
import MonsterUtil from '../../Common/MonsterUtil';
const { ccclass, property } = _decorator;

@ccclass('BossView')
export class BossView extends IView {

    @property({
        type: Prefab,
        displayName: "boss冲刺预警预制件"
    })
    SprintTipsPrefab: Prefab = null;

    @property({
        type: Node,
        displayName: "普通粒子节点"
    })
    NormalParticleNode: Node = null;

    @property({
        type: Node,
        displayName: "boss皮肤"
    })
    SkinNode: Node = null;

    @property({
        type: Sprite,
        displayName: "boss血条"
    })
    BloodSprite: Sprite = null;

    bossLogic: BossLogic = null;

    // 默认属性
    _isTouchHero = false;
    _isTouchFriend1Skill1 = false;
    _isTouchSpell = false;

    _normalDamage = 99;

    //冲刺碰撞技能
    _sprintDir = null; //boss 冲刺方向
    _sprintDis: number; //boss 冲刺距离

    private _bossId: number = 0;

    public initBoss(bossId: number) {
        this._bossId = bossId;
    }

    protected onRegister?(...r: any[]): void {
        this.bossLogic = new BossLogic(this._bossId);
        this.setBossStrategy();
        this.initView();
    }
    protected onUnRegister?(...r: any[]): void {
        console.log("关闭所有回调");
        this.unscheduleAllCallbacks();
    }
    onTick(delta: number): void {
        if (Constant.GlobalGameData.stopAll) return;
        this.updateSpriteDirection();
        this.moveToHero(delta);
    }

    setBossStrategy() {
        this.schedule(() => {
            this.isToSprintHero(200);
        }, 3);
    }

    // =====================初始化阶段=====================
    initView() {
        plm.addPoolToPools("normalParticle", new NodePool(), this.NormalParticleNode);

        let animKey = this.bossLogic.getAnimKey();
        this.initBossMoveAnim(animKey);
        this.updateBloodSprite();
        this.initCollider();
    }

    updateBlood(damage: number) {
        this.bossLogic.updateBlood(damage);
    }

    updateBloodSprite() {
        this.BloodSprite.fillRange = this.bossLogic.getBloodPercentage();
        if (this.bossLogic.getIsDead()) {
            console.log("Dead");
            this.unscheduleAllCallbacks();
            this.node.destroy();
            Constant.GlobalGameData.stopAll = true;
            em.dispatch("passStage");
        }
    }

    // 初始化boss移动动画
    initBossMoveAnim(animKey) {
        let path = "/anim/enemy/monster/" + animKey;
        app.loader.load("resources", path, (err, assets) => {
            if (err) {
                console.log(err);
                return;
            }
            this.SkinNode.getComponent(Animation).defaultClip = assets;
            this.SkinNode.getComponent(Animation).play();
        });
    }

    // 初始化碰撞器
    // initCollider(data: { size: Size, tag: number }) {
    initCollider() {
        let collider = this.SkinNode.addComponent(BoxCollider2D);
        let UIT = this.SkinNode.getComponent(UITransform);
        let bossSize = new Size(UIT.contentSize.x, UIT.contentSize.y);
        collider.tag = Constant.Tag.boss;
        collider.size = bossSize;
        collider.group = Constant.GroupIndex.enemy;

        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    //向玩家移动
    moveToHero(dt) {
        if (!this.bossLogic.canMove) return;
        let targetPos = em.dispatch("getHeroWorldPos");
        let curPos = this.node.getWorldPosition();

        let x = targetPos.x - curPos.x;
        let y = targetPos.y - curPos.y;
        let dis = Math.sqrt(x * x + y * y);
        if (dis >= MonsterUtil.minGapWithHero2) {//离得较近时 无需移动
            let time = dis / this.bossLogic.curSpeed;
            let moveDisX = dt / time * x;
            let moveDisY = dt / time * y;
            this.node.setWorldPosition(curPos.x + moveDisX, curPos.y + moveDisY, 0);
        }
    }

    // // 刷新面朝方向
    updateSpriteDirection() {
        let x = em.dispatch("getHeroWorldPos").x - this.node.getChildByName("sprite").getWorldPosition().x;
        let scale = this.node.getChildByName("sprite").getScale();

        if (x > 0) this.node.getChildByName("sprite").setScale(-Math.abs(scale.x), scale.y, scale.z);
        else if (x < 0) this.node.getChildByName("sprite").setScale(Math.abs(scale.x), scale.y, scale.z);
    }

    // 加速冲刺
    accelerateToHero(t) {
        this.scheduleOnce(() => {
            this.bossLogic.curSpeed = this.bossLogic.rawSpeed;
        }, t);
    }

    //根据方向改变矩形的旋转
    changeRotationByDir(node, dir) {
        if (dir.x == 0 && dir.y == 0) return;//无方向 暂不处理
        if (dir.x == 0) {//没有x方向
            if (dir.y > 0) node.angle = -90;
            else node.angle = 90;
            return;
        };
        if (dir.y == 0) {//没有y方向
            if (dir.x > 0) node.angle = 180;
            else node.angle = 0;
            return;
        };
        let bevelLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        let sin = Math.abs(dir.y) / bevelLen;
        let asin = Math.asin(sin);
        let angle = asin / Math.PI * 180;
        if (dir.y > 0) {//向上飞行
            if (dir.x > 0) node.angle = 180 + angle;
            else node.angle = 360 - angle;
        } else {
            if (dir.x > 0) node.angle = 180 - angle;
            else node.angle = angle;
        }
    }

    /**
     * @description 是否冲向玩家
     * @param {number} offsetDis 冲刺后距离目标的距离 修正距离
     * @param {Function} cb 冲刺结束的回调，默认为空
     * @param {Function} ingCb 冲刺过程中的回调，默认为空
     * @param {number} ingGap ingCb的释放间隔
    */
    isToSprintHero(offsetDis: number = 0, endCb: Function = null, ingCb: Function = null, ingGap: number = 1) {
        if (!this.bossLogic.canMove) return;
        let targetPos = em.dispatch("getHeroWorldPos");
        let curPos = this.node.getWorldPosition();
        let x = targetPos.x - curPos.x;
        let y = targetPos.y - curPos.y;
        let dis = Math.sqrt(x * x + y * y) + offsetDis;
        this.bossLogic.canMove = false;

        this._sprintDir = Utils.getTwoPointFlyDir(targetPos, curPos);
        this._sprintDis = dis;
        //创建提示预制件
        let prefab = instantiate(this.SprintTipsPrefab);
        let anim = prefab.getComponent(Animation);
        anim.on(Animation.EventType.FINISHED, () => {
            if (this.node) this.startSprint(prefab, endCb, ingCb, ingGap);
        });
        prefab.getComponent(UITransform).setContentSize(dis, this.node.getChildByName("sprite").getComponent(UITransform).width - 20);
        this.changeRotationByDir(prefab, this._sprintDir);
        // prefab.parent = this.node;
        // prefab.setPosition(0, 0, 0);
        prefab.parent = find("Canvas/bulletLayer");
        let wp = this.node.getWorldPosition();
        prefab.setWorldPosition(wp);
    }
    /**
     * @description 开始冲刺 
     * @param {Node} prefab 提示预制件 播放完毕销毁 
     * @param {Function} endCb 冲刺结束的回调，默认为空 
    */
    startSprint(prefab, endCb: Function = null, ingCb: Function = null, ingGap: number) {
        let interval = 1 / 60;
        let speed = this.bossLogic.sprintSpeed * interval;
        let callback = () => {
            let curPos = this.node.getWorldPosition();
            this.node.setWorldPosition(curPos.x + speed * this._sprintDir.x, curPos.y + speed * this._sprintDir.y, 0);
            this._sprintDis -= speed;
            if (this._sprintDis <= 0) {
                this._sprintDis = 0;
                this.unschedule(callback);
                if (ingCb) this.unschedule(ingCb);
                this.bossLogic.canMove = true;
                prefab.destroy();
                if (endCb) endCb();
            }
        }
        if (ingCb) {
            ingCb();//先执行一遍
            this.schedule(ingCb, ingGap);
        }
        this.schedule(callback, interval);
    }

    //====================boss碰撞逻辑==========================
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (Constant.GlobalGameData.stopAll) return;
        // console.log(otherCollider);

        switch (otherCollider.tag) {
            case Constant.Tag.hero:
                this._isTouchHero = true;
                this.bossAttackHeroByCollider(selfCollider, otherCollider);
                break;
            case Constant.Tag.friend1Skill1:
                this._isTouchFriend1Skill1 = true;
                this.friendAttackBossByFriend1Skill1(selfCollider, otherCollider);
                break;
            case Constant.Tag.darts:
                this.heroAttackBossByDarts();
                break;
            case Constant.Tag.sword:
                this.heroAttackBossByDarts();
                break;
            default:
                break;
        }
    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {

        switch (otherCollider.tag) {
            case Constant.Tag.hero:
                this._isTouchHero = false;
                break;
            case Constant.Tag.spell:
                this._isTouchSpell = false;
                break;
            case Constant.Tag.friend1Skill1:
                this._isTouchFriend1Skill1 = false;
                break;
            default:
                break;
        }
    }
    // boss攻击玩家
    bossAttackHeroByCollider(self, other) {
        if (Constant.GlobalGameData.stopAll) return;
        if (!this._isTouchHero) return;
        let damage = this._normalDamage;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -damage);
        let t: number = 1;
        this.scheduleOnce(() => {
            this.bossAttackHeroByCollider(self, other);
        }, t);
    }
    //被宝宝技能击中
    friendAttackBossByFriend1Skill1(self, other) {
        if (Constant.GlobalGameData.stopAll) return;
        if (!this._isTouchFriend1Skill1) return;
        let damage = 5;
        em.dispatch("createDamageTex", self.node, damage, { x: 0, y: 20 });

        this.bossLogic.attackedByHero({
            damage: -damage,
        });
        this.updateBloodSprite();

        this.collectToTarget(self, other);
        this.scheduleOnce(() => {
            this.friendAttackBossByFriend1Skill1(self, other);
        }, Constant.AttackInterval.f1s1);
    }
    /**
     * @description: boss被飞镖攻击
     */
    heroAttackBossByDarts() {
        console.log("boss被飞镖攻击 还没写");
        //TODO:  武器的基本攻击力 + 英雄的基本攻击力
        let damage = em.dispatch("usingHeroControlFun", "getCurDamage");
        this.updateBlood(-damage);
        this.updateBloodSprite();

    }

    //boss被击退
    bossIsRepelled() {
        // this.flashWhite();//闪白  被击退的特效
        let hwp = em.dispatch("getHeroWorldPos");
        let mwp = this.node.getWorldPosition();
        mwp.subtract3f(hwp.x, hwp.y, hwp.z).normalize();
        let backDis = 20;
        let pos = this.node.getPosition();
        this.node.setPosition(pos.x + backDis * mwp.x, pos.y + backDis * mwp.y, 0);
    }
    //向目标聚合
    collectToTarget(self, target) {
        if (!target) return;//target被销毁等
        let twp = target.node.getWorldPosition();
        let mwp = self.node.getWorldPosition();
        twp.subtract3f(mwp.x, mwp.y, mwp.z).normalize();
        let collectDis = 20;
        let pos = this.node.getPosition();
        this.node.setPosition(pos.x + collectDis * twp.x, pos.y + collectDis * twp.y, 0);
    }
    // 获取距离玩家的距离
    getDistanceToHero() {
        let targetPos = em.dispatch("getHeroWorldPos");
        let curPos = this.node.getWorldPosition();
        let x = targetPos.x - curPos.x;
        let y = targetPos.y - curPos.y;
        return Math.sqrt(x * x + y * y);
    }
    pauseAnim() {
        // this.node.getChildByName("sprite").getComponent(Animation).pause();
        this.SkinNode.getComponent(Animation).pause();
    }
    resumeAnim() {
        // this.node.getChildByName("sprite").getComponent(Animation).resume();
        this.SkinNode.getComponent(Animation).resume();
    }

    // 获取朝向hero的方向
    getDirToHero() {
        let nwp = this.node.getWorldPosition();
        let hwp = em.dispatch("getHeroWorldPos");
        let x = hwp.x - nwp.x;
        let y = hwp.y - nwp.y;
        let dir = {
            x: 0,
            y: 0
        }
        let offset = {
            x: x,
            y: y
        }
        if (offset.x == 0) {
            dir.x = 0;
            dir.y = Math.abs(offset.y) / offset.y;
        } else if (offset.y == 0) {
            dir.x = Math.abs(offset.x) / offset.x;
            dir.y = 0;
        } else {
            let rate = Math.abs(offset.x / offset.y);
            if (rate >= 1) {
                dir.x = Math.abs(offset.x) / offset.x;
                dir.y = 1 / rate * Math.abs(offset.y) / offset.y;
            } else {
                dir.x = rate * Math.abs(offset.x) / offset.x;
                dir.y = Math.abs(offset.y) / offset.y;
            };
        };
        return new Vec2(dir.x, dir.y);
    }

    //父类提供的子弹 --->atom 
    //发射1发子弹 scale 为子弹碰撞体缩放
    usingNormalParticleOneShot(scale = 1) {
        if (Constant.GlobalGameData.stopAll) return;
        let np = plm.getFromPool("normalParticle");
        let flyDir = this.getDirToHero();
        np.parent = find("Canvas/bulletLayer");
        let wp = this.node.getWorldPosition();
        np.active = true;
        np.setWorldPosition(wp);
        np.getComponent("EnemySkill").init(this.bossLogic.skillData.normalParticle, flyDir, scale);
    }

    // 发射三发子弹
    usingNormalParticleTriShot(posArr, scale = 1) {
        if (Constant.GlobalGameData.stopAll) return;
        for (const pos of posArr) {
            let np = plm.getFromPool("normalParticle");
            let flyDir = this.getDirToHero();
            np.parent = find("Canvas/bulletLayer");
            let wp = this.node.getWorldPosition();
            np.active = true;
            np.setWorldPosition(wp.x + pos[0], wp.y + pos[1], wp.z);
            np.getComponent("EnemySkill").init(this.bossLogic.skillData.normalParticle, flyDir, scale);
        }
    }

    //粒子三角 向hero方向释放三角形粒子集
    usingNormalParticleTriangle(scale = 1) {
        let row = 5;
        let triPosArr = Utils.getTriangleRow(row);
        let queue = new Queue<Array<any>>();
        for (let i = triPosArr.length - 1; i >= 0; i--) {
            let initPosArr = triPosArr[i];
            let arr = [];
            for (let j = 0; j < initPosArr.length; j++) {
                let initPos = initPosArr[j];
                let dp: any = plm.getFromPool("normalParticle");
                dp.active = true;
                dp.setPosition(0, 0, 0);
                dp.initPos = initPos;
                arr.push(dp);
            }
            queue.enqueue(arr);
        }
        let fun = () => {
            if (Constant.GlobalGameData.stopAll) return;
            let arr = queue.dequeue();
            if (arr) {
                let layer = find("Canvas/bulletLayer");
                for (const dp of arr) {
                    dp.parent = layer;
                    // 转换成可使用的方向
                    let flyDir = this.getDirToHero();
                    let wp = this.node.getWorldPosition();
                    wp.x += dp.initPos[0];
                    wp.y += dp.initPos[1];
                    dp.setWorldPosition(wp);
                    dp.getComponent("EnemySkill").init(this.bossLogic.skillData.normalParticle, flyDir, scale);
                }
            } else this.unschedule(fun);
        }
        this.schedule(fun, 0.2);
    }

    //粒子圈 向周边发射一圈粒子 向周边飞行
    usingNormalParticleCircle(total: number, r: number, scale = 1) {
        let initPosArr = Utils.getCirclePos(r, total);
        for (let i = 0; i < total; i++) {
            let dp: any = plm.getFromPool("normalParticle");
            dp.active = true;
            dp.setPosition(0, 0, 0);
            let layer = find("Canvas/bulletLayer");
            dp.parent = layer;
            let initPos = initPosArr[i];
            let dir = { x: initPos[0] / r, y: initPos[1] / r };
            // 转换成可使用的方向
            let flyDir = new Vec2(dir.x, dir.y);
            let wp = this.node.getWorldPosition();
            wp.x += initPos[0];
            wp.y += initPos[1];
            dp.setWorldPosition(wp);
            dp.getComponent("EnemySkill").init(this.bossLogic.skillData.normalParticle, flyDir, scale);
        }
    }

    //向指定方向两端发射子弹 
    usingNormalParticleWithDoubleDir(curDir) {
        console.log("向指定方向两端发射子弹");
        if (Constant.GlobalGameData.stopAll) return;
        let dirs = this.getVerticalDirToCurDir(curDir);
        for (const dir of dirs) {
            let np = plm.getFromPool("normalParticle");
            np.parent = find("Canvas/bulletLayer");
            let wp = this.node.getWorldPosition();
            np.active = true;
            np.setWorldPosition(wp);
            np.getComponent("EnemySkill").init(this.bossLogic.skillData.normalParticle, dir, 0.2);
        }
    }

    // 获取当前方向上的垂直方向
    getVerticalDirToCurDir(curDir) {
        let a = Math.abs(curDir.x / curDir.y);
        if (a > 1) {
            return [
                { x: curDir.y / curDir.x, y: -1 },
                { x: -curDir.y / curDir.x, y: 1 }
            ];
        } else {
            return [
                { x: 1, y: -curDir.x / curDir.y },
                { x: -1, y: curDir.x / curDir.y }
            ];
        }
    }
}

