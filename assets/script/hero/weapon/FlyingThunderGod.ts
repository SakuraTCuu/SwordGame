import { _decorator, Component, Node } from 'cc';
import { em } from '../../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('FlyingThunderGod')
export class FlyingThunderGod extends Component {
    
    _isRun = false;

    update(deltaTime: number) {
        let hwp = em.dispatch("getHeroWorldPos");
        let cwp = this.node.getWorldPosition();
        let x = hwp.x - cwp.x;
        let y = hwp.y - cwp.y;
        let dis = Math.sqrt(x*x+y*y);
        if(!this._isRun&&dis>800) {
            console.log("超过800码，飞雷神标记消失");
            em.dispatch("createTipsTex", "超过2000码，飞雷神标记消失");
            this._isRun = true;
            em.dispatch("usingHeroControlFun","resetFlyingThunderGodCount");
        }
    }
}

