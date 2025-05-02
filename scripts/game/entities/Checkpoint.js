import { Entity } from './Entity.js';
import DEBUG from '../../utils/debug.js';

export class Checkpoint extends Entity {
    constructor(x, y, id) {
        super(x, y);
        this.checkpointId = id;
        this.isActivated = false;
        this.activationTime = null;
        this.size = { width: 48, height: 64 };
        this.pulsePhase = 0;
        this.user = 'Zeeb0-0';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update pulse animation
        this.pulsePhase = (this.pulsePhase + deltaTime * 2) % (Math.PI * 2);
    }

    render(ctx) {
        // Base checkpoint
        ctx.fillStyle = this.isActivated ? '#00ff00' : '#888888';
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );

        // Pulse effect when activated
        if (this.isActivated) {
            const pulseSize = Math.sin(this.pulsePhase) * 8;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.position.x - pulseSize,
                this.position.y - pulseSize,
                this.size.width + pulseSize * 2,
                this.size.height + pulseSize * 2
            );
        }

        // Checkpoint ID
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `CP ${this.checkpointId}`,
            this.position.x + this.size.width / 2,
            this.position.y + this.size.height + 20
        );
    }

    activate() {
        if (!this.isActivated) {
            this.isActivated = true;
            this.activationTime = '2025-05-02 11:50:45';
            DEBUG.log(`Checkpoint ${this.checkpointId} activated by ${this.user}`, 'info');
            return true;
        }
        return false;
    }

    deactivate() {
        if (this.isActivated) {
            this.isActivated = false;
            this.activationTime = null;
            DEBUG.log(`Checkpoint ${this.checkpointId} deactivated`, 'info');
            return true;
        }
        return false;
    }

    getState() {
        return {
            ...super.getState(),
            checkpointId: this.checkpointId,
            isActivated: this.isActivated,
            activationTime: this.activationTime,
            user: this.user
        };
    }

    setState(state) {
        super.setState(state);
        Object.assign(this, {
            checkpointId: state.checkpointId,
            isActivated: state.isActivated,
            activationTime: state.activationTime,
            user: state.user
        });
    }
}