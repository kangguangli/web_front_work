function init() {

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

    renderer.setClearColor(0x000000);

    var onRenderFcts = [];
    var scene = new THREE.Scene();
    var crafts = [];

    var grass = generate_block('grass_block');
    scene.add(grass.cube);
    crafts.push(grass.cube);
    grass.setPos(new THREE.Vector3(0, -0.25, 0));

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var character = new player('resource/char.png', camera, crafts);
    scene.add(character.model.root);
    var camera_helper = new THREE.CameraHelper(character.camera.root);
    scene.add(camera_helper);
    onRenderFcts.push(function(delta, now) {
        character.update(delta, now);
    });

    onRenderFcts.push(function() {
        renderer.render(scene, character.camera.root);
    });

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        requestAnimationFrame(animate);

        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        onRenderFcts.forEach(function(onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000);
        });
    });

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

}