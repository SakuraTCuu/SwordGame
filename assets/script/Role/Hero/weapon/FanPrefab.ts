import { _decorator, Component, Node, tween, Vec3, } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FanPrefab')
export class FanPrefab extends Component {
    start() {
        this.moveLikeParabola();
    }
    // 像抛物线一样运动
    moveLikeParabola() {
        return console.log("还没写");
        tween(this.node)
            .by(1, { position: new Vec3(-50, 100, 0) }, { easing: "sineOut" })
            .by(1, { position: new Vec3(-50, -100, 0) })
            .by(1, { position: new Vec3(-50, -300, 0) })
            .start();
    }
}

