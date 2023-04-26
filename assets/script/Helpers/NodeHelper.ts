import { Material, Node, UITransform, Vec2, Vec3 } from "cc";

export default class NodeHelper {
    /**
	 *
	 *
	 * 不变动位置情况更换父亲
	 *
	 * @static
	 * @param {cc.Node} sub
	 * @param {cc.Node} father
	 * @memberof NodeHelper
	 */
    public static changeParent(sub: Node, father: Node, zIndex?: number) {
        let fatherTransform = father.getComponent(UITransform);
        let subTransform = sub.getComponent(UITransform);
        let location = fatherTransform.convertToNodeSpaceAR(subTransform.convertToWorldSpaceAR(Vec3.ZERO));
        sub.parent = null;
        father.addChild(sub);
        if(zIndex != undefined)
        {
            father.setSiblingIndex(zIndex);
        }
        let subPos = sub.getPosition();
        subPos.x = location.x;
        subPos.y = location.y;
        sub.setPosition(subPos);
    }

	/**
	 * 判断2个节点是否碰撞
	 *
	 * @static
	 * @param {cc.Node} node1
	 * @param {cc.Node} node2
	 * @returns
	 * @memberof NodeHelper
	 */
    public static isCollide(node1: Node, node2: Node) {
        let node1Points = NodeHelper.getPoints(node1);
        let node2Points = NodeHelper.getPoints(node2);

        for (let index = 0; index < node1Points.length; index++) {
            const vec = node1Points[index];
            if (NodeHelper.isInNode(node2, vec)) {
                return true;
            }
        }

        for (let index = 0; index < node2Points.length; index++) {
            const vec = node2Points[index];
            if (NodeHelper.isInNode(node1, vec)) {
                return true;
            }
        }

        return false;
    }

	/**
	 * 获取四个角位置（世界坐标）
	 *
	 * @static
	 * @param {cc.Node} node
	 * @returns
	 * @memberof NodeHelper
	 */
    public static getPoints(node: Node) {
        let result = new Array<Vec3>();
        let nodeTransform = node.getComponent(UITransform);
        result.push(nodeTransform.convertToWorldSpaceAR(new Vec3(nodeTransform.width / 2, nodeTransform.height / 2)));
        result.push(nodeTransform.convertToWorldSpaceAR(new Vec3(-nodeTransform.width / 2, -nodeTransform.height / 2)));
        result.push(nodeTransform.convertToWorldSpaceAR(new Vec3(+nodeTransform.width / 2, -nodeTransform.height / 2)));
        result.push(nodeTransform.convertToWorldSpaceAR(new Vec3(-nodeTransform.width / 2, +nodeTransform.height / 2)));
        return result;
    }

	/**
	 * 判断一个点（世界坐标）是否在节点内
	 *
	 * @static
	 * @param {cc.Node} node
	 * @param {cc.Vec2} vec
	 * @returns
	 * @memberof NodeHelper
	 */
    public static isInNode(node: Node, vec: Vec2 | Vec3) {
        let nodeTransform = node.getComponent(UITransform);
        let location = nodeTransform.convertToNodeSpaceAR(new Vec3(vec.x, vec.y, vec['z'] || 0));
        if (Math.abs(location.x) <= nodeTransform.width / 2 && Math.abs(location.y) <= nodeTransform.height / 2) {
            return true;
        } else {
            return false;
        }
    }

    // /**
    //  * 节点置灰
    //  * @param node 
    //  * @param gray 
    //  * @param defaultMaterial 
    //  */
    // public static setGray(node: Node, gray: boolean = true, defaultMaterial: Material = Material.createWithBuiltin("2d-sprite", 0)) {
    //     let gray_material = Material.createWithBuiltin("2d-gray-sprite", 0);

    //     let sp = node.getComponent(cc.Sprite);
    //     if (sp) {
    //         if (gray) {
    //             sp.setMaterial(0, gray_material);
    //         } else {
    //             sp.setMaterial(0, defaultMaterial);
    //         }
    //     }

    //     const childrenSprite = node.getComponentsInChildren(cc.Sprite);
    //     for (const cs of childrenSprite) {
    //         if (cs.node != node) {
    //             this.setGray(cs.node, gray);
    //         }
    //     }

    //     const childrenOutline = node.getComponentsInChildren(cc.LabelOutline);
    //     for (const co of childrenOutline) {
    //         if (co.node != node) {
    //             // 灰色直接禁用描边
    //             co.enabled = !gray;
    //         }
    //     }
    // }
}