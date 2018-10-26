(function () {
    //物理效果相关
    var rigidBody_json_string = FaceUnity.ReadFromCurrentItem("bodies.json") || "{}";
    var joint_json_string = FaceUnity.ReadFromCurrentItem("joints.json") || "{}";
    var bones_json_string = FaceUnity.ReadFromCurrentItem("boneMap.json") || "{}";
    var canUsePhysical = rigidBody_json_string != "{}" && joint_json_string != "{}" && bones_json_string != "{}";
    var boneMap=JSON.parse(bones_json_string);
    var g_is_physics_init = false;
    var gHeadMat=undefined;
    var skeleton={};

    var Mat4Inverse = function(mat) {       
        var a0 = mat[ 0] * mat[ 5] - mat[ 1] * mat[ 4];
        var a1 = mat[ 0] * mat[ 6] - mat[ 2] * mat[ 4];
        var a2 = mat[ 0] * mat[ 7] - mat[ 3] * mat[ 4];
        var a3 = mat[ 1] * mat[ 6] - mat[ 2] * mat[ 5];
        var a4 = mat[ 1] * mat[ 7] - mat[ 3] * mat[ 5];
        var a5 = mat[ 2] * mat[ 7] - mat[ 3] * mat[ 6];
        var b0 = mat[ 8] * mat[13] - mat[ 9] * mat[12];
        var b1 = mat[ 8] * mat[14] - mat[10] * mat[12];
        var b2 = mat[ 8] * mat[15] - mat[11] * mat[12];
        var b3 = mat[ 9] * mat[14] - mat[10] * mat[13];
        var b4 = mat[ 9] * mat[15] - mat[11] * mat[13];
        var b5 = mat[10] * mat[15] - mat[11] * mat[14];
        var fDet = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
        var FLT_EPSILON = 1.192092896e-07;
        if( fDet > FLT_EPSILON )
        {
            var inv = [];
            inv[ 0] =  mat[ 5]*b5 - mat[ 6]*b4 + mat[ 7]*b3;
            inv[ 4] = -mat[ 4]*b5 + mat[ 6]*b2 - mat[ 7]*b1;
            inv[ 8] =  mat[ 4]*b4 - mat[ 5]*b2 + mat[ 7]*b0;
            inv[12] = -mat[ 4]*b3 + mat[ 5]*b1 - mat[ 6]*b0;
            inv[ 1] = -mat[ 1]*b5 + mat[ 2]*b4 - mat[ 3]*b3;
            inv[ 5] =  mat[ 0]*b5 - mat[ 2]*b2 + mat[ 3]*b1;
            inv[ 9] = -mat[ 0]*b4 + mat[ 1]*b2 - mat[ 3]*b0;
            inv[13] =  mat[ 0]*b3 - mat[ 1]*b1 + mat[ 2]*b0;
            inv[ 2] =  mat[13]*a5 - mat[14]*a4 + mat[15]*a3;
            inv[ 6] = -mat[12]*a5 + mat[14]*a2 - mat[15]*a1;
            inv[10] =  mat[12]*a4 - mat[13]*a2 + mat[15]*a0;
            inv[14] = -mat[12]*a3 + mat[13]*a1 - mat[14]*a0;
            inv[ 3] = -mat[ 9]*a5 + mat[10]*a4 - mat[11]*a3;
            inv[ 7] =  mat[ 8]*a5 - mat[10]*a2 + mat[11]*a1;
            inv[11] = -mat[ 8]*a4 + mat[ 9]*a2 - mat[11]*a0;
            inv[15] =  mat[ 8]*a3 - mat[ 9]*a1 + mat[10]*a0;

            fDet = 1.0 / fDet;
            inv[ 0] *= fDet;
            inv[ 1] *= fDet;
            inv[ 2] *= fDet;
            inv[ 3] *= fDet;
            inv[ 4] *= fDet;
            inv[ 5] *= fDet;
            inv[ 6] *= fDet;
            inv[ 7] *= fDet;
            inv[ 8] *= fDet;
            inv[ 9] *= fDet;
            inv[10] *= fDet;
            inv[11] *= fDet;
            inv[12] *= fDet;
            inv[13] *= fDet;
            inv[14] *= fDet;
            inv[15] *= fDet;
            
            return inv;
        }else{
            return mat;
        }
    }
    if(FaceUnity.MatrixInverse == undefined){
        FaceUnity.MatrixInverse = Mat4Inverse;
    }

    for(var bone in boneMap)//取Head_M的pos值，存成矩阵以备和头相关的物体使用
    {
        if (bone === "Head_M") {
            gHeadMat = FaceUnity.MatrixTranslate(boneMap[bone].pos);
        }
        if (boneMap[bone].skeletonDq === undefined){
            boneMap[bone].skeletonDq = [0,0,0,15360,0,0,0,0];
        }
    } 

    var FloatToHalf = (function() {
      var floatView = new Float32Array(1);
      var int32View = new Int32Array(floatView.buffer);
      /* This method is faster than the OpenEXR implementation (very often
       * used, eg. in Ogre), with the additional benefit of rounding, inspired
       * by James Tursa?s half-precision code. */
      return function toHalf(val) {
        floatView[0] = val;
        var x = int32View[0];
    
        var bits = (x >> 16) & 0x8000;
        var m = (x >> 12) & 0x07ff;
        var e = (x >> 23) & 0xff;
        if (e < 103) {
          return bits;
        }
        if (e > 142) {
          bits |= 0x7c00;
          bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
          return bits;
        }
        if (e < 113) {
          m |= 0x0800;
          bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
          return bits;
        }
        bits |= ((e - 112) << 10) | (m >> 1);
        bits += m & 1;
        return bits;
      };
    
    }());

    var HalfToFloat = function(h) {
        var s = (h & 0x8000) >> 15;
        var e = (h & 0x7C00) >> 10;
        var f = h & 0x03FF;
    
        if(e == 0) {
            return (s?-1:1) * Math.pow(2,-14) * (f/Math.pow(2, 10));
        } else if (e == 0x1F) {
            return f?NaN:((s?-1:1)*Infinity);
        }
    
        return (s?-1:1) * Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
    }

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
        this.use_vtf = 1;
        this.support_vtf = -1;

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
            target.arrvec4_deform = this.animObj.arrvec4_deform;
            target.cluster_num = this.animObj.cluster_num;

            if(bones_json_string!="{}"){
                if(boneMap["Head_M"]){
                    var ddeRotMat = FaceUnity.MatrixRotationFromQuaternion([params.rotation[0],params.rotation[1],-params.rotation[2],params.rotation[3]]);
                    var gHeadInverse = FaceUnity.MatrixInverse(gHeadMat);
                    var gHeadRot = FaceUnity.MatrixMul(ddeRotMat,gHeadMat);
                    var gHeadRotMat = FaceUnity.MatrixMul(gHeadInverse,gHeadRot);
    
                    target.headTransMat=gHeadMat;
                    target.invHeadTransMat=gHeadInverse;
                
                    if(boneMap["Head_M"].skeletonDq==undefined)
                        boneMap["Head_M"].skeletonDq=[0,0,0,15360,0,0,0,0];
                    

                    //移动旋转Head_M骨骼，输入数据必须为Global下的transform
                    boneMap["Head_M"].skeletonDq[0] = FloatToHalf(-params.rotation[0]);  //DDE回传的transform-->Global下的transform
                    boneMap["Head_M"].skeletonDq[1] = FloatToHalf(-params.rotation[1]);
                    boneMap["Head_M"].skeletonDq[2] = FloatToHalf(params.rotation[2]);
                    boneMap["Head_M"].skeletonDq[3] = FloatToHalf(params.rotation[3]);
                    boneMap["Head_M"].skeletonDq[4] = FloatToHalf(gHeadRotMat[12]);
                    boneMap["Head_M"].skeletonDq[5] = FloatToHalf(gHeadRotMat[13]);
                    boneMap["Head_M"].skeletonDq[6] = FloatToHalf(gHeadRotMat[14]);
                    boneMap["Head_M"].skeletonDq[7] = FloatToHalf(gHeadRotMat[15]);
                }
                else
                {
                    console.log("PHYSICS ERROR!!!! NOT FOUND BONE Head_M");
                    return;
                }
            }

            /*
            //这个骨骼动画数据和DDE跟踪骨骼数据有冲突，这里的数据会覆盖掉跟踪数据
            var u16PerFrame = this.animObj.cluster_num * 8;
            var start = fid * u16PerFrame;
            var frame = new Uint16Array(u16PerFrame);
            for(var i=0;i<u16PerFrame;i++)
            {
                frame[i]= this.animObj.frames[start + i];
            }
            //refresh map 
            for(var item in boneMap)
            {
                boneMap[item].skeletonDq = [
                frame[boneMap[item].index*8+0],
                frame[boneMap[item].index*8+1],
                frame[boneMap[item].index*8+2],
                frame[boneMap[item].index*8+3],
                frame[boneMap[item].index*8+4],
                frame[boneMap[item].index*8+5],
                frame[boneMap[item].index*8+6],
                frame[boneMap[item].index*8+7]]
            }*/

            if (g_is_physics_init === false && canUsePhysical&&FaceUnity.SetPhysicsGravity!=undefined) {
                console.log("FaceUnity.InitPhysics");
                if(FaceUnity.IsPhysicsInited() != 0)
                    FaceUnity.ClearPhysics();
                g_is_physics_init=FaceUnity.InitPhysics(rigidBody_json_string, joint_json_string, bones_json_string)==1?true:false;
                target.is_physics_init=g_is_physics_init;
                FaceUnity.SetPhysicsGravity(0);
            }

            if(g_is_physics_init==true && canUsePhysical)
            {
                skeleton.skeletonData = JSON.stringify(boneMap);
                FaceUnity.UpdatePhysics(skeleton,params);      
                boneMap = JSON.parse(skeleton.skeletonData);
            }

            var itemAnimationData = new Uint16Array(Object.keys(boneMap).length*8);
            for(var bone in boneMap)
            {
                if(boneMap[bone].skeletonDq){
                    for(var i=0;i<8;i++)
                    {
                        itemAnimationData[boneMap[bone]["index"]*8+i] = boneMap[bone].skeletonDq[i];
                    }
                }
            }

            if (target.use_vtf == 1)
            {
                FaceUnity.UploadAnimationFrame(this.animObj.tex_deform, itemAnimationData, this.animObj.cluster_num, 0, 1);
            }
            else
            {
                FaceUnity.UploadAnimationFrame(this.animObj.arrvec4_deform, itemAnimationData, this.animObj.cluster_num, 0, 0);
            }
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
