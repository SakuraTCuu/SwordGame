import { _decorator, Component, Node } from 'cc';
import { plm } from '../global/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('CommonCallback')
export class CommonCallback extends Component {
    
    destroyAnim(){
        this.node.destroy();
        console.log("销毁节点");
    }
    //将动画回收到对象池
    recoveryAnim(p1){
        plm.putToPool(p1,this.node,true);
    }
    //
}

