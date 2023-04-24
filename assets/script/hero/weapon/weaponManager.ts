import { _decorator, Component, Node, Prefab, NodePool, find, CircleCollider2D, instantiate, tween, BoxCollider2D, SpriteFrame, Sprite, Button, Material, JsonAsset, resources, Asset, Vec2, Label, math, ColorKey, Color, Vec3, Animation } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, tagData } from '../../global/globalData';
import { glf } from '../../global/globalFun';
import { plm } from '../../global/PoolManager';
import { Queue } from '../../global/Queue';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class weaponManager extends Component {

    @property(Sprite)
    equWeaponCDProgress;
    @property(JsonAsset)
    weaponDataJson;
    @property(Node)
    btnNodes: Node[] = [];
    @property(Material)
    defaultMaterial: Material = null;

    _thousandsSwordToTombQueue: Queue = new Queue();
    _fireBloomQueue: Queue = new Queue();
    _hellFireQueue: Queue = new Queue();


    /**
     * @description:私有属性命名规范 所有等级 命名为 "_" + weaponName +"Lv" 
     */
    _swordLv: number = 0;
    _guardLv: number = 0;
    _spellLv: number = 0;
    _dartsLv: number = 0;
    _spiritBulletLv: number = 0;
    _flySwordLv: number = 0;
    _skyThunderLv: number = 0;
    _iceSpiritNeedleLv: number = 0;
    _taijihuanLv: number = 0;
    _landFireLv: number = 0;

    _rewardConfig: any = null;
    _curAllURList = [];

    //动态加载
    _weaponData: object = {};

    //装备cd 
    _equWeaTotalCD: number;
    _equWeaCurTime: number;

    //rogue技能cd
    _rogueSkillCDList = {
        "spiritBullet": 1.8,//手里剑
        "sword": 1.2,//剑
        "darts": 3.1,//飞镖
        "iceSpiritNeedle": 3.5,//冰魄神针
        "skyThunder": 4.7,//天雷
        "landFire": 14.3,//地火
        "taijihuan": 2.6,//太极环
    }
    // rogue大招CD
    _rogueUltimateSkillCDList = {
        "spell": 15,
        "guard": 8,
        "sword": 8.3,
    }
    onDestroy() {
        em.remove("updateSelectWeapon");
        em.remove("getWeaponDataByIdOrName");
        em.remove("usingWeaponManagerFun");
        em.remove("getWeaponManagerProperty");
    }
    onLoad() {

        em.add("updateSelectWeapon", this.updateSelectWeapon.bind(this));
        em.add("getWeaponDataByIdOrName", this.getWeaponDataByIdOrName.bind(this));
        em.add("usingWeaponManagerFun", this.usingWeaponManagerFun.bind(this));
        em.add("getWeaponManagerProperty", this.getWeaponManagerProperty.bind(this));
        this.initWeaponData();
        this.initWeaponConfig();
        this.dynamicLoadPrefabs();
        this.startUsingWeapon();

        this.usingEqu();
        this.initSelectWeaponAd();
    }
    startUsingWeapon() {
        this._spiritBulletLv = 1;
        this.isUsingSpiritBullet(true);
        // this._landFireLv=1;
        // this.isUsingLandFire(true);
        // this._taijihuanLv = 4;
        // this.isUsingTaijihuan(true);
        // this._iceSpiritNeedleLv = 3;
        // this.isUsingIceSpiritNeedle(true);
        // this._skyThunderLv = 3;
        // this.isUsingSkyThunder(true);
        // this._swordLv = 1;
        // this.isUsingSword(true);
        // this._guardLv = 4;
        // this.isUsingGuard(true);
        // this._dartsLv = 1;
        // this.isUsingDarts(true);
        // this._spellLv = 1;
        // this.isUsingSpell(true);
        // this.usingMaxLvWeapon();
    }
    usingMaxLvWeapon() {
        this._swordLv = 4;
        this._guardLv = 4;
        this._spellLv = 4;
        this._dartsLv = 4;
        this._spiritBulletLv = 4;
        this.isUsingSword(true);
        this.isUsingDarts(true);
        this.isUsingGuard(true);
        this.isUsingSpell(true);
        this.isUsingSpiritBullet(true);
        this._iceSpiritNeedleLv = 4;
        this.isUsingIceSpiritNeedle(true);
    }
    initWeaponData() {
        let all = this.weaponDataJson.json;
        all.forEach(element => {
            let id = element.id;
            let name = element.name;
            this._weaponData[id] = element;
            this._weaponData[name] = element;
        });
        // console.log(this.weaponDataJson);
        // console.log(this._weaponData);
    }
    /**
     * @description: 初始化升级奖励配置
     * "daofaguo", "treasureChest", "partSkillBook", 物品奖励配置 后期添加
     * 无等级上限的配置："restoreHP"：回血。"addMoveSpeed"：加速。"addCriticalHitRate"：加暴击。  
     */
    initWeaponConfig() {

        this._rewardConfig = [
            "restoreHP", "addMoveSpeed", "addCriticalHitRate",
            "sword", "guard", "spell", "darts", "spiritBullet",
            "flySword", "skyThunder", "iceSpiritNeedle", "taijihuan",
            "landFire"
        ]
        // this._rewardConfig = [
        //     "restoreHP", "addMoveSpeed", "addCriticalHitRate",
        //     "sword", "guard", "spell", "darts", "spiritBullet",
        //     "flySword", "skyThunder", "iceSpiritNeedle", "taijihuan"
        // ]
    }
    // 动态加载预制件
    dynamicLoadPrefabs() {
        this.loadPrefab("sword");
        this.loadPrefab("darts");
        this.loadPrefab("spell");
        this.loadPrefab("spiritBullet");
        this.loadPrefab("flySword");
        this.loadPrefab("thousandsSwordToTomb");
        this.loadPrefab("justOneSwordDivideWorld");
        this.loadPrefab("swordRain");
        this.loadPrefab("iceCone");
        this.loadPrefab("fireBloom");
        this.loadPrefab("hellFire");
        this.loadPrefab("moveLikeFire");
        this.loadPrefab("dangerWindToNear");
        this.loadPrefab("doomsdayStorm");
        this.loadPrefab("thunderRunning");
        this.loadPrefab("thunderFissionBead");
        this.loadPrefab("skyThunder");
        this.loadPrefab("iceSpiritNeedle");
        this.loadPrefab("taijihuan");
        // this.scheduleOnce(() => {
        //     console.log("plm", plm);
        // }, 5);
    }
    //加载预制件
    loadPrefab(fileName, callback = null) {
        let defaultUrl = "/prefabs/hero/weapon/"
        // let prefabString = "_" + fileName + "Prefab";
        em.dispatch("loadTheDirResources", defaultUrl + fileName, (assets) => {
            if (callback) callback(assets);
            else {
                // this[prefabString] = assets;
                plm.addPoolToPools(fileName, new NodePool(), assets);
            }
        });
    }
    // 初始化选择武器界面的广告
    initSelectWeaponAd() {
        if (ggd.isOpenAd) {
            find("Canvas/heroLayer/GameUILayer/selectWeapon/getAll").active = true;
            find("Canvas/heroLayer/GameUILayer/selectWeapon/updateAll").active = true;
        } else {
            find("Canvas/heroLayer/GameUILayer/selectWeapon/getAll").active = false;
            find("Canvas/heroLayer/GameUILayer/selectWeapon/updateAll").active = false;
        }
    }
    getAllUpgradeReward(){
        ggd.curAdRewardType = "getAllUpgradeReward";
        glf.playAd();
    }
    updateUpgradeReward(){
        ggd.curAdRewardType = "updateUpgradeReward";
        glf.playAd();
    }
    //======================护符相关=======================
    // 是否开启护符
    isUsingSpell(bool: boolean) {
        console.log("初始化护符");

        let spellPar = find("spellPar", this.node);
        spellPar.active = bool;
        if (!bool) return;
        // let total = weaponData.spell.lv[this._spellLv - 1];
        let data = this.getWeaponDataByIdOrName("spell");
        let total = data.total[this._spellLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        this.openSpell(total);
    }
    //开启护符
    openSpell(total: number, radius: number = 180) {
        if (radius <= 10) return console.log("半径过小");
        let par = find("spellPar", this.node);
        for (let i = 0; i < par.children.length; i++) {
            let child = par.children[i];
            plm.putToPool("spell", child);
            i--;
        };
        let unitR = Math.PI * 2 / total;//单位弧度
        let unitA = 360 / total;//单位角度
        let arr = [];
        for (let i = 0; i < total; i++) {
            let radian = i * unitR;
            let x = Math.cos(radian) * radius;
            let y = Math.sin(radian) * radius;
            arr.push([x, y]);
        };
        // console.log(arr);
        for (let i = 0; i < arr.length; i++) {
            let pos = arr[i];
            let spell = plm.getFromPool("spell");
            if (spell) {
                this.initSpell(spell, pos, i * unitA);
            } else {
                this.loadPrefab("spell", (assets) => {
                    plm.addPoolToPools("spell", new NodePool(), assets);
                    spell = plm.getFromPool("spell");
                    this.initSpell(spell, pos, i * unitA);
                });
            }
        };
        let interval = 1 / 60;
        this.unschedule(this.spellParRotate);
        this.schedule(this.spellParRotate, interval);
    }
    initSpell(spell, pos, angle) {
        let data = this.getWeaponDataByIdOrName("spell");
        spell.parent = find("spellPar", this.node);
        spell.setPosition(pos[0], pos[1], 0);
        spell.angle = angle;
        spell.getComponent("Spell").init(data, this._spellLv);
    }
    // 护符旋转
    spellParRotate() {
        if (ggd.stopAll) return;
        let par = find("spellPar", this.node);
        let interval = 1 / 60;
        let rotationSpeed = 180 * interval;
        par.angle += rotationSpeed;
    }
    //是否开启 护符 大招
    isOpenSpellUltimateSkill(bool: boolean) {
        if (bool) {
            this.usingSpellUltimateSkill();//立即释放一次
            let t = this._rogueUltimateSkillCDList.spell;
            this.schedule(this.usingSpellUltimateSkill, t);
        } else {
            this.unschedule(this.usingSpellUltimateSkill);
        }
    }
    //护符 大招
    usingSpellUltimateSkill() {
        if (ggd.stopAll) return;
        console.log("释放护符大招");
        let total = 12;
        let radius = 150;
        let par = find("spellPar", this.node);
        let data = this.getWeaponDataByIdOrName("spell");
        // let par = find("Canvas/bulletLayer");
        let interval = 1 / 60;//旋转间隔 
        let speed = 3;//离开原点的速度
        let unitR = Math.PI * 2 / total;//单位弧度
        let unitA = 360 / total;//单位角度
        let arr = [];
        for (let i = 0; i < total; i++) {
            let radian = i * unitR;
            let x = Math.cos(radian) * radius;
            let y = Math.sin(radian) * radius;
            arr.push([x, y]);
        };
        for (let i = 0; i < arr.length; i++) {
            let pos = arr[i];
            let spell = plm.getFromPool("spell");//能释放大招 spell 一定加载完毕 无需防护动态加载
            spell.getComponent("Spell").init(data, this._spellLv);
            spell.parent = par;
            spell.setPosition(pos[0], pos[1], 0);
            let angle = i * unitA;
            spell.angle = angle;
            let times = 60;//旋转消失次数
            let callback = () => {
                if (ggd.stopAll) return;
                times--;
                let curPos = spell.getPosition();
                let x = pos[0] / radius * speed;
                let y = pos[1] / radius * speed;
                x *= 2;
                y *= 2;
                spell.setPosition(curPos.x + x, curPos.y + y, 0);
            };
            this.schedule(callback, interval);
        };

        this.unschedule(this.spellParRotate);
        this.schedule(this.spellParRotate, interval);
    }
    // =================波动阵====================
    //开启波动阵
    isUsingGuard(bool: boolean) {
        let guard = find("guard", this.node);
        guard.active = bool;
        if (!bool) return;
        let data = this.getWeaponDataByIdOrName("guard");
        let scale = data.total[this._guardLv - 1];
        guard.setScale(scale, scale);
        let script: any = guard.getComponent("Guard");
        script.init(data, this._guardLv);
        guard.active = true;

    }
    //是否开启波动阵大招
    isOpenGuardUltimateSkill(bool: boolean) {
        this.schedule(() => {
            if (ggd.stopAll) return;
            this.usingGuardUltimateSkill();
        }, this._rogueUltimateSkillCDList.guard);
        // this.usingGuardUltimateSkill();
        // em.dispatch("usingHeroControlFun", "updatePercentageBloodProgress", 0.02);//每秒恢复2%最大生命值
    }
    // 使用波动阵大招 全屏扩张一次  未开发完，暂不开启
    usingGuardUltimateSkill() {
        console.log("开启波动阵大招");
        let guard = find("guard", this.node);
        let data = this.getWeaponDataByIdOrName("guard");
        let rawScale = data.total[this._guardLv - 1];
        let times = 6;
        let t = 0.1;
        let fun = () => {
            if (ggd.stopAll) return;
            let scale = guard.getScale();
            times -= t * 2;
            if (times > 0) {
                guard.setScale(scale.x + t * 2, scale.y + t * 2, scale.z);
            } else {
                guard.setScale(rawScale, rawScale, 1);
                this.unschedule(fun);
            }
        }
        this.schedule(fun, t);
    }

    //================手里剑相关=====================
    // 是否使用手里剑
    isUsingSpiritBullet(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.spiritBullet;
            this.schedule(this.createSpiritBullet, interval);
        } else {
            this.unschedule(this.createSpiritBullet);
        }
    }
    //创建手里剑
    createSpiritBullet() {
        if (ggd.stopAll) return;
        let flyDir = em.dispatch("usingHeroControlFun", "seekTreeFirstEnemyDir");
        if (!flyDir) return;
        let data = this.getWeaponDataByIdOrName("spiritBullet");
        let total = data.total[this._spiritBulletLv - 1];
        // console.log("flyDir",flyDir);

        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        let initPosArr = this.getFlySwordInitPos(total);
        for (let i = 0; i < total; i++) {
            let spiritBullet = plm.getFromPool("spiritBullet");
            let t = 1 / 10 * i;
            if (spiritBullet) {
                this.scheduleOnce(() => {
                    this.initSpiritBullet(spiritBullet, initPosArr[i], flyDir);
                }, t);
            }
            else {
                this.loadPrefab("spiritBullet", (assets) => {
                    plm.addPoolToPools("spiritBullet", new NodePool(), assets);
                    spiritBullet = plm.getFromPool("spiritBullet");
                    this.scheduleOnce(() => {
                        this.initSpiritBullet(spiritBullet, initPosArr[i], flyDir);
                    }, t);
                });
            }
        }
    }
    initSpiritBullet(spiritBullet, initPos, flyDir) {
        let data = this.getWeaponDataByIdOrName("spiritBullet");
        spiritBullet.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        spiritBullet.parent = layer;
        // let flyDir = this.getFlyDir(em.dispatch("getHeroControlProperty", "_curAimDir"));
        let wp = em.dispatch("getHeroWorldPos");
        wp.x += initPos.x;
        wp.y += initPos.y;
        spiritBullet.setWorldPosition(wp);
        spiritBullet.getComponent("SpiritBullet").init(data, this._spiritBulletLv, flyDir);
    }
    getFlyDirByCurPos(target) {
        let wp = em.dispatch("getHeroWorldPos");
        // return glf.getTwoPointFlyDir(wp,target);
        return glf.getTwoPointFlyDir(target, wp);
    }
    isOpenSpiritBulletUltimateSkill(bool: boolean) {
        return;
        if (bool) this.usingSpellUltimateSkill();
    }
    usingSpiritBulletUltimateSkill() {
        console.log("usingSpiritBulletUltimateSkill 还没写");
    }

    //=================剑相关===================
    //是否 使用 剑
    isUsingSword(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.sword;
            this.schedule(this.createSword, interval);
        } else {
            this.unschedule(this.createSword);
        }
    }
    // 创建剑
    createSword() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("sword");
        let total = data.total[this._swordLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        let curDirection = em.dispatch("getHeroControlProperty", "_curDirection");
        if (curDirection.x == 0 && curDirection.y == 0) return;//人物未移动时  不创建子弹
        let initPosArr = this.getFlySwordInitPos(total);
        for (let i = 0; i < total; i++) {
            let sword = plm.getFromPool("sword");
            if (sword) this.initSword(sword, initPosArr[i]);
            else {
                this.loadPrefab("sword", (assets) => {
                    plm.addPoolToPools("sword", new NodePool(), assets);
                    sword = plm.getFromPool("sword");
                    this.initSword(sword, initPosArr[i]);
                });
            }
        }
    }
    initSword(sword, initPos) {
        let data = this.getWeaponDataByIdOrName("sword");
        sword.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        sword.parent = layer;
        let flyDir = this.getFlyDir(em.dispatch("getHeroControlProperty", "_curDirection"));
        let wp = em.dispatch("getHeroWorldPos");
        // console.log("initPos", initPos);

        wp.x += initPos.x;
        wp.y += initPos.y;
        sword.setWorldPosition(wp);
        sword.getComponent("Sword").init(data, this._swordLv, flyDir);
    }
    // 随机获取 剑 初始化位置
    getFlySwordInitPos(total) {
        let unit = 30;
        let arr = [];

        for (let i = 0; i < total; i++) {
            let m = i / 3 | 0;
            let n = i % 3;
            let dir = {
                x: n == 0 ? 0 : (n == 1 ? unit : -unit),
                y: m * unit,
            };
            arr.push(dir);
        }
        // console.log("arr",arr);
        return arr;
        // return [{ x: 0, y: 0 }, { x: unit, y: 0 }, { x: -unit, y: 0 }, { x: 0, y: unit }, { x: unit, y: unit }, { x: -unit, y: unit }].slice(0, total);
    }
    //剑 大招
    usingSwordUltimateSkill() {
        if (ggd.stopAll) return;
        let total = 16;
        let r = 50;
        // let initPosArr = this.getCirclePos(r, total);
        let initPosArr = glf.getCirclePos(r, total);
        let data = this.getWeaponDataByIdOrName("sword");
        for (let i = 0; i < total; i++) {
            let sword = plm.getFromPool("sword");
            sword.setPosition(0, 0, 0);
            let layer = find("Canvas/bulletLayer");
            sword.parent = layer;
            let initPos = initPosArr[i];
            let dir = { x: initPos[0] / r, y: initPos[1] / r };
            // 转换成可使用的方向
            let flyDir = this.getFlyDir(dir);
            let wp = em.dispatch("getHeroWorldPos");
            wp.x += initPos[0];
            wp.y += initPos[1];
            sword.setWorldPosition(wp);
            sword.getComponent("Sword").init(data, this._swordLv, flyDir);
        }
        // console.log("释放简答");

    }
    //是否开启 剑 大招
    isOpenSwordUltimateSkill(bool: boolean) {
        if (bool) {
            let t = this._rogueUltimateSkillCDList.sword;
            this.schedule(this.usingSwordUltimateSkill, t);
        } else {
            this.unschedule(this.usingSwordUltimateSkill);
        }
    }
    //=================飞剑相关====================
    isUsingFlySword(bool: boolean) {
        let data = this.getWeaponDataByIdOrName("flySword");
        let total = data.total[this._flySwordLv - 1];
        // let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        // total += bonusTotal;
        this.openFlySword(total);
    }
    // 开启飞剑
    openFlySword(total) {
        let par = find("Canvas/heroLayer/flySwordPar");
        for (let i = 0; i < total; i++) {
            par.children[i].active = true;
        }
    }
    usingFlySwordUltimateSkill() { }
    isOpenFlySwordUltimateSkill(bool: boolean) { }
    //=================飞镖相关===================
    isUsingDarts(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.darts;
            this.schedule(this.createDarts, interval);
        } else {
            this.unschedule(this.createDarts);
        }
    }
    createDarts() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("darts");
        let total = data.total[this._dartsLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        // let curAimDir = this.getFlyDir(em.dispatch("getHeroControlProperty", "_curAimDir"));
        let curAimDir = this.getFlyDir(em.dispatch("getHeroControlProperty", "_curDirection"));
        let flyDirArr = this.getFlyDirArr(curAimDir, total);
        for (let i = 0; i < total; i++) {
            let darts = plm.getFromPool("darts");
            if (darts) this.initDarts(darts, flyDirArr[i], i);
            else {
                this.loadPrefab("darts", (assets) => {
                    plm.addPoolToPools("darts", new NodePool(), assets);
                    darts = plm.getFromPool("darts");
                    darts = instantiate(assets);
                    this.initDarts(darts, flyDirArr[i], i);
                });
            }
        }
    }
    initDarts(darts, flyDir, i) {
        let data = this.getWeaponDataByIdOrName("darts");
        let unit = 50;
        darts.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        darts.parent = layer;
        let initPos = new Vec2(flyDir.x * unit * (Math.floor(i / 4) + 1), flyDir.y * unit * (Math.floor(i / 4) + 1));
        let wp = em.dispatch("getHeroWorldPos");
        wp.x += initPos.x;
        wp.y += initPos.y;
        darts.setWorldPosition(wp);
        if (this._dartsLv == data.maxLevel) darts.getComponent("Darts").init(data, this._dartsLv, flyDir, true);
        else darts.getComponent("Darts").init(data, this._dartsLv, flyDir);
    }
    isOpenDartsUltimateSkill(bool: boolean) {
        console.log("飞镖可分裂");
    }
    // =================冰魄神针=======================
    //是否 使用 冰魄神针
    isUsingIceSpiritNeedle(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.iceSpiritNeedle;
            this.schedule(this.createIceSpiritNeedle, interval);
        } else {
            this.unschedule(this.createIceSpiritNeedle);
        }
    }
    // 创建 冰魄神针
    createIceSpiritNeedle() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("iceSpiritNeedle");
        let total = data.total[this._iceSpiritNeedleLv - 1];

        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        let flyDirs = em.dispatch("usingHeroControlFun", "seekTreeRandomNEnemyDir", total);
        if (!flyDirs) return;
        for (let i = 0; i < total; i++) {
            let iceSpiritNeedle = plm.getFromPool("iceSpiritNeedle");
            let flyDir = flyDirs[i];
            let t = 0.2 * i;
            if (iceSpiritNeedle) {
                this.scheduleOnce(() => {
                    this.initIceSpiritNeedle(iceSpiritNeedle, flyDir);
                }, t);
            }
            else {
                this.loadPrefab("iceSpiritNeedle", (assets) => {
                    plm.addPoolToPools("iceSpiritNeedle", new NodePool(), assets);
                    iceSpiritNeedle = plm.getFromPool("iceSpiritNeedle", true);
                    this.scheduleOnce(() => {
                        this.initIceSpiritNeedle(iceSpiritNeedle, flyDir);
                    }, t);
                });
            }
        }
    }
    initIceSpiritNeedle(iceSpiritNeedle, flyDir) {
        let data = this.getWeaponDataByIdOrName("iceSpiritNeedle");
        iceSpiritNeedle.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        iceSpiritNeedle.parent = layer;
        // let wp = em.dispatch("usingHeroControlFun", "getRandomPosNearbyHero", 150, 200);
        let wp = em.dispatch("getHeroWorldPos");
        iceSpiritNeedle.setWorldPosition(wp);
        // let flyDir =em.dispatch("usingHeroControlFun", "seekTreeFirstEnemyDir");
        // iceSpiritNeedle.getComponent("IceSpiritNeedle").init(data, this._iceSpiritNeedleLv,this.getRandomFlyDir());
        iceSpiritNeedle.getComponent("IceSpiritNeedle").init(data, this._iceSpiritNeedleLv, flyDir);
    }
    // 获取随机飞行方向
    getRandomFlyDir() {
        let x = Math.random();
        let y = Math.random();
        // 方向归一
        if (x > y) {
            y = x / y;
            x = 1;
        } else {
            x = y / x;
            y = 1;
        }
        //随机正负
        x = Math.random() > 0.5 ? x : -x;
        y = Math.random() > 0.5 ? y : -y;
        return { x: x, y: y };
    }
    isOpenIceSpiritNeedleUltimateSkill(bool: boolean) {
        console.log("冰魄神针大招 还没写");
    }
    // =================天雷=======================
    //是否 使用 天雷
    isUsingSkyThunder(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.skyThunder;
            this.schedule(this.createSkyThunder, interval);
        } else {
            this.unschedule(this.createSkyThunder);
        }
    }
    // 创建 天雷
    createSkyThunder() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("skyThunder");
        let total = data.total[this._skyThunderLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        for (let i = 0; i < total; i++) {
            let t = 0.2 * i;
            this.scheduleOnce(() => {
                if (ggd.stopAll) return;
                let wp = em.dispatch("usingHeroControlFun", "seekTreeRandomOneEnemyPos");
                if (!wp) return;
                let skyThunder = plm.getFromPool("skyThunder");
                if (skyThunder) {
                    this.initSkyThunder(skyThunder, wp);
                }
                else {
                    this.loadPrefab("skyThunder", (assets) => {
                        plm.addPoolToPools("skyThunder", new NodePool(), assets);
                        // skyThunder = plm.getFromPool("skyThunder");
                        skyThunder = plm.getFromPool("skyThunder");
                        this.initSkyThunder(skyThunder, wp);
                    });
                }
            }, t);
        }
    }
    initSkyThunder(skyThunder, wp) {
        let data = this.getWeaponDataByIdOrName("skyThunder");
        // skyThunder.setPosition(0, 0, 0);
        skyThunder.parent = find("Canvas/bulletLayer");
        skyThunder.setWorldPosition(wp.x, wp.y, 0);
        skyThunder.getComponent("SkyThunder").init(data, this._skyThunderLv);

    }
    isOpenSkyThunderUltimateSkill(bool: boolean) {
        console.log("天雷大招 还没写");
    }
    //=================地火相关===================
    //是否 使用 地火
    isUsingLandFire(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.landFire;
            this.schedule(this.createLandFire, interval);
        } else {
            this.unschedule(this.createLandFire);
        }
    }
    // 创建 地火
    createLandFire() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("landFire");
        let total = data.total[this._landFireLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;

        let dirs = [
            { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: -1 }
        ];
        for (let i = 0; i < total; i++) {
            this.scheduleOnce(() => {
                if (ggd.stopAll) return;
                let landFire = plm.getFromPool("landFire");
                if (landFire) this.initLandFire(landFire, dirs[i % dirs.length]);
                else {
                    this.loadPrefab("landFire", (assets) => {
                        plm.addPoolToPools("landFire", new NodePool(), assets);
                        landFire = plm.getFromPool("landFire");
                        this.initLandFire(landFire, dirs[i % 4]);
                    });
                };
            }, i * 0.2);
        };
    }
    initLandFire(landFire, dir) {
        let data = this.getWeaponDataByIdOrName("landFire");
        landFire.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        landFire.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        landFire.setWorldPosition(wp);
        landFire.getComponent("LandFire").init(data, this._landFireLv, dir);
    }
    isOpenLandFireUltimateSkill(bool: boolean) {
        console.log("地火大招 还没写");
    }
    //=================太极环相关===================
    //是否 使用 太极环
    isUsingTaijihuan(bool: boolean) {
        if (bool) {
            let interval = this._rogueSkillCDList.taijihuan;
            this.schedule(this.createTaijihuan, interval);
        } else {
            this.unschedule(this.createTaijihuan);
        }
    }
    // 创建 太极环
    createTaijihuan() {
        if (ggd.stopAll) return;
        let data = this.getWeaponDataByIdOrName("taijihuan");
        let total = data.total[this._taijihuanLv - 1];
        let bonusTotal = em.dispatch("getHeroControlProperty", "_bonusBulletTotal");
        total += bonusTotal;
        if (!total) throw "total err,total is " + total;
        for (let i = 0; i < total; i++) {
            this.scheduleOnce(() => {
                if (ggd.stopAll) return;
                let taijihuan = plm.getFromPool("taijihuan");
                if (taijihuan) this.initTaijihuan(taijihuan);
                else {
                    this.loadPrefab("taijihuan", (assets) => {
                        plm.addPoolToPools("taijihuan", new NodePool(), assets);
                        taijihuan = plm.getFromPool("taijihuan");
                        this.initTaijihuan(taijihuan);
                    });
                }
            }, i * 0.2);

        }
    }
    initTaijihuan(taijihuan) {
        let data = this.getWeaponDataByIdOrName("taijihuan");
        taijihuan.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        taijihuan.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        taijihuan.setWorldPosition(wp);
        taijihuan.getComponent("Taijihuan").init(data, this._taijihuanLv);
    }
    isOpenTaijihuanUltimateSkill(bool: boolean) {
        console.log("太极环大招 还没写");
    }
    // ======================通用======================

    //深拷贝一个飞行方向
    getFlyDir(dir) {
        return new Vec2(dir.x, dir.y);
    }
    getFlyDirArr(dir, total) {
        let arr = [];
        for (let i = 0; i < total; i++) {
            arr.push(this.getRotationDir(dir, 90 * i));
        }
        return arr;
    }
    // 获取旋转后的方向
    getRotationDir(dir, angle) {
        //角度转弧度
        let radian = angle * Math.PI / 180;
        //向量旋转指定弧度的角度
        let x = dir.x;
        let y = dir.y;
        let x2 = x * Math.cos(radian) - y * Math.sin(radian);
        let y2 = x * Math.sin(radian) + y * Math.cos(radian);
        return new Vec2(x2, y2);
        // return { x: x2, y: y2 };
    }




    //===================外部调用===================
    /**
     * @description: 获得升级奖励
     * @param {*} e
     * @param {string} type 奖励类型
     * 奖励分为多种，武器类奖励满级后 从奖励选项中删除
     */
    getUpgradeReward(e, type: string) {
        find("GameUILayer/selectWeapon", this.node.parent).active = false;
        for (const node of this.btnNodes) {
            node.getChildByName("mask").getChildByName("icon").getComponent(Sprite).spriteFrame = null;
            // node.getComponent(Sprite).spriteFrame = null;
        }
        ggd.stopAll = find("GameUILayer/passRewardLayer", this.node.parent).active;
        switch (type) {
            case "restoreHP":
                this.restoreHP();
                break;
            case "addMoveSpeed":
                em.dispatch("usingHeroControlFun", "updateBonusMoveSpeed", 20);
                break;
            case "addCriticalHitRate":
                em.dispatch("usingHeroControlFun", "updateBonusCriticalHitRate", 5);
                break;

            default:
                if (this.isHasWeaponByName(type)) {
                    this.upgradeWeaponByWeaponName(type);
                    break;
                } else throw "type error,type is " + type;
        }
        em.dispatch("usingHeroControlFun", "resumeGame");
        for (const node of this.btnNodes) {
            node.getComponent(Animation).stop();
            node.setScale(0, 0, 1);
        }
    }
    getAllUpgradeRewardComplete() {
        find("GameUILayer/selectWeapon", this.node.parent).active = false;
        for (const node of this.btnNodes) {
            node.getChildByName("mask").getChildByName("icon").getComponent(Sprite).spriteFrame = null;
            // node.getComponent(Sprite).spriteFrame = null;
        }
        ggd.stopAll = find("GameUILayer/passRewardLayer", this.node.parent).active;
        for (const type of this._curAllURList) {
            switch (type) {
                case "restoreHP":
                    this.restoreHP();
                    break;
                case "addMoveSpeed":
                    em.dispatch("usingHeroControlFun", "updateBonusMoveSpeed", 30);
                    break;
                case "addCriticalHitRate":
                    em.dispatch("usingHeroControlFun", "updateBonusCriticalHitRate", 5);
                    break;
                default:
                    if (this.isHasWeaponByName(type)) {
                        this.upgradeWeaponByWeaponName(type);
                        break;
                    } else throw "type error,type is " + type;
            }
        }
        em.dispatch("usingHeroControlFun", "resumeGame");
        for (const node of this.btnNodes) {
            node.getComponent(Animation).stop();
            node.setScale(0, 0, 1);
        }
    }
    // 刷新升级奖励
    updateUpgradeRewardComplete() {
        for (const node of this.btnNodes) {
            node.getComponent(Animation).stop();
            node.setScale(0, 0, 1);
        };
        this.updateSelectWeapon();
    }
    //播放选择武器 进场动画
    playBtnNodeAnim() {
        let interval = 0.4;
        this.btnNodes.forEach((node, index) => {
            this.scheduleOnce(() => {
                node.getComponent(Animation).play();
            }, interval * index);
        });
    }
    //打开并刷新选择武器界面
    updateSelectWeapon() {
        this.playBtnNodeAnim();
        let total = this.btnNodes.length;
        let count = 0;
        let randomArr = [];
        if (this._rewardConfig.length < total) throw "this._rewardConfig.length is err,this._rewardConfig is " + this._rewardConfig;
        while (total != count) {
            let name = this._rewardConfig[Math.random() * this._rewardConfig.length | 0];
            if (randomArr.indexOf(name) < 0) {
                // console.log(" //添加等级判断 越级则不添加 目前 还没写 后期添加");
                randomArr.push(name);
                count++;
            }
        }
        this._curAllURList = randomArr;
        let noStarArr = ["restoreHP", "addMoveSpeed", "addCriticalHitRate"];
        // console.log("randomArr", randomArr);
        for (let i = 0; i < this.btnNodes.length; i++) {
            let node = this.btnNodes[i];
            let name = randomArr[i];
            let sprite = node.getChildByName("mask").getChildByName("icon").getComponent(Sprite);
            // em.dispatch("loadTheDirResources", "images/weapons/" + name + "/spriteFrame", (assets) => sprite.spriteFrame = assets);
            em.dispatch("loadTheDirResources", "images/weapons/icon_" + name + "/spriteFrame", (assets) => sprite.spriteFrame = assets);
            //添加回调函数寻址方式
            glf.createButton(this.node, node, "WeaponManager", "getUpgradeReward", name);
            // 初始化描述
            let mainNode = node;
            let label = mainNode.getChildByName("label").getComponent(Label);
            let label2 = mainNode.getChildByName("name").getComponent(Label);
            this.updateUpgradeWeaponDescription(label, label2, name);
            // 处理星星
            let starPar = mainNode.getChildByName("starPar");
            if (noStarArr.indexOf(name) > -1) {//隐藏星星
                starPar.active = false;
            } else {
                starPar.active = true;
                let data = this.getWeaponDataByIdOrName(name);
                let lv = this["_" + data.name + "Lv"] + 1;
                for (let i = 1; i < 6; i++) {
                    let starPurple = starPar.getChildByName("star" + i).getChildByName("starPurple");
                    if (i <= lv) starPurple.active = true;
                    else starPurple.active = false;
                }
                // console.log("name", name);
                // console.log("lv", lv);

                // let playStar = starPar.getChildByName("star" + (lv + 1)).getChildByName("starPurple");
                let playStar = starPar.getChildByName("star" + lv).getChildByName("starPurple");
                this.playStarWink(playStar, mainNode.parent);
            }
        }
        //开启自动化脚本后自动选择
        // console.log("open auto script", em.dispatch("getHeroControlProperty", "_openAutoScript"));

        if (em.dispatch("getHeroControlProperty", "_openAutoScript")) {
            let name = randomArr[Math.random() * randomArr.length | 0];
            console.log("getUpgradeReward name", name);
            this.getUpgradeReward(null, name);
        }
    }
    // 播放星星闪烁动画
    playStarWink(node, mainNode) {
        node.active = true;
        let fun = () => {
            node.active = !node.active;
            if (mainNode.active == false) {
                this.unschedule(fun);
            }
        };
        this.schedule(fun, 0.3);
    }
    /**
     * @description: 刷新升级武器描述
     * @param {Label} label 需要刷新的label组件 
     * @param {string} wName 武器名称
     */
    updateUpgradeWeaponDescription(label: Label, label2, wName: string) {
        switch (wName) {
            case "restoreHP":
                label.string = "血量拉满";
                label2.string = "血量拉满";
                break;
            case "addMoveSpeed":
                label.string = "增加20移速";
                label2.string = "移速⬆";
                break;
            case "addCriticalHitRate":
                label.string = "增加5%暴击率";
                label2.string = "暴击率⬆";
                break;
            default:
                if (this.isHasWeaponByName(wName)) {
                    let data = this.getWeaponDataByIdOrName(wName);
                    let lv = this["_" + data.name + "Lv"] + 1;//此时lv还没有++；
                    label.string = data["lv" + lv];
                    label2.string = data.name2;
                    break;
                } else throw "type error,type is " + wName;
        }
    }
    upgradeWeaponByWeaponName(wn: string) {
        let data = this.getWeaponDataByIdOrName(wn);
        if (!data) throw "data is error,current data is " + data;
        if (this["_" + wn + "Lv"] == data.maxLevel) return;
        this["_" + wn + "Lv"]++;
        let wn2 = this.getNewStringFirstLetterToUpperCase(wn);
        this["isUsing" + wn2](true);
        if (this["_" + wn + "Lv"] == data.maxLevel) {
            this.deleteFillLevelWeaponFromRewardConfig(wn);//删除满级技能
            let string = "isOpen" + wn2 + "UltimateSkill";
            console.log("string", string);
            this[string](true);
        }
        // console.log("wn",wn);
        // console.log("wn2",wn2);
    }
    // 首字母大写
    getNewStringFirstLetterToUpperCase(str: string) {
        return str[0].toUpperCase() + str.substring(1);
    }
    // 将满级武器从奖励配置中删除
    deleteFillLevelWeaponFromRewardConfig(wn: string) {
        let index = this._rewardConfig.indexOf(wn);
        if (index > -1) this._rewardConfig.splice(index, 1);
        else throw "weapon name is error,wn is " + wn;
    }
    //回血
    restoreHP() {
        em.dispatch("usingHeroControlFun", "updateBloodProgress", 999999);
    }
    //获取武器信息描述
    getWeaponDes() {
        // let string = "===========武器等级===========\n";
        let string = "武器等级：\n";
        let swordLv = this._swordLv > 0 ? "飞剑术等级：" + this._swordLv + "\n" : "";
        let guardLv = this._guardLv > 0 ? "波动阵等级：" + this._guardLv + "\n" : "";
        let spellLv = this._spellLv > 0 ? "旋转护符等级：" + this._spellLv + "\n" : "";
        let dartsLv = this._dartsLv > 0 ? "六角镖等级：" + this._dartsLv + "\n" : "";
        let spiritBulletLv = this._spiritBulletLv > 0 ? "手里剑等级：" + this._spiritBulletLv + "\n" : "";
        let skyThunderLv = this._skyThunderLv > 0 ? "天雷等级：" + this._skyThunderLv + "\n" : "";
        let flySwordLv = this._flySwordLv > 0 ? "五行珠等级：" + this._flySwordLv + "\n" : "";
        return string + swordLv + guardLv + spellLv + dartsLv + spiritBulletLv + flySwordLv + skyThunderLv;
    }


    /**
     * @description: 通过id 或 name 获取武器属性
     * @param {*} id_name 武器 id 或 name
     */
    getWeaponDataByIdOrName(id_name) {
        if (this._weaponData.hasOwnProperty(id_name)) return this._weaponData[id_name];
        else throw id_name + " of _weaponData is null";
    }
    //通过名称判断是否拥有武器
    isHasWeaponByName(name) {
        return this._weaponData.hasOwnProperty(name);
    }

    // 外部调用WeaponManager通用方法
    usingWeaponManagerFun(string, ...param) {
        if (this[string] && typeof this[string] == "function") return this[string](...param);
        else throw string + " is not fun or undefined";
    }
    //获取hero control 属性
    getWeaponManagerProperty(string: string) {
        if (this.hasOwnProperty(string)) return this[string];
        else throw "hero control 中不存在属性：" + string;
    }
    //=================技能==========================
    // =============一阶功法==================
    /**
     * @description: 剑雨术
     * 生成一阵持续5s的剑雨，对敌人产生多段伤害，每段伤害基础伤害为22。
     */
    usingSkillSwordRain() {
        if (ggd.stopAll) return;
        let total = 5;
        let spx = -160;
        let unitX = 80;
        let times = 5;
        let interval = 0.2;
        this.schedule(() => {
            for (let i = 0; i < total; i++) {
                let swordRain = plm.getFromPool("swordRain");
                if (swordRain) {
                    this.initSwordRain(swordRain, (spx + i * unitX));
                } else {
                    this.loadPrefab("swordRain", (assets) => {
                        plm.addPoolToPools("swordRain", new NodePool(), assets);
                        swordRain = plm.getFromPool("swordRain");
                        this.initSwordRain(swordRain, (spx + i * unitX));
                    });
                }
            }
        }, interval, times, 0);
    }
    initSwordRain(swordRain, xOffset) {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "剑雨术");
        let data = {
            name: skillData.name2,
            duration: skillData.duration,
            damage: skillData.baseDamage
        };
        swordRain.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        swordRain.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        wp.x += xOffset;
        wp.y += 500;
        swordRain.setWorldPosition(wp);
        swordRain.getComponent("SwordRain").init(data);
    }
    // 
    /**
     * @description: 一剑隔世
     * 在一段时间聚气后对周边单位产生999的基础伤害，附加1.2倍的伤害加成。
     */
    usingSkillJustOneSwordDivideWorld() {
        let prefab = plm.getFromPool("justOneSwordDivideWorld");
        if (prefab) this.initJustOneSwordDivideWorld(prefab);
        else {
            this.loadPrefab("justOneSwordDivideWorld", (assets) => {
                plm.addPoolToPools("justOneSwordDivideWorld", new NodePool(), assets);
                let prefab = plm.getFromPool("justOneSwordDivideWorld");
                this.initJustOneSwordDivideWorld(prefab);
            });
        }

    }
    initJustOneSwordDivideWorld(prefab) {
        // let layer = find("Canvas/bulletLayer");
        let layer = find("Canvas/heroLayer/skillParent");
        prefab.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        prefab.setWorldPosition(wp);
        prefab.getComponent("JustOneSwordDivideWorld").init();
        let changeAngle = 0;
        let unitChange = 20;
        let callback = () => {
            if (ggd.stopAll) return;
            prefab.angle += unitChange;
            changeAngle += unitChange;
            if (changeAngle >= 1080) {
                this.unschedule(callback);
                prefab.getComponent("JustOneSwordDivideWorld").recoveryToPool();
            }
        }
        this.scheduleOnce(() => {
            prefab.getChildByName("collectPower").active = false;;
            this.schedule(callback, 1 / 60);
        }, 1.5);
    }
    /**
     * @description: 万剑归冢
     * 15s内从远方唤来30把巨剑，每把可造成666的基础伤害，附加2倍伤害加成
     */
    usingSkillThousandsSwordToTomb() {
        let total = 30;
        for (let i = 0; i < total; i++) {
            let prefab = plm.getFromPool("thousandsSwordToTomb");
            if (prefab) {
                this._thousandsSwordToTombQueue.enqueue(prefab);
                if (i === 0) this.schedule(this.createThousandsSwordToTomb, 0.3);//第一次有prefab 说明 已经预加载成功 直接调用即可。
            }
            else {
                this.loadPrefab("thousandsSwordToTomb", (assets) => {
                    plm.addPoolToPools("thousandsSwordToTomb", new NodePool(), assets);
                    let prefab = plm.getFromPool("thousandsSwordToTomb");
                    this._thousandsSwordToTombQueue.enqueue(prefab);//第一次没有prefab 则回调成功后在调用
                });
            }
        }

    }
    //创建万剑
    createThousandsSwordToTomb() {
        if (ggd.stopAll) return;
        // console.log("创建万剑");
        let prefab = this._thousandsSwordToTombQueue.dequeue();
        if (prefab) this.initThousandsSwordToTomb(prefab);
        else this.unschedule(this.createThousandsSwordToTomb);
    }
    initThousandsSwordToTomb(prefab) {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "万剑归冢");
        let data = {
            damage: skillData.baseDamage,
            duration: skillData.duration,
            moveDistance: 1000,
            name: skillData.name2,
        }
        let layer = find("Canvas/bulletLayer");
        prefab.parent = layer;
        prefab.getComponent("ThousandsSwordToTomb").init(data);
    }
    /**
     * @description: 冰锥术
     * 向周围发射冰锥，每个冰锥造成500伤害，附加1.5伤害加成，并冻结对方。
     */
    usingSkillIceCone() {
        let total = 20;
        let r = 20;
        let initPosArr = glf.getCirclePos(r, total);
        for (let i = 0; i < total; i++) {
            let prefab = plm.getFromPool("iceCone");
            let initPos = initPosArr[i];
            let dir = { x: initPos[0] / r, y: initPos[1] / r };
            if (prefab) {
                this.initIceCone(prefab, dir, initPos);
            } else {
                this.loadPrefab("iceCone", (assets) => {
                    plm.addPoolToPools("iceCone", new NodePool(), assets);
                    let prefab = plm.getFromPool("iceCone");
                    this.initIceCone(prefab, dir, initPos);
                });
            }
        }
    }
    initIceCone(prefab, dir, pos) {
        let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "冰锥术");
        let data = {
            "damage": skillData.baseDamage,
            "duration": skillData.duration,
            "moveSpeed": 600,
            "canAttackTimes": 1,
            "name": skillData.name2,
        }

        let layer = find("Canvas/bulletLayer");
        let wp = em.dispatch("getHeroWorldPos");
        prefab.parent = layer;
        prefab.setWorldPosition(wp.x + pos[0], wp.y + pos[1], wp.z);

        prefab.getComponent("IceCone").init(data, dir);

    }
    //使用炎爆术
    usingSkillFireBloom() {
        let total = 60;
        for (let i = 0; i < total; i++) {
            let prefab = plm.getFromPool("fireBloom");
            if (prefab) {
                this._fireBloomQueue.enqueue(prefab);
                if (i === 0) this.schedule(this.createFireBloom, 0.2);//第一次有prefab 说明 已经预加载成功 直接调用即可。
            }
            else {
                this.loadPrefab("fireBloom", (assets) => {
                    plm.addPoolToPools("fireBloom", new NodePool(), assets);
                    let prefab = plm.getFromPool("fireBloom");
                    this._fireBloomQueue.enqueue(prefab);//第一次没有prefab 则回调成功后在调用
                });
            }
        }
    }
    // 创建炎爆
    createFireBloom() {
        if (ggd.stopAll) return;
        // console.log("创建炎爆");
        let prefab = this._fireBloomQueue.dequeue();
        if (prefab) {
            let wp = em.dispatch("usingHeroControlFun", "getRandomPosNearHero");
            let layer = find("Canvas/bulletLayer");
            prefab.parent = layer;
            prefab.setWorldPosition(wp.x, wp.y, 0);
            prefab.getComponent("FireBloom").init();
        }
        else this.unschedule(this.createFireBloom);
    }
    // 使用地狱火
    usingSkillHellFire() {
        let total = 20;
        for (let i = 0; i < total; i++) {
            let prefab = plm.getFromPool("hellFire");
            if (prefab) {
                this._hellFireQueue.enqueue(prefab);
                if (i === 0) this.schedule(this.createHellFire, 1);//第一次有prefab 说明 已经预加载成功 直接调用即可。
            }
            else {
                this.loadPrefab("hellFire", (assets) => {
                    plm.addPoolToPools("hellFire", new NodePool(), assets);
                    let prefab = plm.getFromPool("hellFire");
                    this._hellFireQueue.enqueue(prefab);//第一次没有prefab 则回调成功后在调用
                });
            }
        }
    }
    createHellFire() {
        if (ggd.stopAll) return;
        // console.log("创建炎爆");
        let prefab = this._hellFireQueue.dequeue();
        if (prefab) {
            // let wp = em.dispatch("usingHeroControlFun","getRandomPosNearHero");
            let wp = em.dispatch("getHeroWorldPos");
            let layer = find("Canvas/bulletLayer");
            prefab.parent = layer;
            prefab.setWorldPosition(wp.x, wp.y + 50, 0);
            prefab.getComponent("HellFire").init();
        }
        else this.unschedule(this.createHellFire);
    }
    //使用火行步
    usingSkillMoveLikeFire() {
        this.schedule(this.createMoveLikeFire, 0.2);
        // this.schedule(this.createMoveLikeFire, 0.5);
    }
    createMoveLikeFire() {
        if (ggd.stopAll) return;
        let prefab = plm.getFromPool("moveLikeFire");
        if (prefab) {
            let wp = em.dispatch("getHeroWorldPos");
            let layer = find("Canvas/bulletLayer");
            prefab.parent = layer;
            prefab.setWorldPosition(wp.x, wp.y, 0);
            prefab.getComponent("MoveLikeFire").init();
        } else {
            this.loadPrefab("moveLikeFire", (assets) => {
                plm.addPoolToPools("moveLikeFire", new NodePool(), assets);
                let prefab = plm.getFromPool("moveLikeFire");
                let wp = em.dispatch("getHeroWorldPos");
                let layer = find("Canvas/bulletLayer");
                prefab.parent = layer;
                prefab.setWorldPosition(wp.x, wp.y, 0);
                prefab.getComponent("MoveLikeFire").init();
            });
        }
    }
    // 使用八面危风
    usingSkillDangerWindToNear() {
        let dirArr = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];
        let wp = em.dispatch("getHeroWorldPos");
        for (const dir of dirArr) {
            let prefab = plm.getFromPool("dangerWindToNear");
            if (prefab) {
                prefab.parent = find("Canvas/bulletLayer");
                prefab.setWorldPosition(wp.x, wp.y, 0);
                prefab.getComponent("DangerWindToNear").init(dir);
            } else {
                this.loadPrefab("dangerWindToNear", (assets) => {
                    plm.addPoolToPools("dangerWindToNear", new NodePool(), assets);
                    let prefab = plm.getFromPool("dangerWindToNear");
                    prefab.parent = find("Canvas/bulletLayer");
                    prefab.setWorldPosition(wp.x, wp.y, 0);
                    prefab.getComponent("DangerWindToNear").init(dir);
                });
            }
        }
    }
    // 使用末日风暴
    usingSkillDoomsdayStorm() {
        let dirArr = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];
        let total = 50;
        let queue = new Queue();
        while (total) {
            let prefab = plm.getFromPool("doomsdayStorm");
            if (prefab) queue.enqueue(prefab);
            else {
                this.loadPrefab("doomsdayStorm", (assets) => {
                    plm.addPoolToPools("doomsdayStorm", new NodePool(), assets);
                    let prefab = plm.getFromPool("doomsdayStorm");
                    queue.enqueue(prefab);
                });
            }
            total--;
        }
        let count = 0;
        let fun = () => {
            if (ggd.stopAll) return;
            let prefab = queue.dequeue();
            if (prefab) {
                let dir = dirArr[count % dirArr.length];
                let wp = em.dispatch("getHeroWorldPos");
                prefab.parent = find("Canvas/bulletLayer");
                prefab.setWorldPosition(wp.x, wp.y, 0);
                prefab.getComponent("DoomsdayStorm").init(dir);
                count++;
            } else {
                this.unschedule(fun);
            }
        }
        this.schedule(fun, 1);
    }
    // 使用技能奔雷术
    usingSkillThunderRunning() {
        let dirArr = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        let total = 20;
        let unit = 100;
        let queue = new Queue();
        for (let i = 0; i < total; i++) {
            // let dir = dirArr[i % dirArr.length];
            let prefab = plm.getFromPool("thunderRunning");
            if (prefab) {
                queue.enqueue(prefab);;
            } else {
                this.loadPrefab("thunderRunning", (assets) => {
                    plm.addPoolToPools("thunderRunning", new NodePool(), assets);
                    let prefab = plm.getFromPool("thunderRunning");
                    queue.enqueue(prefab);
                });
            }
        }
        let count = 0;
        let fun = () => {
            if (ggd.stopAll) return;
            let prefab = queue.dequeue();
            if (prefab) {
                let dir = dirArr[count % dirArr.length];
                prefab.parent = find("Canvas/bulletLayer");
                let wp = em.dispatch("getHeroWorldPos");
                // prefab.setWorldPosition(wp.x + dir[0] * unit, wp.y + dir[1] * unit, wp.z);
                prefab.setWorldPosition(wp);
                prefab.getComponent("ThunderRunning").init({ x: dir[0], y: dir[1] });
                count++;
            } else {
                this.unschedule(fun);
            }
        }
        this.schedule(fun, 1);
    }
    // 使用技能雷裂珠
    usingSkillThunderFissionBead() {
        let flyDir = this.getFlyDir(em.dispatch("getHeroControlProperty", "_curAimDir"));
        let prefab = plm.getFromPool("thunderFissionBead");
        // let skillData = em.dispatch("usingHeroBasePropertyFun", "getSkillBookDataByIdOrName", "thunderFissionBead");
        if (prefab) {
            prefab.parent = find("Canvas/bulletLayer");
            let wp = em.dispatch("getHeroWorldPos");
            prefab.setWorldPosition(wp);
            prefab.getComponent("ThunderFissionBead").init(5, flyDir);
        } else {
            this.loadPrefab("thunderFissionBead", (assets) => {
                plm.addPoolToPools("thunderFissionBead", new NodePool(), assets);
                let prefab = plm.getFromPool("thunderFissionBead");
                prefab.parent = find("Canvas/bulletLayer");
                let wp = em.dispatch("getHeroWorldPos");
                prefab.setWorldPosition(wp);
                // prefab.getComponent("ThunderFissionBead").init(8,flyDir);
                prefab.getComponent("ThunderFissionBead").init(5, flyDir);
            });
        }
    }
    /**
     * @description 使用装备 目前只有法器
     * 判断是否有装备， 没装备 关闭武器进度条 否则打开，开始计时
    */
    usingEqu() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        console.log("usingEqu", data);
        if (!data) {//没装备法器
            this.equWeaponCDProgress.node.parent.active = false;
            return;
        }
        this.usingEquWeapon();
        this.equWeaponCDProgress.node.parent.active = true;
        let interval = this.getCurUsingWeaponAttackInterval();
        this._equWeaTotalCD = interval;
        this._equWeaCurTime = 0;
        //无cd流  5002巨剑无cd流
        if (data.qData.effect.indexOf(5002) > -1) {
            this._equWeaCurTime = this._equWeaTotalCD;
            this.updateEquWeaProgress();
            return;
        }
        let t = 0.025;
        this.schedule(() => {
            if (ggd.stopAll) return;
            this._equWeaCurTime += t;
            this.updateEquWeaProgress();
            if (this._equWeaCurTime >= this._equWeaTotalCD) {
                this._equWeaCurTime = 0;
                this.usingEquWeapon();
            };
        }, t);

    }
    // 刷新装备 武器 进度条
    updateEquWeaProgress() {
        this.equWeaponCDProgress.fillRange = this._equWeaCurTime / this._equWeaTotalCD;
    }
    // 使用当前装备
    usingEquWeapon() {
        let weapon = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponType");
        switch (weapon) {
            case "长剑":
                this.createLongSword();
                break;
            case "巨剑":
                this.createGiantSword();
                break;
            case "巨斧":
                this.createGiantAxe();
                break;
            case "旋转斧":
                this.createRotationAxe();
                break;
            case "巨弩":
                this.createGiantArrow();
                break;
            case "连弩":
                this.createContinueArrow();
                break;
            default:
                break;
        }
    }
    // ====================法器类=========================

    // ===================长剑======================
    // 创建 长剑暂时使用的剑的数据 待修改
    usingLongSword() {
        let interval = this.getCurUsingWeaponAttackInterval();
        this.schedule(() => {
            this.createLongSword();
        }, interval);

    }
    createLongSword() {
        if (ggd.stopAll) return;
        let total = 2;
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        console.log("createLongSword", data);

        if (data.qData.effect.indexOf(5003) > -1) total = 4;//横少千军
        if (data.qData.effect.indexOf(5004) > -1) total = 8;//上古剑气

        let flyDirs = [
            { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: -1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }
        ];
        for (let i = 0; i < total; i++) {
            let sword = plm.getFromPool("longSword");
            if (sword) this.initLongSword(sword, flyDirs[i]);
            else {
                this.loadPrefab("longSword", (assets) => {
                    plm.addPoolToPools("longSword", new NodePool(), assets);
                    sword = plm.getFromPool("longSword");
                    this.initLongSword(sword, flyDirs[i]);
                });
            }
        }
    }
    initLongSword(sword, flyDir) {
        sword.setPosition(0, 0, 0);
        let layer = find("Canvas/bulletLayer");
        sword.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        // wp.x += (flyDir.x * 10);
        // wp.y += (flyDir.y * 10);
        console.log("initLongSword", wp);

        sword.setWorldPosition(wp.x, wp.y, wp.z);
        sword.getComponent("LongSword").init(flyDir);
        console.log("long sword", sword);
    }
    // ===================巨剑======================
    usingGiantSword() {
        //拥有诸神之力 仅创建一次
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        if (data.qData.effect.indexOf(5002) > -1) {
            this.createGiantSword();
            return;
        }
        let interval = this.getCurUsingWeaponAttackInterval();
        this.schedule(() => {
            this.createGiantSword();
        }, interval);
    }
    createGiantSword() {
        if (ggd.stopAll) return;
        let giantSword = plm.getFromPool("giantSword");
        if (giantSword) this.initGiantSword(giantSword);
        else {
            this.loadPrefab("giantSword", (assets) => {
                plm.addPoolToPools("giantSword", new NodePool(), assets);
                giantSword = plm.getFromPool("giantSword");
                this.initGiantSword(giantSword);
            });
        };
    }
    initGiantSword(giantSword) {
        giantSword.setPosition(0, 0, 0);
        giantSword.parent = find("Canvas/heroLayer/skillParent");
        let wp = em.dispatch("getHeroWorldPos");
        giantSword.setWorldPosition(wp.x, wp.y, wp.z);
        giantSword.getComponent("GiantSword").init();
        console.log("initGiantSword", giantSword);
    }
    //===================巨斧=====================
    usingGiantAxe() {
        let interval = this.getCurUsingWeaponAttackInterval();
        this.schedule(() => {
            this.createGiantAxe();
        }, interval);
    }
    createGiantAxe() {
        if (ggd.stopAll) return;
        let giantAxe = plm.getFromPool("giantAxe");
        if (giantAxe) this.initGiantAxe(giantAxe);
        else {
            this.loadPrefab("giantAxe", (assets) => {
                plm.addPoolToPools("giantAxe", new NodePool(), assets);
                giantAxe = plm.getFromPool("giantAxe");
                this.initGiantAxe(giantAxe);
            });
        }
    }
    initGiantAxe(giantAxe) {
        giantAxe.setPosition(0, 0, 0);
        // let layer = find("Canvas/bulletLayer");
        let layer = find("Canvas/heroLayer/skillParent");
        giantAxe.parent = layer;
        let wp = em.dispatch("getHeroWorldPos");
        giantAxe.setWorldPosition(wp.x, wp.y, wp.z);
        giantAxe.getComponent("GiantAxe").init();
        console.log("initGiantAxe", giantAxe);
    }
    //===================旋转斧=====================
    usingRotationAxe() {
        let interval = this.getCurUsingWeaponAttackInterval();
        this.schedule(() => {
            this.createRotationAxe();
        }, interval);
    }
    // 创建旋转斧
    createRotationAxe() {
        if (ggd.stopAll) return;
        let rotationAxe = plm.getFromPool("rotationAxe");
        if (rotationAxe) this.initRotationAxe(rotationAxe);
        else {
            this.loadPrefab("rotationAxe", (assets) => {
                plm.addPoolToPools("rotationAxe", new NodePool(), assets);
                rotationAxe = plm.getFromPool("rotationAxe");
                this.initRotationAxe(rotationAxe);
            });
        }
    }
    initRotationAxe(rotationAxe) {
        rotationAxe.setPosition(0, 0, 0);
        // let layer = find("Canvas/bulletLayer");
        rotationAxe.parent = find("Canvas/heroLayer/skillParent");
        let wp = em.dispatch("getHeroWorldPos");
        rotationAxe.setWorldPosition(wp.x, wp.y, wp.z);
        rotationAxe.getComponent("RotationAxe").init();
    }
    // =================巨弩==================
    usingGiantArrow() {
        let interval = this.getCurUsingWeaponAttackInterval();
        this.createGiantArrow();
        this.schedule(() => {
            this.createGiantArrow();
        }, interval);
    }
    createGiantArrow() {
        if (ggd.stopAll) return;
        let giantArrow = plm.getFromPool("giantArrow");
        if (giantArrow) this.initGiantArrow(giantArrow);
        else {
            this.loadPrefab("giantArrow", (assets) => {
                plm.addPoolToPools("giantArrow", new NodePool(), assets);
                giantArrow = plm.getFromPool("giantArrow");
                this.initGiantArrow(giantArrow);
            });
        }
    }
    initGiantArrow(giantArrow) {
        giantArrow.setPosition(0, 0, 0);
        giantArrow.parent = find("Canvas/bulletLayer");
        let wp = em.dispatch("getHeroWorldPos");
        giantArrow.setWorldPosition(wp.x, wp.y, wp.z);
        giantArrow.getComponent("GiantArrow").init();
        // console.log("initGiantArrow", giantArrow);
    }
    // =================连弩==================
    usingContinueArrow() {
        let interval = this.getCurUsingWeaponAttackInterval();
        this.schedule(() => {
            this.createContinueArrow();
        }, interval);
    }
    createContinueArrow() {
        if (ggd.stopAll) return;
        let continueArrow = plm.getFromPool("continueArrow");
        if (continueArrow) this.initContinueArrow(continueArrow);
        else {
            this.loadPrefab("continueArrow", (assets) => {
                plm.addPoolToPools("continueArrow", new NodePool(), assets);
                continueArrow = plm.getFromPool("continueArrow");
                this.initContinueArrow(continueArrow);
            });
        }
    }
    initContinueArrow(continueArrow) {
        continueArrow.setPosition(0, 0, 0);
        continueArrow.parent = find("Canvas/bulletLayer");
        let wp = em.dispatch("getHeroWorldPos");
        let pos = {
            x: Math.random() * 30,
            y: Math.random() * 30,
        };
        continueArrow.setWorldPosition(wp.x + pos.x, wp.y + pos.y, wp.z);
        continueArrow.getComponent("ContinueArrow").init();
    }
    //======================法器公用方法===================
    getCurUsingWeaponAttackInterval() {
        let data = em.dispatch("usingHeroBasePropertyFun", "getCurHeroUsingWeaponData");
        let interval = data.lData.attackInterval;
        if (data.qData.effect.indexOf(2) > -1) interval *= 2;
        if (data.qData.effect.indexOf(1001) > -1) interval *= 0.5;
        console.log("getCurUsingWeaponAttackInterval", interval);
        return interval;
    }
    // 产生冲击波
    createShockWave(wp, flyDir) {
        let shockWave = plm.getFromPool("shockWave");
        if (shockWave) this.initShockWave(shockWave, wp, flyDir);
        else {
            this.loadPrefab("shockWave", (assets) => {
                plm.addPoolToPools("shockWave", new NodePool(), assets);
                shockWave = plm.getFromPool("shockWave");
                this.initShockWave(shockWave, wp, flyDir);
            });
        }
    }
    // 初始化冲击波
    initShockWave(shockWave, wp, flyDir) {
        shockWave.setPosition(0, 0, 0);
        shockWave.parent = find("Canvas/bulletLayer");
        shockWave.setWorldPosition(wp);
        shockWave.getComponent("ShockWave").init(flyDir);
    }
    // //通用按钮入口 用于解决因脚本函数过多找不到具体方法
    // commonBtnEnter(e,p){
    //     if(this.hasOwnProperty(p)) this[p]();
    // }
}

