(function () {
    var loadConf = function (src, dest) {
        for (var prop in src)
            dest[prop] = src[prop];
    }
	
	var animConf = JSON.parse(FaceUnity.ReadFromCurrentItem("animConf.json"));
	var conf = JSON.parse(FaceUnity.ReadFromCurrentItem(animConf["animName"] + ".json") || "{}");
	var animObj = FaceUnity.LoadAnimationToMemory(animConf["animName"] + ".json", animConf["animName"] + "_dq.bin");
	var animRef = null;
    var identityMat = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    var boneMap = JSON.parse(FaceUnity.ReadFromCurrentItem("boneMap.json"));

    var Animation = function (filename) {
        this.animData = FaceUnity.LoadFloatArrayFrom(filename + "_local.bin");
        this.boneMap = boneMap;
        this.boneNames = new Array(Object.keys(this.boneMap).length);
        for (boneName in this.boneMap) {
            this.boneNames[parseInt(this.boneMap[boneName].index)] = boneName;
        }
        this.animObj = animObj;
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
        this.use_vtf = 1;
        this.support_vtf = -1;
		this.isPause = false;
        
        loadConf(conf, this);

        this.reset_anim_process = function (anim_state) {
            anim_state.firstTime = true;
            anim_state.last_time = 0;
            anim_state.last_frame_id = 0;
            anim_state.anim_time = 0;
            anim_state.last_anim_fid = 0;
            this.last_frame = 0;
        }
		
		this.reset_anim_frame = function (anim_state, fid) {
            anim_state.last_time = new Date().getTime();
			anim_state.anim_time = fid / 0.025;
        }
		
        this.start = function (anim_state, frame_id) {
            if (anim_state.firstTime) {
                anim_state.firstTime = false;
                anim_state.last_time = new Date().getTime();
                anim_state.last_frame_id = frame_id;
            }
        }
        this.frame_id_callback = function (target, frame_id) {
			if(this.isPause) return 0;
			
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
        this.getLocalMat = function(node_index, fid) {
            var offset = (this.animObj.frame_num * node_index + fid) * 16;
            return [
                this.animData[offset], this.animData[offset+1], this.animData[offset+2], this.animData[offset+3],
                this.animData[offset+4], this.animData[offset+5], this.animData[offset+6], this.animData[offset+7],
                this.animData[offset+8], this.animData[offset+9], this.animData[offset+10], this.animData[offset+11],
                this.animData[offset+12], this.animData[offset+13], this.animData[offset+14], this.animData[offset+15]
            ]
        }
        this.calcGlobalMat = function(node_index, fid, parent_transform) {
            var bone = this.boneMap[this.boneNames[node_index]];
            var transform = FaceUnity.MatrixMul(
                this.getLocalMat(node_index, fid),
                parent_transform
            );
            bone.global = FaceUnity.MatrixMul(
                bone.invBindMat,
                transform
            );
            for (child in bone["children"]) {
                this.calcGlobalMat(bone["children"][child], fid, transform);
            }
        }
        this.update_callback = function (target, params) {
			//if(this.isPause) return;
			for (bone in this.boneMap) {
                if (this.boneMap[bone].parent == -1) {
                    this.calcGlobalMat(
                        this.boneMap[bone].index,
                        target.anim_state.last_anim_fid,
                        identityMat
                    );
                }
            }
            var frame = [];
            for (bone in this.boneMap) {
                var half_dp = FaceUnity.MatrixToDq(this.boneMap[bone].global)
                frame.push(half_dp[0], half_dp[1], half_dp[2], half_dp[3], half_dp[4], half_dp[5], half_dp[6], half_dp[7]);
            }
            var halfDqFrame = new Int16Array(frame);

            var anim_id = target.anim_state.animation_id;
            target.anim_head = this.animObj.anim_head;

            this.frame_id_callback(target, params.frame_id);
            var fid = target.anim_state.last_anim_fid;
            this.fid = fid;
            target.tex_deform = this.animObj.tex_deform;
            target.tex_deform_width = target.tex_deform.w;
            target.arrvec4_deform = this.animObj.arrvec4_deform;
            target.cluster_num = this.animObj.cluster_num;
            if (target.use_vtf == 1) 
                FaceUnity.LoadAnimationFrame(target.tex_deform, halfDqFrame, target.tex_deform.h, 0, 1);
            else
                FaceUnity.LoadAnimationFrame(target.arrvec4_deform, halfDqFrame, target.tex_deform.h, 0, 0);
        }
        this.bind = function (pair) {
            pair.animation = this;
            pair.initMeshAnimation();
        }
        this.unbind = function (pair) {
            pair.animation = null;
			console.log("do unbind!!!!");
        }
		this.pause = function() {
			this.isPause = true;
			this.anim_state.last_anim_fid = this.animObj.frame_num - 1;
		}
    }

    var anims = {};
	
	var getActiveAnimFrameCount = function() {
		var animName = animConf["animName"];
		return anims[animName].frame_num;
	}
	
	var setFrame = function(fid) {
		var animName = animConf["animName"];
		var anim = anims[animName];
		anim.reset_anim_frame(anim.anim_state,fid);
	}
	
	var doBind = function(pair) {
		var animName = animConf["animName"];
		var meshName = pair.meshName;
		if (meshName == null || meshName == undefined) return;
		
		animRef = new Animation(animName);
        animRef.meshName = meshName;
        anims[animName] = animRef;
		//anims[animName].bind(pair);
		ret.Anims = anims;
		ret.AnimRef = animRef;
	}
	
	var doUnbind = function(pair) {
		animRef.animating = 0;
		//animRef.unbind(pair);
		ret.AnimRef = animRef;
	}

	var ret = {
        Anims: anims,
		AnimRef: animRef,
        SetParam: function (name, value) {

        },
        Render: function (params) { },
        name: "animation",
		GetAnimFrameCount: getActiveAnimFrameCount,
		SetFrame: setFrame,
		name:"animation",
		OnBind:doBind,
		OnUnbind:doUnbind
    };
    return ret;
})()