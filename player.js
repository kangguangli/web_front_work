var player = function(url_texture, _camera, crafts) {
    var _player = this;

    this.model = new THREEx.MinecraftChar(url_texture);
    this.head_anims = new THREEx.MinecraftCharHeadAnimations(this.model);
    this.body_anims = new THREEx.MinecraftCharBodyAnimations(this.model);
    this.head_anims.start('still');

    this.crafts = crafts;

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

    this.model.root.position.set(0, 0, 0);
    this.model.head.add(_camera);
    this.camera = new PerspectiveControl(_camera, this);

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

    this.leftClick = function(event) {
        var distance = 5;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), _player.camera.root);
        var results = raycaster.intersectObjects(_player.crafts);
        if (results.length > 0 && results[0].distance < 5) {
            if (results[0].object.name === 'block') {
                console.log('remove');
                _player.model.root.parent.remove(results[0].object);
                var index;
                for (index = 0; index < _player.crafts.length; index++)
                    if (_player.crafts[index] === results[0].object)
                        break;
                if (index < _player.crafts.length)
                    _player.crafts.splice(index, 1);
            }
        }

    };
    this.rightClick = function(event) {
        console.log('right_click');
        var distance = 5;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), _player.camera.root);
        var results = raycaster.intersectObjects(_player.crafts);
        if (results.length > 0 && results[0].distance < 5) {
            console.log('results[0]: ', results[0].object.name);
            if (results[0].object.name === 'block') {
                var _block = generate_block('grass_block');
                _block.setPos(results[0].object.getWorldPosition().add(results[0].face.normal.multiplyScalar(0.5)));
                _player.model.root.parent.add(_block.cube);
                _player.crafts.push(_block.cube);
                console.log('should be there ', _block.cube.position);
            }
        }

        event.cancelBubble = true;
        event.returnValue = false;
        return false; //remove context menu
    };

    this.stateHandle = function(delta, now) {

        _object = this.model.root;
        _state = this.state;

        var prevPosition = _object.position.clone();
        var distance = 0;

        if (!hasProp(_state) && !this.jumping) {
            this.body_anims.start('stand');
            if (this.model.root.position.y > 0) {
                var isGound = false;
                vertices = [];
                vertices = vertices.concat(this.model.legL.geometry.vertices);
                vertices = vertices.concat(this.model.legR.geometry.vertices);
                for (var v_index = 0; v_index < vertices.length; v_index++) {
                    var local_v = vertices[v_index];
                    var global_v = local_v.applyMatrix4(this.model.root.matrix);
                    var direction_vector = global_v.sub(this.model.root.position);

                    var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
                    var collision_results = ray.intersectObjects(this.crafts);
                    if (collision_results.length > 0 &&
                        collision_results[0].distance < direction_vector.length() &&
                        collision_results[0].object.y >= this.model.root.position.y - 0.25) {
                        console.log(collision_results[0].object.y);
                        isGound = true;
                        break;
                    }
                }

                console.log(isGound);
                if (!isGound) {
                    this.model.root.position.y = -this.speed / 2 * delta;
                }
            }
            return;
        }

        if (_state.jump && !this.jumping) {
            this.body_anims.start('jump');
            this.jumping = true;
        }

        var height = 0;
        if ((this.jump_time < this.jump_duration / 2) && this.jumping) {
            this.state.jump = 'jumping';
            height = +this.speed / 2 * delta;
            this.jump_time += 1;
        } else if ((this.jump_time < this.jump_duration) && this.jumping) {
            this.state.jump = 'falling';
            this.body_anims.start('fall');
            height = -this.speed / 2 * delta;
            this.jump_time += 1;
        } else {
            this.body_anims.start('stand');
            this.state.jump = '';
            this.jumping = false;
            this.jump_time = 0;
        }

        if (height) {
            if (_state.forward)
                distance = +this.speed * delta / 2;
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

    this.collisionDectect = function() {
        var vertices = [];
        vertices = vertices.concat(this.model.legL.geometry.vertices);
        vertices = vertices.concat(this.model.legR.geometry.vertices);
        vertices = vertices.concat(this.model.body.geometry.vertices);
        vertices = vertices.concat(this.model.head.geometry.vertices);
        vertices = vertices.concat(this.model.armL.geometry.vertices);
        vertices = vertices.concat(this.model.armR.geometry.vertices);
        for (var v_index = 0; v_index < vertices.length; v_index++) {
            var local_v = vertices[v_index];
            var global_v = local_v.applyMatrix4(this.model.root.matrix);
            var direction_vector = global_v.sub(this.model.root.position);

            var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
            var collision_results = ray.intersectObjects(this.crafts);
            if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                for (obj of collision_results) {
                    var forward = new THREE.Vector3(0, 0, 1);
                    forward.applyMatrix4(new THREE.Matrix4().makeRotationY(_player.model.root.rotation.y));
                    var dir = obj.object.position.clone().sub(_player.model.root.position);
                    dir.y = 0;
                    var isFront = dir.dot(forward);
                    isFront = (isFront > 0) ? true : false;

                    if (this.state.jump === 'falling' &&
                        obj.object.position.y >= this.model.root.position.y - 0.25) {
                        this.model.root.position.y = obj.object.position.y + 0.25;
                        // this.state.jump = '';
                        // this.jumping = false;
                        this.jump_time = this.jump_duration + 1;
                        console.log('jump collision detected');
                        return;
                    }
                    if (this.state.forward && isFront &&
                        obj.object.position.y > this.model.root.position.y - 0.25) {
                        this.state.forward = '';
                        console.log('forward collision detected, ', obj.object.position.y, this.model.root.position.y - 0.25);
                        return;
                    }
                    if (this.state.backward && !isFront &&
                        obj.object.position.y > this.model.root.position.y - 0.25) {
                        this.state.backward = '';
                        console.log('backward collision detected', isFront);
                        return;
                    }
                }
            }
        }
    };

    this.update = function(delta, now) {
        this.collisionDectect();
        this.stateHandle(delta, now);
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