(function () {
    var loadConf = function (src, dest) {
        for (var prop in src)
            dest[prop] = src[prop];
    }

    var bindings = JSON.parse(FaceUnity.ReadFromCurrentItem("binding.json"));

    var Animation = function (filename) {
        this.animObj = FaceUnity.LoadAnimationToMemory(filename + ".json", filename + "_dq.bin");
        this.resume = false;
        this.face_animation_list = [];
        this.anim_state = {};
        this.animating = 0;
        this.anim_head = 0;
        this.tex_deform = 0;
        this.tex_deform_width = 0;
        this.play_count = 0;
        this.meshName = ""; // binding mesh name
        this.last_frame = 0;
        this.fid = 0;

        var conf = JSON.parse(FaceUnity.ReadFromCurrentItem(filename + ".json") || "{}");
        loadConf(conf, this);

        this.reset_anim_process = function (anim_state) {
            anim_state.firstTime = true;
            anim_state.last_time = 0;
            anim_state.last_frame_id = 0;
            anim_state.anim_time = 0;
            anim_state.last_anim_fid = 0;
            this.last_frame = 0;
        }
        this.start = function (anim_state, frame_id) {
            if (anim_state.firstTime) {
                anim_state.firstTime = false;
                anim_state.last_time = new Date().getTime();
                anim_state.last_frame_id = frame_id;
            }
        }
        this.frame_id_callback = function (target, frame_id) {
            var anim_state = target.anim_state;
            this.start(anim_state, frame_id);
            if (frame_id != anim_state.last_frame_id) {
                var current_time = new Date().getTime();
                var delta_time = current_time - anim_state.last_time;
                anim_state.last_time = current_time;
                anim_state.last_frame_id = frame_id;
                anim_state.anim_time += delta_time;
                var anim_fid = Math.floor(anim_state.anim_time * 0.025) % this.animObj.frame_num;
                anim_state.last_anim_fid = anim_fid;
                if (anim_fid < this.last_frame) {
                    this.play_count++;
                }
                this.last_frame = anim_fid;
            }
            return 0;
        }
        this.update_callback = function (target, params) {
            var anim_id = target.anim_state.animation_id;
            target.anim_head = this.animObj.anim_head;

            this.frame_id_callback(target, params.frame_id);
            var fid = target.anim_state.last_anim_fid;
            this.fid = fid;
            target.tex_deform = this.animObj.tex_deform;
            target.tex_deform_width = target.tex_deform.w;
            FaceUnity.LoadAnimationFrame(target.tex_deform, this.animObj.frames, target.tex_deform.h, fid);
        }
        this.bind = function (pair) {
            pair.animation = this;
            pair.initMeshAnimation();
        }
        this.unbind = function (pair) {
            pair.animation = null;
        }
    }

    var anims = {};
    for (var prop in bindings) {
        var animName = prop;
        var meshName = bindings[animName];
        if (meshName == null || meshName == undefined) return;
        var anim = new Animation(animName);
        anim.meshName = meshName;
        anims[animName] = anim;
    }

    return {
        Anims: anims,
        SetParam: function (name, value) {

        },
        Render: function (params) { },
        name: "animation"
    };
})()