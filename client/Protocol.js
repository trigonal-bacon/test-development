"use strict";
const MSPT = 40;
class Reader {
    constructor() {
        this.i = 0;
        this.p = new Uint8Array(0);
    }
    set(p) { this.p = p; this.i = 0; }
    has() { return this.p.length > this.i; }
    ru8() { return this.p[this.i]; }
    u8() { return this.p[this.i++]; }
    vu() {
        let out = 0, at = 0;
        while (this.p[this.i] & 0x80) {
            out |= (this.u8() & 0x7f) << at;
            at += 7;
        }
        out |= this.u8() << at;
        return out;
    }
    vi() { return this.vu() | 0; }
    f32() { return new Float32Array(this.p.slice(this.i, this.i += 4).buffer)[0]; }
}
const r = new Reader;
let entities = {};
let ws = new WebSocket(`ws${location.protocol.slice(4)}//${location.host}`);
ws.onclose = _ => setTimeout(() => { ws = new WebSocket(`ws${location.protocol.slice(4)}//${location.host}`); }, 1000);
ws.onmessage = async (e) => {
    const packet = new Uint8Array(await e.data.arrayBuffer());
    r.set(packet);
    switch (r.u8()) {
        case 1:
            parseEntPacket();
            break;
        case 254: break;
    }
};
function parseEntPacket() {
    let id;
    while ((id = r.vu()))
        if (entities[id])
            delete entities[id];
    while ((id = r.vu()) && r.has()) {
        if (r.u8() === 0) {
            entities[id] = { CLIENT_RENDER_TICK: 0 };
            let component;
            while ((component = r.u8()) !== 255) {
                switch (component) {
                    case 0:
                        entities[id].pos = new PositionComponent;
                        break;
                    case 1:
                        entities[id].camera = new CameraComponent;
                        clientRender.camera = id;
                        break;
                    case 2:
                        entities[id].arena = new ArenaComponent;
                        break;
                    case 3:
                        entities[id].style = new StyleComponent;
                        break;
                    case 4:
                        entities[id].health = new HealthComponent;
                        break;
                    case 5:
                        entities[id].drop = new DropComponent;
                        break;
                    case 6:
                        entities[id].mob = new MobComponent;
                        break;
                    case 7:
                        entities[id].petal = new PetalComponent;
                        break;
                    case 8:
                        entities[id].player = new PlayerComponent;
                        break;
                }
            }
        }
        else {
            const entity = entities[id];
            let field, pos;
            while ((field = r.u8()) !== 255) {
                switch (field) {
                    case 0:
                        if (entity.pos)
                            entity.pos.x = r.vi();
                        break;
                    case 1:
                        if (entity.pos)
                            entity.pos.y = r.vi();
                        break;
                    case 2:
                        if (entity.pos)
                            entity.pos.angle = r.f32();
                        break;
                    case 3:
                        if (entity.pos)
                            entity.pos.radius = r.f32();
                        break;
                    case 4:
                        if (entity.camera)
                            entity.camera.x = r.f32();
                        break;
                    case 5:
                        if (entity.camera)
                            entity.camera.y = r.f32();
                        break;
                    case 6:
                        if (entity.camera)
                            entity.camera.fov = r.f32();
                        break;
                    case 7:
                        if (entity.camera)
                            entity.camera.player = r.vu();
                        break;
                    case 8:
                        if (entity.arena)
                            entity.arena.width = r.vu();
                        break;
                    case 9:
                        if (entity.arena)
                            entity.arena.height = r.vu();
                        break;
                    case 10:
                        if (entity.style)
                            entity.style.flags = r.u8();
                        break;
                    case 11:
                        if (entity.style)
                            entity.style.opacity = r.u8();
                        break;
                    case 12:
                        if (entity.health)
                            entity.health.health = r.u8();
                        break;
                    case 13:
                        if (entity.drop)
                            entity.drop.id = r.u8();
                        break;
                    case 14:
                        if (entity.drop)
                            entity.drop.rarity = r.u8();
                        break;
                    case 15:
                        if (entity.mob)
                            entity.mob.id = r.u8();
                        break;
                    case 16:
                        if (entity.mob)
                            entity.mob.rarity = r.u8();
                        break;
                    case 17:
                        if (entity.petal)
                            entity.petal.id = r.u8();
                        break;
                    case 18:
                        if (entity.petal)
                            entity.petal.rarity = r.u8();
                        break;
                    case 19:
                        if (entity.player)
                            entity.player.numEquipped = r.u8();
                        break;
                    case 20:
                        if (entity.player)
                            while ((pos = r.u8()) !== 255)
                                entity.player.petalsEquipped[pos] = r.u8();
                        break;
                    case 21:
                        if (entity.player)
                            while ((pos = r.u8()) !== 255)
                                entity.player.petalHealths[pos].set(r.u8());
                        break;
                    case 22:
                        if (entity.player)
                            while ((pos = r.u8()) !== 255)
                                entity.player.petalCooldowns[pos].set(r.u8());
                        break;
                    case 23:
                        if (entity.player)
                            entity.player.faceFlags = r.u8();
                        break;
                }
            }
        }
    }
}
