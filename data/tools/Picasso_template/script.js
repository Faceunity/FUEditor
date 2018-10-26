//1536041232968
(function () {
	var g_items = [];
	var item2ds;
	var item3ds;
	var handTrigger;
	
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
	var current_frame = 0;
	
	var require=function(fn){
		var jsstr = FaceUnity.ReadFromCurrentItem(fn);
		if(jsstr == undefined){
			console.log(fn,"is not exist");
			return undefined;
		}
		console.log("eval",fn,'begin');
		return eval(jsstr);
	};
	var itemname = "dummy";
	try{
	    item2ds = require("2d_script.js");
		item3ds = require("3d_script.js");
		handTrigger = require("hands_script.js");
		
		if(item3ds!=undefined){
			g_items.push(item3ds);
			itemname = item3ds.name;
		}
		if(item2ds!=undefined){
			g_items.push(item2ds);
			itemname = item2ds.name;
		}
		if(item2ds && item2ds.CalRef && item3ds && item3ds.meshlst)item2ds.CalRef(item3ds.meshlst);
		if (item3ds && item3ds.CalRef && item2ds && item2ds.meshlst) item3ds.CalRef(item2ds.meshlst);
	}catch(err){
		console.log(err.stack);
	}
	console.log("itemname",itemname);
	var faces=[];
	var g_params={
		isMultiMask: 0,
		isPause: 0
	};

	///////face
	var jsonbuffer;
	
	var imageary = undefined;
	var tex_image = undefined;
	var g_picasso_width = 0;
	var g_picasso_height = 0;
	
	var avatarbuffer;
	var blendshape;
	var g_tex = FaceUnity.LoadTexture("black_bg_00000.png",0,1);
	var g_shader = FaceUnity.ReadFromCurrentItem("bg.glsl");
	var globals = {};
	var tex_id = 0;
	var mode = 0;
	var flipx = 0.0;
	var img_w = 0, img_h = 0;
	var screen_w = 0, screen_h = 0;
	var w_min = -1, w_max = -1;
	var h_min = -1, h_max = -1;
	var img_scale = -1;
	var DoRender = function() {
		gl.enable(gl.BLEND);
		if(tex_id) {
			FaceUnity.RenderScreenQuad(g_shader, { mode:mode, flipx:flipx, img_w:img_w, img_h:img_h, screen_w:screen_w, screen_h:screen_h, 
				w_min:w_min, w_max:w_max, h_min:h_min, h_max:h_max, img_scale:img_scale,
				tex_bg:tex_id, mat_scene:FaceUnity.m_tfm_bg }, globals);
		}
		else {
			FaceUnity.RenderScreenQuad(g_shader, { mode:mode, flipx:flipx, img_w:img_w, img_h:img_h, screen_w:screen_w, screen_h:screen_h,
				w_min:w_min, w_max:w_max, h_min:h_min, h_max:h_max, img_scale:img_scale,
				tex_bg:g_tex, mat_scene:FaceUnity.m_tfm_bg }, globals);
		}
		gl.disable(gl.BLEND);
	}
	///////
	return {
		SetParam:function(name,value){
		    try {
				if(name=="isMultiMask"){
					g_params[name] = value;
					return 1;
				}
				if(name=="isPause") {
					g_params[name] = value;
					return 1;
 				}
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].SetParam(name,value);
					if(ret!=undefined)respone=true;
				}
				
				if(handTrigger!=undefined && handTrigger) {
					var ret = handTrigger.SetParam(name,value); //set hand trigger params
					if(ret!=undefined)respone=true;
				}
				
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		GetParam:function(name){
			if(name=="allFinish"){
				var allf = 1;
				for(var i in g_items)allf&=g_items[i].animCounter.allFinish();
				return allf;
			};
			if(name=="hasFinish"){
				var hasf = 0;
				for(var i in g_items)hasf|=g_items[i].animCounter.hasFinish();
				console.log("hasFinish",hasf);
				return hasf;
			};
			for(var i in g_items){
				var ret = g_items[i].GetParam(name);
				if(ret!=undefined)return ret;
			}
			
			var ret = handTrigger.GetParam(name); //get hand trigger params
			if(ret!=undefined)return ret;
			
			return undefined;
		},
		OnGeneralExtraDetector:function(){
			if(item2ds.OnGeneralExtraDetector)item2ds.OnGeneralExtraDetector();
		},
		FilterEntireImage:function(w,h,e,flip_x,flip_y){
			if(item2ds.FilterEntireImage)item2ds.FilterEntireImage(flip_x,flip_y);
		},
		Render:function(params){
			try{
				DoRender();
				if(g_params.isPause == 0)
					current_frame++;
				params.frame_id = current_frame;
				params.isPause = g_params.isPause;
				
				if(handTrigger && item2ds) handTrigger.TriggerHand(item2ds, params);//trigger hand
				
				if((FaceUnity.renderbillboardv||0)>3.0 && g_params.isMultiMask < 0.5){
					//this path when multi-people, 2d/ar ok ,3d ok
					if((params.face_ord < FaceUnity.m_n_valid_faces-1)){
						faces.push(params);
						return;
					}
					faces.push(params);
					for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
						params = faces[faceIndex];
						if(item3ds)item3ds.Render(params,1);//face hack
					}
					if(item2ds)item2ds.Render(params,1);//bg item
					for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
						params = faces[faceIndex];
						if(item3ds)item3ds.Render(params,2);
						if(item2ds)item2ds.Render(params,2);//non bg item
					}
					faces.splice(0,faces.length);
				}else{
					//this path when multi-people, 2d/ar ok ,3d fail
					if(item3ds)item3ds.Render(params,1);//face hack
					if(item2ds)item2ds.Render(params,1);//bg item
					if(item3ds)item3ds.Render(params,2);//3d item
					if(item2ds)item2ds.Render(params,2);//non bg item
				}
				
				if(handTrigger && item2ds) handTrigger.CheckHand(item2ds, params);//trigger hand end
			}
			catch(err){
				console.log(err.stack);
			}
		},
		OnGeneralSSDDetector: function() {
			if(handTrigger) handTrigger.OnGeneralSSDDetector();
		},
		OnDetect:function(boxes) {
			if(handTrigger) handTrigger.OnDetect(boxes);
		},
		RenderNonFace:function(params){
			if(params.face_count<=0)DoRender();
			//for(var i in g_items)g_items[i].RenderNonFace(params);
			try{
				params.frame_id = current_frame;
				params.isPause = g_params.isPause; 
				
				if(item3ds)item3ds.RenderNonFace(params,1);//face hack
				if(item2ds)item2ds.RenderNonFace(params,1);//bg item
				if(item3ds)item3ds.RenderNonFace(params,2);//3d item
				if(item2ds)item2ds.RenderNonFace(params,2);//non bg item
				
				if(handTrigger) handTrigger.FlushHands();
			}catch(err){
				console.log(err.stack);
			}
		},
		name:itemname,
	};
})()