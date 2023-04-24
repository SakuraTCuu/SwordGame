import { _decorator, Component, Node, BoxCollider2D, UITransform, Size } from 'cc';
import { groupIndex } from '../global/globalData';
const { ccclass, property } = _decorator;

@ccclass('ItemInPlaying')
export class ItemInPlaying extends Component {
   
    init(tag){
        let collider = this.node.getComponent(BoxCollider2D);
        if (!collider) collider = this.node.addComponent(BoxCollider2D);
        let UIT = this.node.getComponent(UITransform);
        let itemSize = new Size(UIT.contentSize.x , UIT.contentSize.y);
        collider.size = itemSize;
        collider.tag = tag;
        collider.group = groupIndex.itemInPlaying;
    }
}


