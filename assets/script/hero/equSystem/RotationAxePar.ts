import { _decorator, Component, Node, BoxCollider2D, Contact2DType } from 'cc';
import { em } from '../../global/EventManager';
import { ggd, groupIndex, tagData } from '../../global/globalData';
import { plm } from '../../global/PoolManager';
import { Weapon } from '../weapon/Weapon';

const { ccclass, property } = _decorator;

@ccclass('RotationAxe')
export class RotationAxe extends Component {
    @property(Node)
    axe1;
    @property(Node)
    axe2;

    _moveSpeed:number
    _duration:number;
    _weaponName:string;
    init() {
        this.axe1.setPosition(-100,0,0);
        this.axe2.setPosition(100,0,0);
        this.axe1.setRotationFromEuler(0,0,0);
        this.axe2.setRotationFromEuler(0,0,0);
        this._moveSpeed = 120;
        this._duration = 3.5;
        this._weaponName = "rotationAxe";
        this.axe1.getComponent("RotationAxeChild").init();
        this.axe2.getComponent("RotationAxeChild").init();
    }
    update(dt) {
        if (ggd.stopAll) return;
        let pos1 = this.axe1.getPosition();
        let pos2 = this.axe2.getPosition();
        this.axe1.setPosition(pos1.x - dt * this._moveSpeed, pos1.y, pos1.z);
        this.axe2.setPosition(pos2.x + dt * this._moveSpeed, pos2.y, pos2.z);
        this._duration -= dt;
        if (this._duration <= 0) {
            plm.putToPool(this._weaponName, this.node, true);
        }
    }
}


