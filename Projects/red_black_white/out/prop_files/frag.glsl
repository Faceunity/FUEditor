vec3 RGB2HSL(vec3 rgb)
{
	float _min=min(rgb.r, min(rgb.g, rgb.b));
	float _max=max(rgb.r, max(rgb.g, rgb.b));
	if(_max-_min<1e-6)
		return vec3(0.0, 0.0, _min);
	vec3 res;
	if(_max-rgb.r<1e-6)
		if(rgb.g>=rgb.b)
			res.r=60.0*(rgb.g-rgb.b)/(_max-_min);
		else
			res.r=60.0*(rgb.g-rgb.b)/(_max-_min)+360.0;
	else if(_max-rgb.g<1e-6)
		res.r=60.0*(rgb.b-rgb.r)/(_max-_min)+120.0;
	else
		res.r=60.0*(rgb.r-rgb.g)/(_max-_min)+240.0;
	res.r*=1.0/360.0;
	res.b=0.5*(_min+_max);
	if(res.b<=0.5)
		res.g=(_max-_min)/(2.0*res.b);
	else
		res.g=(_max-_min)/(2.0-2.0*res.b);
	return res;
}

vec3 HSL2RGB(vec3 hsl)
{
	if(hsl.g<=0.0)
		return vec3(hsl.b);
	float q;
	if(hsl.b<0.5)
		q=hsl.b*(1.0+hsl.g);
	else
		q=hsl.b+hsl.g-hsl.g*hsl.b;
	float p=2.0*hsl.b-q;
	vec3 res;
	float t=hsl.r+1.0/3.0;
	t=(t>1.0)?(t-1.0):(t<0.0?t+1.0:t);
	if(t<1.0/6.0)
		res.r=p+(q-p)*6.0*t;
	else if(t<0.5)
		res.r=q;
	else if(t<2.0/3.0)
		res.r=p+(q-p)*6.0*(2.0/3.0-t);
	else
		res.r=p;
	t=hsl.r;
	t=(t>1.0)?(t-1.0):(t<0.0?t+1.0:t);
	if(t<1.0/6.0)
		res.g=p+(q-p)*6.0*t;
	else if(t<0.5)
		res.g=q;
	else if(t<2.0/3.0)
		res.g=p+(q-p)*6.0*(2.0/3.0-t);
	else
		res.g=p;
	t=hsl.r-1.0/3.0;
	t=(t>1.0)?(t-1.0):(t<0.0?t+1.0:t);
	if(t<1.0/6.0)
		res.b=p+(q-p)*6.0*t;
	else if(t<0.5)
		res.b=q;
	else if(t<2.0/3.0)
		res.b=p+(q-p)*6.0*(2.0/3.0-t);
	else
		res.b=p;
	return res;
}

vec4 shader_main_lookup_table(vec4 C, float idx, vec4 flags)
{
	float st_y=(idx+0.5)*lookup_tex_norm_y;
	if(flags.r>0.0)
		C.r=texture2D(lookup_tex, vec2(C.r,st_y)).r;
	if(flags.g>0.0)
		C.g=texture2D(lookup_tex, vec2(C.g,st_y)).g;
	if(flags.b>0.0)
		C.b=texture2D(lookup_tex, vec2(C.b,st_y)).b;
	if(flags.a>0.0)
	{
		C.r=texture2D(lookup_tex, vec2(C.r,st_y)).a;
		C.g=texture2D(lookup_tex, vec2(C.g,st_y)).a;
		C.b=texture2D(lookup_tex, vec2(C.b,st_y)).a;
	}
	C.a=1.0;
	return C;
}

vec4 shader_main_hue_saturation_shading(vec4 C, vec3 hsl)
{
	if(hsl.b>0.0)
		C=C*(1.0-hsl.b)+vec4(hsl.b);
	else
		C=C*(1.0+hsl.b);
	vec3 CC=RGB2HSL(C.rgb);
	CC.rg=hsl.rg;
	vec3 C_new=HSL2RGB(CC);
	return vec4(clamp(C_new, vec3(0.0), vec3(1.0)),1.0);
}

vec4 shader_main_image_none_reorder_repeat(sampler2D tex_image, vec4 tex_size_n_size_inv){
	vec2 st2=st*img_size;
	st2=mod(st2, tex_size_n_size_inv.xy);
	st2*=tex_size_n_size_inv.zw;
	return texture2D(tex_image, st2);
}

void main()
{
	float src_alpha=0.0, dest_alpha=0.0; 

	vec4 C_layer0=vec4(texture2D(tex, st).rgb, 1.0);
	if(is_bgra>0.0)
		C_layer0=C_layer0.bgra;
	vec4 C_res=C_layer0;

	//curves
	vec4 C_layer1=shader_main_lookup_table(C_res, 0.000000, vec4(0.000000,0.000000,0.000000,1.000000));
	src_alpha=1.000000*C_layer1.a;
	dest_alpha=1.0-src_alpha;
	//normal
	C_res=C_res*dest_alpha+C_layer1*src_alpha;

	//loop operation
	vec4 C_layer3;
	{
		int idx=int(mod(float(int(frame_id)/3),2.0));
		if(idx==0)
		{
			//image
			vec4 C_layer4=shader_main_image_none_reorder_repeat(tex_C_layer4, vec4(100.000000,100.000000,0.010000,0.010000));
			src_alpha=1.000000*C_layer4.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer4*src_alpha;

			C_layer3=C_layer4;
		}
		else if(idx==1)
		{
			//image
			vec4 C_layer5=shader_main_image_none_reorder_repeat(tex_C_layer5, vec4(100.000000,100.000000,0.010000,0.010000));
			src_alpha=1.000000*C_layer5.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer5*src_alpha;

			C_layer3=C_layer5;
		}
	}
	//levels
	vec4 C_layer6=shader_main_lookup_table(C_res, 1.000000, vec4(0.000000,0.000000,0.000000,1.000000));
	src_alpha=1.000000*C_layer6.a;
	dest_alpha=1.0-src_alpha;
	//normal
	C_res=C_res*dest_alpha+C_layer6*src_alpha;

	//hue&saturation
	vec4 C_layer7=shader_main_hue_saturation_shading(C_res, vec3(0.969444,0.250000,0.000000));
	src_alpha=1.000000*C_layer7.a;
	dest_alpha=1.0-src_alpha;
	//normal
	C_res=C_res*dest_alpha+C_layer7*src_alpha;

	if(is_bgra>0.0)
		gl_FragColor=C_res.bgra;
	else
		gl_FragColor=C_res;
}

