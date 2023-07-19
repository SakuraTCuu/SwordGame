import { _decorator, Component, Node, BoxCollider2D, UITransform, Size, Contact2DType, Collider2D, Animation, CircleCollider2D } from 'cc';
import { em } from '../../../Common/EventManager';

import { Constant } from '../../../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('EnemySkill')
export class EnemySkill extends Component {

    _skillName: string;
    _damage: number;
    _flyDir: any;
    _moveSpeed: number;
    _duration: number = Infinity;
    _canAttackTimes: number;

    _curData = null;

    init(data, flyDir = null, scale = 1) {
        this._curData = data;
        this._skillName = data.name;
        this._damage = data.damage;
        this._duration = data.duration;
        this._moveSpeed = data.moveSpeed;
        if (data.canAttackTimes) this._canAttackTimes = data.canAttackTimes;
        else this._canAttackTimes = Infinity;
        this._flyDir = flyDir;
        this.initCollider(scale);
    }
    initCollider(scale = 1) {
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let skillSize = new Size(UIT.contentSize.x * scale, UIT.contentSize.y * scale);
        collider.tag = Constant.Tag.enemySkill;
        collider.size = skillSize;
        collider.group = Constant.GroupIndex.enemySkill;
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // console.log("EnemySkill collider",collider);
    }
    initCircleCollider(scale = 1) {
        let collider = this.node.getComponent(CircleCollider2D);
        if (!collider) collider = this.node.addComponent(CircleCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let skillSize = new Size(UIT.contentSize.x * scale, UIT.contentSize.y * scale);
        collider.tag = Constant.Tag.enemySkill;
        collider.radius = skillSize.x / 2;
        collider.group = Constant.GroupIndex.enemySkill;
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
    onBeginContact(self, other) {
        // 攻击玩家
        if (other.tag == Constant.Tag.hero) {
            this.colliderHero();
        }
        //碰撞销毁
        if (other.tag == Constant.Tag.destroyWeapon) {
            this.recoveryPrefab();
        }
    }
    colliderHero() {
        if (this._curData.hasOwnProperty("effects") && this._curData.effects.indexOf("slow") > -1) {//减速
            em.dispatch("usingHeroControlFun", "addDebuffSlow", 5, 20);//降低20点移速 持续3s
        }
        if (this._damage) {//技能存在伤害
            em.dispatch("usingHeroControlFun", "createBossDamageTex", -this._damage);
        }
        this._canAttackTimes--;
        if (this._canAttackTimes <= 0) this.recoveryPrefab();
    }
    recoveryPrefab() {
        app.pool.plm.putToPool(this._skillName, this.node);
        // app.pool.plm.putToPool(this._skillName,this.node,true);
    }
    destroyPrefab() {
        this.node.destroy();
    }
    update(deltaTime: number) {
        this.weaponMove(deltaTime);
        this.weaponDuration(deltaTime);
    }
    weaponMove(deltaTime: number) {
        if (Constant.GlobalGameData.stopAll) return;
        if (!this._flyDir) return;
        if (this._moveSpeed == 0 || this._duration == Infinity) return;

        let dis = deltaTime * this._moveSpeed;
        // let dis = deltaTime*(this._moveSpeed+bonusMS);
        let moveX = this._flyDir.x * dis;
        let moveY = this._flyDir.y * dis;
        this.node.setPosition(this.node.getPosition().x + moveX, this.node.getPosition().y + moveY, 0);
    }
    weaponDuration(deltaTime: number) {
        if (Constant.GlobalGameData.stopAll) return;
        this._duration -= deltaTime;
        if (this._duration <= 0) this.recoveryPrefab();
    }
}

