(function(){
	var g_items = [];
	var item2dbgs;
	var item3ds;
	var itemAnims;
	const require=function(fn){
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
		item2dbgs = require("2dbg_script.js");
		item3ds = require("3d_script.js");
		
		if(item3ds!=undefined){
			g_items.push(item3ds);
			itemname = item3ds.name;
		}
		if(item2dbgs!=undefined){
			g_items.push(item2dbgs);
			itemname = item2dbgs.name;
		}

		itemAnims = require("anim_script.js");
		if (item3ds != undefined && itemAnims != undefined) {
            var animMeshs = item3ds.animMeshs;
            for (var i = 1; i < animMeshs.length; i++) //do not bind animation for the first mesh
                itemAnims.Bind(animMeshs[i]);
		}
	}catch(err){
		console.log(err.stack);
	}
	console.log("itemname",itemname);
	var faces=[];
	return {
		SetParam:function(name,value){
			try{
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].SetParam(name,value);
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
			return undefined;
		},

		Render:function(params){
			try{
				if((FaceUnity.renderbillboardv||0)>3.0){
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
					if(item2dbgs)item2dbgs.Render(params,1);//bg item
					for(var faceIndex = 0; faceIndex < faces.length;faceIndex++){
						params = faces[faceIndex];
						if(item3ds)item3ds.Render(params,2);
					}
					faces.splice(0,faces.length);
				}else{
					//this path when multi-people, 2d/ar ok ,3d fail
					if(item3ds)item3ds.Render(params,1);//face hack
					if(item2dbgs)item2dbgs.Render(params,1);//bg item
					if(item3ds)item3ds.Render(params,2);//3d item
				}
			}
			catch(err){
				console.log(err.stack);
			}
		},
		RenderNonFace:function(params){
			//for(var i in g_items)g_items[i].RenderNonFace(params);
			try{
				if(item3ds)item3ds.RenderNonFace(params,1);//face hack
				if(item2dbgs)item2dbgs.RenderNonFace(params,1);//bg item
				if(item3ds)item3ds.RenderNonFace(params,2);//3d item
			}catch(err){
				console.log(err.stack);
			}
		},
		name:itemname,
	};
})()