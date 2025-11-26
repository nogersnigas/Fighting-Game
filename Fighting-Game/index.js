const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

const gravity = 0.7

// Image cache to store preloaded images
const imageCache = {}

// simple image preloader so the game starts with assets ready
function preloadImages(paths = []) {
    return Promise.all(
        paths.map((src) => {
            return new Promise((resolve, reject) => {
                if (imageCache[src]) {
                    console.log(`Image cached: ${src}`)
                    return resolve(imageCache[src])
                }

                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.onload = () => {
                    imageCache[src] = img
                    console.log(`Image loaded: ${src}`)
                    resolve(img)
                }
                img.onerror = () => {
                    console.error(`Image failed to load: ${src}`)
                    reject(new Error(`Failed to load image: ${src}`))
                }
                img.src = src
            })
        })
    )
}

const imagePaths = [
    './img/background.png',
    './img/samuraiMack/Idle.png',
    './img/samuraiMack/Walk.png',
    './img/samuraiMack/Attack.png'
]

let background
let player
let enemy

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false }
}

// Create game objects after images are preloaded
preloadImages(imagePaths).then(() => {
    console.log('All images preloaded, initializing game...')

    background = new sprite({
        position: { x: 0, y: 0 },
        imageSrc: './img/background.png'
    })
    background.setImage(imageCache['./img/background.png'])

    player = new Fighter({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        imageSrc: './img/samuraiMack/Idle.png',
        framesMax: 4,
        scale: 0.28,
        offset: { x: 10, y: 61 },
        sprites: {
            idle: {
                imageSrc: './img/samuraiMack/Idle.png',
                framesMax: 4,
                offset: { x: 10, y: 61 },
                scale: 0.28
            },
            run: {
                imageSrc: './img/samuraiMack/Walk.png',
                framesMax: 10,
                offset: { x: 10, y: 61 },
                scale: 1.5
            }
            ,
            attack: {
                imageSrc: './img/samuraiMack/Attack.png',
                framesMax: 6,
                offset: { x: 10, y: 61 },
                scale: 0.28
            }
        }
    })
    player.setImage(imageCache['./img/samuraiMack/Idle.png'])
    if (player.sprites) {
        if (player.sprites.idle) player.sprites.idle.image = imageCache['./img/samuraiMack/Idle.png']
        if (player.sprites.run) player.sprites.run.image = imageCache['./img/samuraiMack/Walk.png']
        if (player.sprites.attack) player.sprites.attack.image = imageCache['./img/samuraiMack/Attack.png']
    }

    enemy = new Fighter({
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: 0 },
        color: 'blue',
        offset: { x: -50, y: 0 },
        imageSrc: './img/samuraiMack/Idle.png',
        framesMax: 4,
        scale: 0.28,
        offset: { x: -60, y: 61 }
    })
    // clone player sprites for enemy to avoid shared state
    if (player.sprites) {
        enemy.sprites = JSON.parse(JSON.stringify(player.sprites))
        if (enemy.sprites.idle) enemy.sprites.idle.image = imageCache['./img/samuraiMack/Idle.png']
        if (enemy.sprites.run) enemy.sprites.run.image = imageCache['./img/samuraiMack/Walk.png']
        if (enemy.sprites.attack) enemy.sprites.attack.image = imageCache['./img/samuraiMack/Attack.png']
    }
    enemy.setImage(imageCache['./img/samuraiMack/Idle.png'])

    console.log('Player ready:', player)
    console.log('Enemy ready:', enemy)

    decreaseTimer()
    animate()
}).catch((err) => {
    console.error('Failed to load images:', err)
})

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    if (background) background.update()
    if (player) player.update()
    if (enemy) enemy.update()

    if (!player || !enemy) return

    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement
    if (!player.isAttacking) {
        if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        if (player.sprites && player.sprites.run) {
            player.image = player.sprites.run.image
            player.framesMax = player.sprites.run.framesMax
        }
        } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        if (player.sprites && player.sprites.run) {
            player.image = player.sprites.run.image
            player.framesMax = player.sprites.run.framesMax
        }
        } else {
            if (player.sprites && player.sprites.idle) {
                player.image = player.sprites.idle.image
                player.framesMax = player.sprites.idle.framesMax
            }
        }
    }

    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
    }

    // detect for collision 
    if (
        rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking
    ) {
        player.isAttacking = false
        enemy.health -= 20
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
        if (typeof enemy.takeHit === 'function') enemy.takeHit()
    }

    if (
        rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking
    ) {
        enemy.isAttacking = false
        player.health -= 20
        document.querySelector('#playerHealth').style.width = player.health + '%'
        if (typeof player.takeHit === 'function') player.takeHit()
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

window.addEventListener('keydown', (event) => {
    if (!player || !enemy) return

    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break
        case 'w':
            player.velocity.y = -20
            break
        case ' ':
            player.attack()
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':
            enemy.velocity.y = -20
            break
        case 'ArrowDown':
            if (enemy && typeof enemy.attack === 'function') enemy.attack()
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

    // enemy keys
    switch (event.key) {
       case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})