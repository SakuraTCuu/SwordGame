/*
 * @Author: li_jiang_wei_12345 739671694@qq.com
 * @Date: 2022-08-25 14:17:48
 * @LastEditors: li_jiang_wei_12345 739671694@qq.com
 * @LastEditTime: 2022-11-24 15:19:15
 * @FilePath: \to-be-immortal\assets\script\layers\MapLayer.ts
 * @Description: 
 * 
 * Copyright (c) 2022 by li_jiang_wei_12345 739671694@qq.com, All Rights Reserved. 
 */
import { _decorator, Component, Node, SpriteFrame, Size, find, Sprite, UITransform, Vec3, Rect, Vec2, math, CacheMode, Prefab, instantiate, BoxCollider2D, Collider2D, Material } from 'cc';
import { em } from '../global/EventManager';
import { ggd, groupIndex, tagData } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('MapLayer')
export class MapLayer extends Component {
    @property(SpriteFrame)
    defaultBgSF = null;
    @property(Prefab)
    obstaclePrefab;
    @property([SpriteFrame])
    bgSFs;
    @property([SpriteFrame])
    obsSFs;
    @property(Material)
    frozenMaterial;
    @property(Material)
    normalMaterial;

    mapList: Node[] = [];

    _mapSize: Size;
    // _changeOffset = 700;//手机高度的一半
    _changeOffset = 1000;//手机高度的一半
    _obsColliderArr: Collider2D[] = [];//存放障碍物
    _frozenCountdown: number = 0;//冻结倒计时
    _frozenTotalTime: number = 0;//冻结总时长
    _frozenSlowTimes = 0;//冰冻减速效果
    onDestroy() {
        em.remove("usingMapLayerFun");
        em.remove("getMapLayerProperty");
    }
    onLoad() {
        em.add("usingMapLayerFun", this.usingMapLayerFun.bind(this));
        em.add("getMapLayerProperty", this.getMapLayerProperty.bind(this));
        this.mapList.push(find("bg1", this.node));
        this.mapList.push(find("bg2", this.node));
        this.mapList.push(find("bg3", this.node));
        this.mapList.push(find("bg4", this.node));
    }

