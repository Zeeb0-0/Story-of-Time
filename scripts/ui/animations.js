export class Animations {
    static DURATIONS = {
        FADE: 300,
        SLIDE: 500,
        SCALE: 400
    };

    static async fadeIn(element, duration = this.DURATIONS.FADE) {
        element.style.display = 'block';
        element.style.opacity = '0';

        await this._animate(element, [
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration,
            easing: 'ease-in'
        });
    }

    static async fadeOut(element, duration = this.DURATIONS.FADE) {
        await this._animate(element, [
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration,
            easing: 'ease-out'
        });

        element.style.display = 'none';
    }

    static async slideIn(element, direction = 'right', duration = this.DURATIONS.SLIDE) {
        const start = this._getStartPosition(direction);
        element.style.display = 'block';

        await this._animate(element, [
            { transform: `translate${start.axis}(${start.value}px)` },
            { transform: 'translate(0, 0)' }
        ], {
            duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
    }

    static async slideOut(element, direction = 'right', duration = this.DURATIONS.SLIDE) {
        const end = this._getEndPosition(direction);

        await this._animate(element, [
            { transform: 'translate(0, 0)' },
            { transform: `translate${end.axis}(${end.value}px)` }
        ], {
            duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });

        element.style.display = 'none';
    }

    static async scaleIn(element, duration = this.DURATIONS.SCALE) {
        element.style.display = 'block';

        await this._animate(element, [
            { transform: 'scale(0)' },
            { transform: 'scale(1)' }
        ], {
            duration,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });
    }

    static async scaleOut(element, duration = this.DURATIONS.SCALE) {
        await this._animate(element, [
            { transform: 'scale(1)' },
            { transform: 'scale(0)' }
        ], {
            duration,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });

        element.style.display = 'none';
    }

    static async _animate(element, keyframes, options) {
        const animation = element.animate(keyframes, {
            ...options,
            fill: 'forwards'
        });

        return new Promise(resolve => {
            animation.onfinish = () => resolve();
        });
    }

    static _getStartPosition(direction) {
        const positions = {
            'right': { axis: 'X', value: 100 },
            'left': { axis: 'X', value: -100 },
            'top': { axis: 'Y', value: -100 },
            'bottom': { axis: 'Y', value: 100 }
        };
        return positions[direction] || positions.right;
    }

    static _getEndPosition(direction) {
        const positions = {
            'right': { axis: 'X', value: 100 },
            'left': { axis: 'X', value: -100 },
            'top': { axis: 'Y', value: -100 },
            'bottom': { axis: 'Y', value: 100 }
        };
        return positions[direction] || positions.right;
    }
}