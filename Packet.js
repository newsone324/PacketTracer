import PacketType from "./PacketType.js";
import Packet from "./Packet.js";


const PacketState = Object.freeze({
    CLOSED: "CLOSED",
    SYN_SENT: "SYN-SENT",
    SYN_RECEIVED: "SYN-RECEIVED",
    ESTABLISHED: "ESTABLISHED"
});

class Connection {
    constructor(nodeA, nodeB, network) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.network = network;

        this.stateA = PacketState.CLOSED;
        this.stateB = PacketState.CLOSED;

        nodeA.addConnection(this);
        nodeB.addConnection(this);
    }

    //checks if this node is part of the connection
    involves(node) {
        return node === this.nodeA || node === this.nodeB;
    }

    //decides what to do when a packet arrives
    handlePacket(packet, receiver) {
        const sender = packet.source;

        switch (packet.type) {
            case PacketType.SYN:
                //server receives SYN, respond with SYN-ACk
                console.log(`[CONNECTION] ${receiver.name} received SYN, sending SYN-ACK`);
                const synAck = new Packet(
                    receiver,
                    sender,
                    PacketType.SYN_ACK,
                    receiver.currSeqNum,
                    packet.seqNum + 1
                );

                receiver.send(synAck, this.network);
                this.stateA = this.stateB = PacketState.SYN_RECEIVED;
                break;

            case PacketType.SYN_ACK:
                //client receives, synack, respond with ack
                console.log(`[CONNECTION] ${receiver.name} received SYN-ACK, sending ACK`);
                const ack = new Packet(
                    receiver,
                    sender,
                    PacketType.ACK,
                    receiver.currSeqNum,
                    packet.seqNum + 1
                );

                receiver.send(ack, this.network);
                this.stateA = this.stateB = PacketState.ESTABLISHED;
                console.log(`[CONNECTION] ✅ Connection established between ${this.nodeA.name} and ${this.nodeB.name}`);
                break;
        }
    }

    //internal logic per TCP rules
    handleForNode(receiver, sender, packet) {
        if (receiver.type === "SERVER") {
            if (packet.type === PacketType.SYN) {
                console.log(`${receiver.name} received SYN, sending SYN-ACK`);

                //create syn-ack packet
                const synAckPacket = new Packet(receiver, sender, PacketType.SYN_ACK);

                //send synAckPacket
                receiver.send(synAckPacket, this.network);

                //update state
                this.stateB = PacketState.SYN_RECEIVED;
            } else if (packet.type === PacketType.ACK) {
                console.log(`${receiver.name} received ACK, connection established!`)
                this.stateB = PacketState.ESTABLISHED;
                this.stateA = PacketState.ESTABLISHED;
            }

        } else if (receiver.type === "CLIENT") {
            if (packet.type === PacketType.SYN_ACK) {
                console.log(`${receiver.name} received SYN-ACK, sending ACK`);
                const ack = new Packet(receiver, sender, PacketType.ACK);
                receiver.send(ack, this.network);
            }
        }
    }

    //initiates a conneciton from one side
    startHandshake() {
        console.log(`[CONNECTION] Initiating handshake from ${this.nodeA.type === "CLIENT" ? this.nodeA.name : this.nodeB.name}`);
        if (this.nodeA.type === "CLIENT") {
            this.stateA = PacketState.SYN_SENT;
            const syn = new Packet(this.nodeA, this.nodeB, PacketType.SYN);
            this.nodeA.send(syn, this.network);
        } else if (this.nodeB.type === "CLIENT") {
            this.stateB = PacketState.SYN_SENT;
            const syn = new Packet(this.nodeB, this.nodeA, PacketType.SYN);
            this.nodeB.send(syn, this.network);
        }
    }
}
export default Connection;
