import { _decorator, Component, Node, CircleCollider2D, Contact2DType } from 'cc';
import { em } from '../../global/EventManager';
import { tagData } from '../../global/globalData';
import { EnemySkill } from './EnemySkill';
const { ccclass, property } = _decorator;

@ccclass('BlackHole')
export class BlackHole extends EnemySkill {
    _touchHero: boolean = false;
    _attackInterval = 0.05;
    _gravitationSpeed = 100;
    init() {
        this._damage = 1;
        this._skillName = "blackHole";
        this._duration = 15;
        this.initCircleCollider();
        let collider = this.node.getComponent(CircleCollider2D);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
    }
    onBeginContact(self, other) {
        console.log("onBeginContact black hole");

        if (other.tag !== tagData.hero) return;
        this._touchHero = true;
        this.scheduleOnce(() => {
            this.heroInBlackHole(other);
        }, this._attackInterval);
        console.log("进入黑洞");
    }
    onEndContact(self, other) {
        console.log("离开黑洞");
        this._touchHero = false;
    }
    heroInBlackHole(other) {
        console.log("heroInBlackHole");

        if (this._touchHero) {
            let nwp = this.node.getWorldPosition();
            let hwp = em.dispatch("getHeroWorldPos");
            let x = nwp.x - hwp.x;
            let y = nwp.y - hwp.y;
            let dis = Math.sqrt(x * x + y * y);
            let moveDisX = (x == 0 ? 0 : this._attackInterval / (dis / this._gravitationSpeed) * x);
            let moveDisY = (y == 0 ? 0 : this._attackInterval / (dis / this._gravitationSpeed) * y);
            other.node.parent.setWorldPosition(hwp.x + moveDisX, hwp.y + moveDisY, hwp.z);
            em.dispatch("usingHeroControlFun", "updateBloodProgress", -this._damage);
            this.scheduleOnce(() => {
                this.heroInBlackHole(other);
            }, this._attackInterval);
        }
    }
}

