// 英雄死亡
import { _decorator, Component, Sprite, input, Input, Node, find, js, JsonAsset, Label, Animation, game, Game, Color, PhysicsSystem2D, EPhysics2DDrawFlags, BoxCollider2D, ParticleSystem, ParticleSystem2D, Rect, Collider2D, Touch, math, view, instantiate, Prefab, macro, native, JavaScript, Material } from 'cc';
import { em } from '../global/EventManager';
import { ggd, tagData } from '../global/globalData';
import { LevelManager } from "../system/LevelManager";
import { glf } from '../global/globalFun';
const { ccclass, property } = _decorator;

@ccclass('HeroControl')
export class HeroControl extends Component {
    @property(Sprite)
    bloodSprite;
    @property(Sprite)
    shieldSprite;
    @property(Node)
    heroSprite;
    @property(Sprite)
    expProgress;
    @property(JsonAsset)
    expDataJson;
    @property(JsonAsset)
    heroPropertyDataJson;
    @property(Label)
    lvDescription;
    @property(Node)
    GameUILayer;
    @property(Prefab)
    itemInPlaying;
    @property(Node)
    curDirPar;
    @property(Prefab)
    flyingThunderGodPrefab;
    @property([Material])
    heroMaterial = [];

    _flyingThunderGodCount: number = 0;//飞雷神计数
    _flyingThunderGodMark;//分类神标记

    _spriteAnim;

    _heroData: any;
    _expData: any;
    _curDirection: { x: number, y: number } = { x: 1, y: 0 };
    _curAimDir: { x: number, y: number } = { x: 1, y: 0 };
    _canMove = false;
    _LM: LevelManager;
    //外部脚本
    _WM: any;

    _baseBlood: number;
    _bonusBlood: number;
    _curBlood: number;

    _baseMoveSpeed: number;
    _bonusMoveSpeed: number;
    _baseDamage: number;
    _bonusDamage: number;

    _criticalHitRate: number;//暴击率
    _bonusCriticalHitRate: number;
    _bonusCriticalHitDamage: number;//额外爆伤（除自身暴击伤害外的额外暴击伤害）  暴击伤害 =  1+爆伤
    _bonusBulletTotal: number = 0;
    _bonusBulletMoveSpeed: number = 0;
    _bonusBulletDuration: number = 0;
    _bonusBulletAttackTimes: number = 0;
    _bonusBackDis: number = 0;//额外击退距离
    _recoveryHealthy: number = 0;
    _expAddition: number = 0;
    _divineStoneAddition: number = 0;
    //词条提供
    _damageReduce: number = 0;//减伤
    _slowResistance: number = 0;//减速抗性
    _continueSlowPer: number = 0;//持续减速效果 不受时间影响

    _moveSpeedTimes: number = 1;
    _changeHeroMoveSpeedCountdown: number = 0;

    _tempCriticalHitRate: number = 0;//临时暴击率 通过技能 药物 等提升 
    _tempPercentageDamage: number = 0;//临时百分比伤害 通过技能或药物等提升 

    _isDamageImmunity = false;//伤害免疫

    //百分比属性
    _percentageDamage: number;
    _percentageBlood: number;
    _percentageMoveSpeed: number;

    // 额外百分比属性
    _bonusPercentageDamage: number;
    _bonusPercentageBlood: number;
    _bonusPercentageMoveSpeed: number;

    _effectList: number[];//技能词条列表
    //技能相关
    _trackDisappearCountdown = 0;//迷踪步倒计时
    //护盾相关
    _shieldList = {
        "iceShield": false,//冰盾术
        "effect5006": false,//重甲之魂
    }
    _maxShield: number = 0;
    _curShield: number = 0;

    //自动化脚本
    _openAutoScript: boolean = false;

    //debuff清单
    _deBuffList = {
        "banMove": false,
        "slow": {//减速比率 减速数值 减速时间
            "percent": 0,
            "value": 0,
            "time": 0,
        }
    }

    //双触
    _touchMoveId: number;
    _touchShotId: number;

    //傀儡
    _heroPuppet = null;

    _canRebirthByAdTimes = 1;

    _gameRunTimer: number = 0;

