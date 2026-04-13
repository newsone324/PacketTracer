class PacketInTransit {
    constructor(packet, fromNode, toNode, duration) {
        this.packet = packet;
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.progress = 0;  //0 = start, 1 = arrived
        this.duration = duration;   //time to traverse
    }

    update(deltaTime) {
        this.progress += deltaTime / this.duration;

        if (this.progress >= 1) {
            this.toNode.receive(this.packet);
            return true;                    //finished
        }
        return false;           //still traveling
    }
}
export default PacketInTransit;
