import { _decorator, Component, Node, find, UITransform } from 'cc';
import { Constant } from '../Common/Constant';
const { ccclass, property } = _decorator;

@ccclass('DynamicSupFrame')
export class DynamicSupFrame extends Component {

    _L: Node = null;
    _R: Node = null;
    _U: Node = null;
    _D: Node = null;

    onLoad() {
        this._L = find("L", this.node);
        this._R = find("R", this.node);
        this._U = find("U", this.node);
        this._D = find("D", this.node);
        if (!Constant.GlobalGameConfig.dynamicSupFrame) {
            this._L.active = false;
            this._R.active = false;
            this._U.active = false;
            this._D.active = false;
            return;
        }
        console.log("动态初始化 四叉树范围框");
        this._L.getComponent(UITransform).setContentSize(2, Constant.GlobalGameConfig.quadTreeRange.h);
        this._R.getComponent(UITransform).setContentSize(2, Constant.GlobalGameConfig.quadTreeRange.h);
        this._U.getComponent(UITransform).setContentSize(Constant.GlobalGameConfig.quadTreeRange.w, 2);
        this._D.getComponent(UITransform).setContentSize(Constant.GlobalGameConfig.quadTreeRange.w, 2);
        this._L.setPosition(-Constant.GlobalGameConfig.quadTreeRange.w/2, 0);
        this._R.setPosition(Constant.GlobalGameConfig.quadTreeRange.w/2, 0);
        this._U.setPosition(0, Constant.GlobalGameConfig.quadTreeRange.h/2);
        this._D.setPosition(0, -Constant.GlobalGameConfig.quadTreeRange.h/2);
        this._L.active = true;
        this._R.active = true;
        this._U.active = true;
        this._D.active = true;
    }
}


