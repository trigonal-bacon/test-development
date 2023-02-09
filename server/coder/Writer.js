export class Writer {
    constructor() {
        this.packet = [];
    }
    u8 = x => this.packet.push(x);
    i32 = x => this.packet.push(...new Uint8Array(new Int32Array([x]).buffer));
    f32 = x => this.packet.push(...new Uint8Array(new Float32Array([x]).buffer));
    str = x => this.packet.push(...new TextEncoder().encode(x), 0);
    write = _ => new Uint8Array(this.packet);
}