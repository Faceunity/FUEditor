(function () {
    //物理效果相关
    var rigidBody_json_string = FaceUnity.ReadFromCurrentItem("bodies.json") || "{}";
    var joint_json_string = FaceUnity.ReadFromCurrentItem("joints.json") || "{}";
    var bones_json_string = FaceUnity.ReadFromCurrentItem("boneMap.json") || "{}";
    var globals=JSON.parse(FaceUnity.ReadFromCurrentItem("globals.json")||"{}");
    var canUsePhysics = rigidBody_json_string != "{}" && joint_json_string != "{}" && bones_json_string != "{}" && globals.enable_physics>0.5;
    var boneMap=JSON.parse(bones_json_string);
    var PhysicsBoneMap ={};
    var g_is_physics_init = -1;
    var g_HeadTransMat=undefined;
    var g_invHeadTransMat=undefined;
    var skeleton={};
    var localInstanceIDs=[];
    var ddeInstanceIDs=[];
    var rigidBodyData = {};
    var jointData = {};
    var current_faceid=-1;
    var boneMaps_Phy={};
    var boneMaps_Ani={};

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
            g_HeadTransMat = FaceUnity.MatrixTranslate(boneMap[bone].pos);
        }
        if (boneMap[bone].skeletonDq === undefined){
            boneMap[bone].skeletonDq = [0,0,0,15360,0,0,0,15360];//FloatToHalf(boneMap[bone].scale[0])];
        }
    } 

    //初始化PhysicsBoneMap，rigidBodyData，jointData，并自动纠错
    if(canUsePhysics)
    {
        PhysicsBoneMap={};
        rigidBodyData = JSON.parse(rigidBody_json_string);
        var rname={};
        for(var t in rigidBodyData)
        {
            var bonename=rigidBodyData[t]["bone"];
            if(boneMap[bonename]!=undefined)
            {
                if(PhysicsBoneMap[bonename]!=undefined)
                {
                    console.log("ERROR!!!!!!! ",rigidBodyData[t]["name"],"has the same BONE:",bonename," as other RigidBody");
                    console.log("Delete RigidBody ",rigidBodyData[t]["name"]);
                    delete rigidBodyData[t];
                }
                else if(bonename=="TRANSLATION")
                {
                    console.log("ERROR!!!!!!! TRANSLATION is a reserved name,DO NOT USE TRANSLATION AS A BONENAME");
                    console.log("Delete RigidBody ",rigidBodyData[t]["name"]);
                    delete rigidBodyData[t];
                }
                else{
                    PhysicsBoneMap[bonename]={};
                    PhysicsBoneMap[bonename]["skeletonDq"]=[0,0,0,15360,0,0,0,15360];//FloatToHalf(boneMap[bonename].scale[0])];
                    PhysicsBoneMap[bonename]["InstanceID"]=-1;
                    rname[rigidBodyData[t]["name"]]=1;
                }
            }
        }
        jointData = JSON.parse(joint_json_string);
        for(var t in jointData)
        {
            if(rname[jointData[t]["bodies"][0]]!=1)
            {
                console.log("ERROR!!!!!!! ",jointData[t]["name"],"has unknown rigidBody:",jointData[t]["bodies"][0],"at bodies[0]");
                console.log("Delete joint ",jointData[t]["name"]);
                delete jointData[t];
            }
            else if(jointData[t]["bodies"][1]!=undefined && rname[jointData[t]["bodies"][1]]!=1)
            {
                console.log("ERROR!!!!!!! ",jointData[t]["name"],"has unknown rigidBody:",jointData[t]["bodies"][1],"at bodies[1]");
                console.log("Delete joint ",jointData[t]["name"]);
                delete jointData[t];
            }
        }
    }

    var deepCopy =function(p, c){
        var c = c || {};
        for (var i in p) {
            if (typeof p[i] === 'object') {
                c[i] = (p[i].constructor === Array) ? [] : {};
                deepCopy(p[i], c[i]);
            } else {
                c[i] = p[i];
            }
        }
        return c;
    }

    var deepCopyArray =function(p, c){
        var c = c || [];
        for(var i in p){
            c[i] = p[i];
        }
        return c;
    }

    var GetboneMap = function(id,type) {
        if(type==0)
        {
            if(typeof boneMaps_Phy[id] != 'object')
                boneMaps_Phy[id]=deepCopy(boneMap);
            return boneMaps_Phy[id];
        }
        else if(type==1)
        {
            if(typeof boneMaps_Ani[id] != 'object')
                boneMaps_Ani[id]=deepCopy(boneMap);
            return boneMaps_Ani[id];
        }
        else
            console.log("GetboneMap error type:",type);
    }
    var ClearboneMap = function(id,type) {
        if(type==0)
        {
            if(boneMaps_Phy[id]!=undefined)
                delete boneMaps_Phy[id];
        }
        else if(type==1)
        {
            if(boneMaps_Ani[id]!=undefined)
                delete boneMaps_Ani[id]; 
        }
        else
            console.log("ClearboneMap error type:",type);
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
        this.AnalysisInstanceID = function (params) {
            ddeInstanceIDs=deepCopyArray(params.InstanceIDs);
            if(ddeInstanceIDs.length==0)
            {
                if(localInstanceIDs.length>0){  //先前有物理实体,只取第一个
                    ddeInstanceIDs[0]=localInstanceIDs[0];
                    current_faceid=localInstanceIDs[0];
                }
                else{   //先前没有物理实体
                    ddeInstanceIDs[0]=1;
                    current_faceid=1;
                }
            }
            else
                current_faceid = params.current_faceid;
        }
        this.updateAnim = function (target, params) {
            if (target.animating) {
                this.frame_id_callback(target, params.frame_id);
                var fid = target.anim_state.last_anim_fid;
                this.fid = fid;
                var u16PerFrame = this.animObj.cluster_num * 8;
                var start = fid * u16PerFrame;
                var frame = new Uint16Array(u16PerFrame);
                for(var i=0;i<u16PerFrame;i++)
                {
                    frame[i]= this.animObj.frames[start + i];
                }
                //refresh map 
                var bm=GetboneMap(current_faceid,1);
                for(var item in bm)
                {
                    var index=bm[item].index;
                    bm[item].skeletonDq = [
                    frame[index*8+0],
                    frame[index*8+1],
                    frame[index*8+2],
                    frame[index*8+3],
                    frame[index*8+4],
                    frame[index*8+5],
                    frame[index*8+6],
                    frame[index*8+7]]
                }
                /*for(var bone in bm){
                    var dq=bm[bone].skeletonDq;
                    console.log(bone,"dq:",HalfToFloat(dq[0]),HalfToFloat(dq[1]),HalfToFloat(dq[2]),HalfToFloat(dq[3]),HalfToFloat(dq[4]),HalfToFloat(dq[5]),HalfToFloat(dq[6]),HalfToFloat(dq[7]));
                }*/
                //console.log("bm=",JSON.stringify(bm));
            }
        }
        this.updatePhysics = function (target, params) {
            //这里有一个动画数据和Head_M数据混合的问题
            var bm;
            if(bones_json_string!="{}"){
                bm=GetboneMap(current_faceid,0);
                if(bm["Head_M"]){
                    var ddeRotMat = FaceUnity.MatrixRotationFromQuaternion([params.rotation[0],params.rotation[1],-params.rotation[2],params.rotation[3]]);
                    var gHeadInverse = FaceUnity.MatrixInverse(g_HeadTransMat);
                    var gHeadRot = FaceUnity.MatrixMul(ddeRotMat,g_HeadTransMat);
                    var gHeadRotMat = FaceUnity.MatrixMul(gHeadInverse,gHeadRot);
    
                    g_invHeadTransMat=gHeadInverse;

                    //移动旋转Head_M骨骼，输入数据必须为Global下的transform
                    bm["Head_M"].skeletonDq[0] = FloatToHalf(-params.rotation[0]);  //DDE回传的transform-->Global下的transform
                    bm["Head_M"].skeletonDq[1] = FloatToHalf(-params.rotation[1]);
                    bm["Head_M"].skeletonDq[2] = FloatToHalf(params.rotation[2]);
                    bm["Head_M"].skeletonDq[3] = FloatToHalf(params.rotation[3]);
                    bm["Head_M"].skeletonDq[4] = FloatToHalf(gHeadRotMat[12]);
                    bm["Head_M"].skeletonDq[5] = FloatToHalf(gHeadRotMat[13]);
                    bm["Head_M"].skeletonDq[6] = FloatToHalf(gHeadRotMat[14]);
                    //bm["Head_M"].skeletonDq[7] = FloatToHalf(gHeadRotMat[15]);
                }
                else
                {
                    console.log("BONE ERROR!!!! CAN NOT FOUND BONE Head_M");
                    return;
                }
            }
            if (!canUsePhysics) return;    //物理资源不全
            if(g_is_physics_init == -1 && FaceUnity.SetPhysicsGravity!=undefined){
                g_is_physics_init=FaceUnity.IsPhysicsInited();
                if(g_is_physics_init==1) FaceUnity.ClearPhysics();
            }
            if(g_is_physics_init == -1) return; //nama未开启物理
            
            for(var i=0,flag=true,len=localInstanceIDs.length;i<len;flag?i++:i){
                if(localInstanceIDs[i])
                {
                    var exist=false;
                    for(var j=0;j<ddeInstanceIDs.length;j++)
                    {
                        if(localInstanceIDs[i]==ddeInstanceIDs[j])
                        {
                            exist=true;
                            break;
                        }
                    }
                    if(exist==false)    //这张脸消失了，清除对应物理实体，并从localInstanceIDs中清除
                    {
                        FaceUnity.RemovePhysicalObjs(localInstanceIDs[i]);
                        ClearboneMap(localInstanceIDs[i],0);
                        ClearboneMap(localInstanceIDs[i],1);
                        localInstanceIDs.splice(i,1);
                        flag=false;
                    }
                    else
                        flag=true;
                }
                else
                    flag=true;
            }
            var needcreate=false;
            for(var j=0;j<ddeInstanceIDs.length;j++)
            {
                var exist=false;
                for(var i=0;i<localInstanceIDs.length;i++){
                    if(localInstanceIDs[i]==ddeInstanceIDs[j])
                    {
                        exist=true;
                        break;
                    }
                }
                if(exist==false&&ddeInstanceIDs[j]==current_faceid)  { //这是一张新增的脸,且是当前要更新的脸
                    needcreate=true;
                    localInstanceIDs[localInstanceIDs.length]=current_faceid;
                    break;
                }
            }

            if(needcreate)
            {
                var initPos=[];
                initPos[0]=params.isFlipTrack!=undefined&&params.isFlipTrack>0.5?-params.translation[0]:params.translation[0];
                initPos[1]=params.translation[1];
                initPos[2]=params.translation[2];
                FaceUnity.InitPhysics(JSON.stringify(rigidBodyData), JSON.stringify(jointData), current_faceid, initPos);
                console.log("FaceUnity.InitPhysics");
                FaceUnity.SetPhysicsGravity(0);
                g_is_physics_init=FaceUnity.IsPhysicsInited();
            }

            if(g_is_physics_init==1)
            {
                if(params.isFlipTrack!=undefined&&params.isFlipTrack>0.5)
                    PhysicsBoneMap["TRANSLATION"]=[-params.translation[0],params.translation[1],params.translation[2]];
                else
                    PhysicsBoneMap["TRANSLATION"]=[params.translation[0],params.translation[1],params.translation[2]];
                for(var bone in PhysicsBoneMap)
                {
                    if(bone!="TRANSLATION"&&bm[bone]!=undefined)
                    {
                        PhysicsBoneMap[bone]["skeletonDq"] = bm[bone]["skeletonDq"];
                        PhysicsBoneMap[bone]["InstanceID"] = current_faceid;
                    }
                }
                skeleton.skeletonData = JSON.stringify(PhysicsBoneMap);
                //console.log("before:",skeleton.skeletonData);
                FaceUnity.UpdatePhysics(skeleton);  
                //console.log("after:",skeleton.skeletonData);
                PhysicsBoneMap = JSON.parse(skeleton.skeletonData);
                for(var bone in PhysicsBoneMap)
                {
                    if(bone!="TRANSLATION"&&bm[bone]!=undefined)
                    {
                        bm[bone]["skeletonDq"] = PhysicsBoneMap[bone]["skeletonDq"];
                    }
                }
            }
        }
        this.upload = function (target, params) {
            target.tex_deform = this.animObj.tex_deform;
            target.tex_deform_width = target.tex_deform.w;
            target.arrvec4_deform = this.animObj.arrvec4_deform;
            target.cluster_num = this.animObj.cluster_num;

            var bmphy=GetboneMap(current_faceid,0); 
            //console.log("0 current_faceid=",current_faceid,"upload:",JSON.stringify(bmphy),"\n");
            var itemPhysicsData = new Uint16Array(Object.keys(bmphy).length*8);
            for(var bone in bmphy)
            {
                if(bmphy[bone].skeletonDq){
                    for(var i=0;i<8;i++)
                    {
                        itemPhysicsData[bmphy[bone]["index"]*8+i] = bmphy[bone].skeletonDq[i];
                    }
                }
            }

            if(g_is_physics_init==1){
                var bmani=GetboneMap(current_faceid,1); 
                //console.log("1 current_faceid=",current_faceid,"upload:",JSON.stringify(bmani),"\n");
                var itemAnimationData = new Uint16Array(Object.keys(bmani).length*8);
                for(var bone in bmani)
                {
                    if(bmani[bone].skeletonDq){
                        var index=bmani[bone]["index"];
                        for(var i=0;i<8;i++)
                        {
                            itemAnimationData[index*8+i] = bmani[bone].skeletonDq[i];
                        }
                    }
                }
                
                if (target.use_vtf == 1)
                {
                    FaceUnity.UploadAnimationFramePhysics(this.animObj.tex_deform, itemPhysicsData,itemAnimationData, this.animObj.cluster_num, 0, 1);
                }
                else
                {
                    FaceUnity.UploadAnimationFramePhysics(this.animObj.arrvec4_deform, itemPhysicsData,itemAnimationData, this.animObj.cluster_num, 0, 0);
                }
            }
            else
            {
                if (target.use_vtf == 1)
                {
                    FaceUnity.UploadAnimationFrame(this.animObj.tex_deform, itemPhysicsData, this.animObj.cluster_num, 0, 1);
                }
                else
                {
                    FaceUnity.UploadAnimationFrame(this.animObj.arrvec4_deform, itemPhysicsData, this.animObj.cluster_num, 0, 0);
                }
            }
        }
        this.bind = function (pair) {
            pair.animation = this;
            pair.initMeshAnimation();
        }
        this.unbind = function (pair) {
            pair.animation = null;
        }
        this.is_physics_init = function(){
            return g_is_physics_init==1;
        }
        this.HeadTransMat = function(){
            return g_HeadTransMat;
        }
        this.invHeadTransMat = function(){
            return g_invHeadTransMat;
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
