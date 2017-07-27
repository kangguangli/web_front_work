function init() {

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

    renderer.setClearColor(0xbfd1e5);

    var onRenderFcts = [];
    var scene = new THREE.Scene();
    var crafts = [];

    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);

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

    var sky_geo = new THREE.PlaneGeometry(8, 8);
    var sky_material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("resource/sun1.png"),
    });
    var sky = new THREE.Mesh(sky_geo, sky_material);
    sky.position.set(0, 0, 500);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    scene.add(directionalLight);
    onRenderFcts.push(function(delta, now) {
        var angle = (now % 30) / 30 * Math.PI * 2;
        sky.position.set(0, 100 * Math.sin(angle), 100 * Math.cos(angle));
        sky.lookAt(character.model.root.position);
        directionalLight.position.set(0, 100 * Math.sin(angle), 100 * Math.cos(angle));
        directionalLight.lookAt(character.model.root.position);
    });
    scene.add(sky);

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