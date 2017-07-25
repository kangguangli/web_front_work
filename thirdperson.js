var ThirdPersonCamera = function(_camera, _player) {
    var _this = this;
    this.camera = _camera;
    this.camera.position.set(0, 0, 2);
    this.root = this.camera;
    this.player = _player;

    this.lookSpeed = 0.005;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.autoSpeedFactor = 0.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;

    this.viewHalfX = window.innerWidth / 2;
    this.viewHalfY = window.innerHeight / 2;

    this.mouseMove = function(event) {
        _this.mouseX = event.pageX - _this.viewHalfX;
        _this.mouseY = event.pageY - _this.viewHalfY;
    };

    this.update = function(delta, now) {
        var actualLookSpeed = delta * this.lookSpeed;
        var verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

        this.lon += this.mouseX * actualLookSpeed;
        this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.Math.degToRad(90 - this.lat);
        this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
        this.theta = THREE.Math.degToRad(this.lon);

        //this.camera.rotation = this.model.root.rotation;


        var camera_height = 0.5;
        var camera_distance = 3;

        var cur_angle = this.player.model.root.rotation.y;
        this.camera.rotation.y = Math.PI + cur_angle;

        var delta_x = -camera_distance * Math.sin(cur_angle);
        var delta_z = -camera_distance * Math.cos(cur_angle);
        var position = this.player.model.root.position.clone();
        var target_pos = new THREE.Vector3(delta_x, camera_height, delta_z).add(this.player.model.root.position);
        this.camera.position.copy(target_pos);
    };
    document.body.addEventListener('mousemove', this.mouseMove);
}