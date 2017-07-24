function init() {

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

    renderer.setClearColor(0x000000);

    var onRenderFcts = [];
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(0, 0, 2);
    scene.add(camera);

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


    var character = new THREEx.MinecraftChar('resource/zombie.png');
    scene.add(character.root);

    var controls = new THREEx.MinecraftControls(character);
    THREEx.MinecraftControls.setKeyboardInput(controls);
    onRenderFcts.push(function(delta, now) {
        controls.update(delta, now);
    });

    var headAnims = new THREEx.MinecraftCharHeadAnimations(character);
    headAnims.start('still');
    onRenderFcts.push(function(delta, now) {
        headAnims.update(delta, now);
    });


    // init bodyAnims
    var bodyAnims = new THREEx.MinecraftCharBodyAnimations(character);
    bodyAnims.start('stand');
    onRenderFcts.push(function(delta, now) {
        bodyAnims.update(delta, now);
    });

    onRenderFcts.push(function(delta, now) {
        var input = controls.input;
        if (input.up || input.down) {
            bodyAnims.start('run');
        } else if (input.strafeLeft || input.strafeRight) {
            bodyAnims.start('strafe');
        } else {
            bodyAnims.start('stand');
        }
    });

    onRenderFcts.push(function() {
        renderer.render(scene, camera);
    });

    var lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        camera.lookAt(character.root.position);
        camera.position.set(character.root.position.x, character.root.position.y + 2, character.root.position.z - 3);
        camera.rotation = character.root.rotation;
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec;
        // call each update function
        onRenderFcts.forEach(function(onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        });
    });


    renderer.render(scene, camera);
}