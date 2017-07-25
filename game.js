function init() {

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

    renderer.setClearColor(0x000000);

    var onRenderFcts = [];
    var scene = new THREE.Scene();

    // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // camera.position.set(0, 0, 2);
    // scene.add(camera);

    var materials = [];

    for (var i = 0; i < 2; i++)
        materials.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('resource/grass_side.png'),
        }));
    materials.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('resource/grass_top.png'),
        color: 0x7FC14E
    }));
    materials.push(new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('resource/dirt.png'),
    }));

    for (var i = 0; i < 2; i++)
        materials.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('resource/grass_side.png'),
        }));

    var cube = new THREE.Mesh(new THREE.CubeGeometry(0.5, 0.5, 0.5), materials);
    onRenderFcts.push(function(delta, now) { cube.rotateX(0.01); });
    scene.add(cube);
    cube.position.set(0, 0, 1);

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var character = new player('resource/zombie.png', camera);
    scene.add(character.model.root);
    scene.add(camera);
    var camera_helper = new THREE.CameraHelper(character.camera.root);
    scene.add(camera_helper);
    onRenderFcts.push(function(delta, now) {
        character.update(delta, now);
    });

    onRenderFcts.push(function() {
        renderer.render(scene, camera);
        //renderer.render(scene, camera);
    });

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);

        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec;
        // call each update function
        onRenderFcts.forEach(function(onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        });
    });

}