    start() {
        this.initBg();
        // this.initObstacles();
    }
    initBg() {
        if (!this.defaultBgSF) throw "default bg is null";
        let scale = 5;//3
        this._mapSize = new Size(this.defaultBgSF.originalSize.x * scale, this.defaultBgSF.originalSize.y * scale);
        // console.log("this._mapSize", this._mapSize);

        this.switchMapBg();
        let hwp = em.dispatch("getHeroWorldPos");
        this.mapList[0].setWorldPosition(hwp);
        this.mapList[1].setWorldPosition(hwp.x + this._mapSize.x, hwp.y, hwp.z);
        this.mapList[2].setWorldPosition(hwp.x, hwp.y + this._mapSize.y, hwp.z);
        this.mapList[3].setWorldPosition(hwp.x + this._mapSize.x, hwp.y + this._mapSize.y, hwp.z);
    }
    switchMapBg() {
        let index = Math.ceil(ggd.curStage / 10) - 1;
        for (let i = 0; i < this.mapList.length; i++) {
            let node = this.mapList[i];
            node.getComponent(UITransform).setContentSize(this._mapSize);
            // node.getComponent(Sprite).spriteFrame = this.defaultBgSF;
            node.getComponent(Sprite).spriteFrame = this.bgSFs[index];
        }
    }
    // 初始化障碍物
    initObstacles() {
        let total = 10;
        this.mapList.forEach(map => {
            let list = [
                [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
                [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
                [4, 2], [4, 3], [4, 6], [4, 7],
                [5, 2], [5, 3], [5, 6], [5, 7],
                [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7],
                [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]
            ];
            // let list = [
            //     [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
            //     [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
            //     [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
            //     [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7],
            //     [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7],
            //     [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]
            // ];
            for (let i = 0; i < total; i++) {
                let pos = list.splice(Math.random() * list.length | 0, 1)[0];
                this.addObstacle(map, pos);
            };
        });
    }
    addObstacle(map, pos) {
        let obs = instantiate(this.obstaclePrefab);
        let offset = new Size(-this._mapSize.width / 2, -this._mapSize.height / 2);
        obs.parent = map;
        obs.setPosition(pos[0] * 200 + offset.width, pos[1] * 200 + offset.height);
        let index = Math.ceil(ggd.curStage / 10) - 1;
        obs.getComponent(Sprite).spriteFrame = this.obsSFs[index];
        let collider = obs.addComponent(BoxCollider2D);
        let UIT = obs.getComponent(UITransform);
        // let obsSize = new Size(UIT.contentSize.x, UIT.contentSize.y);
        // let obsSize = new Size(UIT.contentSize.x*3/4, UIT.contentSize.y*3/4);
        let obsSize = new Size(UIT.contentSize.x * 1 / 2, UIT.contentSize.y * 1 / 2);
        collider.tag = tagData.obstacle;
        collider.size = obsSize;
        collider.group = groupIndex.obstacle;
        this._obsColliderArr.push(collider);
    }

    // =================外部调用=================
    usingMapLayerFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    getMapLayerProperty(string: string) {
        if (this.hasOwnProperty(string)) return this[string];
        else throw "hero control 中不存在属性：" + string;
    }
    // 获取所有障碍物
    getAllObs() {
        return this._obsColliderArr;
    }
    //冻结地图
    frozenMap(t, slowTimes) {
        console.log("frozenMap");
        this._frozenCountdown = t;
        this._frozenTotalTime = t;
        this._frozenSlowTimes = slowTimes;
        em.dispatch("usingHeroControlFun", "isOpenSnowEffect", true);
        this.unschedule(this.frozenCountdownRun);
        this.frozenMaterial.setProperty("frozenProgress", 0);//还原材质颜色
        this.schedule(this.frozenCountdownRun, 1);
        for (const map of this.mapList) {
            map.getComponent(Sprite).material = this.frozenMaterial;
        }
    }
    // 冻结倒计时运行
    frozenCountdownRun() {
        if (ggd.stopAll) return;
        this._frozenCountdown--;
        let progress = 1 - (this._frozenCountdown / this._frozenTotalTime);
        this.frozenMaterial.setProperty("frozenProgress", progress);
        console.log("this._frozenCountdown", this._frozenCountdown);
        if (this._frozenCountdown <= 0) {
            console.log("冻结结束");
            em.dispatch("usingHeroControlFun", "isOpenSnowEffect", false);
            this._frozenCountdown = 0;
            this.unschedule(this.frozenCountdownRun);
            this.recoveryMapNormalState();
        }
    }
    //恢复普通状态
    recoveryMapNormalState() {
        for (const map of this.mapList) {
            map.getComponent(Sprite).material = this.normalMaterial;
        };
    }
    updateMap(dir) {
        //获取当前所在地图
        let curInSideMap = this.getCurPosMap();
        let isInside = this.heroIsNearbyMapEdge();
        // if (isInside) console.log("hero is inside rect ");
        if (isInside) return;
        else {
            // console.log("hero is outside rect ");
            // 找到距离目前位置最远的切图
            let farthestMap = this.getFarthestMap();
            //判断最远地图需要初始化的位置
            let mapInitDir = this.getFarthestMapInitPos();
            //初始化最远地图地图最新位置
            let curMwp = curInSideMap.getWorldPosition();
            let initPos = new Vec3(curMwp.x + this._mapSize.x * mapInitDir.x, curMwp.y + this._mapSize.y * mapInitDir.y, curMwp.z);
            farthestMap.setWorldPosition(initPos);
            // console.log("=====================================");
        }
    }
    // 获取当前所在地图 
    getCurPosMap() {
        let hwp = em.dispatch("getHeroWorldPos");
        for (let i = 0; i < this.mapList.length; i++) {
            let map = this.mapList[i];
            if (this.thePointIsInsideMap(map, hwp)) return map;
            else continue;
        };
        throw "hero is outside map."
    }
    //判断点是否在小地图中 指定地图
    thePointIsInsideMap(map, p) {
        let wp = map.getWorldPosition();
        let rect = new Rect(wp.x - this._mapSize.x / 2, wp.y - this._mapSize.y / 2, this._mapSize.x, this._mapSize.y);
        return rect.contains(p);
    }
    // 判断点是否在任何一个小地图中
    thePointIsInsideAnyMap(p) {
        return this.mapList.some((map) => {
            return this.thePointIsInsideMap(map, p);
        });
    }
    /**
     * @description: 判断玩家是否在地图边缘 上下左右及其斜角8个方向有一个不在地图中 则处于地图边缘
     */
    heroIsNearbyMapEdge() {
        let hwp = em.dispatch("getHeroWorldPos");
        let pArr = this.getThePointNearbyPoint(hwp);
        return !pArr.some((p) => {
            return !this.mapList.some((map) => {
                return this.thePointIsInsideMap(map, p);
            });
        });
    }
    /**
     * @description: 获取距离玩家当前位置距离最远的地图
     * @return {Node} 
     */
    getFarthestMap() {
        let hwp = em.dispatch("getHeroWorldPos");
        let farthestMap = this.mapList[0];
        let m1wp = this.mapList[0].getWorldPosition();
        let maxDis = (m1wp.x - hwp.x) * (m1wp.x - hwp.x) + (m1wp.y - hwp.y) * (m1wp.y - hwp.y);
        for (let i = 1; i < this.mapList.length; i++) {
            let map = this.mapList[i];
            let mwp = map.getWorldPosition();
            let dis = (mwp.x - hwp.x) * (mwp.x - hwp.x) + (mwp.y - hwp.y) * (mwp.y - hwp.y);
            if (dis > maxDis) {
                maxDis = dis;
                farthestMap = map;
            };
        };
        return farthestMap;
    }
    getFarthestMapInitPos() {
        let hwp = em.dispatch("getHeroWorldPos");
        let pArr = this.getThePointNearbyPoint(hwp);
        let outPoint: Vec2;
        for (let i = 0; i < pArr.length; i++) {
            let p = pArr[i];
            if (!this.thePointIsInsideAnyMap(p)) {
                outPoint = p;
                // console.log(i);
                break;
            }
        };
        let dir = outPoint.subtract(hwp);
        // console.log("getFarthestMapInitPos", dir);
        return new Vec2(dir.x / Math.abs(dir.x), dir.y / Math.abs(dir.y));
    }
    // 获取某点附近的点（8个）
    getThePointNearbyPoint(p) {
        return [
            new Vec2(p.x + this._changeOffset, p.y),//R -->0
            new Vec2(p.x, p.y + this._changeOffset),//U  -->1
            new Vec2(p.x - this._changeOffset, p.y),//L -->2
            new Vec2(p.x, p.y - this._changeOffset),//D -->3
            new Vec2(p.x + this._changeOffset, p.y + this._changeOffset),//UR -->4
            new Vec2(p.x - this._changeOffset, p.y + this._changeOffset),//UL -->5
            new Vec2(p.x - this._changeOffset, p.y - this._changeOffset),//DL -->6
            new Vec2(p.x + this._changeOffset, p.y - this._changeOffset),//DR -->7
        ];
    }

}

