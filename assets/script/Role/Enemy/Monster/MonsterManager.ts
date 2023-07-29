import { _decorator, Component, Prefab, NodePool, Vec3, JsonAsset, SpriteAtlas, resources, find, AnimationClip, BoxCollider2D, Rect, Label, input, Input, Node } from 'cc';
import { Constant } from '../../../Common/Constant';
import QuadtreeRect from '../../../Libs/QuadTree/Quadtree';
import RVOConfig from '../../../Libs/RVO/RVOConfig';
import Simulator from '../../../Libs/RVO/Simulator';
import { em } from '../../../Common/EventManager';
import { Monster } from './Monster';
import { MonsterLeader } from './MonsterLeader';
import { BossView } from '../BossView';
import IView from '../../../Interfaces/IView';
const { ccclass, property } = _decorator;

@ccclass('MonsterManager')
export class MonsterManager extends IView {

    @property(Node)
    enemyLayer: Node = null;

    @property(Node)
    bossLayer: Node = null;

    @property(Label)
    monsterTotalLabel;

    _distance: number = 300;

    _initPosList = {
        "up": { x: 0, y: this._distance },
        "down": { x: 0, y: -this._distance },
        "left": { x: -this._distance, y: 0 },
        "right": { x: this._distance, y: 0 }
    };
    _monsterProperties = {};

    _createCount: number = 0;//记录monster 创建数

    _quadtree: QuadtreeRect;//四叉树

    _waitCreateQueue = [];//等待创建怪物的队列

    _enemyNoodeConfig = ["normal", "green", "red", "yellow", "others", "white", "frozen", "paralysis", "effect_frozen"];

    _monsterNodeList: Record<string, Node | undefined> = {};

    protected onRegister?(...r: any[]): void {
        em.add("usingMonsterManagerFun", this.usingMonsterManagerFun.bind(this));
        em.add("createMonsterByOutsideData", this.createMonsterByOutsideData.bind(this));
        em.add("createMonsterLeader", this.createMonsterLeader.bind(this));
        em.add("getMonsterTotal", this.getMonsterTotal.bind(this));
        em.add("removeAllMonsters", this.removeAllMonsters.bind(this));
        this.subscribe(Constant.EventId.createMonsterDamageTex, this.createMonsterDamageTex.bind(this));
        em.add("getAllMonsterColliders", this.getAllMonsterColliders.bind(this));
        em.add("getCurMonsterQuadtree", this.getCurMonsterQuadtree.bind(this));

        this.initRVOConfig();
        this.initEnemyLayer();
    }

    protected onUnRegister?(...r: any[]): void {
        em.remove("usingMonsterManagerFun");
        em.remove("createMonsterByOutsideData");
        em.remove("createMonsterLeader");
        em.remove("getMonsterTotal");
        em.remove("removeAllMonsters");
        this.unsubscribe(Constant.EventId.createMonsterDamageTex, this.createMonsterDamageTex, this);
        em.remove("getAllMonsterColliders");
        em.remove("getCurMonsterQuadtree");
    }

    onTick(delta: number): void {
        if (Constant.GlobalGameData.stopAll) return;
        this.updateQuadtree();
        Simulator.Instance.doStep();
        if (!Constant.GlobalGameConfig.framingInitMonster) return;
        if (this._waitCreateQueue.length > 0) {
            // console.log("分帧生成", this._waitCreateQueue);
            let max = 1;
            let count = this._waitCreateQueue.length > max ? max : this._waitCreateQueue.length;
            while (count) {
                let data = this._waitCreateQueue.shift();
                this.createMonster(data.monsterId, data.pos, data.initOffset);
                count--;
            }
        }
    }

    start() {
        this.initQuadTree();
        this.showMonsterTotal(1);//测试函数
    }

    initRVOConfig() {
        Simulator.Instance.setTimeStep(RVOConfig.gameTimeStep);
        Simulator.Instance.setAgentDefaults(RVOConfig.neighborDist, RVOConfig.maxNeighbors, RVOConfig.timeHorizon, RVOConfig.timeHorizonObst,
            RVOConfig.radius, RVOConfig.maxSpeed, RVOConfig.velocity);
    }

    initEnemyLayer() {
        for (const name of this._enemyNoodeConfig) {
            let node = new Node(name);
            node.parent = this.enemyLayer;
            this._monsterNodeList[name] = node;
        };
    }

