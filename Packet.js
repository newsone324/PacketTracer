import PacketType from "./PacketType.js";

class Packet {
    constructor(source, destination, type, seqNum = null, ackNum = null) {
        this.source = source;                   //node sending the packet
        this.destination = destination;         //node receiving the packet
        this.type = type;                       //PacketType.SYN, PacketType.ACK, etc
        this.seqNum = seqNum;                   //Sequence number
        this.ackNum = ackNum;                   //acknowledgement number
    }

    log() {
        console.log(`${this.type} packet from ${this.source.name} to ${this.destination.name} | seq=${this.seqNum}, ack=${this.ackNum}`);
    }
}

export default Packet;
