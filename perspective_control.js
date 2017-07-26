var PerspectiveControl = function(_camera, _player) {
    var _this = this;
    this.camera = _camera;
    this.camera.position.set(0, 0, 0);
    this.root = this.camera;
    this.player = _player;

    this.delta_pitch = 0;
    this.delta_yaw = 0;

    this.viewHalfX = window.innerWidth / 2;
    this.viewHalfY = window.innerHeight / 2;

    this.mouseMove = function(event) {

        var mouseX = event.pageX - _this.viewHalfX;
        var mouseY = event.pageY - _this.viewHalfY;
        _this.delta_yaw = mouseX / _this.viewHalfX * Math.PI / 6;
        _this.delta_pitch = mouseY / _this.viewHalfY * Math.PI / 6;

        _this.camera.parent.rotation.y = -_this.delta_yaw;
        _this.camera.parent.rotation.x = _this.delta_pitch;
    };

    this.update = function(delta, now) {
        this.camera.rotation.y = Math.PI;
    };

    document.body.addEventListener('mousemove', this.mouseMove);
}