    onDestroy() {
        em.remove("getHeroWorldPos");
        em.remove("getTargetWorldPos");
        em.remove("usingHeroControlFun");
        em.remove("getHeroControlProperty");
        em.remove("rebirthHero");
        em.remove("closeRebirthAd");
        input.off(Input.EventType.TOUCH_START, this.touchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.off(Input.EventType.TOUCH_END, this.touchEnd, this);
    }
    onLoad() {

        // this.openPhysicalDraw();
        // this.showViewInfo();

        em.add("getHeroWorldPos", this.getHeroWorldPos.bind(this));
        em.add("getTargetWorldPos", this.getTargetWorldPos.bind(this));
        em.add("usingHeroControlFun", this.usingHeroControlFun.bind(this));
        em.add("getHeroControlProperty", this.getHeroControlProperty.bind(this));
        em.add("rebirthHero", this.rebirthHero.bind(this));
        em.add("closeRebirthAd", this.closeRebirthAd.bind(this));
        input.on(Input.EventType.TOUCH_START, this.touchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.touchMove, this);
        input.on(Input.EventType.TOUCH_END, this.touchEnd, this);
        this.initHeroData();
        this.initComponents();
        this.initOutScripts();
        this._curDirection = { x: 0, y: 0 };
        this.schedule(this.continueRecoveryHealthy, 1);
        this.createRandomSkill();
        //游戏运行计时器开始计时
        this.schedule(() => {
            if (ggd.stopAll) return;
            this._gameRunTimer++;
            this.activeEffects();
        }, 1);
    }

    createRandomSkill() {
        let total = 1 + Math.random() * 5 | 0;
        let loadUrl = "images/items/skillBook/spriteFrame";
        let posArr = [
            { x: -500, y: 0 }, { x: 500, y: 0 }, { x: 0, y: 500 }, { x: 0, y: 500 },
            { x: -500, y: 500 }, { x: 500, y: 500 }, { x: -500, y: -500 }, { x: 500, y: -500 },
        ]
        for (let i = 0; i < total; i++) {
            let pos = posArr[i];
            em.dispatch("loadTheDirResources", loadUrl, assets => {
                let prefab = instantiate(this.itemInPlaying);
                prefab.parent = find("Canvas/bulletLayer");
                prefab.setPosition(pos.x, pos.y, 0);
                prefab.getComponent(Sprite).spriteFrame = assets;
                prefab.getComponent("ItemInPlaying").init(tagData.randomSkillReward);
            });
        }
    }
    start() {
        //    this.schedule(()=>{
        //      // 找到距离自己最近的单位
        //      let tree = em.dispatch("getCurMonsterQuadtree");
        //      let collider = this.node.getChildByName("sprite").getComponent(BoxCollider2D);
        //      let rect = collider.worldAABB;
        //      let res = tree.retrieve(rect);
        //      console.log("查询结果",res);
        //    },1);
    }
    showViewInfo() {
        console.log("view", view);
        console.log("getVisibleSize", view.getVisibleSize());
    }
    openPhysicalDraw() {
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
            EPhysics2DDrawFlags.Pair |
            EPhysics2DDrawFlags.CenterOfMass |
            EPhysics2DDrawFlags.Joint |
            EPhysics2DDrawFlags.Shape;
    }
    // 初始化玩家数据
    initHeroData() {
        this._heroData = this.heroPropertyDataJson.json[0];//0 为当前的 后期配置hero data list  通过id 索引 获取配置
        this.initExpData();
        this.initHeroDataByLv();
        this.updateBloodProgress(0);//用于初次刷新血条

    }
    // 初始化经验数据 和 等级
    initExpData() {
        this._expData = this.expDataJson.json;
        let obj = {
            "level": 1,
            "maxLevel": this._expData.length,
            "curExp": 0,
            "levelMappingExpList": this._expData,
        };
        this._LM = new LevelManager(obj);
        this.lvDescription.string = "LV:" + this._LM.level;
    }
    /**
     * @description: 属性包括基础属性和额外属性 
     */
    initHeroDataByLv() {
        let a = em.dispatch("usingHeroBasePropertyFun", "getBasePropertyValueByEqu");
        this._effectList = a.effectList;
        console.log("hero data", this._heroData);
        this._slowResistance = a.slowResistance;
        this._slowResistance > 1 ? 1 : this._slowResistance;
        this._damageReduce = a.damageReduce;
        this._continueSlowPer = a.slowPer;
        this._baseBlood = em.dispatch("usingHeroBasePropertyFun", "getTrainingData", "blood") + a.blood;
        this._baseMoveSpeed = em.dispatch("usingHeroBasePropertyFun", "getTrainingData", "moveSpeed") + a.moveSpeed;;
        // this._baseMoveSpeed += 500;

        this._baseMoveSpeed += em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "moveSpeed");
        // this._isDamageImmunity = true;
        this._baseDamage = em.dispatch("usingHeroBasePropertyFun", "getTrainingData", "damage") + a.baseDamage;

        this._percentageBlood = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "percentageBlood");
        this._percentageDamage = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "percentageDamage");
        this._percentageMoveSpeed = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "percentageMoveSpeed");
        this._percentageMoveSpeed = 0;//暂时移除百分比移速加成
        this._criticalHitRate = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "criticalHitRate") + a.CHR;
        this._bonusCriticalHitDamage = a.CHD + a.bonusCHD;//爆伤

        this._bonusBulletTotal = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "bonusBulletTotal");
        this._bonusBulletTotal = a.bonusBulletTotal;//额外法宝数量
        this._bonusBulletMoveSpeed = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "bonusBulletMoveSpeed") + a.bonusMoveSpeed;
        this._bonusBulletDuration = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "bonusBulletDuration");
        this._bonusBulletAttackTimes = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "bonusBulletAttackTimes") + a.bonusBulletAttackTimes;
        this._bonusBackDis = a.bonusBackDis;
        this._recoveryHealthy = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "recoveryHealthy");
        this._expAddition = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "expAddition") / 100;
        this._divineStoneAddition = em.dispatch("usingHeroBasePropertyFun", "getHeroBaseProperty", "divineStoneAddition") / 100;//灵石加成 暂未开发

        this._bonusBlood = 0;
        this._bonusMoveSpeed = 0;
        this._bonusDamage = 0;
        this._bonusCriticalHitRate = 0;
        // this._bonusCriticalHitRate = 100;

        this._bonusPercentageBlood = 0;
        this._bonusPercentageMoveSpeed = 0;
        this._bonusPercentageDamage = 0;

        this._curBlood = this.getMaxBlood();
        this.updateBloodProgress(0);
    }
    //获取角色属性描述
    getHeroPropertiesDes() {
        // let string = "==============英雄属性==============\n";
        let string = "英雄属性:\n";
        let bB = "基础血量：" + this._baseBlood + "\n";
        let bMS = "基础移速：" + this._baseMoveSpeed + "\n";
        let bD = "基础伤害：" + this._baseDamage + "\n";
        let bCHR = "基础暴击率：" + this._criticalHitRate + "\n";
        let pB = "血量百分比加成：" + this._percentageBlood + "\n";
        let pD = "伤害百分比加成：" + this._percentageDamage + "\n";
        let pMS = "移速百分比加成：" + this._percentageMoveSpeed + "\n";
        let boB = "额外血量：" + this._bonusBlood + "\n";
        let boMS = "额外移速：" + this._bonusMoveSpeed + "\n";
        let boD = "额外伤害：" + this._bonusDamage + "\n";
        let boCHR = "额外暴击率：" + this._bonusCriticalHitRate + "\n";
        let bPB = "额外血量百分比加成：" + this._bonusPercentageBlood + "\n";
        let bPMS = "额外移速百分比加成：" + this._bonusPercentageMoveSpeed + "\n";
        let bPD = "额外伤害百分比加成：" + this._bonusPercentageDamage + "\n";
        let tCHR = "临时暴击率：" + this._tempCriticalHitRate + "\n";
        let tPD = "临时百分比加成：" + this._tempPercentageDamage + "\n";
        let cB = "当前血量：" + this._curBlood + "/" + this.getMaxBlood() + "\n";
        let cS = "当前护盾：" + this._curShield + "\n";
        let cD = "当前伤害：" + this.getCurDamage() + "\n";
        let cMS = "当前移速：" + this.getCurMoveSpeed() + "\n";
        let cCHR = "当前暴击率：" + this.getCurCHR() + "\n";
        // string += bB + bMS + bD + bCHR + pB + pD + pMS + boB + boMS + boD + boCHR + bPB + bPMS + bPD+tCHR;
        string += cB + cS + cD + cMS + cCHR + bB + bMS + bD + bCHR + tPD + pB + pD + pMS + boB + boMS + boD + boCHR + bPB + bPMS + bPD + tCHR;
        return string;
    }
    //初始化组件
    initComponents() {
        this._spriteAnim = find("sprite", this.node).getComponent(Animation);
    }
    // 初始化外部脚本
    initOutScripts() {
        this._WM = find("weapon", this.node).getComponent("WeaponManager");
    }
    update(deltaTime: number) {
        this.heroMoveControl(deltaTime);
        let x1 = -1;
        let y1 = 0;
        let x2 = this._curDirection.x;
        let y2 = this._curDirection.y;
        let cos = (x1 * x2 + y1 * y2) / (Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2));
        let angle = Math.acos(cos) / Math.PI * 180;
        if (this._curDirection.y > 0) angle = 360 - angle;
        this.curDirPar.angle = angle;
        // console.log("hero world Pos",this.heroSprite.getWorldPosition());

    }
    //角色移动
    heroMoveControl(t: number) {
        if (!this._canMove) return;
        if (ggd.stopAll) return;
        let dir = this._curDirection;
        em.dispatch("usingMapLayerFun", "updateMap", dir);//刷新地图
        let speed = this.getCurMoveSpeed();
        let result = this.isCollideObs(dir.x * t * speed, dir.y * t * speed);
        if (result) {
            this.node.setPosition(this.node.position.x + result.x, this.node.position.y + result.y);
            return;
        }
        this.node.setPosition(this.node.position.x + dir.x * t * speed, this.node.position.y + dir.y * t * speed);
    }
    isCollideObs(x: number, y: number) {
        let obsArr = em.dispatch("usingMapLayerFun", "getAllObs");
        let curPos = this.heroSprite.getWorldPosition();
        let collider = this.heroSprite.getComponent(Collider2D);

        // return false;
        let rect = new Rect(collider.worldAABB.x + x, collider.worldAABB.y + y, collider.worldAABB.width, collider.worldAABB.height);
        for (const obs of obsArr) {
            let obsPos = obs.node.getWorldPosition();
            if (this.getTwoPointDistance(curPos, obsPos > 300)) continue;//距离超过300的障碍物直接忽略  多此一举？
            else {
                if (this.rectIsIntersectsRect(rect, obs.worldAABB)) {
                    if (x !== 0 && y !== 0) {
                        rect = new Rect(collider.worldAABB.x + x, collider.worldAABB.y, collider.worldAABB.width, collider.worldAABB.height);
                        if (!this.rectIsIntersectsRect(rect, obs.worldAABB)) return { x: x, y: 0 };
                        rect = new Rect(collider.worldAABB.x, collider.worldAABB.y + y, collider.worldAABB.width, collider.worldAABB.height);
                        if (!this.rectIsIntersectsRect(rect, obs.worldAABB)) return { x: 0, y: y };
                        else return false;//卡在两个墙挂角方向
                    } else if (x === 0 && y !== 0) {
                        rect = new Rect(collider.worldAABB.x, collider.worldAABB.y + y, collider.worldAABB.width, collider.worldAABB.height);
                        if (!this.rectIsIntersectsRect(rect, obs.worldAABB)) return { x: 0, y: y };
                    } else if (x !== 0 && y === 0) {
                        rect = new Rect(collider.worldAABB.x + x, collider.worldAABB.y, collider.worldAABB.width, collider.worldAABB.height);
                        if (!this.rectIsIntersectsRect(rect, obs.worldAABB)) return { x: x, y: 0 };
                    } else {
                        return false;
                    }
                }
            }
        }
        return false;
    }
    //获取两点的距离
    getTwoPointDistance(pos1, pos2) {
        let x = pos1.x - pos2.x;
        let y = pos1.y - pos2.y;
        return Math.sqrt(x * x + y * y);
    }
    //判断矩形是否相交
    rectIsIntersectsRect(rect1, rect2) {
        return rect1.intersects(rect2);
    }
    //改变changeMove状态 外部调用
    changeMoveState(bool: boolean) {
        this._canMove = bool;
    }
    /**
     * @description: 优先给移动id 和 射击id 分配值
     * 如果都有值，在根据值判断是移动 还是 射击
     * @param {Touch} e
     */
    touchStart(e) {
        if (ggd.stopAll) return;
        let id = e.getID();
        if (this._touchMoveId === undefined) {
            this._touchMoveId = id;
            this.heroMoveByTouchStart();
        }
        else if (this._touchShotId == undefined) {
            this._touchShotId = id;
            this.heroShotByTouchStart(e);
        }
        else if (this._touchMoveId === id) this.heroMoveByTouchStart();
        else if (this._touchShotId === id) this.heroShotByTouchStart(e);
        else {
            console.log("暂未处理的第三次触摸 start");
        }
    }
    touchMove(e) {
        if (ggd.stopAll) return;
        let id = e.getID();
        if (id === this._touchMoveId) this.heroMoveByTouchMove(e);
        else if (id === this._touchShotId) this.heroShotByTouchMove(e);
        else {
            console.log("暂未处理的第三次触摸 move");
        }
    }
    touchEnd(e) {
        let id = e.getID();
        if (id === this._touchMoveId) this.heroMoveByTouchEnd();
        else if (id === this._touchShotId) this.heroShotByTouchEnd();
        else {
            console.log("暂未处理的第三次触摸 end");
        }
    }
    //恢复到点击原始状态
    recoveryTouchRawState() {
        this._touchMoveId = undefined;
        this._touchShotId = undefined;
        this._canMove = false;
    }
    //通过偏移设置方向
    setDirByTouchOffset(offset) {
        if (offset.x == 0) {
            this._curDirection.x = 0;

            this._curDirection.y = Math.abs(offset.y) / offset.y;
        } else if (offset.y == 0) {
            this._curDirection.x = Math.abs(offset.x) / offset.x;
            this._curDirection.y = 0;
        } else {
            let rate = Math.abs(offset.x / offset.y);
            if (rate >= 1) {
                this._curDirection.x = Math.abs(offset.x) / offset.x;
                this._curDirection.y = 1 / rate * Math.abs(offset.y) / offset.y;
            } else {
                this._curDirection.x = rate * Math.abs(offset.x) / offset.x;
                this._curDirection.y = Math.abs(offset.y) / offset.y;
            };
            // console.log("1/rate",1/rate);
        };
        // console.log("curDirection",this._curDirection);
        if (this._curDirection.x <= 0) this.heroSprite.setScale(1, 1, 1);
        else this.heroSprite.setScale(-1, 1, 1);
    }
    //生命恢复函数
    continueRecoveryHealthy() {
        if (ggd.stopAll) return;
        // console.log("current blood",this._curBlood);
        let value = Math.ceil(this.getMaxBlood() * this._recoveryHealthy);
        this.updateBloodProgress(value);
        // console.log("回血+"+value);
    }
    //开始移动
    heroMoveByTouchStart() {
        this._canMove = true;
    }
    //保持移动
    heroMoveByTouchMove(e) {
        let sp = e.touch.getStartLocation();
        let cp = e.touch.getLocation();
        let offset: any = {};
        offset.x = cp.x - sp.x;
        offset.y = cp.y - sp.y;
        if (0 == offset.x && 0 == offset.y) return;//点击未发生偏移 不需要处理
        this.setDirByTouchOffset(offset);
    }
    //结束移动
    heroMoveByTouchEnd() {
        this._canMove = false;
        this._touchMoveId = undefined;
    }
    // 开始射击
    heroShotByTouchStart(e) {
        console.log("射击开始");
        this.updateShotDirByTouch(e);
        // this._curAimDir = twp.

        // em.dispatch("createTipsTex","射击开始");
    }
    // 保持射击
    heroShotByTouchMove(e) {
        console.log("保持射击");
        this.updateShotDirByTouch(e);
        // em.dispatch("createTipsTex","保持射击");
    }
    // 结束射击
    heroShotByTouchEnd() {
        console.log("射击结束");
        // em.dispatch("createTipsTex","射击结束");
        this._touchShotId = undefined;
    }
    updateShotDirByTouch(e) {
        // Touch
        // let twp = e.getLocation();
        // let hwp = this.getHeroWorldPos();
        // let x = twp.x - hwp.x;
        // let y = twp.y - hwp.y;
        let rect = view.getVisibleSize();
        let x = e.getLocationX() - rect.width / 2;
        let y = e.getLocationY() - rect.height / 2;
        if (x === 0 && y === 0) {
            this._curAimDir.x = 1;
            this._curAimDir.y = 0;
        } else if (x === 0) {
            this._curAimDir.x = 0;
            this._curAimDir.y = Math.abs(y) / y;
        } else if (y === 0) {
            this._curAimDir.x = Math.abs(x) / x;
            this._curAimDir.y = 0;
        } else if (Math.abs(x) >= Math.abs(y)) {
            this._curAimDir.x = Math.abs(x) / x;
            this._curAimDir.y = y / Math.abs(x);
        } else {
            this._curAimDir.x = x / Math.abs(y);
            this._curAimDir.y = Math.abs(y) / y;
        }
        console.log("shotDir", this._curAimDir);
        console.log("x", x);
        console.log("y", y);
    }
    //==================================外部调用======================================================
    //使用hero control 方法
    usingHeroControlFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //获取hero control 属性
    getHeroControlProperty(string: string) {
        if (this.hasOwnProperty(string)) return this[string];
        else throw "hero control 中不存在属性：" + string;
    }
    // 暂停游戏
    pauseGame() {
        this._spriteAnim.pause();
        ggd.stopAll = true;
        em.dispatch("usingMonsterManagerFun", "pauseAllAnim");
        em.dispatch("usingGameAnimManagerFun", "pauseAllAnim");
    }
    //恢复游戏
    resumeGame() {
        let passA = find("Canvas/heroLayer/GameUILayer/passRewardLayer").active;
        if (passA) {
            return;
        }
        this._spriteAnim.resume();
        ggd.stopAll = false;
        em.dispatch("usingMonsterManagerFun", "resumeAllAnim");
        em.dispatch("usingGameAnimManagerFun", "resumeAllAnim");

    }
    //获取hero的世界坐标  
    getHeroWorldPos() {
        return this.heroSprite.getWorldPosition();
    }
    /**
     * @description 获取英雄附近一定范围内的随机坐标
     * @param {number} dis 起始距离
     * @param {number} offset 距离偏移量
     * */
    getRandomPosNearbyHero(dis, offset) {
        let wp = this.heroSprite.getWorldPosition();
        wp.x += ((dis + Math.random() * offset | 0) * (Math.random() > 0.5 ? 1 : -1));
        wp.y += (dis + Math.random() * offset | 0 * (Math.random() > 0.5 ? 1 : -1));
        return wp;
    }
    //获取target的世界坐标  优先返回傀儡位置信息 无傀儡在返回hero位置
    getTargetWorldPos() {
        if (this._heroPuppet) return this._heroPuppet.getWorldPosition();
        return this.heroSprite.getWorldPosition();
    }
    //获取一个在hero附近的位置
    getRandomPosNearHero(dis = 200) {
        let wp = this.heroSprite.getWorldPosition();
        let x = Math.random() * dis | 0;
        let y = Math.random() * dis | 0;
        x = Math.random() > 0.5 ? x : -x;
        y = Math.random() > 0.5 ? y : -y;
        return { x: wp.x + x, y: wp.y + y };
    }
    //百分比刷新血量
    updatePercentageBloodProgress(percentage: number) {
        let changeValue = this.getMaxBlood() * percentage;
        this.updateBloodProgress(changeValue);
    }
    //刷新血条
    updateBloodProgress(changeValue: number) {
        if (ggd.stopAll) return;
        if (changeValue < 0) {//受到伤害
            let damageReduce = em.dispatch("usingSkillManagerFun", "getPercentageReduceDamageFromSecretSkill") + this._damageReduce;
            damageReduce > 1 ? 1 : damageReduce;
            changeValue = changeValue * (1 - damageReduce) | 0;
            em.dispatch("createDamageTex", this.heroSprite, changeValue, { x: 0, y: 50 });
            em.dispatch("usingSkillManagerFun", "updateSecretSkillTimesAfterAttacked");//刷新被击中触发的技能层数
        }
        if (changeValue < 0 && this._curShield > 0) {
            this.updateShieldProgress(changeValue);
            return;
        }
        // console.log("刷新血条，changeValue", changeValue);
        this._curBlood += changeValue;
        if (this._curBlood < 0) {
            this._curBlood = 0;
            this.pauseGame();
            if (ggd.isOpenAd && this._canRebirthByAdTimes > 0) {
                this._canRebirthByAdTimes--;
                this.showRebirthAd();
            } else this.showGameOver();
        };
        if (this._curBlood > this.getMaxBlood()) this._curBlood = this.getMaxBlood();
        this.bloodSprite.fillRange = this._curBlood / this.getMaxBlood();
    }
    // 血量拉满
    makeBloodFull() {
        this._curBlood = this.getMaxBlood();
        this.bloodSprite.fillRange = this._curBlood / this.getMaxBlood();
    }
    showRebirthAd() {
        find("Canvas/heroLayer/GameUILayer/rebirthAd").active = true;
    }
    onBtnPlayAds() {
        ggd.curAdRewardType = "rebirthHero";
        glf.playAd();
        // native.reflection.callStaticMethod("com/cocos/game/AppActivity", "createAds", "()V");
        find("Canvas/heroLayer/GameUILayer/rebirthAd").active = false;
        // console.log("播放广告");
        // this.scheduleOnce(()=>{
        //     this.rebirthHero();
        // },3);
    }
    rebirthHero() {
        console.log("复活玩家");
        this._isDamageImmunity = true;
        this.scheduleOnce(() => {
            this._isDamageImmunity = false;
        }, 5);
        this.makeBloodFull();
        this.resumeGame();
    }
    closeRebirthAd() {
        find("Canvas/heroLayer/GameUILayer/rebirthAd").active = false;
        this.showGameOver();
    }

    //刷新护盾
    updateShieldProgress(changeValue: number) {
        this._curShield += changeValue;
        this._curShield = this._curShield > this._maxShield ? this._maxShield : this._curShield;
        if (this._curShield > 0) {
            this.shieldSprite.fillRange = this._curShield / this._maxShield;
        }
        else {
            this._curShield = 0;
            this.shieldSprite.node.parent.active = false;
            changeValue -= this._curShield;
            this.updateBloodProgress(changeValue);
        }
    }
    // 开启护盾
    openShield(value: number, type: string) {
        if (this._shieldList[type] === false) {
            this._shieldList[type] = true;
            this._maxShield += value;
        }
        this._curShield += value;
        this._curShield = this._curShield > this._maxShield ? this._maxShield : this._curShield;
        this.shieldSprite.fillRange = this._curShield / this._maxShield;
        this.shieldSprite.node.parent.active = true;
    }

    //展示游戏结束
    showGameOver() {
        ggd.stopAll = true;//停止一切行为
        this._WM.isUsingSword(false);// 停止攻击
        this._spriteAnim.stop();// 停止移动
        //所有怪物放入对象池 移除之前 先停止生成
        em.dispatch("endStage");
    }
    //刷新经验/100条
    updateExpProgress(exp: number) {

        exp *= (1 + this._expAddition);
        // exp *= (3 + this._expAddition);
        let res = this._LM.addExp(exp);
        if (res) {
            this.lvDescription.string = "LV:" + this._LM.level;
            this.selectUpgradeReward();
            //升级后刷新最大血量 并且血量拉满
            this.updateBloodProgress(0);//用于初次刷新血条
        }
        let fillRange = this._LM.getExpProgress();
        fillRange = fillRange == undefined ? 0 : fillRange;
        this.expProgress.fillRange = fillRange;
    }
    //选择奖励技能
    selectUpgradeReward() {
        this.pauseGame();
        find("selectWeapon", this.GameUILayer).active = true;
        em.dispatch("updateSelectWeapon");
    }
    //是否播放hero动画
    isPlayHeroAnim(bool: boolean) {
        if (bool) {
            this._spriteAnim.resume();
            console.log("继续播放");
        } else {
            this._spriteAnim.pause();
            console.log("停止播放");//
        }
    }
    //创建玩家被攻击的伤害文本
    createBossDamageTex(damage: number) {
        // if(em.dispatch("getHeroControlProperty","_isDamageImmunity")) return;
        if (this._isDamageImmunity) return;
        em.dispatch("createDamageTex", this.node, damage, { x: 0, y: 50 });//伤害低于30不显示伤害文本
        this.updateBloodProgress(damage);
    }
    //重新开始
    restartGame() {
        ggd.stopAll = false;
        game.restart();
    }

    // 刷新额外属性（百分比提升）   注：更新血量时 需要刷新 
    updateBonusValue(type, lv) {
        console.log("刷新额外属性 ,还没写");
        let bonusContent = "";
        let config = {
            "1": 0.01,
            "2": 0.02,
            "3": 0.03,
            "4": 0.04,
            "5": 0.05,
        };
        switch (type) {
            case "blood":
                // this._bonusBlood+=config[lv];
                this._bonusPercentageBlood += config[lv];
                this._bonusPercentageBlood = (this._bonusPercentageBlood * 100 | 0) / 100;
                let value = (this._baseBlood + this._bonusBlood) * config[lv] | 0;
                this.updateBloodProgress(value);
                bonusContent = "血量+" + config[lv] * 100 + "%";
                break;
            case "damage":
                this._bonusPercentageDamage += config[lv];
                this._bonusPercentageDamage = (this._bonusPercentageDamage * 100 | 0) / 100;
                bonusContent = "伤害+" + config[lv] * 100 + "%";
                break;
            case "moveSpeed":
                this._bonusPercentageMoveSpeed += config[lv];
                this._bonusPercentageMoveSpeed = (this._bonusPercentageMoveSpeed * 100 | 0) / 100;
                bonusContent = "移速+" + config[lv] * 100 + "%";
                break;
            case "superArmor"://增加血量和伤害
                this._bonusPercentageBlood += config[lv];
                this._bonusPercentageBlood = (this._bonusPercentageBlood * 100 | 0) / 100;
                let value2 = (this._baseBlood + this._bonusBlood) * config[lv] | 0;
                this.updateBloodProgress(value2);
                bonusContent += "血量+" + config[lv] * 100 + "%";
                this._bonusPercentageDamage += config[lv];
                this._bonusPercentageDamage = (this._bonusPercentageDamage * 100 | 0) / 100;
                bonusContent += "伤害+" + config[lv] * 100 + "%";
                break;
            default:
                throw "strength type is error";
        }
        return bonusContent;
    }
    // 开启免伤
    openDamageImmunity() {
        this._isDamageImmunity = true;
    }
    // 从障碍物中弹出
    ejectFormObs() {
        let ejectDis = 5;
        this.node.setPosition(this.node.position.x - this._curDirection.x * ejectDis, this.node.position.y - this._curDirection.y * ejectDis);
        // let script:any = find("sprite",this.node).getComponent("HeroCollider");
        // let isInside:any = script._isInsideObs;
        // if(isInside) this.ejectFormObs();
    }
    /**
     * @description 寻找玩家附近四叉树的第一个目标 
     * @returns {{x,y}|null} 返回dir;
    */
    seekTreeFirstEnemyDir() {
        let tree = em.dispatch("getCurMonsterQuadtree");
        let rect = this.heroSprite.getComponent(BoxCollider2D).worldAABB;
        let res = tree.retrieve(rect);
        // console.log("seekTreeFirstEnemyDir",res);
        //随机返回一个附近位置
        if (res.length) {
            let rect = res[0];
            //四叉树位置锁定修正
            let targetPos = {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
            };
            let wp = em.dispatch("getHeroWorldPos");
            return glf.getTwoPointFlyDir(targetPos, wp);
        } else {
            return null;
        }
    }
    /**
     * @description 随机寻找附近的n个目标 随机一个rect 依次向后
     * @param {number} n 获取的总数量
     * @returns {Array|null} 返回dirs;
    */
    seekTreeRandomNEnemyDir(n) {
        let tree = em.dispatch("getCurMonsterQuadtree");
        let rect = this.heroSprite.getComponent(BoxCollider2D).worldAABB;
        let res = tree.retrieve(rect);
        // console.log("seekTreeRandomNEnemyDir",res);
        if (res.length) {
            let arr = [];
            for (let i = 0; i < n; i++) {
                let index = Math.random() * res.length | 0;
                let rect = res[index];
                let targetPos = {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2
                };
                let wp = em.dispatch("getHeroWorldPos");
                let dir = glf.getTwoPointFlyDir(targetPos, wp);
                arr.push(dir);
            }
            return arr;
        } else return null;
    }
    // seekTreeRandomNEnemyDir(n) {
    //     let tree = em.dispatch("getCurMonsterQuadtree");
    //     let rect = this.heroSprite.getComponent(BoxCollider2D).worldAABB;
    //     let res = tree.retrieve(rect);
    //     // console.log("seekTreeRandomNEnemyDir",res);
    //     if (res.length) {
    //         let arr = [];
    //         let index = Math.random() * res.length | 0;
    //         for (let i = 0; i < n; i++) {
    //             index = index >= res.length ? 0 : index;
    //             let rect = res[index];
    //             let targetPos = {
    //                 x: rect.x + rect.width / 2,
    //                 y: rect.y + rect.height / 2
    //             };
    //             let wp = em.dispatch("getHeroWorldPos");
    //             let dir = glf.getTwoPointFlyDir(targetPos, wp);
    //             arr.push(dir);
    //             index++;
    //         }
    //         return arr;
    //     } else return null;
    // }
    /**
     * @description 获取四叉树附近的目标位置
     * @param {number} n 获取目标的总数量
     * @returns {Array|null} 返回n个位置 或 null
    */
    seekTreeNEnemyPos(n) {
        let tree = em.dispatch("getCurMonsterQuadtree");
        let rect = this.heroSprite.getComponent(BoxCollider2D).worldAABB;
        let res = tree.retrieve(rect);
        if (res.length) {
            let arr = [];
            let index = Math.random() * res.length | 0;
            for (let i = 0; i < n; i++) {
                index = index >= res.length ? 0 : index;
                let rect = res[index];
                let targetPos = {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2
                };
                arr.push(targetPos);
                index++;
            }
            return arr;
        } else return null;
    }
    /**
     * @description 随机获取四叉树中的一个目标位置
     * @returns {{x,y}}|null} 返回1个位置 或 null
    */
    seekTreeRandomOneEnemyPos() {
        let tree = em.dispatch("getCurMonsterQuadtree");
        let rect = this.heroSprite.getComponent(BoxCollider2D).worldAABB;
        let res = tree.retrieve(rect);
        //随机返回一个附近位置
        if (res.length) {
            let rect = res[Math.random() * res.length | 0];
            //四叉树位置锁定修正
            let targetPos = {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
            };
            return targetPos;
        } else {
            return null;
        }
    }
    // =====================获取当前信息===================
    // 获取最大血量（满血）
    getMaxBlood() {
        return (this._baseBlood + this._bonusBlood) * (1 + this._bonusPercentageBlood + this._percentageBlood) | 0;
    }
    /**
     * @description 获取当前移速
     * @variation  msV 移速值
     * @variation  msP 移速百分比
     * @variation  msSV 秘法移速值
    */
    getCurMoveSpeed() {
        if (this._deBuffList.banMove) return 0;
        let msV = (this._baseMoveSpeed + this._bonusMoveSpeed) - this._deBuffList.slow.value * (1 - this._slowResistance);
        if (msV < 0) msV = 0;
        let slowPer = (this._deBuffList.slow.percent + this._continueSlowPer) * (1 - this._slowResistance);
        slowPer >= 1 ? 1 : slowPer;
        let msP = (this._moveSpeedTimes + this._bonusPercentageMoveSpeed + this._percentageMoveSpeed) * (1 - slowPer);
        let msSV = em.dispatch("usingSkillManagerFun", "getMoveSpeedFromSecretSkill");
        // console.log("msV", msV);
        // console.log("msP", msP);
        // console.log("msSV", msSV);
        return (msV * msP + msSV) | 0;
    }
    //获取当前伤害
    getCurDamage() {
        let d1 = this._baseDamage + this._bonusDamage;
        let d2 = em.dispatch("usingSkillManagerFun", "getDamageValueFromSecretSkill");
        let dp = em.dispatch("usingSkillManagerFun", "getPercentageDamageFromSecretSkill");//秘法提供的加成
        let dTotal = (d1 + d2) * (1 + this._bonusPercentageDamage + this._percentageDamage + dp + this._tempPercentageDamage);
        // console.log("d1", d1);
        // console.log("d2", d2);
        // console.log("dp", dp);
        // console.log("percentageD", 1 + this._bonusPercentageDamage + this._percentageDamage + dp);=
        // console.log("dTotal", dTotal);
        return parseInt(dTotal.toFixed());
    }
    // 获取当前暴击率
    getCurCHR() {
        let total = this._criticalHitRate + this._tempCriticalHitRate + this._bonusCriticalHitRate;
        total += em.dispatch("usingSkillManagerFun", "getCHRFromSecretSkill");
        return total;
    }
    //攻击是否暴击
    isCriticalHit() {
        return Math.random() * 100 < this.getCurCHR();
    }
    /**
     * @description 获取当前暴击伤害  CRD_T = 1 + 1 + CRD  
     * CRD_T 总暴击伤害 = 基础伤害 + 基础暴击伤害 + 爆伤伤害
    */
    getCurCriticalHitDamage() {
        return 2 + this._bonusCriticalHitDamage;
    }
    //==================施加debuff=========================
    /**
     * @description: 施加debuff 禁步
     */
    addDebuffBanMove(t) {
        console.log("addDebuffBanMove");
        this._deBuffList.banMove = true;
        let fun = () => {
            if (ggd.stopAll) return;
            t--;
            if (t <= 0) {
                this.unschedule(fun);
                this._deBuffList.banMove = false;
            }
        };
        this.schedule(fun, 1);
    }
    /**
     * @description: 施加debuff 减速   减速规则：时间无限叠加。数值无限叠加 ,比例无限叠加（极限为1）；
     * @param {number} t  减速时长
     * @param {number} v  减速数值
     * @param {number} p  减速百分比
     */
    addDebuffSlow(t, v, p = 0) {
        console.log("addDebuffSlow");
        em.dispatch("createTipsTex", "减速");
        this._deBuffList.slow.time = t;
        this._deBuffList.slow.value += v;
        this._deBuffList.slow.percent += 0;
        if (this._deBuffList.slow.percent > 1) this._deBuffList.slow.percent = 1;
        this.unschedule(this.addDebuffSlowCallFun);
        this.schedule(this.addDebuffSlowCallFun, 1);
    }
    // 减速回调 新的减速会重置回调
    addDebuffSlowCallFun() {
        if (ggd.stopAll) return;
        this._deBuffList.slow.time--;
        if (this._deBuffList.slow.time <= 0) {
            this.unschedule(this.addDebuffSlowCallFun);
            this._deBuffList.slow.time = 0;
            this._deBuffList.slow.percent = 0;
            this._deBuffList.slow.value = 0;
        }
    }
    // =====================技能相关===================
    /**
     * @description: 改变移速 加速或减速
     * @param {*} times 速度倍率
     * @param {*} t 变化时长
     */
    changeHeroMoveSpeed(times, t) {
        this._moveSpeedTimes = times;
        this._changeHeroMoveSpeedCountdown = t;
        this.schedule(this.changeHeroMoveSpeedCountdownRun, 1);
    }
    // 改变移速倒计时
    changeHeroMoveSpeedCountdownRun() {
        this._changeHeroMoveSpeedCountdown--;
        if (this._changeHeroMoveSpeedCountdown <= 0) {
            this._moveSpeedTimes = 1;
            this._changeHeroMoveSpeedCountdown = 0;
        }
    }

    updateTempCriticalHitRate(changeValue) {
        this._tempCriticalHitRate += changeValue;
    }
    //更新奖励暴击率
    updateBonusCriticalHitRate(changeValue) {
        this._bonusCriticalHitRate += changeValue;
    }
    // 更新临时百分比伤害
    updateTempPercentageDamage(changeValue) {
        this._tempPercentageDamage += changeValue;
    }
    //更新奖励移速
    updateBonusMoveSpeed(changeValue) {
        this._bonusMoveSpeed += changeValue;
    }
    // 凝气术 聚气
    isOpenCollectGas(bool: boolean) {
        find("effect/collectGasEffect", this.node).active = bool;
    }
    // 如沐春风 聚气
    isOpenLikeSpringBreeze(bool: boolean) {
        find("effect/likeSpringBreeze", this.node).active = bool;
    }
    // 雷神之力
    isOpenThunderGodPower(bool: boolean) {
        find("effect/thunderGodPower", this.node).active = bool;
    }
    // 下雪
    isOpenSnowEffect(bool: boolean) {
        find("effect/snowEffect", this.node).active = bool;
    }
    // 使用迷踪步
    usingSkillTrackDisappear(t) {
        console.log("usingSkillTrackDisappear", t);

        this._trackDisappearCountdown = t;
        this._isDamageImmunity = true;
        this._spriteAnim.play("trackDisappear");
        this.unschedule(this.trackDisappearSchedule);
        this.schedule(this.trackDisappearSchedule, 1);
        // this.scheduleOnce(() => {
        //     this._isDamageImmunity = false;
        //     this._spriteAnim.play("heroMove1");
        //     this.node.getChildByName("sprite").getComponent(Sprite).color = new Color(255, 255, 255, 255);
        // }, t);
    }
    trackDisappearSchedule() {
        if (ggd.stopAll) return;
        this._trackDisappearCountdown--;

        if (this._trackDisappearCountdown <= 0) {
            this._isDamageImmunity = false;
            this._spriteAnim.play("heroRun");
            this.node.getChildByName("sprite").getComponent(Sprite).color = new Color(255, 255, 255, 255);
            this.unschedule(this.trackDisappearSchedule);
        }
    }
    // 使用 怒狮狂吼
    usingSkillLionRoar() {
        let all = em.dispatch("usingMonsterManagerFun", "getAllMonsterScript");
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "怒狮狂吼");
        all.forEach(script => {
            if (script.getDistanceToHero() < 300) {
                script.monsterIsRepelled(150);//击退150码
                script.addDebuffTimid(skillData.duration);//施加5s胆怯
            }
        });
    }
    //使用冰盾术
    usingSkillIceShield() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "iceShield");
        let value = this.getMaxBlood() * skillData.damageTimes;
        this.openShield(value, "iceShield");
    }
    // 使用移形换影
    usingSkillMoveLikeShadow() {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "moveLikeShadow");
        let value = this.getMaxBlood() * skillData.damageTimes;
        em.dispatch("loadTheDirResources", "/prefabs/hero/weapon/moveLikeShadow", (assets) => {
            let prefab = instantiate(assets);
            let wp = this.getHeroWorldPos();
            prefab.parent = find("Canvas/puppetLayer");
            prefab.setWorldPosition(wp);
            prefab.getComponent("MoveLikeShadow").init(value);
            this._heroPuppet = prefab;
        });
    }
    //置空移形换影
    resetHeroPuppet() {
        this._heroPuppet = null;
    }
    // 飞雷神 
    usingSkillFlyingThunderGod() {
        if (this._flyingThunderGodCount % 2 == 0) {
            console.log("留下标记");
            let prefab = instantiate(this.flyingThunderGodPrefab);
            prefab.parent = find("Canvas/bulletLayer");
            let wp = this.getHeroWorldPos();
            // prefab.setWorldPosition(wp.x,wp.y,wp.z);
            prefab.setWorldPosition(wp);
            this._flyingThunderGodMark = prefab;
            this._flyingThunderGodCount++;
        } else {
            console.log("回到标记");
            let wp = this._flyingThunderGodMark.getWorldPosition();
            this.resetFlyingThunderGodCount();
            this.node.setWorldPosition(wp);
        }
    }
    //销毁飞雷神标记
    resetFlyingThunderGodCount() {
        this._flyingThunderGodCount = 0;
        if (!this._flyingThunderGodMark) return;
        let prefab = this._flyingThunderGodMark;
        this._flyingThunderGodMark = null;
        prefab.destroy();
    }
    //=============词条相关================
    // 激活词条
    activeEffects() {
        // if(this._effectList.indexOf(5010)>-1&&this._gameRunTimer%50 == 0) this.activeEffect5010();
        if (this._effectList.indexOf(5010) > -1 && this._gameRunTimer % 50 == 0) this.activeEffect5010();
        if (this._effectList.indexOf(5006) > -1 && this._gameRunTimer % 30 == 0) this.activeEffect5006();
    }
    //重甲之魂
    activeEffect5006() {
        em.dispatch("createTipsTex", "重甲之魂");
        let blood = this.getMaxBlood() * 0.2 | 0;
        this.openShield(blood, "effect5006");
    }
    // 无敌风火轮
    activeEffect5010() {
        em.dispatch("createTipsTex", "无敌风火轮");
        this._isDamageImmunity = true;
        this.switchMaterial(1);
        let count = 10;
        let fun = () => {
            if (ggd.stopAll) return;
            count--;
            if (count <= 0) {
                this.unschedule(fun);
                this._isDamageImmunity = false;
                this.switchMaterial();
                em.dispatch("createTipsTex", "无敌风火轮结束");
            }
        }
        this.schedule(fun, 1);
    }
    switchMaterial(index = 0) {
        switch (index) {
            case 0://默认材质
                this.heroSprite.getComponent(Sprite).material = this.heroMaterial[0];
                break;
            case 1://无敌风火轮
                this.heroSprite.getComponent(Sprite).material = this.heroMaterial[1];
                break;
            default:
                console.warn("不存在材质index=" + index);
                break;
        }
    }
    //=============辅助功能================
    // 挂机测试
    openHangupTest() {
        this._openAutoScript = true;
        em.dispatch("usingWeaponManagerFun", "usingMaxLvWeapon");//开启武器高等级
        // this._isDamageImmunity = true;//开启无敌
    }

}

