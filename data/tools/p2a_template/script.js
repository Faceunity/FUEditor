(function(){

	//@gparam name {"type":"edit","default_value":"unnamed"}
	//@gparam log_scale {"type":"slider","min":-5,"max":5,"default_value":0}
	//@gparam eye_rot_scale {"type":"slider","min":0.0,"max":3.0,"default_value":1.5}
	//@gparam L0_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L0_log_intensity {"type":"slider","min":-4,"max":4,"default_value":0}
	//@gparam L1_R {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_G {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_B {"type":"slider","min":0,"max":1,"default_value":1}
	//@gparam L1_log_intensity {"type":"slider","min":-4,"max":4,"default_value":-2}
	//@mparam obj_type {"type":"edit","default_value":"0"}
	//@mparam eye_type {"type":"edit","default_value":"0"}
	//@mparam is_hair {"type":"slider","min":0,"max":1,"default_value":1}
	//@mparam has_transparency {"type":"slider","min":0,"max":1,"default_value":1}
	//@mparam tex_albedo {"type":"texture","default_value":"white.png"}
	//@mparam tex_normal {"type":"texture","default_value":"white.png"}
	//@mparam tex_spec {"type":"texture","default_value":"white.png"}
	//@mparam tex_ao {"type":"texture","default_value":"white.png"}

	//@mparam TransFactor {"type":"slider","min":0,"max":3,"default_value":1.0}
	//@mparam S_Intensity {"type":"slider","min":0,"max":1,"default_value":0.6}
    //@mparam S_Power {"type":"slider","min":0,"max":512,"default_value":256}
    //@mparam S_Color_R {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Color_G {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Color_B {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Power2 {"type":"slider","min":0,"max":512,"default_value":256}
    //@mparam S_Color2_R {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Color2_G {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Color2_B {"type":"slider","min":0,"max":1,"default_value":1}
    //@mparam S_Shift {"type":"slider","min":-2,"max":2,"default_value":0}
    //@mparam S_Shift2 {"type":"slider","min":-2,"max":2,"default_value":-0.1}
    //@mparam S_Shift2GlossFactor {"type":"slider","min":0,"max":2,"default_value":1.0}
    //@mparam Diffuse_base {"type":"slider","min":0.0,"max":1,"default_value":0.25}
	//@mparam alphaThreshold {"type":"slider","min":0,"max":2,"default_value":0.7}
	//@mparam Has2Pass {"type":"slider","min":0,"max":1,"default_value":1.0}
	
	//@gparam ly {"type":"slider","min":-2,"max":2,"default_value":0}
	//@gparam lz {"type":"slider","min":2,"max":10,"default_value":2.5}
	//@gparam trans_x {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam trans_y {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam trans_z {"type":"slider","min":-30,"max":30,"default_value":0}
	//@gparam model_scale {"type":"slider","min":0,"max":2,"default_value":1}
    //#Current
    var g_items = [];
	var item_hair;
	var item_glasses;
	var item_clothes;
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
		item_hair = require("hair_script.js");
	    item_glasses = require("glasses_script.js");
		item_clothes = require("clothes_script.js");

		if(item_hair!=undefined){
			g_items.push(item_hair);
			itemname = item_hair.name;
		}else if(item_glasses!=undefined){
			g_items.push(item_glasses);
			itemname = item_glasses.name;
		}else if(item_clothes!=undefined){
			g_items.push(item_clothes);
			itemname = item_clothes.name;
		}
	}catch(err){
		console.log(err.stack);
	}
	console.log("itemname",itemname);
	return {
		Render:function(params){
		    try {
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].Render(params);
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		RenderNonFace:function(params){
		    try {
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].RenderNonFace(params);
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		OnBind:function(item){
		    try {
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].OnBind(item);
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		OnUnbind:function(item){
		    try {
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].OnUnbind(item);
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		LoadTextures:function(){
		    try {
				var respone = false;
				for(var i in g_items){
					var ret = g_items[i].LoadTextures();
					if(ret!=undefined)respone=true;
				}
				if(respone)return 1;
				return undefined;
			}catch(err){
				console.log(err.stack);
				return undefined;
			}
		},
		tag:g_items[0].tag,
		name:itemname,
	};
})()

