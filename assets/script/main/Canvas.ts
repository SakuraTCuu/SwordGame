
import { _decorator, Component, Node, Label, instantiate, tween, Vec3, Color, NodePool, Prefab, Game, game } from 'cc';
import { em } from '../global/EventManager';
import { glf } from '../global/globalFun';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('Canvas')
export class Canvas extends Component {
    @property(Node)
    childNode = [];
    @property(Node)
    needActiveNode = [];

    onLoad(){
        this.activeChildNodeFirst();
        this.activeScriptByActiveNode();
        game.on(Game.EVENT_SHOW,this.gameShow,this)
        game.on(Game.EVENT_HIDE,this.gameHide,this)
    }
    gameShow(){
        console.log("game show");
    }
    gameHide(){
        console.log("game hide");
        em.dispatch("usingHeroControlFun","recoveryTouchRawState");
    }
    onDestroy(){
        plm.clearAllNodePool();
    }
    start() {

    }

    //激活需要依赖父节点的子节点
    activeChildNodeFirst() {
        let arr = this.childNode;
        for (let i = 0; i < arr.length; i++) {
            let node = arr[i];
            if (node) {
                node.active = true;
            };
        };
    }
    //通过激活节点激活脚本
    activeScriptByActiveNode() {
        let arr = this.needActiveNode;
        for (let i = 0; i < arr.length; i++) {
            // for (let i = 0; i < arr.length; i++) {
            let node = arr[i];
            if (node) {
                node.active = true;
                node.active = false;
            };
        };
    }
}

