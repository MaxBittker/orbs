let THREE = require('three')
let HUSL = require('husl')
let scene, camera, renderer
let geometry, material, mesh
const origin = new THREE.Vector3(0,0,0)
let cursor = {x:150,y:150}
let mouseDown = 0;
let lastRender = new Date()
const startCount = 250
let toggle = true;
let entities = []
document.onmousemove = e => {
    cursor.x = window.innerWidth - e.clientX
    cursor.y = window.innerHeight - e.clientY
}
document.body.onmousedown = e => {
  mouseDown = 1;
  // toggle = !toggle
}
document.body.onmouseup = e => {
  mouseDown = 0;
}

const birth = () => {
  let loc = origin.clone()
  if(scene.children.length>0) {
    let parent =scene.children[Math.random()*(scene.children.length-1)|0]
    loc.copy(parent.position)
  }
  let color  =  HUSL.toHex(Math.random()*360|0, 0,100)

  let material = new THREE.MeshPhongMaterial( { color, transparent: true, opacity: 0.8 } )
  geometry = new THREE.SphereGeometry( Math.random()+0.2 , 8, 8 )
  mesh = new THREE.Mesh( geometry, material )
  mesh.position.copy(loc)
  mesh.velocity = new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5),(Math.random()-0.5))
  scene.add( mesh )
}

const init = () => {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 )
  camera.position.z = 22

  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth, window.innerHeight )
  renderer.setClearColor(0x0aa7f0, 1)
  document.body.appendChild( renderer.domElement )

  let loc = origin.clone()
  let color  =  HUSL.toHex(Math.random()*360|0, 50,90)
  let material = new THREE.MeshPhongMaterial( { color } )
  geometry = new THREE.SphereGeometry( 4, 1, 1 )
  mesh = new THREE.Mesh( geometry, material )
  mesh.position.copy(loc)
  mesh.isPlanet = true
  // scene.add( mesh )
  var ambientLight = new THREE.AmbientLight(0xffccff);
       scene.add(ambientLight);

  var spotLight = new THREE.SpotLight(0xaaffff);
     spotLight.position.set(-0, 30, 60);
     spotLight.castShadow = true;
     spotLight.intensity = 0.6;
     scene.add(spotLight);


}


const animate = () => {
  requestAnimationFrame( animate )
  scene.children.forEach(me => {
    me.rotation.y += 0.1
    if(me.type!=="Mesh") return
    if(me.isPlanet) return


    // me.geometry.normalize()
    // let scale =  1.0
    // let scale = me.position.length()/10
    // me.geometry.scale(scale,scale,scale);

    let move = origin.clone()
    scene.children.forEach(friend => {
      if(friend === me || friend.type !== "Mesh" || friend.isPlanet) return
      let distance = friend.position.clone().sub(me.position)
      let delta = distance.length()
      if(delta < 3) //avoid close neighbors
        move.sub(distance.setLength(Math.pow(delta, -1) * 10))
      else if(delta > 150) //attract to further neighbors
        move.add(distance.max(25))
      else
        mouseDown ? //rotate center
        move.add(origin.clone().crossVectors(me.velocity,friend.velocity).divideScalar(10)) :
        move.add(me.position.clone().cross(distance))
        // move.sub(me.position.clone().cross(distance)) :

    })
    if(me.position.length() < 7){
      // me.
    }
    me.velocity.add(move.normalize().divideScalar(20))
    me.velocity.sub(me.position.clone().divideScalar(cursor.y * 2))
    me.position.add(me.velocity.normalize().divideScalar( 1 + (cursor.x / 100)))
  })

  const c = Date.now()
  const tickTime = c - lastRender
  if( tickTime > 35 && scene.children.length > 15){
    scene.children.pop(1)
  } else if(tickTime < 30)
    birth()
  lastRender = c
  if(mouseDown>0)
    mouseDown++
  renderer.render(scene, camera )

}

init()
animate()
