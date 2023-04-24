export { Queue }

class Queue {
    list = [];
    enqueue(data) {
        this.list.push(data);
    }
    dequeue() {//出队
        if (this.empty()) {
            console.log("无法出队");
            return false;
        }
        return this.list.shift();
    }
    front() {//查看/获取队首元素
        if (this.empty()) {
            console.log("无法查看");
        }
        return this.list[0];
    }
    back() { //查看/获取队尾元素
        if (this.empty()) {
            console.log("无法查看");
        }
        return this.list[this.list.length - 1];
    }
    toString() { //显示队列所有元素
        return this.list.join('\n');
    }
    clear() {
        delete this.list;
        this.list = [];
    }         //清空当前队列
    empty() {
        if (this.list.length === 0) {
            console.log("队列为空");
            return true;
        }
    }         //判断当前队列是否为空
}