    // 刷新四叉树
    updateQuadtree() {
        if (Constant.GlobalGameData.stopAll) return;
        let wp = em.dispatch("getHeroWorldPos");
        this._quadtree = new QuadtreeRect({
            x: wp.x - Constant.GlobalGameConfig.quadTreeRange.w / 2,
            y: wp.y - Constant.GlobalGameConfig.quadTreeRange.h / 2,
            width: Constant.GlobalGameConfig.quadTreeRange.w,//750
            height: Constant.GlobalGameConfig.quadTreeRange.h,//1334
        });
        for (let i = 0; i < this.node.children.length; i++) {
            let par = this.node.children[i];
            for (const child of par.children) {
                let collider = child.getComponent(BoxCollider2D);
                // let wp = child.getWorldPosition();
                let rect = collider.worldAABB;
                if (Math.abs((wp.x - rect.x - rect.width / 2)) > Constant.GlobalGameConfig.quadTreeRange.w / 2) continue;
                if (Math.abs((wp.y - rect.y - rect.height / 2)) > Constant.GlobalGameConfig.quadTreeRange.h / 2) continue;
                this._quadtree.insert(rect);
            }
        };
        for (let i = 0; i < this.bossLayer.children.length; i++) {
            let boss = this.bossLayer.children[i];
            let collider = boss.getChildByName("sprite").getComponent(BoxCollider2D);
            let rect = collider.worldAABB;
            this._quadtree.insert(rect);
        }
    }

    // 获取当前四叉树
    getCurMonsterQuadtree() {
        return this._quadtree;
    }

    // 初始化四叉树
    initQuadTree() {
        let wp = em.dispatch("getHeroWorldPos");
        this._quadtree = new QuadtreeRect({
            x: wp.x - 300,
            y: wp.y - 300,
            width: 600,//750
            height: 1200,//1334
        });
        console.log("this._quadtree", this._quadtree);
    }

    // 日志输出怪物总数
    showMonsterTotal(interval: number) {
        this.schedule(() => {
            let monsterTotal = this.getMonsterTotal();
            // console.log("monsterTotal", monsterTotal);
            this.monsterTotalLabel.string = "怪物总数：\n" + monsterTotal;
        }, interval);
    }

    //创建怪物
    createMonster(id: number, pos: number[], initOffset: { x, y }) {
        let monster = app.pool.get("monsterChild");

        let data = app.staticData.getMonsterDataById(id);
        // prefab.parent = this.node;
        let wp = em.dispatch("getHeroWorldPos");

        monster.parent = this.getParNodeByKey(data.color);
        monster.setWorldPosition(initOffset.x + wp.x + pos[0], initOffset.y + wp.y + pos[1], 0);
        monster.active = true;
        monster.getComponent(Monster).init(id);//初始化碰撞脚本血量
    }

    // 创建精英怪
    createMonsterLeader(id: number, type: number) {
        let leader = app.pool.get("monsterLeader");

        leader.parent = this.getParNodeByKey("normal");
        let initOffset = this.getRandomInitPos();
        let wp = em.dispatch("getHeroWorldPos");
        leader.setWorldPosition(initOffset.x + wp.x, initOffset.y + wp.y, 0);
        leader.getComponent(MonsterLeader).createLeader(id, type);
    }

    /**
     * @description: 增加随机偏移量 
     * @param {object} initOffset {x,y} x为x轴上的偏移量 y为y轴上的偏移量
     *  如果x轴或y轴等于0则在该轴上增加0 如果都为0 则不变
     */
    addRandomOffset(initOffset: { x: number, y: number }) {
        if (initOffset.x == 0 && initOffset.y != 0) {
            let y = initOffset.y;
            initOffset.x += Math.random() > 0.5 ? (0.5 * y + Math.random() * y * 0.5 | 0) : -(0.5 * y + Math.random() * y * 0.5 | 0);
        } else if (initOffset.x != 0 && initOffset.y == 0) {
            let x = initOffset.x;
            initOffset.y += Math.random() > 0.5 ? (0.5 * x + Math.random() * x * 0.5 | 0) : -(0.5 * x + Math.random() * x * 0.5 | 0);
        } else return initOffset;
        return initOffset;
    }

    // 获取随机上下左右 四个初始化方向
    getRandomInitPos() {
        let coefficient = 2;
        // let index = Math.random() * 4 | 0;
        this._createCount++;
        let index = this._createCount % 4;
        switch (index) {
            case 0:
                return { x: this._initPosList.up.x * coefficient, y: this._initPosList.up.y * coefficient };
            case 1:
                return { x: this._initPosList.down.x * coefficient, y: this._initPosList.down.y * coefficient };
            case 2:
                return { x: this._initPosList.left.x * coefficient, y: this._initPosList.left.y * coefficient };
            case 3:
                return { x: this._initPosList.right.x * coefficient, y: this._initPosList.right.y * coefficient };
            default:
                throw new Error("getRandomInitPos err");
        }
    }

