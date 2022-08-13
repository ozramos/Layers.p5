export default function () {
  const busts = [
    ['👩🏻','👨🏻','🧑🏻','👵🏻','👴🏻','🧓🏻','👩🏻‍🦰','👨🏻‍🦰','🧑🏻‍🦰','👩🏻‍🦱','👨🏻‍🦱','🧑🏻‍🦱','👩🏻‍🦲','👨🏻‍🦲','🧑🏻‍🦲','👩🏻‍🦳','👨🏻‍🦳','🧑🏻‍🦳','👱🏻‍♀️','👱🏻‍♂️','👱🏻','👳🏻‍♀️','👳🏻‍♂️','👳🏻','🧔🏻','🧔🏻‍♂️','🧔🏻‍♀️'],
    ['👩🏼','👨🏼','🧑🏼','👵🏼','👴🏼','🧓🏼','👩🏼‍🦰','👨🏼‍🦰','🧑🏼‍🦰','👩🏼‍🦱','👨🏼‍🦱','🧑🏼‍🦱','👩🏼‍🦲','👨🏼‍🦲','🧑🏼‍🦲','👩🏼‍🦳','👨🏼‍🦳','🧑🏼‍🦳','👱🏼‍♀️','👱🏼‍♂️','👱🏼','👳🏼‍♀️','👳🏼‍♂️','👳🏼','🧔🏼','🧔🏼‍♂️','🧔🏼‍♀️'],
    ['👩🏽','👨🏽','🧑🏽','👵🏽','👴🏽','🧓🏽','👩🏽‍🦰','👨🏽‍🦰','🧑🏽‍🦰','👩🏽‍🦱','👨🏽‍🦱','🧑🏽‍🦱','👩🏽‍🦲','👨🏽‍🦲','🧑🏽‍🦲','👩🏽‍🦳','👨🏽‍🦳','🧑🏽‍🦳','👱🏽‍♀️','👱🏽‍♂️','👱🏽','👳🏽‍♀️','👳🏽‍♂️','👳🏽','🧔🏽','🧔🏽‍♂️','🧔🏽‍♀️'],
    ['👩🏾','👨🏾','🧑🏾','👵🏾','👴🏾','🧓🏾','👩🏾‍🦰','👨🏾‍🦰','🧑🏾‍🦰','👩🏾‍🦱','👨🏾‍🦱','🧑🏾‍🦱','👩🏾‍🦲','👨🏾‍🦲','🧑🏾‍🦲','👩🏾‍🦳','👨🏾‍🦳','🧑🏾‍🦳','👱🏾‍♀️','👱🏾‍♂️','👱🏾','👳🏾‍♀️','👳🏾‍♂️','👳🏾','🧔🏾','🧔🏾‍♂️','🧔🏾‍♀️'],
    ['👩🏿','👨🏿','🧑🏿','👵🏿','👴🏿','🧓🏿','👩🏿‍🦰','👨🏿‍🦰','🧑🏿‍🦰','👩🏿‍🦱','👨🏿‍🦱','🧑🏿‍🦱','👩🏿‍🦲','👨🏿‍🦲','🧑🏿‍🦲','👩🏿‍🦳','👨🏿‍🦳','🧑🏿‍🦳','👱🏿‍♀️','👱🏿‍♂️','👱🏿','👳🏿‍♀️','👳🏿‍♂️','👳🏿','🧔🏿','🧔🏿‍♂️','🧔🏿‍♀️']   
  ]
  const siblings = [
    ['👧🏻','👦🏻','🧒🏻'],
    ['👧🏼','👦🏼','🧒🏼'],
    ['👧🏽','👦🏽','🧒🏽'],
    ['👧🏾','👦🏾','🧒🏾'],
    ['👧🏿','👦🏿','🧒🏿']
  ]
  const self = [
    ['🧑🏻‍💻','👨🏻‍💻','👩🏻‍💻'],
    ['🧑🏼‍💻','👨🏼‍💻','👩🏼‍💻'],
    ['🧑🏽‍💻','👨🏽‍💻','👩🏽‍💻'],
    ['🧑🏾‍💻','👨🏾‍💻','👩🏾‍💻'],
    ['🧑🏿‍💻','👨🏿‍💻','👩🏿‍💻']
  ]
  const imagination = ['✨','🎶','🎵','⭐','🌟','❤️','🧡','💛','💚','💙','💜','👻','👽','👾','🐵','🐶','🐺','🐱','🦁','🐯','🦊','🦝','🐮','🐷','🐭','🐹','🐰','🐻','🐻‍❄️','🐨','🐼','🐸','🦖','🦕','🐉','🐍','🐢','🐙','🐧','🐥','🐣','🦋','🐝','🐞','🪲']

  Layers.create(() => {
    const size = minSize*.3
    let numFamily = ~~random(50, 100)

    new Layer({
      id: 'family',
      renderer: WEBGL,
      noLoop: true,

      store: {
        numFamily,
        family: [],
        selfIdx: 0,
        bubble: {},
        imaginationCount: random(500, 1000),
        imagination: [],
        imaginationCanvas: null,
        isDark: random() > .5
      },

      onDispose () {
        $imaginationCanvas && $imaginationCanvas.dispose()
      },

      setup () {
        // Reset things
        $family = []
        $bubble = {
          shape: 'box',//random(['box', 'sphere']),
          detailX: ~~random(3, 6),
          detailY: ~~random(3, 9),
          rotX: random(PI*2),
          rotY: random(PI*2),
          rotZ: random(PI*2),
        }
        
        // Canvas
        $imaginationCanvas = createGraphics(width, height)
        $imaginationCanvas.textAlign(CENTER, CENTER)
        offscreen.textAlign(CENTER, CENTER)
        canvas.setAttributes('alpha', true)

        // Create family and create smear points for each face
        for (let i = 0; i < $numFamily+1; i++) {
          let emoji
          let tone = ~~random(5)
          let emojiHeight
          let isSelf = false
          let x
          let z
          let rot

          // Different settings for guardians and children
          if (i < $numFamily) {
            emoji = random(busts[tone])
            emojiHeight = random(-size*.25, size*1.25)
            x = random(size/2, width-size/2)
            z = random(-size*2, -size*.5)
            rot = random(-PI/6, PI/6)
          } else {
            emoji = random(self[tone])
            emojiHeight = random(height/2+size*.85, height/2+size*1.2)
            isSelf = true
            x = width/2//random(size*1.25, width-size*1.25)
            z = random(0, size*.25)
            rot = random(-PI/12, PI/12)
          }
          
          // Create family member
          const fam = {
            emoji,
            x,
            height: emojiHeight,
            z,
            tone,
            isSelf,
            rot
          }
          $family.push(fam)

          // Pick a bunch of random points to smear
          if (!isSelf) {
            const smear = []
            for (let j = 0; j < 1000; j++) {
              const x = random(fam.x-size*2, fam.x+size*2)
              const y = random(height/2-size/2, height/2+size/6)
              const thickness = random(size*.01, size*.05)
    
              for (let k = 0; k < thickness; k++) {
                smear.push({
                  x, y,
                  height: random(size*.3, size*.5),
                })
              }
            }

            // Sort smear by y
            fam.smear = smear
            fam.smear.sort((a, b) => a.y - b.y)
          }
        }

        // Sort family by z for transparent buffer drawing
        if ($isDark) {
          $family.sort((a, b) => a.height - b.height)
        } else {
          $family.sort((a, b) => b.height - a.height)
        }
        // Get the index of self
        $selfIdx = $family.findIndex(fam => fam.isSelf)

        // Create imagination
        $imagination = []
        for (let i = 0; i < $imaginationCount; i++) {
          const angle = random(PI*2)
          const len = random(size)
          
          $imagination.push({
            emoji: random(imagination),
            x: sin(angle) * len,
            y: cos(angle) * len,
            z: random(-size*1.5, -size),
            rot: random(-PI/6, PI/6),
            size: random(size*.25, size*.5)
          })
        }
      },

      draw () {
        drawingContext.enable(drawingContext.DEPTH_TEST)
        clear()
        background(0,0)
        
        // Draw family
        for (let i = 0; i < $numFamily+1; i++) {
          const fam = $family[i]
          offscreen.clear()

          // Set size
          if (fam.isSelf) {
            offscreen.textSize(size*.75)
            offscreen.text(fam.emoji, width/2, height/2)
          } else {
            offscreen.textSize(size)
            offscreen.text(fam.emoji, fam.x, height/2)
          }

          // Get the points
          if (!fam.isSelf) {
            fam.smear.forEach((point, n) => {
              // @todo use pixels bc faster
              point.color = offscreen.get(point.x, point.y)
              if (!point.color[3]) {
                delete fam.smear[n]
              }
            })
    
            // Draw lines from points to smear height
            offscreen.strokeWeight(minSize*.01)
            offscreen.colorMode(RGB)
            fam.smear.forEach(point => {
              const col = [...point.color]
              const darken = 255
              col[0] -= darken
              col[1] -= darken
              col[2] -= darken
              col[3] = 0
    
              const gradient = offscreen.drawingContext.createLinearGradient(point.x, point.y, point.x, point.y-point.height)
              gradient.addColorStop(0, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, ${point.color[3]})`)
              gradient.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`)
              offscreen.drawingContext.strokeStyle = gradient
    
              offscreen.drawingContext.beginPath()
              offscreen.drawingContext.moveTo(point.x, point.y)
              offscreen.drawingContext.lineTo(point.x, point.y-point.height)
              offscreen.drawingContext.stroke()
            })
            offscreen.colorMode(...this.colorMode)
          }
  
          // Set depth test (for transparent plane rendering)
          if (fam.isSelf) {
            drawingContext.enable(drawingContext.DEPTH_TEST)
          } else {
            drawingContext.disable(drawingContext.DEPTH_TEST)
          }

          // Draw imagination
          if (fam.isSelf) {
            noStroke()
            drawingContext.disable(drawingContext.DEPTH_TEST)
            // drawingContext.globalCompositionOperation = 'destination-over'
            for (let j = 0; j < $imaginationCount; j++) {
              const img = $imagination[j]
              $imaginationCanvas.clear()
              $imaginationCanvas.textSize(size)
              $imaginationCanvas.text(img.emoji, width/2, height/2)
              texture($imaginationCanvas)
              push()
              translate(fam.x-width/2, fam.height-height/2, fam.z)
              translate(img.x, img.y+size/2, img.z)
              rotateY(img.rot)
              plane(img.size, img.size)
              pop()
            }
            // drawingContext.globalCompositionOperation = 'source-over'
          }

          // Draw bubble
          if (fam.isSelf) {
            push()
            translate(fam.x-width/2, fam.height-height/2, fam.z)

            stroke(255)
            strokeWeight(max(1, minSize*.0025))
            noFill()
            switch ($bubble.shape) {
              case 'box':
                rotateY(fam.rot)
                box(size*1.25)
              break
              case 'sphere':
                rotateY($bubble.rotY)
                sphere(size, $bubble.detailX, $bubble.detailY)
              break
            }
            pop()
          }

          // Draw emoji
          texture(offscreen)
          noStroke()
          push()
          translate(fam.x-width/2, fam.height-height/2, fam.z)
          rotateY(fam.rot)
          plane(width, height)
          pop()
        }
      }
    })
  })
}