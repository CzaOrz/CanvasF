Math.randrange = (min, max) => Math.random() * (max - min) + min;
Math.choice = array => array[parseInt(Math.randrange(0, array.length))];

function* yield_loop(n) {
    var loop;
    if (typeof n === 'number') {
        loop = Array(n);
        for (let i = 0; i < n; i++) loop[i] = i;
    } else {
        loop = n;
    }
    while (1) {
        for (value of loop) yield value
    }
}

class CSF {

    static bubble(x, y, r, color) {
        return new (class Bubble {
            constructor(x, y, r = [4, 8], color = '#000') {
                this.x = x;
                this.y = y;
                this.r = Math.randrange(...r);
                this.color = color;
                this.xStep = Math.randrange(-1, 1);
                this.yStep = Math.randrange(-1, 1);
            }

            update() {
                this.x += this.xStep;
                this.y += this.yStep;
                this.r -= 0.2;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }

            changeDirection() {
                if (this.x - this.r < 0 || this.x + this.r > window.innerWidth) {
                    this.xStep = -this.xStep;
                }
                if (this.y - this.r < 0 || this.y + this.r > window.innerHeight) {
                    this.yStep = -this.yStep;
                }
            }
        })(x, y, r, color);
    }

    static circleBar(ctx, r, bar_length, bar_number, bar_width = 1) {
        var container, word_rotate;
        if (typeof bar_number === 'number') {
            container = Array(bar_number);
        } else {
            word_rotate = Math.PI + Math.PI / 20;
            container = bar_number;
            bar_number = bar_number.length;
        }

        let
            bar = r + bar_length,
            rad = 2 * Math.PI / bar_number;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = bar_width;
        ctx.font = `${bar_width}px sans-serif`;
        for (value of container) {
            ctx.rotate(rad);
            if (value) {
                ctx.save();
                ctx.translate(0, r);
                ctx.rotate(word_rotate);
                ctx.fillText(value, 0, bar_length);
                ctx.restore();
            } else {
                ctx.moveTo(0, r);
                ctx.lineTo(0, bar);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    static rocket(x, y, size) {
        return new (class Rocket {
            constructor(x, y, size = [5, 15]) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.angle = Math.random() * Math.PI / 4 - Math.PI / 6;
                this.blastSpeed = 6 + Math.random() * 7;
                this.xSpeed = Math.sin(this.angle) * this.blastSpeed;
                this.ySpeed = -Math.cos(this.angle) * this.blastSpeed;
                this.hue = Math.floor(Math.random() * 360);
            }

            update() {
                this.x = this.x + this.xSpeed;
                this.y = this.y + this.ySpeed;
                this.ySpeed += 0.1;
            }

            draw(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.atan2(this.ySpeed, this.xSpeed) + Math.PI / 2);
                ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
                ctx.fillRect(0, 0, ...this.size);
                ctx.restore();
            }
        })(x, y, size)
    }

    static star5(ctx, r, fill = true) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(0.588 * r, 0.809 * r);
        ctx.lineTo(-0.952 * r, -0.309 * r);
        ctx.lineTo(0.952 * r, -0.309 * r);
        ctx.lineTo(-0.588 * r, 0.809 * r);
        ctx.closePath();
        fill ? ctx.fill() : ctx.stroke();
        ctx.restore();
    }

    static star6(ctx, r) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(0.866 * r, 0.5 * r);
        ctx.lineTo(-0.866 * r, 0.5 * r);
        ctx.lineTo(0, -r);
        ctx.moveTo(0.866 * r, -0.5 * r);
        ctx.lineTo(-0.866 * r, -0.5 * r);
        ctx.lineTo(0, r);
        ctx.lineTo(0.866 * r, -0.5 * r);
        ctx.stroke();
        ctx.restore();
    }

}

class CanvasF {
    requestAnimationFrameNumber = null;

    constructor(options = {}) {
        this.drawing_stack = [];
        this.$options = options;
        for (let method in options.methods) {
            if (method.startsWith('draw_')) this.drawing_stack.push(options.methods[method]);
        }
        if (!options.el) throw "Not Found El in options";
        this.$el = document.querySelector(options.el);
        if (!this.$el) throw `Not Found element by ${options.el}`;
        this.$ctx = this.$el.getContext('2d');
        this.height = this.$el.height = options.height || window.innerHeight;
        this.width = this.$el.width = options.width || window.innerWidth;
        this.$data = Object.assign({
            radian: Math.PI / 180,
            oPI: Math.PI * 2,
            PI: Math.PI,
        }, options.data || {});
        if (options.path2d) {
            var path2d = {};
            for (let path in options.path2d) path2d[path] = options.path2d[path].call(this);
            this.$data = Object.assign(this.$data, path2d);
        }
        if (options.created) options.created.call(this);
        this.refresh();
    }

    refresh() {
        if (!this.$options.dont_clear) this.clearCanvas();
        for (var drawStep of this.drawing_stack) {
            this.$ctx.save();
            this.$ctx.beginPath();
            drawStep.call(this);
            this.$ctx.restore();
        }
    }

    stroke() {
        this.$ctx.stroke();
    }

    fill() {
        this.$ctx.fill();
    }

    clearCanvas() {
        this.$ctx.clearRect(-this.width, -this.height, 2 * this.width, 2 * this.height);
    }

    startAnimation() {
        this.requestAnimationFrameNumber = requestAnimationFrame(() => {
            this.refresh();
            this.startAnimation();
        })
    }

    stopAnimation() {
        cancelAnimationFrame(this.requestAnimationFrameNumber);
    }
}
