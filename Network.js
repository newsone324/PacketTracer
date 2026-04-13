import PacketInTransit from "./PacketInTransit.js";

class Network {
    constructor() {
        this.nodes = [];     //list of all nodes
        this.inTransit = [];
    }

    registerNode(node) {
        this.nodes.push(node);
    }

    sendPacket(packet) {
        // setTimeout(() => {

        //     const destination = packet.destination;

        //     if (!this.nodes.includes(destination)) {
        //         console.log(`[NETWORK] ERROR: Destination ${destination.name} not found`);
        //         return;
        //     }

        //     console.log(`[NETWORK] Delivering ${packet.type} (seq=${packet.seqNum}) from ${packet.source.name} → ${destination.name}`);
        //     destination.receive(packet);
        // });

        const duration = Math.random() * 500 + 100; //random latency, 100-600ms
        this.inTransit.push(new PacketInTransit(packet, packet.source, packet.destination, duration));

    }

    tick(deltaTime) {
        //update in-transit packets
        this.inTransit = this.inTransit.filter(p => !p.update(deltaTime));
    }
}
export default Network;
