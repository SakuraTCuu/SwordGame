import { _decorator, Component, Node, Contact2DType, Collider2D, BoxCollider2D, UITransform, Size, Sprite, UI } from 'cc';
import { Constant } from '../../Common/Constant';
import { em } from '../../Common/EventManager';
const { ccclass, property } = _decorator;

@ccclass('HeroCollider')
export class HeroCollider extends Component {

    _touchFireBallFire = false;
    _isInsideObs = false;

    start() {
        this.openCollider();

    }
    openCollider() {
        let collider = this.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let monsterSize = new Size(UIT.contentSize.x/2, UIT.contentSize.y);
        collider.tag = Constant.Tag.hero;
        collider.size = monsterSize;
        collider.group = Constant.GroupIndex.self;
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
    onBeginContact(self: Collider2D, other: Collider2D) {
        switch (other.tag) {
            case Constant.Tag.fireBall:
                this.fireBallAttackHero();
                break;
            case Constant.Tag.fireBallFire:
                this._touchFireBallFire = true;
                this.fireBallFireAttackHero();
                break;
            case Constant.Tag.obstacle:
                this._isInsideObs = true;
                em.dispatch("usingHeroControlFun", "changeMoveState",false);
                let fun = ()=>{
                    if(this._isInsideObs) em.dispatch("usingHeroControlFun", "ejectFormObs");
                    else this.unschedule(fun);
                }
                this.schedule(fun,0.01);
                break;
            case Constant.Tag.randomSkillReward:
                other.node.destroy();
                em.dispatch("usingHeroControlFun","selectUpgradeReward");
                break;
            default:
                let ignore = [Constant.Tag.boss, Constant.Tag.monster, Constant.Tag.enemySkill];//在其他碰撞脚本中已经做过处理 再此忽略
                if (ignore.indexOf(other.tag) > -1) break;
                throw new Error("未处理的碰撞开始：" + self.tag + "与" + other.tag + "发生碰撞");
        }
    }

    onEndContact(self: Collider2D, other: Collider2D) {
        switch (other.tag) {
            case Constant.Tag.fireBallFire:
                this._touchFireBallFire = false;
                break;
            case Constant.Tag.obstacle:
                console.log("碰撞障碍物 未处理");
                this._isInsideObs = false;
                em.dispatch("usingHeroControlFun", "changeMoveState",true);
                break;
            default:
                break;
        }
    }
    // 火球攻击玩家
    fireBallAttackHero() {
        if (Constant.GlobalGameData.stopAll) return;
        let damage = 10;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -damage);
    }
    //火球爆炸后的火攻击玩家
    fireBallFireAttackHero() {
        if (Constant.GlobalGameData.stopAll) return;
        if (!this._touchFireBallFire) return;
        let damage = 8;
        em.dispatch("usingHeroControlFun", "createBossDamageTex", -damage);
        let attackInterval = 0.5;
        this.scheduleOnce(() => {
            this.fireBallFireAttackHero();
        }, attackInterval);
    }


}

