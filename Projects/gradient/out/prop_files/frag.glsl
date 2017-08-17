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

vec4 shader_main_lookup_table2(vec4 C, float idx)
{
	float gray=C.r*0.299+C.g*0.587+C.b*0.114;
	vec4 res=texture2D(lookup_tex, vec2(gray, (idx+0.5)*lookup_tex_norm_y));
	res.a=1.0;
	return res;
}

vec4 shader_main_hue_saturation(vec4 C, vec3 hsl)
{
	if(hsl.b>0.0)
		C=C*(1.0-hsl.b)+vec4(hsl.b);
	else
		C=C*(1.0+hsl.b);
	vec3 CC=RGB2HSL(C.rgb);
	CC.r+=hsl.r;
	vec3 C_new=HSL2RGB(CC);
	if(hsl.g>=0.0)
	{
		float alpha=(hsl.g+CC.g>=1.0)?max(CC.g,0.01):1.0-hsl.g;
		alpha = 1.0/alpha-1.0;
		C_new=C_new+(C_new-vec3(CC.b))*alpha;
	}
	else
		C_new=vec3(CC.b)+(C_new-CC.b)*(1.0+hsl.g);
	return vec4(clamp(C_new, vec3(0.0), vec3(1.0)),1.0);
}

void main()
{
	float src_alpha=0.0, dest_alpha=0.0; 

	vec4 C_layer0=vec4(texture2D(tex, st).rgb, 1.0);
	if(is_bgra>0.0)
		C_layer0=C_layer0.bgra;
	vec4 C_res=C_layer0;

	//gradient map
	vec4 C_layer1=shader_main_lookup_table2(C_res, 0.000000);
	src_alpha=1.000000*C_layer1.a;
	dest_alpha=1.0-src_alpha;
	//normal
	C_res=C_res*dest_alpha+C_layer1*src_alpha;

	//loop operation
	vec4 C_layer2;
	{
		int idx=int(mod(float(int(frame_id)/3),8.0));
		if(idx==0)
		{
			//hue&saturation (default parameters)
			vec4 C_layer3=C_res;
			src_alpha=1.000000*C_layer3.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer3*src_alpha;

			C_layer2=C_layer3;
		}
		else if(idx==1)
		{
			//hue&saturation
			vec4 C_layer4=shader_main_hue_saturation(C_res, vec3(-0.125000,0.000000,0.000000));
			src_alpha=1.000000*C_layer4.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer4*src_alpha;

			C_layer2=C_layer4;
		}
		else if(idx==2)
		{
			//hue&saturation
			vec4 C_layer5=shader_main_hue_saturation(C_res, vec3(-0.250000,0.000000,0.000000));
			src_alpha=1.000000*C_layer5.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer5*src_alpha;

			C_layer2=C_layer5;
		}
		else if(idx==3)
		{
			//hue&saturation
			vec4 C_layer6=shader_main_hue_saturation(C_res, vec3(-0.375000,0.000000,0.000000));
			src_alpha=1.000000*C_layer6.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer6*src_alpha;

			C_layer2=C_layer6;
		}
		else if(idx==4)
		{
			//hue&saturation
			vec4 C_layer7=shader_main_hue_saturation(C_res, vec3(-0.500000,0.000000,0.000000));
			src_alpha=1.000000*C_layer7.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer7*src_alpha;

			C_layer2=C_layer7;
		}
		else if(idx==5)
		{
			//hue&saturation
			vec4 C_layer8=shader_main_hue_saturation(C_res, vec3(0.375000,0.000000,0.000000));
			src_alpha=1.000000*C_layer8.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer8*src_alpha;

			C_layer2=C_layer8;
		}
		else if(idx==6)
		{
			//hue&saturation
			vec4 C_layer9=shader_main_hue_saturation(C_res, vec3(0.250000,0.000000,0.000000));
			src_alpha=1.000000*C_layer9.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer9*src_alpha;

			C_layer2=C_layer9;
		}
		else if(idx==7)
		{
			//hue&saturation
			vec4 C_layer10=shader_main_hue_saturation(C_res, vec3(0.125000,0.000000,0.000000));
			src_alpha=1.000000*C_layer10.a;
			dest_alpha=1.0-src_alpha;
			//normal
			C_res=C_res*dest_alpha+C_layer10*src_alpha;

			C_layer2=C_layer10;
		}
	}
	if(is_bgra>0.0)
		gl_FragColor=C_res.bgra;
	else
		gl_FragColor=C_res;
}

