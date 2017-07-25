var player = function(url_texture, _camera) {
    var _player = this;

    this.model = new THREEx.MinecraftChar(url_texture);
    this.head_anims = new THREEx.MinecraftCharHeadAnimations(this.model);
    this.body_anims = new THREEx.MinecraftCharBodyAnimations(this.model);

    this.keymap = {
        D: 68,
        d: 100,
        W: 87,
        w: 119,
        A: 65,
        a: 97,
        S: 83,
        s: 115,
        right: 39,
        up: 38,
        left: 37,
        down: 40,
        blank: ' '.charCodeAt(0),
    };

    this.camera = new ThirdPersonCamera(_camera, this);
    this.state = {};
    this.speed = 2;
    this.angularSpeed = 0.2 * Math.PI * 2;
    this.jump_time = 0;
    this.jump_duration = 120;
    this.jumping = false;

    this.keyUp = function(evt) {

        switch (evt.keyCode) {
            case _player.keymap.W:
            case _player.keymap.w:
            case _player.keymap.up:
                _player.state.forward = '';
                break;
            case _player.keymap.S:
            case _player.keymap.s:
            case _player.keymap.down:
                _player.state.backward = '';
                break;
            case _player.keymap.A:
            case _player.keymap.a:
            case _player.keymap.left:
                _player.state.rotation = '';
                break;
            case _player.keymap.D:
            case _player.keymap.d:
            case _player.keymap.right:
                _player.state.rotation = '';
                break;
            case _player.keymap.blank:
                _player.state.jump = '';
                break;
            default:
                break;
        }
    };

    this.keyRealease = function(evt) {
        switch (evt.keyCode) {
            case _player.keymap.W:
            case _player.keymap.w:
            case _player.keymap.up:
                _player.state.forward = evt.shiftKey ? 'run' : 'walk';
                break;
            case _player.keymap.S:
            case _player.keymap.s:
            case _player.keymap.down:
                _player.state.backward = 'walk';
                break;
            case _player.keymap.A:
            case _player.keymap.a:
            case _player.keymap.left:
                _player.state.rotation = 'left';
                break;
            case _player.keymap.D:
            case _player.keymap.d:
            case _player.keymap.right:
                _player.state.rotation = 'right';
                break;
            case _player.keymap.blank:
                _player.state.jump = 'jump';
                break;
            default:
                break;
        }
    };

    this.mouseMove = function(evt) {
        //console.log(evt);
        var center = { x: window.innerWidth / 2, y: window.innerHeight / 2, };

    };
    this.leftClick = function(evt) {

    };
    this.rightClick = function(evt) {};

    this.keyHandle = function(delta, now) {

        _object = this.model.root;
        _state = this.state;

        var prevPosition = _object.position.clone();
        var distance = 0;

        if (!hasProp(_state) && !this.jumping) {
            this.body_anims.start('stand');
            return;
        }

        if (_state.jump && !this.jumping) {
            this.body_anims.start('jump');
            this.jumping = true;
        }

        var height = 0;
        if ((this.jump_time < this.jump_duration / 2) && this.jumping) {
            height = +this.speed / 2 * delta;
            this.jump_time += 1;
        } else if ((this.jump_time < this.jump_duration) && this.jumping) {
            this.body_anims.start('fall');
            height = -this.speed / 2 * delta;
            this.jump_time += 1;
        } else {
            this.jumping = false;
            this.jump_time = 0;
        }

        if (height) {
            console.log(_object.position.x);
            if (_state.forward)
                distance = +this.speed * delta / 4;
            else
                distance = 0;
            var velocity = new THREE.Vector3(0, height, distance);
            var matrix = new THREE.Matrix4().makeRotationY(_object.rotation.y);
            velocity.applyMatrix4(matrix);
            _object.position.add(velocity);
            return;
        }

        if (_state.rotation && _state.rotation === 'left')
            _object.rotation.y += this.angularSpeed * delta;
        else if (_state.rotation && _state.rotation === 'right')
            _object.rotation.y -= this.angularSpeed * delta;


        distance = 0;
        if (_state.strafe && _state.strafe === 'left') distance = +this.speed * delta;
        else if (_state.strafe && _state.strafe === 'right') distance = -this.speed * delta;
        if (distance) {
            var velocity = new THREE.Vector3(distance, 0, 0);
            var matrix = new THREE.Matrix4().makeRotationY(_object.rotation.y);
            velocity.applyMatrix4(matrix);
            _object.position.add(velocity);
        }

        distance = 0;
        if (_state.forward && _state.forward === 'walk') {
            distance = +this.speed * delta;
            this.body_anims.start('walk');
        } else if (_state.forward && _state.forward === 'run') {
            distance = +this.speed * delta * 2;
            this.body_anims.start('run');
        }
        if (_state.backward && !this.jumping) {
            distance = -this.speed * delta;
            this.body_anims.start('walk');
        }
        if (distance) {
            var velocity = new THREE.Vector3(0, 0, distance);
            var matrix = new THREE.Matrix4().makeRotationY(_object.rotation.y);
            velocity.applyMatrix4(matrix);
            _object.position.add(velocity);
        }

    };

    this.mouseHandle = function(delta, now) {

    };

    this.update = function(delta, now) {
        //console.log(this.model.root.position.y, this.jump_time);
        this.keyHandle(delta, now);
        this.head_anims.update(delta, now);
        this.body_anims.update(delta, now);
        this.camera.update(delta, now);
    };

    document.body.addEventListener('keyup', this.keyUp);
    document.body.addEventListener('keydown', this.keyRealease);
    document.body.addEventListener('click', this.leftClick);
    document.body.addEventListener('contextmenu', this.rightClick);
}


function hasProp(obj) {

    for (var p in obj) {
        if (obj[p]) return true;
    }

    return false;
}