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

vec4 shader_main_image_none_reorder_repeat(sampler2D tex_image, vec4 tex_size_n_size_inv){
	vec2 st2=st*img_size;
	st2=mod(st2, tex_size_n_size_inv.xy);
	st2*=tex_size_n_size_inv.zw;
	return texture2D(tex_image, st2);
}

vec4 shader_main_image_none_reorder_scale(sampler2D tex_image){
	return texture2D(tex_image, st);
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

	//image
	vec4 C_layer2=shader_main_image_none_reorder_repeat(tex_C_layer2, vec4(100.000000,100.000000,0.010000,0.010000));
	src_alpha=1.000000*C_layer2.a;
	dest_alpha=1.0-src_alpha;
	//normal
	C_res=C_res*dest_alpha+C_layer2*src_alpha;

	//loop operation
	vec4 C_layer3;
	{
		int idx=int(mod(float(int(frame_id)/3),8.0));
		if(idx==0)
		{
			//image
			vec4 C_layer4=shader_main_image_none_reorder_scale(tex_C_layer4);
			src_alpha=1.000000*C_layer4.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer4.rgb), 1.0)*src_alpha;

			C_layer3=C_layer4;
		}
		else if(idx==1)
		{
			//image
			vec4 C_layer5=shader_main_image_none_reorder_scale(tex_C_layer5);
			src_alpha=1.000000*C_layer5.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer5.rgb), 1.0)*src_alpha;

			C_layer3=C_layer5;
		}
		else if(idx==2)
		{
			//image
			vec4 C_layer6=shader_main_image_none_reorder_scale(tex_C_layer6);
			src_alpha=1.000000*C_layer6.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer6.rgb), 1.0)*src_alpha;

			C_layer3=C_layer6;
		}
		else if(idx==3)
		{
			//image
			vec4 C_layer7=shader_main_image_none_reorder_scale(tex_C_layer7);
			src_alpha=1.000000*C_layer7.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer7.rgb), 1.0)*src_alpha;

			C_layer3=C_layer7;
		}
		else if(idx==4)
		{
			//image
			vec4 C_layer8=shader_main_image_none_reorder_scale(tex_C_layer8);
			src_alpha=1.000000*C_layer8.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer8.rgb), 1.0)*src_alpha;

			C_layer3=C_layer8;
		}
		else if(idx==5)
		{
			//image
			vec4 C_layer9=shader_main_image_none_reorder_scale(tex_C_layer9);
			src_alpha=1.000000*C_layer9.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer9.rgb), 1.0)*src_alpha;

			C_layer3=C_layer9;
		}
		else if(idx==6)
		{
			//image
			vec4 C_layer10=shader_main_image_none_reorder_scale(tex_C_layer10);
			src_alpha=1.000000*C_layer10.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer10.rgb), 1.0)*src_alpha;

			C_layer3=C_layer10;
		}
		else if(idx==7)
		{
			//image
			vec4 C_layer11=shader_main_image_none_reorder_scale(tex_C_layer11);
			src_alpha=1.000000*C_layer11.a;
			dest_alpha=1.0-src_alpha;
			//screen
			C_res=C_res*dest_alpha+vec4(1.0-(1.0-C_res.rgb)*(1.0-C_layer11.rgb), 1.0)*src_alpha;

			C_layer3=C_layer11;
		}
	}
	if(is_bgra>0.0)
		gl_FragColor=C_res.bgra;
	else
		gl_FragColor=C_res;
}