    //获取玩家附近点
    getAllAroundWpList(wp: { x, y, z }) {
        let list = { up: new Vec3(), down: new Vec3(), left: new Vec3(), right: new Vec3() };
        for (const dir in list) {
            let obj = list[dir];
            obj.x = wp.x + this._initPosList[dir].x;
            obj.y = wp.y + this._initPosList[dir].y;
            obj.z = 0;
        };
        return list;
    }

    /**
    * 通过外部数据创建关卡怪物
    * @param {number} id 生成怪物id
    * @param {object} queue 生成怪物队形
    */
    createMonsterByOutsideData(id, queue, initOffset: { x, y } = null) {
        // console.log("参数为",id,queue);
        if (initOffset == null) {
            initOffset = this.getRandomInitPos();
        };
        this.createMonsterQueue(id, queue, initOffset);
    }

    //生成怪物   
    createMonsterQueue(monsterId: number, queue: number[][], initOffset: { x, y }) {
        initOffset = this.addRandomOffset(initOffset);
        // console.log("initOffset",initOffset);
        queue.forEach(pos => {
            if (Constant.GlobalGameConfig.framingInitMonster) this._waitCreateQueue.push({ monsterId, pos, initOffset });
            else this.createMonster(monsterId, pos, initOffset);
        });
    }

    //获取怪物总数  不获取boss 
    getMonsterTotal() {
        let total = 0;
        this.enemyLayer.children.forEach(par => {
            total += par.children.length;
        });
        return total;
    }

    //获取所有怪物 不获取boss 信息
    getAllMonster(): Array<Node> {
        let all: Array<Node> = [];

        for (let i = 0; i < this.enemyLayer.children.length; i++) {
            let parent = this.enemyLayer.children[i];
            for (const child of parent.children) {
                all.push(child);
            }
        };
        return all;
    }

    //移除所有怪物
    removeAllMonsters() {
        let some = 50;
        let fun = () => {
            console.log("分帧移除");
            let mt = this.getMonsterTotal();
            console.log("mt", mt);
            if (mt) {
                if (mt >= some) this.removeSomeMonsters(some);
                else this.removeSomeMonsters(mt);
            } else {
                this.unschedule(fun);
            }
        }
        this.schedule(fun, 1 / 60);
    }

    /**
     * @description: 移除指定数量monster 
     * @param {*} total 单次移除总数
     * @total 550+： 耗时：18s  some：5
     * @total 550+： 耗时：23s  some：1 
     */
    removeSomeMonsters(total) {
        let all = this.getAllMonster();
        while (total) {
            let child = all[total - 1];
            child.removeFromParent();
            app.pool.plm.putToJunkyard(child);
            total--;
        }
    }

    //创建怪物伤害文本
    createMonsterDamageTex(node, damage) {
        //判断英雄 伤害免疫
        // if (em.dispatch("getHeroControlProperty", "_isDamageImmunity")) return;
        // em.dispatch("usingHeroControlFun", "updateBloodProgress", -damage);
        this.dispatch(Constant.EventId.updateBloodProgress, -damage);
    }

    // 获取敌人节点上所有的碰撞器  精英怪和boss 的未获取
    getAllMonsterColliders() {
        let all = this.getAllMonster();
        let arr = [];
        all.forEach(child => {
            if (child.name == "monsterChild") {
                let collider = child.getComponent(BoxCollider2D);
                arr.push(collider)
            }
        });
        return arr;
    }

    // 怪物层所有节点做一样的事情（调用同一方法）
    doSameThings(funName: string) {

        let all = this.getAllMonster();
        all.forEach((child: any) => {
            let ctrl;
            let monsterControl = child.getComponent(Monster);
            let monsterLeaderControl = child.getComponent(MonsterLeader);
            let bossControl = child.getComponent(BossView);

            if (monsterControl) {
                ctrl = monsterControl;
            } else if (monsterLeaderControl) {
                ctrl = monsterLeaderControl
            } else {
                ctrl = bossControl
            }

            if (!ctrl) {
                return;
            }

            Function.call(ctrl, funName);
        });
    }

    //使用hero control 方法
    usingMonsterManagerFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }

    //根据 key 获取父节点
    getParNodeByKey(key) {
        return this._monsterNodeList[key];
    }
}

