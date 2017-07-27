var player = function(url_texture, _camera, crafts) {
    var _player = this;

    this.model = new THREEx.MinecraftChar(url_texture);
    this.head_anims = new THREEx.MinecraftCharHeadAnimations(this.model);
    this.body_anims = new THREEx.MinecraftCharBodyAnimations(this.model);
    this.head_anims.start('still');

    this.crafts = crafts;
    this.monsters = [];

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

    var widget_geo = new THREE.PlaneGeometry(0.2, 0.02);
    var widget_material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("resource/widgets.png"),
    });
    this.widget = new THREE.Mesh(widget_geo, widget_material);
    this.widget.position.set(0, -0.1, -0.25);

    var grass_icon = generate_block('grass_block');
    this.widget.add(grass_icon.cube);
    grass_icon.cube.scale.set(0.01, 0.01, 0.01);
    grass_icon.cube.position.set(-0.053, 0.04, 0.1);
    grass_icon.cube.rotation.set(Math.PI / 8, Math.PI / 4, 0);

    var log_oak = generate_block('log_oak');
    this.widget.add(log_oak.cube);
    log_oak.cube.scale.set(0.01, 0.01, 0.01);
    log_oak.cube.position.set(-0.040, 0.04, 0.1);
    log_oak.cube.rotation.set(Math.PI / 8, Math.PI / 4, 0);

    var cobble_stone = generate_block('cobble_stone');
    this.widget.add(cobble_stone.cube);
    cobble_stone.cube.scale.set(0.01, 0.01, 0.01);
    cobble_stone.cube.position.set(-0.026, 0.04, 0.1);
    cobble_stone.cube.rotation.set(Math.PI / 8, Math.PI / 4, 0);

    var widgets_light_geo = new THREE.PlaneGeometry(0.02, 0.02);
    var widgets_light_material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("resource/widgets_light.png"),
    });
    this.widgets_light = new THREE.Mesh(widgets_light_geo, widgets_light_material);
    this.widgets_light.position.set(-0.088, 0, 0);
    this.widget.add(this.widgets_light);

    this.camera = new PerspectiveControl(_camera, this);
    this.camera.camera.add(this.widget);
    this.selections = ['grass_block', 'log_oak', 'cobble_stone', 'zombie'];
    this.selected = 0;

    this.state = {};
    this.speed = 2;
    this.angularSpeed = 0.2 * Math.PI * 2;
    this.jump_time = 0;
    this.jump_duration = 30;

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
                //_player.state.jump = '';
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
                if (!_player.state.jump)
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
        var distance = 5;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), _player.camera.root);
        var results = raycaster.intersectObjects(_player.crafts);
        if (results.length > 0 && results[0].distance < 5) {
            if (results[0].object.name === 'block' && _player.selected < _player.selections.length &&
                _player.selections[_player.selected] !== 'zombie') {
                var _block = generate_block(_player.selections[_player.selected]);
                _block.setPos(results[0].object.getWorldPosition().add(results[0].face.normal.normalize().multiplyScalar(0.5)));
                _player.model.root.parent.add(_block.cube);
                _player.crafts.push(_block.cube);
            } else if (_player.selected < _player.selections.length) {
                var _zombie = generate_zombie(results[0].object.position.clone(), crafts);
                _player.monsters.push(_zombie);
                _player.model.root.parent.add(_zombie.model.root);
            }
        }

        event.cancelBubble = true;
        event.returnValue = false;
        return false; //remove context menu
    };

    this.mouseScroll = function(event) {
        if (event.wheelDelta < 0)
            _player.selected = (_player.selected + 1) % 9;
        else
            _player.selected = (_player.selected + 8) % 9;
        _player.widgets_light.position.x = -0.088 + (0.022 * _player.selected);
    }

    this.stateHandle = function(delta, now) {

        if (!hasProp(this.state)) {
            this.body_anims.start('stand');
            return;
        }

        dis = {};
        dis.x = dis.y = dis.z = 0;

        switch (this.state.jump) {
            case 'jump':
                this.body_anims.start('stand');
                if (!this.state.forward) {
                    this.state.forward_jump = 'jump';
                }
                this.state.jump = 'jumping';
                this.jump_time = 0;
                break;
            case 'jumping':
                if (this.jump_time < this.jump_duration) {
                    dis.y = 0.70 / this.jump_duration;
                    this.jump_time += 1;
                    if (this.state.forward) {
                        this.state.forward_jump = 'jump';
                    }
                } else {
                    this.state.jump = 'fall';
                    if (this.state.forward_jump) {
                        dis.z += 0.10;
                        this.state.forward_jump = '';
                    }
                }
                break;
            case 'fall':
                var willStop = 0;
                var target_block = null;
                var vertices = [];
                vertices = vertices.concat(this.model.legL.geometry.vertices);
                vertices = vertices.concat(this.model.legR.geometry.vertices);
                for (var v_index = 0; v_index < vertices.length; v_index++) {
                    var local_v = vertices[v_index];
                    var global_v = local_v.applyMatrix4(this.model.root.matrix);
                    var direction_vector = global_v.sub(this.model.root.position);

                    var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
                    var collision_results = ray.intersectObjects(this.crafts);
                    if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                        for (obj of collision_results) {
                            if (obj.distance >= direction_vector.length())
                                continue;
                            if (obj.object.position.y + 0.30 > this.model.root.position.y) {
                                if (obj.object.position.y > this.model.root.position.y) {
                                    willStop = -1;
                                    break;
                                }
                                willStop = 1;
                                target_block = obj.object;
                            }
                        }
                        if (willStop < 0) break;
                    }
                }
                if (willStop > 0) {
                    var thingInTop = false;
                    for (var obj of this.crafts) {
                        if (obj.position.equals(target_block.position.clone().add(new THREE.Vector3(0, 0.5, 0)))) {
                            thingInTop = true;
                            break;
                        }
                    }
                    if (!thingInTop) {
                        this.state.jump = '';
                        this.model.root.position.y = target_block.position.y + 0.25;
                        return;
                    }
                }
                if (this.model.root.position.y > 0) {
                    dis.y = -0.5 / this.jump_duration;
                } else {
                    this.model.root.position.y = 0;
                    this.state.jump = '';
                    return;
                }
                break;
            default:
                break;
        }

        if (!this.state.jump && this.state.forward) {
            dis.z += (this.state.forward === 'run') ? this.speed * delta * 2 : this.speed * delta;
            this.body_anims.start(this.state.forward);
        } else if (this.state.backward) {
            dis.z -= this.speed * delta;
            this.body_anims.start('walk');
        }

        if (!this.state.jump && this.state.rotation) {
            //dis.z = (this.state.forward === 'left') ? this.speed * delta : -this.speed * delta;
            this.model.root.rotation.y += ((this.state.rotation === 'left') ? this.angularSpeed * delta : -this.angularSpeed * delta);
        }

        var velocity = new THREE.Vector3(dis.x, dis.y, dis.z);
        var matrix = new THREE.Matrix4().makeRotationY(this.model.root.rotation.y);
        velocity.applyMatrix4(matrix);
        this.model.root.position.add(velocity);

    };

    this.collisionDectect = function() {

        function detect(_mesh) {
            for (var v_index = 0; v_index < _mesh.geometry.vertices.length; v_index++) {
                var local_v = _mesh.geometry.vertices[v_index];
                var global_v = local_v.clone().applyMatrix4(_mesh.matrixWorld);
                var direction_vector = global_v.sub(_mesh.getWorldPosition());

                var ray = new THREE.Raycaster(_mesh.getWorldPosition(), direction_vector.clone().normalize());
                var collision_results = ray.intersectObjects(_player.crafts);
                if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                    for (obj of collision_results) {
                        if (obj.distance >= direction_vector.length())
                            continue;
                        var forward = new THREE.Vector3(0, 0, 1);
                        forward.applyMatrix4(new THREE.Matrix4().makeRotationY(_player.model.root.rotation.y));
                        var dir = obj.object.position.clone().sub(_player.model.root.position);
                        dir.y = 0;
                        var isFront = dir.dot(forward);
                        isFront = (isFront > 0) ? true : false;

                        if ((_player.state.jump === 'jump' || _player.state.jump === 'jumping') &&
                            obj.object.position.y - 0.20 > _player.model.root.position.y + 1) {
                            _player.state.jump = 'fall';
                            return;
                        }

                        if (_player.state.forward && isFront &&
                            obj.object.position.y - 0.20 > _player.model.root.position.y &&
                            obj.object.position.y - 0.20 < _player.model.root.position.y + 1) {
                            _player.state.forward = '';
                            return;
                        }
                        if (_player.state.backward && !isFront &&
                            obj.object.position.y >= _player.model.root.position.y + 0.20 &&
                            obj.object.position.y - 0.20 < _player.model.root.position.y + 1) {
                            _player.state.backward = '';
                            return;
                        }
                    }
                }
            }
        }

        detect(this.model.legL);
        detect(this.model.legR);
        detect(this.model.body);
        detect(this.model.head);

        var willFall = true;
        var vertices = [];
        vertices = vertices.concat(this.model.legL.geometry.vertices);
        vertices = vertices.concat(this.model.legR.geometry.vertices);
        vertices = vertices.concat(this.model.body.geometry.vertices);
        vertices = vertices.concat(this.model.head.geometry.vertices);
        // vertices = vertices.concat(this.model.armL.geometry.vertices);
        // vertices = vertices.concat(this.model.armR.geometry.vertices);

        for (var v_index = 0; v_index < vertices.length; v_index++) {
            var local_v = vertices[v_index];
            var global_v = local_v.clone().applyMatrix4(this.model.root.matrix);
            var direction_vector = global_v.sub(this.model.root.position);

            var ray = new THREE.Raycaster(this.model.root.getWorldPosition(), direction_vector.clone().normalize());
            var collision_results = ray.intersectObjects(this.crafts);
            if (collision_results.length > 0 && collision_results[0].distance < direction_vector.length()) {
                for (obj of collision_results) {
                    if (obj.distance >= direction_vector.length())
                        continue;

                    if (this.state.jump || obj.object.position.y + 0.25 <= this.model.root.position.y)
                        willFall = false;
                }
            }
        }

        if (willFall && this.model.root.position.y > 0 && !this.state.jump) {
            this.state.jump = 'fall';
        }

    };

    this.update = function(delta, now) {
        this.collisionDectect();
        this.stateHandle(delta, now);
        this.head_anims.update(delta, now);
        this.body_anims.update(delta, now);
        this.camera.update(delta, now);

        for (var mon of this.monsters) {
            mon.update(delta, now);
        }
    };

    document.body.addEventListener('keyup', this.keyUp);
    document.body.addEventListener('keydown', this.keyRealease);
    document.body.addEventListener('click', this.leftClick);
    document.body.addEventListener('contextmenu', this.rightClick);
    document.body.addEventListener('mousewheel', this.mouseScroll);
}


function hasProp(obj) {

    for (var p in obj) {
        if (obj[p]) return true;
    }

    return false;
}