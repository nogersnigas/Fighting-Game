class sprite {
    constructor({ 
        position, 
        imageSrc, 
        scale = 1, 
        framesMax = 1, 
        offset = { x: 0, y: 0 } 
    }) {
        this.position = position
        this.width = 50
        this.height = 150
        this.image = typeof imageSrc === 'string' ? null : imageSrc
        this.imageSrc = typeof imageSrc === 'string' ? imageSrc : null
        this.scale = scale
        this.framesMax = framesMax
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 3
        this.offset = offset
    }

    setImage(img) {
        this.image = img
    }

    draw() {
        if (!this.image) {
            // Fallback: draw a colored rectangle if no image is set
            c.fillStyle = 'rgba(0, 0, 150, 0.7)'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
            return
        }
        c.drawImage(
            this.image, 
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        )
    }

    animateFrames() {
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++
            }   else {
                this.framesCurrent = 0
            }
        }
    }

    update() {
        this.draw()
        this.animateFrames()
    }

    switchSprite(state) {
        if (!this.sprites || !this.sprites[state]) return
        const s = this.sprites[state]
        if (s.image) this.image = s.image
        if (s.framesMax) this.framesMax = s.framesMax
        this.framesCurrent = 0
    }
}

class Fighter extends sprite {
    constructor({ 
        position, 
        velocity, 
        color = 'red', 
        imageSrc, 
        scale = 1, 
        framesMax =1,
        offset = {x: 0, y: 0},
        sprites
    }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        })

        this.velocity = velocity
        this.width = 50
        this.height = 150
        this.lastKey = ''
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50
        }
        this.color = color
        this.isAttacking = false
        this.facing = 'right'
        this.isHit = false
        this.health = 100
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 5
        this.sprites = sprites

        // Don't create new images here; they'll be set via setImage() after preload
    }

    update() {
        this.draw()
        this.animateFrames()

        // Update facing based on velocity (fallback to lastKey if set)
        if (this.velocity.x > 0) this.facing = 'right'
        else if (this.velocity.x < 0) this.facing = 'left'
        else if (this.lastKey) this.facing = (this.lastKey === 'a' || this.lastKey === 'ArrowLeft') ? 'left' : 'right'

        // Position attack box depending on facing direction
        const attackOffsetX = Math.abs(this.attackBox.offset.x || 0)
        if (this.facing === 'right') {
            this.attackBox.position.x = this.position.x + attackOffsetX
        } else {
            this.attackBox.position.x = this.position.x - attackOffsetX - this.attackBox.width
        }
        this.attackBox.position.y = this.position.y

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.height + this.velocity.y >= 
            canvas.height - 99 
        ) {
            this.velocity.y = 0
        } else this.velocity.y += gravity
        
        // draw attack box when attacking (visual debug + gameplay feedback)
        if (this.isAttacking) {
            c.fillStyle = 'rgba(255,0,0,0.4)'
            c.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height
            )
        }

        // draw brief hit flash overlay
        if (this.isHit) {
            c.fillStyle = 'rgba(255,255,255,0.5)'
            c.fillRect(this.position.x - this.offset.x, this.position.y - this.offset.y, this.width, this.height)
        }
    }

    // Override draw so fighters can be flipped horizontally when facing left
    draw() {
        if (!this.image) {
            // Fallback rectangle
            c.fillStyle = 'rgba(0, 0, 150, 0.7)'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
            return
        }

        const frameWidth = this.image.width / this.framesMax
        const destWidth = frameWidth * this.scale
        const destHeight = this.image.height * this.scale

        if (this.facing === 'right') {
            c.drawImage(
                this.image,
                this.framesCurrent * frameWidth,
                0,
                frameWidth,
                this.image.height,
                this.position.x - this.offset.x,
                this.position.y - this.offset.y,
                destWidth,
                destHeight
            )
        } else {
            c.save()
            c.scale(-1, 1)
            // draw flipped image: mirror around vertical axis by drawing at negative x
            c.drawImage(
                this.image,
                this.framesCurrent * frameWidth,
                0,
                frameWidth,
                this.image.height,
                -(this.position.x - this.offset.x) - destWidth,
                this.position.y - this.offset.y,
                destWidth,
                destHeight
            )
            c.restore()
        }
    }

    attack() {
        this.isAttacking = true
        // If there is an attack sprite, switch to it for the duration of the attack
        if (this.sprites && this.sprites.attack) {
            this.switchSprite('attack')
            // keep attack state for a bit longer so attack animation is visible
            setTimeout(() => {
                this.isAttacking = false
                this.switchSprite('idle')
            }, 300)
        } else {
            setTimeout(() => {
                this.isAttacking = false
            }, 100)
        }
    }

    takeHit() {
        this.isHit = true
        setTimeout(() => {
            this.isHit = false
        }, 150)
    }
}