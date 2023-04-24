
import { _decorator, Component, Node, Animation, Sprite, Material, instantiate, find, Vec3, tween, BoxCollider2D, Prefab, UITransform, Size, Contact2DType } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import Simulator from '../../RVO/Simulator';
import { Monster } from './Monster';
const { ccclass, property } = _decorator;

@ccclass('MonsterLeader')
export class MonsterLeader extends Monster {

    @property(Material)
    leaderMaterial0;
    @property(Material)
    leaderMaterial1;
    @property(Material)
    leaderMaterial2;
    @property(Material)
    leaderMaterial3;
    @property([Material])
    leaderMaterial: Material[] = [];



    _strengthType: string;//强化类型

    /**
     * @description:创建精英怪 0为强化血量 1为强化速度型 2为强化伤害 3 为霸体 
     * @param {*} id
     */
    createLeader(id, type) {
        this._type = "leader";
        //需要对数据进行修改 进行深拷贝
        let data = JSON.parse(JSON.stringify(em.dispatch("getMonsterDataById", id)));
        this.setDefaultMaterialByType(type);
        switch (type) {
            case 0:
                this.createLeaderStrengthBlood(data);
                break;
            case 1:
                this.createLeaderStrengthMoveSpeed(data);
                break;
            case 2:
                this.createLeaderStrengthDamage(data);
                break;
            case 3:
                this.createLeaderSuperArmor(data);
                break;

            default:
                throw "未知的类型：" + type;
        }
    }
    /**
     * @description: 通过精英怪类型设置默认材质 用于区分不同的精英怪
     * @param {number} type 
     * @type {0} 红色描边 血量增加 
     * @type {1} 浅蓝色填充 移速增加 
     * @type {2} 填充 伤害增加 
     * @type {3} 黄色填充 霸体 
     */
    setDefaultMaterialByType(type) {

        let material = this.leaderMaterial[type];
        // let material = this["leaderMaterial"+type];
        if (!material) throw "type is " + type + " material is error";
        this._defaultMaterial = material;
        let spriteComp = this.node.getComponent(Sprite);
        spriteComp.material = this._defaultMaterial;
        console.log("setDefaultMaterialByType", this.node);
    }
    //创建强化血量的精英怪
    createLeaderStrengthBlood(data) {

        this._strengthType = "blood";
        console.log("创建强化血量精英怪");
        data.maxBlood *= 20;
        data.damage *= 3;
        data.moveSpeed *= 1.5;
        this.node.setScale(2, 2);
        // console.log("createLeaderStrengthBlood",data);
        this.init(data);
    }
    //创建强化移速精英怪
    createLeaderStrengthMoveSpeed(data) {

        this._strengthType = "moveSpeed";
        console.log("创建强化移速精英怪");
        data.maxBlood *= 5;
        data.damage *= 2;
        data.moveSpeed *= 3;
        this.node.setScale(1.2, 1.2);
        // console.log("createLeaderStrengthBlood",data);
        this.init(data);
    }
    // 创建强化伤害精英怪
    createLeaderStrengthDamage(data) {

        this._strengthType = "damage";
        console.log("创建强化伤害精英怪");
        data.maxBlood *= 10;
        data.damage *= 5;
        data.moveSpeed *= 1.5;
        this.node.setScale(1.5, 1.5);
        // console.log("createLeaderStrengthBlood",data);
        this.init(data);
    }
    // 创建霸体精英怪
    createLeaderSuperArmor(data) {

        this._strengthType = "superArmor";
        console.log("创建霸体精英怪");
        this._isSuperArmor = true;
        data.maxBlood *= 10;
        data.damage *= 2;
        data.moveSpeed *= 2;
        this.node.setScale(1.5, 1.5);
        // console.log("createLeaderStrengthBlood",data);
        this.init(data);
    }

    init(data) {
        this._curMonsterData = data;
        this.initMonsterMoveAnim(data);
        // this._maxBlood = data.maxBlood;
        this._maxBlood = data.maxBlood * 2;
        this._curBlood = data.maxBlood;
        //所有的精英怪 攻击间隔 减半。 如果每种精英怪的需求不一样  则需要在init之前的 创建数据阶段改变内容
        this._attackInterval *= 0.5;
        this.initCollider();

        //添加代理
        this._sid = Simulator.Instance.addAgent(this.node.getWorldPosition());
    }
    initCollider() {
        let collider = this.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        // let monsterSize = new Size(UIT.contentSize.x, UIT.contentSize.y);
        //碰撞体积缩小到1/4
        // let monsterSize = new Size(UIT.contentSize.x, UIT.contentSize.y);
        let monsterSize = new Size(UIT.contentSize.x / 2, UIT.contentSize.y / 2);
        // let monsterSize = new Size(UIT.contentSize.x*2/3, UIT.contentSize.y*2/3);

        collider.tag = tagData.monster;
        collider.size = monsterSize;
        collider.group = groupIndex.enemy;

        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

    }
    update(deltaTime: number) {
        this.move();
        this.updateSpriteDirection();
    }
    //精英怪 无视碰撞
    dynamicAvoidCollider() {
        return null;
    }

    //=======================重新方法=======================
    monsterDied() {
        //节点已经被清除 无法找到父节点 血条更新处理
        if (this.node.parent) {
            plm.putToPool("monsterLeader", this.node);
            em.dispatch("updateLeaderCurTotal", -1);
            em.dispatch("showKillLeaderReward", this._strengthType);
            // 加经验
            em.dispatch("usingHeroControlFun", "updateExpProgress", 100);
            // em.dispatch("usingHeroControlFun", "updateExpProgress", 200);
            em.dispatch("updateKillCountLabel", 1);
        };
        this.afterMonsterDied();
    }

}

